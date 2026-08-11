---
layout: post
title: GCP Pub/Sub Subscription 機制深入：Pull/Push、Ack Deadline、重試與 Dead Letter
date: 2025-18-11 
description: 整理 Subscription 的運作機制與實務設定——Pull 與 Push 怎麼選、ack deadline 與 lease 續約、retry policy、dead letter、訊息順序、filter、exactly-once delivery，以及上線前該檢查的項目
tags: gcp pubsub message-queue golang distributed-systems
categories: gcp
---

接續上一篇的核心概念，這篇把 Subscription 的機制拆開來看。實務上 Pub/Sub 出問題，九成都是出在這一層——ack 沒回、deadline 設太短、重試policy 沒調、壞訊息卡住整條線。

## Subscription 的四種型態

| 型態 | 訊息怎麼流動 | 適合場景 |
|---|---|---|
| **Pull** | Subscriber 主動連線拉取 | 一般後端服務、需要控制消費速率、高吞吐量 |
| **Push** | Pub/Sub 主動 POST 到你的 HTTPS endpoint | Serverless（Cloud Run / Cloud Functions）、低流量、不想常駐連線 |
| **BigQuery** | Pub/Sub 直接寫進 BigQuery table | 資料收集，中間不需要任何處理邏輯 |
| **Cloud Storage** | Pub/Sub 直接寫成 GCS 檔案 | 歸檔、批次處理的原始資料落地 |

後兩種是「匯出型 Subscription」，完全不需要自己寫 Subscriber，適合純資料落地的場景。以下主要談 Pull 與 Push。

## Pull：Subscriber 主動拉

Pull 底下其實有兩種做法：

- **StreamingPull**：gRPC 雙向串流，Subscriber 開一條長連線，訊息一到就推過來。各語言的官方 client library 預設都用這個，吞吐量與延遲都最好
- **Unary Pull**：一次 RPC 拉一批訊息就結束。適合排程觸發、批次處理，或環境不支援長連線的情況

用 Go 的 client library 大概長這樣：

```go
sub := client.Subscription("order-inventory-sub")

// 流量控制：同時最多處理 100 則、總計 50 MB
sub.ReceiveSettings.MaxOutstandingMessages = 100
sub.ReceiveSettings.MaxOutstandingBytes = 50 * 1024 * 1024
sub.ReceiveSettings.NumGoroutines = 4

err := sub.Receive(ctx, func(ctx context.Context, m *pubsub.Message) {
    if err := handle(ctx, m.Data); err != nil {
        m.Nack()   // 明確告訴 Pub/Sub 這則失敗，請重送
        return
    }
    m.Ack()
})
```

要注意 `Receive` 的 callback 是**併發**執行的，同時會有多則訊息在跑，處理函式本身必須是 thread-safe 的。

**Flow control（流量控制）** 是 Pull 很重要的一環：`MaxOutstandingMessages` 限制同時未 ack 的訊息數量，達到上限後 client 就會暫停拉取。沒設好的話，尖峰時一次湧入幾千則訊息，記憶體直接爆掉，或是下游資料庫被打死。這個值該設多少，取決於單則訊息的處理成本與下游能承受的併發量。

## Push：Pub/Sub 主動送

Push 的模型是 Pub/Sub 對你的 HTTPS endpoint 發 POST，訊息放在 request body：

- 回 **HTTP 2xx** = ack，這則訊息完成
- 回其他狀態碼或逾時 = nack，會被重送
- Endpoint 必須是 HTTPS，且有有效憑證
- 可以設定 **OIDC token 驗證**：Pub/Sub 會帶著指定 service account 的 token 呼叫，你的服務驗證這個 token 才處理，避免 endpoint 被任意來源打

Push 的 ack deadline 就是 HTTP request 的逾時時間（預設 10 秒，最長可調到 600 秒）。它也有自己的流量控制：Pub/Sub 會依照成功率動態調整推送速率，一直失敗就自動退避，成功就慢慢加速。

### 怎麼選

| 考量 | Pull | Push |
|---|---|---|
| 消費速率控制 | 自己完全掌控 | 由 Pub/Sub 決定 |
| 吞吐量 | 高 | 較低（每則一個 HTTP request） |
| 部署形態 | 需要常駐 process | 無狀態 HTTP 服務即可 |
| 網路需求 | 只要能對外連線 | 需要對外的 HTTPS endpoint |
| Exactly-once | 支援 | **不支援** |
| 有序傳遞 | 支援 | 支援 |

簡單的判斷方式：**跑在 Cloud Run / Cloud Functions 這類請求驅動的環境，用 Push；跑在 GKE / GCE 上的常駐服務，或需要嚴格控制併發、需要 exactly-once，用 Pull。**

## Ack、Nack 與 Ack Deadline

這是整個機制的核心。

訊息送到 Subscriber 之後，會進入 **outstanding（未確認）** 狀態，同時開始倒數 **ack deadline**（預設 10 秒，可設定 10～600 秒）：

- 期限內回 **ack** → 訊息從 Subscription 移除，完成
- 明確回 **nack** → 立刻視為失敗，馬上重送（不等 deadline 到期）
- 什麼都沒回、deadline 到期 → 視為失敗，重送

處理時間超過 ack deadline 是新手最常見的問題：訊息還在處理中，Pub/Sub 已經判定逾時把它重送給另一台 worker，結果同一件事被做了兩次，而且第一台處理完回 ack 時 ack ID 已經失效。

### Lease 自動續約

好消息是，官方 client library 都有做 **lease management**：只要訊息還在你的 callback 裡沒回 ack，函式庫會在背景自動呼叫 `modifyAckDeadline` 幫你延長期限，不需要自己把 ack deadline 設成 600 秒。

不過續約不是無上限的，各語言都有一個「最長延長時間」的設定（Go 是 `ReceiveSettings.MaxExtension`，預設 60 分鐘）。所以：

- **處理時間可能超過幾分鐘的任務，要顯式調大這個上限**，否則做到一半訊息還是會被重送
- 更好的做法是**不要讓訊息處理跑太久**：收到訊息後只做「登記任務 + ack」，實際的長時間工作交給另外的機制跑。訊息佇列不適合拿來當長時間任務的執行框架

如果沒用官方 client library（例如自己包 REST API），就得自己處理續約，這也是不建議自己接的原因。

## Retry Policy：重送要隔多久

每個 Subscription 可以設定重試策略：

- **Immediate retry（預設）**：失敗後幾乎立刻重送
- **Exponential backoff**：設定 `minimum_backoff`（預設 10 秒）與 `maximum_backoff`（預設 600 秒），失敗後等待時間逐次加倍

預設的立即重送在很多情境下是有害的：下游資料庫暫時掛掉時，訊息會以最高速度不斷重試，把已經有問題的下游打得更慘。**只要下游有外部依賴（DB、第三方 API），就應該改用 exponential backoff**，給下游恢復的時間。

## Dead Letter Topic：別讓一則壞訊息卡住全部

如果一則訊息因為內容本身有問題（格式錯誤、參照到不存在的資料）而永遠處理不成功，它會在保留期內一直重試，佔用處理量、把 backlog 撐大，如果又剛好有 ordering key，還會把同 key 後面的訊息全部堵住。

Dead letter topic 的作用就是設一個上限：

- 設定 `max_delivery_attempts`（範圍 5～100，預設 5）
- 超過次數後，訊息不再重試，改為轉發到指定的 dead letter topic
- 這個 DLQ topic 底下再掛一個 Subscription，讓人工或另一套流程去檢查

設定時有兩個很容易漏掉的權限（漏掉的話設定看起來成功、實際不會轉發）：Pub/Sub 的服務帳號 `service-{PROJECT_NUMBER}@gcp-sa-pubsub.iam.gserviceaccount.com` 需要對來源 Subscription 有 `roles/pubsub.subscriber`、對 DLQ topic 有 `roles/pubsub.publisher`。

另外提醒：**DLQ 只是把問題搬個位置，不是解決問題**。DLQ topic 也要有自己的 Subscription 和監控告警，不然訊息進去之後同樣會過期消失，而且沒人知道。

## 訊息順序：Ordering Key

Pub/Sub 預設不保證順序。需要順序時：

1. Publisher 發布時帶上 **orderingKey**（例如用 `order_id`、`user_id`）
2. Subscription 開啟 **enable_message_ordering**
3. Publisher 要用區域性的 endpoint 發布，確保同一個 key 的訊息進到同一個處理區域

保證的範圍是「**同一個 ordering key 內的訊息，會依照發布順序、依序傳遞給 Subscriber**」。不同 key 之間互不相干，仍然是併發處理——這其實是好事，順序保證的粒度越細，可平行處理的程度就越高。

代價要清楚：**同一個 key 的訊息是嚴格序列化的**，前一則沒 ack 成功，後面的就送不出來。所以一則處理不掉的訊息會卡住整個 key 的後續流程，這時候 dead letter topic 就不是選配而是必要的了。

實務上的建議是：**ordering key 的粒度要盡量細**（用 `order_id` 而不是 `shop_id`），而且先確認業務上是否真的需要順序——很多時候把消費端設計成「順序無關 + 冪等」，比開 ordering 來得單純可靠。

## Filter：在服務端就過濾掉不要的訊息

Subscription 可以設定 filter，只接收符合條件的訊息：

```
attributes.event_type = "order.paid" AND attributes.region = "tw"
```

幾個關鍵限制：

- **只能過濾 attributes，不能看訊息內容（data）**。所以要拿來過濾的欄位一定要放在 attributes
- **Filter 在建立 Subscription 時就固定，之後不能修改**，要改只能刪掉重建（而重建就會失去 backlog——回到上一篇說的那條規則）
- 被過濾掉的訊息會自動 ack，但**費用照算**，因為訊息還是有經過服務

好處是可以只開一個 Topic，讓不同的訂閱者各自過濾自己要的事件，不用為每種事件類型都開一個 Topic。

## Exactly-once Delivery 保證了什麼

Pub/Sub 預設是 **at-least-once**：訊息至少送達一次，可能重複。

Pull 型 Subscription 可以開啟 **exactly-once delivery**（Push 與匯出型不支援），它保證的是：

- 一則訊息成功 ack 之後，**不會再被重送**
- 在 ack deadline 未到期前，不會有重複投遞

要留意它**沒有**保證的部分：這是「傳遞層」的保證，不是「處理層」的保證。Subscriber 處理到一半就當掉、還沒 ack，訊息一樣會重送——只是你不會再遇到「已經 ack 成功卻又收到同一則」的情況。

所以結論不變：**消費端的處理邏輯還是必須是冪等的**。常見做法是用 `messageId` 或業務上的唯一鍵（訂單編號＋事件類型）做去重，或是把處理設計成天然冪等的操作（用 upsert 而不是 insert、狀態機只允許往前推進）。開啟 exactly-once 還會讓吞吐量下降、延遲上升，所以先做好冪等，通常比開這個選項更划算。

## 該監控什麼

Cloud Monitoring 上最該盯的幾個指標：

| 指標 | 意義 | 為什麼重要 |
|---|---|---|
| `subscription/num_undelivered_messages` | 未處理訊息數（backlog） | 持續上升 = 消費速度跟不上 |
| `subscription/oldest_unacked_message_age` | 最舊未確認訊息的年齡 | **最重要的告警指標**，逼近保留期就要掉訊息了 |
| `subscription/expired_ack_deadlines_count` | ack deadline 逾時次數 | 高 = 處理太慢或 deadline 設太短 |
| `subscription/dead_letter_message_count` | 進入 DLQ 的數量 | 有值就代表有一直失敗的訊息 |
| `subscription/push_request_count`（依 response code 分組） | Push 的回應狀態分布 | Push 模式下看健康度的主要依據 |

如果只能設一個告警，選 `oldest_unacked_message_age`。backlog 數量大不一定是問題（可能只是尖峰流量），但「最舊的訊息一直沒被處理」幾乎一定是問題。

## 上線前的檢查清單

- [ ] Subscription 在 Publisher 開始發布之前就已經建立
- [ ] 消費邏輯是冪等的（假設每則訊息都可能重複收到）
- [ ] Ack deadline 或 client 的 lease 延長上限，涵蓋得住最慢的處理時間
- [ ] 有外部依賴的話，retry policy 改用 exponential backoff
- [ ] 有設定 dead letter topic，且相關 IAM 權限已授予
- [ ] DLQ 本身有 Subscription 與告警，不是丟進去就沒人管
- [ ] Flow control（`MaxOutstandingMessages`）設了合理的值
- [ ] 用到 ordering key 的話，粒度夠細，而且一定要搭配 DLQ
- [ ] 要過濾的欄位放在 attributes（filter 建立後不能改）
- [ ] `oldest_unacked_message_age` 有設告警
- [ ] Message retention duration 是有意識設定的，不是預設值

## 小結

Subscription 的機制說穿了就是圍繞著一件事：**訊息在被 ack 之前，都還活著**。ack deadline 決定它多久沒消息就重送、retry policy 決定重送的節奏、dead letter 決定什麼時候放棄、ordering key 決定重送時會不會卡住別人。

把這條線想清楚，剩下的設定就只是依照自己的業務特性選參數而已。而不管參數怎麼調，「消費端必須冪等」這件事永遠是前提。

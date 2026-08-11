---
layout: post
title: GCP Pub/Sub 核心概念整理：Topic、Subscription 與訊息的一生
date: 2025-08-10
description: 整理 GCP Pub/Sub 的基礎必備觀念——Topic 與 Subscription 的分工、fan-out 與負載分攤怎麼設計、一則訊息從發布到被確認的完整流程，以及跟 RabbitMQ / Kafka 的心智模型差異
tags: gcp pubsub message-queue distributed-systems
categories: gcp
---

## 為什麼需要 Pub/Sub

服務之間如果直接用 HTTP 互相呼叫，會有幾個典型問題：下游掛掉時上游跟著失敗、流量尖峰時下游被打爆、想多加一個訂閱者就得改上游的程式碼。訊息佇列就是為了把這層耦合拆開——上游只負責把事件丟出去，誰要收、收得多快、收失敗怎麼辦，都是下游自己的事。

GCP Pub/Sub 是 Google Cloud 的全代管訊息服務，特點是不用自己維運 broker、天生跨區、可以水平擴展。但它的模型跟 RabbitMQ 或 Kafka 不太一樣，如果直接把舊的心智模型套過來，很容易踩到坑。這篇先把最基礎的幾個觀念整理清楚。

## 四個角色

| 角色 | 職責 |
|---|---|
| **Publisher** | 把訊息發布到 Topic 的一方 |
| **Topic** | 訊息的分類名稱，發布的入口 |
| **Subscription** | 訂閱關係＋這個訂閱者專屬的訊息佇列 |
| **Subscriber** | 從 Subscription 取得訊息並處理的一方 |

其中最關鍵、也最容易誤解的是 **Subscription**。它不只是「訂閱這個 Topic」的宣告，它本身就是一條獨立的佇列：Topic 收到訊息後，會把訊息**複製一份到每一個 Subscription**，之後每個 Subscription 各自維護自己的未確認訊息、各自重試、各自累積 backlog，互不影響。

## 最重要的一條規則：先有 Subscription，訊息才會被保留

Pub/Sub 不像 Kafka 那樣把訊息無條件寫進 log 保留一段時間。**訊息只會被存在「發布當下已經存在」的 Subscription 裡**。

也就是說：

- 如果一個 Topic 沒有任何 Subscription，發布的訊息會直接被丟掉，publish 還是會回成功
- 如果你先發布了 1000 則訊息，事後才建立 Subscription，這個新的 Subscription 一則都拿不到

這是實務上最常見的意外之一：測試環境把 Subscription 刪掉重建，就會發現訊息全不見了。所以**部署順序上，Subscription 一定要比 Publisher 先就緒**。

（Topic 本身也可以另外開啟 message retention，把訊息保留在 Topic 層級最多 31 天，這樣新建的 Subscription 才有機會 seek 回過去的訊息，但這是要額外開啟、額外收費的功能，預設是關的。）

## Fan-out 與負載分攤：用 Subscription 數量決定

這兩個很常搞混的需求，在 Pub/Sub 裡是靠 Subscription 的配置來區分的：

**情境一：同一則訊息要讓多個服務都收到（fan-out）**

```
                    ┌── sub-notification ──→ 通知服務
topic: order.paid ──┼── sub-analytics    ──→ 數據分析
                    └── sub-inventory    ──→ 庫存服務
```

一個 Topic 掛多個 Subscription，每個 Subscription 都會拿到**完整的一份**訊息。要新增一個訂閱者，只要多建一個 Subscription，Publisher 完全不用改。

**情境二：同一則訊息只要被處理一次，但要多台機器分攤（competing consumers）**

```
                                        ┌──→ worker-1
topic: order.paid ── sub-inventory ─────┼──→ worker-2
                                        └──→ worker-3
```

多個 Subscriber 連到**同一個 Subscription**，Pub/Sub 會把訊息分散給它們，同一則訊息正常情況下只會給其中一台。要加開處理量，直接把 worker 副本數往上加就好，不需要動任何 Pub/Sub 設定——這也是為什麼 Pub/Sub 很適合搭配會自動擴縮的 Cloud Run / GKE。

實務上兩者常常混用：三個 Subscription 做 fan-out，每個 Subscription 底下再各跑多個 worker 分攤負載。

## 訊息長什麼樣子

一則 Pub/Sub 訊息包含這幾個部分：

- **data**：訊息本體，是 bytes（實際傳輸時是 base64 編碼）。Pub/Sub 不在意內容格式，JSON、Protobuf 都可以，單則上限 10 MB
- **attributes**：一組 key-value 的字串 metadata。**Subscription 的 filter 只能過濾 attributes，不能看 data**，所以會拿來過濾的欄位（例如 `event_type`、`tenant_id`）記得放這裡
- **messageId**：Pub/Sub 產生的唯一 ID，發布成功時回傳
- **publishTime**：服務端收到的時間
- **orderingKey**：需要保證順序時才會用到（下一篇會談）

如果想在服務之間強制訊息格式，Topic 可以綁 **Schema**（支援 Avro 與 Protobuf），格式不符的訊息會在 publish 階段就被擋下來，不用等到消費端才炸。

## 一則訊息的一生

1. Publisher 呼叫 publish，訊息送到 Topic（客戶端函式庫預設會做批次，累積一小段時間或一定數量才送出，用延遲換吞吐量）
2. Pub/Sub 寫入儲存並回傳 `messageId`——**收到 messageId 才代表發布成功**，在那之前都應該視為未送達
3. 訊息被複製到該 Topic 底下的每一個 Subscription
4. 各 Subscription 依自己的型態把訊息交給 Subscriber（Pull 是 Subscriber 來拉、Push 是 Pub/Sub 主動送）
5. Subscriber 處理完後回 **ack**；訊息從這個 Subscription 移除
6. 如果沒在期限內 ack（或明確 nack），訊息會被**重送**
7. 重試超過設定次數後，可以被丟到 dead letter topic，避免一則壞訊息無限卡住

第 5～7 步就是 Subscription 機制的核心，下一篇會展開講。

## 訊息會留多久

每個 Subscription 有自己的 **message retention duration**，預設 7 天（可設定 10 分鐘到 7 天，開啟延長保留後最多 31 天）。在保留期內：

- 未 ack 的訊息會持續重試
- 已 ack 的訊息如果開啟了 **retain acked messages**，還可以用 **Seek** 倒帶重播

**Seek** 可以把 Subscription 的游標移到某個時間點（重播那之後的訊息），或是移到「現在」（等於一次清空整個 backlog，事故處理時很常用）。**Snapshot** 則是把某個時刻的未確認狀態存起來，之後可以 seek 回這個快照——上線新版消費邏輯前先開一個 snapshot，出事就能倒回去重跑，是滿實用的做法。

## 跟 RabbitMQ / Kafka 的心智模型對照

| | GCP Pub/Sub | RabbitMQ | Kafka |
|---|---|---|---|
| 訊息入口 | Topic | Exchange | Topic |
| 消費單位 | Subscription | Queue | Consumer Group |
| 訊息保留 | 只存進**已存在的** Subscription | 只存進已綁定的 Queue | 寫進 log，依 retention 保留，與消費者無關 |
| 消費進度 | 服務端逐則管理 ack | 服務端逐則管理 ack | 消費者自己管理 offset |
| 順序保證 | 需用 ordering key，同 key 才保證 | 單一 queue 內大致有序 | 同 partition 內嚴格有序 |
| 擴充處理量 | 增加 subscriber 即可 | 增加 consumer | 受 partition 數量上限限制 |

心智模型上，**Pub/Sub 的 Subscription ≈ RabbitMQ 的 Queue**，這個對照最好用。反而跟 Kafka 差最遠：Kafka 是「一份 log 大家各自讀」，Pub/Sub 是「每個訂閱者各拿一份副本、服務端幫你記到哪裡」。習慣 Kafka 的人最容易錯的就是以為訊息會先躺在 Topic 裡等人來讀。

Pub/Sub 也沒有 partition 的概念，吞吐量不需要事先規劃分區數量——這是它擴展性上最舒服的一點，代價是失去了「同一個 partition 天然有序」這件事，要順序就得自己用 ordering key 換。

## 幾個一定要先知道的前提

- **預設是 at-least-once**：訊息可能重複送達（網路抖動、ack 遺失、subscriber 重啟都會造成），**消費端的處理邏輯必須設計成冪等的**。這不是可選項
- **預設不保證順序**：沒設 ordering key 就沒有任何順序保證，先發的訊息可能後到
- **publish 成功不等於處理成功**：兩者之間隔著整個 Subscription 的重試機制
- **同一則訊息在不同 Subscription 之間完全獨立**：A subscription ack 了不影響 B subscription 還在重試
- **重複與失敗都是常態**：把重試、冪等、dead letter 當成基本設計，而不是事後補救

## 小結

Pub/Sub 的觀念其實不複雜，但「Subscription 才是佇列本體」「先有 Subscription 訊息才會留」這兩件事是所有行為的起點，先想清楚了，後面的 ack、重試、順序、過濾才會串得起來。

下一篇會專門整理 Subscription 的機制：Pull 與 Push 的差異、ack deadline 怎麼運作、retry policy 與 dead letter 該怎麼設，還有 exactly-once delivery 到底保證了什麼。

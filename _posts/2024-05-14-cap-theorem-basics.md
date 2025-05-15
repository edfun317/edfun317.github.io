---
layout: post
title: Understanding CAP Theorem in Distributed Systems
date: 2024-05-14
description: A clear explanation of CAP theorem fundamentals and its implications in distributed systems design
tags: system-design distributed-systems cap-theorem
categories: distributed-systems
---

## Understanding CAP Theorem

CAP theorem (也稱為布魯爾定理 Brewer's theorem) 指出在分散式系統中，以下三個特性最多只能同時滿足其中兩個：

### Consistency (一致性)
- 所有節點在同一時間看到相同的數據
- 當數據更新後，所有客戶端讀取到的數據都是最新的
- 範例：當你更新銀行帳戶餘額，不論連到哪個節點查詢都應該看到更新後的金額

### Availability (可用性)
- 每個對非故障節點的請求都必須得到回應
- 系統持續運作並回應請求
- 範例：即使某些節點故障，系統仍然可以處理用戶請求

### Partition Tolerance (分區容錯性)
- 系統在網路分區(節點之間無法通訊)的情況下仍能繼續運作
- 即使節點之間的網路出現問題，系統仍可維持運作
- 範例：當兩個數據中心之間的網路連接中斷時，系統仍可繼續提供服務

## CAP 的取捨

在實際的分散式系統中，網路分區(P)是不可避免的，所以實際上我們只能在 CP 和 AP 之間做選擇：

### CP (Consistency + Partition Tolerance)
- 犧牲可用性 (A)
- 當發生網路分區時，系統會停止服務以確保一致性
- 適用場景：
  - 銀行交易系統
  - 庫存管理系統
  - 訂單處理系統

### AP (Availability + Partition Tolerance)
- 犧牲一致性 (C)
- 系統會繼續提供服務，但可能返回舊數據
- 適用場景：
  - 社交媒體貼文
  - 新聞推薦系統
  - 商品評論系統

## 實際應用案例

### 銀行系統 (CP)
```
場景：銀行轉帳
選擇：CP（一致性 + 分區容錯性）
理由：
- 不能容忍帳戶餘額不一致
- 寧可暫時無法服務也不能出現錯誤數據
- 必須確保交易的 ACID 特性
```

### 社交媒體 (AP)
```
場景：Instagram 貼文
選擇：AP（可用性 + 分區容錯性）
理由：
- 用戶暫時看不到最新貼文是可以接受的
- 系統持續可用比數據即時一致更重要
- 可以使用最終一致性解決方案
```

## CAP 理論的限制

需要注意的是，CAP 理論有其限制：

1. **非二元選擇**
   - 一致性和可用性並非非黑即白
   - 可以在不同層級實現不同程度的一致性或可用性

2. **特定場景**
   - CAP 主要適用於分散式數據存儲系統
   - 不是所有分散式系統設計決策的唯一依據

3. **技術演進**
   - 現代資料庫系統提供了更多細緻的選項
   - 可以在不同操作上做出不同的 CAP 選擇

## 結論

CAP 理論幫助我們理解分散式系統的基本限制和取捨。選擇 CP 還是 AP 取決於業務需求：
- 需要強一致性的場景（如金融系統）選擇 CP
- 需要高可用性的場景（如社交媒體）選擇 AP

理解這些概念有助於做出更好的系統設計決策。而且要注意，這不是一個非黑即白的選擇，現代系統往往需要在不同場景中找到適當的平衡點。

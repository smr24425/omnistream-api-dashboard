# JSON 路徑與選擇器指南

學習如何從任何 API 回傳結構中精確提取資料點。

## 1. 物件遍歷 (Object Traversal)
使用點號 (`.`) 符號來穿透層級物件。
- **範例**: `{ "platform": { "online_users": 6742 } }`
- **選擇器**: `platform.online_users`

## 2. 陣列存取 (Array Access)
使用從零開始的索引數字來存取列表中的特定項目。
- **範例**: `{ "services": [ { "rps": 950 }, { "rps": 3200 } ] }`
- **選擇器**: `services.0.rps` (回傳 950)

## 3. 動態選擇器 (Dynamic Selectors)
根據「鍵值對」匹配來從陣列中尋找特定物件。
- **語法**: `[鍵=值].目標欄位`
- **範例**: `{ "services": [ { "name": "checkout", "rps": 950 }, { "name": "search", "rps": 3200 } ] }`
- **選擇器**: `services.[name=checkout].rps` (回傳 950)

| 類型 | 範例數據 | 選擇器 | 說明 |
| :--- | :--- | :--- | :--- |
| 物件遍歷 | `{ "platform": { "error_rate": 1.4 } }` | `platform.error_rate` | 穿透巢狀物件 |
| 動態選擇器 | `{ "traffic": [ { "region": "APAC", "requests": 4100 } ] }` | `traffic.[region=APAC].requests` | 根據鍵值對尋找陣列中的項目 |
| **數值加總 (Sum)** | `{ "services": [ { "rps": 950 }, { "rps": 3200 } ] }` | `sum(services.rps)` | 將所有匹配的數值進行加總 |

## 進階功能：數據聚合 (Data Aggregation)
當您的選擇器匹配到陣列中的多個項目時，可以使用聚合函數來處理這些數據。

### `sum(path)`
計算路徑匹配到的所有數值的總和。
- **範例**: `sum(services.rps)`
- **結果**: 系統會加總 `services` 陣列中所有物件的 `rps` 欄位值。

> [!TIP]
> 您可以將這些選擇器串聯起來處理複雜結構！
> `services.[name=checkout].latency_p95`

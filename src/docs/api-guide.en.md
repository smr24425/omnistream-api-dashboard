# JSON Path & Selector Guide

Learn how to extract precise data points from any API response structure.

## 1. Object Traversal
Use dot notation to move through nested objects.
- **Example**: `{ "platform": { "online_users": 6742 } }`
- **Selector**: `platform.online_users`

## 2. Array Access
Use zero-based indices to access specific items in a list.
- **Example**: `{ "services": [ { "rps": 950 }, { "rps": 3200 } ] }`
- **Selector**: `services.0.rps` (returns 950)

## 3. Dynamic Selectors
Find an object in an array based on a key-value match.
- **Syntax**: `[key=value].targetField`
- **Example**: `{ "services": [ { "name": "checkout", "rps": 950 }, { "name": "search", "rps": 3200 } ] }`
- **Selector**: `services.[name=checkout].rps` (returns 950)

| Feature | Example Data | Selector | Description |
| :--- | :--- | :--- | :--- |
| Object Traversal | `{ "platform": { "error_rate": 1.4 } }` | `platform.error_rate` | Navigate nested objects |
| Dynamic Selector | `{ "traffic": [ { "region": "APAC", "requests": 4100 } ] }` | `traffic.[region=APAC].requests` | Find item by key-value pair |
| **Sum Aggregation** | `{ "services": [ { "rps": 950 }, { "rps": 3200 } ] }` | `sum(services.rps)` | Sum all matching numeric values |

## Advanced: Data Aggregation
When your selector matches multiple items, you can use aggregation functions to process them.

### `sum(path)`
Calculate the total of all numeric values matched by the path.
- **Example**: `sum(services.rps)`
- **Result**: Sums the `rps` field across all objects in the `services` array.

> [!TIP]
> You can chain these selectors together for complex structures!
> `services.[name=checkout].latency_p95`

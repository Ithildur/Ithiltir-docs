---
slug: /Config/Traffic
title: Traffic Accounting
---

# 流量统计和账期

Dash 从节点上报的网卡计数器生成流量统计。系统保存原始入站和出站计数，计费视图由方向模式决定。

## 模式

| 模式 | 值 | 行为 |
| --- | --- | --- |
| 轻量模式 | `lite` | 保存月度入/出总量和估算峰值 |
| 计费模式 | `billing` | 额外维护 5 分钟事实、日汇总、P95、覆盖率和月度快照 |

`GET /api/statistics/traffic/daily` 只在 `billing` 模式可用，否则返回 `409 traffic_daily_requires_billing`。`period` 可选，允许 `current`、`previous`，省略时为 `current`。

`GET /api/statistics/traffic/monthly` 支持 `months` 和 `period`。`months` 最大 24；`period=current` 从本账期开始，`period=previous` 从上账期开始，省略时为 `current`。响应字段 `includes_current` 在 `period=current` 时为 `true`，在 `period=previous` 时为 `false`。

## 全局设置

```json
{
  "guest_access_mode": "disabled",
  "usage_mode": "lite",
  "cycle_mode": "calendar_month",
  "billing_start_day": 1,
  "billing_anchor_date": "",
  "billing_timezone": "Asia/Shanghai",
  "direction_mode": "out"
}
```

允许值：

| 字段 | 允许值 |
| --- | --- |
| `guest_access_mode` | `disabled`、`by_node` |
| `usage_mode` | `lite`、`billing` |
| `cycle_mode` | `calendar_month`、`whmcs_compatible`、`clamp_to_month_end` |
| `direction_mode` | `out`、`both`、`max` |

## 账期模式

| 模式 | 行为 |
| --- | --- |
| `calendar_month` | 自然月，`billing_start_day` 固定为 `1` |
| `clamp_to_month_end` | 每月指定日起算；遇到短月夹到月末 |
| `whmcs_compatible` | 按 WHMCS 兼容规则生成账期；可使用 `billing_anchor_date` 锚定 |

`billing_anchor_date` 接受 `YYYY-MM-DD` 或 RFC3339，保存时规范化成 `YYYY-MM-DD`。

`billing_timezone` 必须是 Go 可加载的 IANA 时区，例如：

```text
Asia/Shanghai
Asia/Hong_Kong
UTC
America/Los_Angeles
```

## 节点覆盖

节点可覆盖全局账期：

| 字段 | 说明 |
| --- | --- |
| `traffic_cycle_mode` | `default` 表示继承全局；也可使用三个账期模式 |
| `traffic_billing_start_day` | 1 到 31 |
| `traffic_billing_anchor_date` | WHMCS 锚点 |
| `traffic_billing_timezone` | 节点账期时区 |
| `traffic_p95_enabled` | 是否为该节点计算 P95 |

规范化规则：

- `default` 清空节点账期字段并继承全局。
- `calendar_month` 保存 `traffic_billing_start_day=1`。
- 非 `whmcs_compatible` 模式保存空 `traffic_billing_anchor_date`。
- 非默认模式下空 `traffic_billing_timezone` 在读取时使用应用时区。

## 方向模式

| 模式 | 计费视图 |
| --- | --- |
| `out` | 只使用出站 |
| `both` | 入站 + 出站 |
| `max` | 每项指标选择入站/出站较大值 |

响应仍保留原始字段：

- `in_bytes`
- `out_bytes`
- `in_p95_bytes_per_sec`
- `out_p95_bytes_per_sec`
- `in_peak_bytes_per_sec`
- `out_peak_bytes_per_sec`

当前计费视图字段：

- `selected_bytes`
- `selected_p95_bytes_per_sec`
- `selected_peak_bytes_per_sec`
- `selected_bytes_direction`
- `selected_p95_direction`
- `selected_peak_direction`

客户端应使用 `coverage_ratio` 展示样本覆盖率和准确性提示。`partial` 仅为兼容保留，新的展示逻辑不应依赖该字段。

## 后台服务

流量后台服务会：

- 每 5 分钟物化 5 分钟流量事实。
- 每小时刷新月度快照。
- 分块回填月度用量。
- 在 `billing` 模式补齐缺失 5 分钟桶。

`traffic_retention_days` 控制 5 分钟事实保留窗口。

## P95 状态

`p95_status` 可能是：

- `available`
- `disabled`
- `lite_mode`
- `insufficient_samples`
- `snapshot_without_p95`

只有 `available` 时，P95 字段才不是 `null`。

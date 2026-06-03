---
slug: /Config/Traffic
---

# 流量统计和账期

Dash 从节点上报的网卡计数器生成流量统计。系统保存原始入站和出站计数，计费视图由方向模式决定。

## 模式

| 模式 | 值 | 行为 |
| --- | --- | --- |
| 轻量模式 | `lite` | 根据近期原始网卡采样保存月度入/出总量和估算峰值 |
| 计费模式 | `billing` | 维护当前 5 分钟事实、日汇总、P95、覆盖率和月度快照 |

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

节点可覆盖全局账期和统计方向：

| 字段 | 说明 |
| --- | --- |
| `traffic_cycle_mode` | `default` 表示继承全局；也可使用三个账期模式 |
| `traffic_billing_start_day` | 1 到 31 |
| `traffic_billing_anchor_date` | WHMCS 锚点 |
| `traffic_billing_timezone` | 节点账期时区 |
| `traffic_direction_mode` | `default` 表示继承全局；也可使用 `out`、`both`、`max` |
| `traffic_p95_enabled` | 是否为该节点计算 P95 |

规范化规则：

- `default` 清空节点账期字段并继承全局。
- `calendar_month` 保存 `traffic_billing_start_day=1`。
- 非 `whmcs_compatible` 模式保存空 `traffic_billing_anchor_date`。
- 非默认模式下空 `traffic_billing_timezone` 在读取时使用应用时区。
- `traffic_direction_mode=default` 继承全局统计方向；`out`、`both`、`max` 覆盖该节点。

## 方向模式

| 模式 | 计费视图 |
| --- | --- |
| `out` | 只使用出站 |
| `both` | 入站 + 出站 |
| `max` | 每项指标选择入站/出站较大值 |

全局 `direction_mode` 是默认计费视图。节点设置 `traffic_direction_mode=default` 时继承全局值。

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

后台服务负责把节点上报的原始计数器整理成查询使用的流量事实和月度结果。写入节奏如下：

- 每 5 分钟按近期原始采样 upsert 可推导出的 5 分钟事实。
- 每次物化时更新近期月度用量。
- 每小时刷新月度快照。
- 与手工 5 分钟事实重建串行执行。

`traffic_retention_days` 控制 5 分钟事实保留窗口，也决定手工重建能使用的事实范围。`traffic_5m` 保持可写，并通过滚动保留策略删除旧数据；历史 P95 计费值保存在月度快照中。

## 手工重建

当保留窗口内的事实需要重新生成时，管理台可按节点启动流量重建。重建任务根据保留窗口内的原始 `nic_metrics` 重写该节点的 5 分钟事实，并让重叠的月度快照失效。任务是进程内单任务状态，不跨进程重启持久化。任务失败后，月度历史由后续快照维护、读取路径按保留事实计算，或重试重建恢复；超出保留窗口的数据不会自动补回。

## P95 状态

`p95_status` 可能是：

- `available`
- `disabled`
- `lite_mode`
- `insufficient_samples`
- `snapshot_without_p95`

只有 `available` 时，P95 字段才不是 `null`。

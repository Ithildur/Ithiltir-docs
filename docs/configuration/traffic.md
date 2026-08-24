---
slug: /Config/Traffic
---

# 流量统计和账期

Dash 从 Node 上报的网卡计数器生成流量统计。原始入站和出站计数分开保存；方向模式只决定查询时选择的计费视图。

## 模式

| 模式 | 值 | 行为 |
| --- | --- | --- |
| 轻量模式 | `lite` | 保存每个节点、网卡和账期的月度入/出总量、估算峰值和覆盖边界；不写 5 分钟事实 |
| 计费模式 | `billing` | 保留同一月度累计，并额外维护 5 分钟事实、日汇总、P95、覆盖率和月度计费快照 |

`GET /api/statistics/traffic/daily` 只在 Billing 模式可用，否则返回 `409 traffic_daily_requires_billing`。

`GET /api/statistics/traffic/monthly` 的 `months` 只接受 `1..24`。`period` 允许 `current` 或 `previous`，省略时为 `current`。

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

可修改字段：

| 字段 | 允许值 |
| --- | --- |
| `guest_access_mode` | `disabled`、`by_node` |
| `usage_mode` | `lite`、`billing` |
| `direction_mode` | `out`、`both`、`max` |

`cycle_mode`、`billing_start_day`、`billing_anchor_date` 和 `billing_timezone` 只为旧响应结构兼容保留，固定表示应用时区中从 1 号开始的自然月。`PATCH /api/statistics/traffic/settings` 提交任一账期字段会返回 `400 billing_cycle_is_per_node`。

## 节点账期

每个节点显式保存自己的账期：

| 字段 | 说明 |
| --- | --- |
| `traffic_cycle_mode` | `calendar_month`、`whmcs_compatible` 或 `clamp_to_month_end` |
| `traffic_billing_start_day` | `1..31` |
| `traffic_billing_anchor_date` | WHMCS 锚点 |
| `traffic_billing_timezone` | IANA 时区 |
| `traffic_direction_mode` | `default`、`out`、`both` 或 `max` |
| `traffic_p95_enabled` | 是否为该节点计算 P95 |

账期模式：

| 模式 | 行为 |
| --- | --- |
| `calendar_month` | 自然月，开始日固定为 1 |
| `clamp_to_month_end` | 每月指定日起算；短月夹到月末 |
| `whmcs_compatible` | 使用 `traffic_billing_anchor_date` 对齐 WHMCS 兼容账期 |

`traffic_billing_anchor_date` 接受 `YYYY-MM-DD` 或 RFC3339，保存时规范化为 `YYYY-MM-DD`。时区必须是可加载的 IANA 时区，例如 `Asia/Hong_Kong` 或 `UTC`；空值读取时使用应用时区。

新节点默认保存 `calendar_month` 和开始日 1。旧客户端仍可提交 `traffic_cycle_mode=default`，但该值只是不带账期字段时可用的输入别名，会保存为显式自然月，后续读取不再返回 `default`。

节点账期变更立即生效。Dash 会删除该节点受影响的月度派生数据，并从新旧当前账期中较早的起点开始修复仍在网卡原始指标保留期内的数据。修复期间只暂停该节点在 `lite` 模式下的实时用量累计，不影响其他节点。修复完成前，当前账期统计可能暂时缺失或仅覆盖部分时段。

## 方向模式

| 模式 | 计费视图 |
| --- | --- |
| `out` | 只使用出站 |
| `both` | 入站 + 出站 |
| `max` | 每项指标取入站和出站的较大值 |

全局 `direction_mode` 是方向默认值。节点 `traffic_direction_mode=default` 时继承全局方向；其他值覆盖该节点。

响应保留原始入/出字段，并提供 `selected_bytes`、`selected_p95_bytes_per_sec`、`selected_peak_bytes_per_sec` 及对应方向字段。

## 后台汇总

后台服务维护两组独立的处理进度：

- 用量累计：在 `lite` 和 `billing` 模式下运行，维护月度累计和覆盖边界。
- 五分钟流量明细：仅在 `billing` 模式下运行，维护 `traffic_5m`。

后台任务每 5 分钟调度一次，并按 1 小时时间段处理数据。汇总结果与处理进度在同一事务中提交。任一任务失败时不会推进自身进度，也不会阻止另一任务后续继续处理。

从 `lite` 切换到 `billing` 时，系统从切换前 30 分钟开始生成五分钟流量明细。更早的数据不会自动补算；仍在网卡原始指标保留期内的数据可在 `billing` 模式下按节点手工重建。

从 `billing` 切换到 `lite` 时，不等待正在运行的手工重建。当前 6 小时分块完成后，任务在下一次模式检查时停止。

## 手工重建

节点手工重建仅在 `billing` 模式下可用。`lite` 模式返回 `409 traffic_rebuild_requires_billing`。

重建范围取 `database.retention_days` 所控制的网卡原始指标保留期与 `database.traffic_retention_days` 的交集。任务按 6 小时时间段重写该节点的五分钟流量明细，并在同一事务中使重叠的月度快照失效。每个时间段提交后，其他流量写入可以继续执行。

同一 Dash 进程一次只运行一个重建任务。任务状态和游标不持久化；Dash 重启会取消任务并把状态恢复为 `idle`。超出保留窗口的数据无法通过重建恢复。

## 数据完整性

响应使用以下字段表达覆盖范围：

- `sample_count`
- `expected_sample_count`
- `coverage_ratio`
- `gap_count`
- `reset_count`
- `cycle_complete`
- `data_complete`
- `status`

废弃字段 `partial` 已删除。客户端应使用 `data_complete`、`coverage_ratio`、`gap_count` 和 `reset_count`。

## P95 状态

`p95_status` 可能是：

- `available`
- `disabled`
- `lite_mode`
- `insufficient_samples`
- `snapshot_without_p95`

只有 `available` 时，P95 字段才不是 `null`。

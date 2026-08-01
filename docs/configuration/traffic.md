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

节点账期改变后立即生效。Dash 会删除该节点受影响的月度派生数据，并从新旧当前账期较早的起点局部修复仍在原始指标保留期内的数据。修复期间只暂停该节点的 Lite 实时累计，不影响其他节点；追平前可能暂时没有当前账期统计或只有部分覆盖。

## 方向模式

| 模式 | 计费视图 |
| --- | --- |
| `out` | 只使用出站 |
| `both` | 入站 + 出站 |
| `max` | 每项指标取入站和出站的较大值 |

全局 `direction_mode` 是方向默认值。节点 `traffic_direction_mode=default` 时继承全局方向；其他值覆盖该节点。

响应保留原始入/出字段，并提供 `selected_bytes`、`selected_p95_bytes_per_sec`、`selected_peak_bytes_per_sec` 及对应方向字段。

## 后台物化

后台服务维护两个独立进度：

- Usage：Lite 和 Billing 都运行，维护月度累计和覆盖边界；
- Facts：只在 Billing 运行，维护 `traffic_5m`。

每 5 分钟调度一次。每个物化器按 1 小时分块处理，派生数据和对应进度在同一事务提交。一个物化器失败不会推进自己的进度，也不会阻止另一个物化器后续追赶。

Lite 切换到 Billing 时，Facts 进度从最近 30 分钟开始，使当前统计先恢复。Lite 期间更早、但仍在原始指标保留期内的数据不会自动进入主追赶路径；需要在 Billing 模式下按节点手工重建。

Billing 切换到 Lite 不等待正在运行的手工重建。当前 6 小时分块完成后，任务在下一次模式检查停止。

## 手工重建

节点手工重建只在 Billing 模式可用。Lite 模式返回 `409 traffic_rebuild_requires_billing`。

重建范围取普通指标保留期与 `database.traffic_retention_days` 的交集。任务按 6 小时分块重写该节点的 5 分钟事实，并在同一事务中使重叠月度快照失效。分块之间释放流量写入门。

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

---
slug: /Guides/TrafficBilling
---

# 流量计费配置

`lite` 保存月度累计；`billing` 额外保存 5 分钟事实并提供日统计、P95、覆盖率和月度快照。

## 模式与保留期

| 模式 | 持久化数据 | 适用范围 |
| --- | --- | --- |
| `lite` | 每网卡月度入站/出站总量、估算峰值 | 月度总量展示 |
| `billing` | 月度累计、5 分钟事实、日统计、P95 和快照 | 计费与复核 |

计费环境应使用：

```text
usage_mode = billing
```

原始指标和 5 分钟事实的可重建范围受保留期限制：

```yaml
database:
  retention_days: 30
  traffic_retention_days: 90
```

实际可重建范围取相关保留窗口的交集。

## 单节点账期

账期由每个节点独立持有，并始终显式保存。新节点默认使用应用时区中的自然月：

```text
traffic_cycle_mode = calendar_month
traffic_billing_start_day = 1
traffic_billing_timezone = Asia/Hong_Kong
```

允许的模式：

| 模式 | 必需字段 | 行为 |
| --- | --- | --- |
| `calendar_month` | `traffic_billing_timezone` | 每月 1 日开始 |
| `clamp_to_month_end` | `traffic_billing_start_day`、`traffic_billing_timezone` | 指定日期开始，短月份夹到月末 |
| `whmcs_compatible` | `traffic_billing_anchor_date`、`traffic_billing_timezone` | 按锚点日期对齐 |

固定每月 20 日：

```text
traffic_cycle_mode = clamp_to_month_end
traffic_billing_start_day = 20
traffic_billing_timezone = Asia/Hong_Kong
```

WHMCS 兼容账期：

```text
traffic_cycle_mode = whmcs_compatible
traffic_billing_anchor_date = 2026-01-15
traffic_billing_timezone = Asia/Hong_Kong
```

`traffic_billing_anchor_date` 接受 `YYYY-MM-DD` 或 RFC3339，保存时规范化为 `YYYY-MM-DD`。非 `whmcs_compatible` 模式保存空锚点。

旧客户端仍可提交不带账期字段的 `traffic_cycle_mode=default`。该值只作为输入别名，保存为显式 `calendar_month`；读取不会返回 `default`。

升级迁移会把原有 `default` 节点冻结为升级前实际继承的账期，避免现有边界移动。

## 全局设置

全局流量设置只允许修改：

- `guest_access_mode`
- `usage_mode`
- `direction_mode`

响应中的 `cycle_mode`、`billing_start_day`、`billing_anchor_date` 和 `billing_timezone` 仅保留固定兼容形状。提交这些字段返回 `400 billing_cycle_is_per_node`。

全局 `direction_mode` 允许 `out`、`both` 和 `max`。节点 `traffic_direction_mode=default` 继承该值；节点也可以显式覆盖。账期没有全局继承。

## 物化与模式切换

Usage 和 Facts 使用独立的 PostgreSQL 进度：

- Usage 在 `lite` 和 `billing` 中都维护月度累计。
- Facts 只在 `billing` 中维护 5 分钟事实。
- 两者按小时分块追赶，后台调度周期为 5 分钟。
- 月度快照每小时生成，最多查询 24 个月。

从 Lite 切换到 Billing 时，Facts 从最近 30 分钟开始恢复，不会自动追赶 Lite 期间更早的数据。更早数据仍在原始指标保留期内时，可按节点执行重建。

从 Billing 切换到 Lite 不等待正在运行的重建。当前 6 小时分块完成后，任务停止并返回 `traffic_rebuild_requires_billing`。

## 节点账期变更

修改节点账期后，Dash 会使该节点受影响的月度累计和快照失效，并从新旧当前账期较早的起点局部修复。修复期间只暂停该节点的实时 Usage 更新，其他节点继续物化。

原始数据不足时不会补造样本。客户端应根据以下字段显示完整性：

- `data_complete`
- `coverage_ratio`
- `gap_count`
- `reset_count`

废弃字段 `partial` 已删除。

## 手工重建

重建只在 `billing` 模式可用：

```text
POST /api/admin/nodes/{id}/traffic/rebuild
```

每个 Dash 进程同时只运行一个重建任务。任务按 6 小时分块重写该节点的 5 分钟事实，并使重叠月度快照失效。任务状态只在进程内保存；Dash 重启后状态恢复为 `idle`。

| 结果 | 含义 |
| --- | --- |
| `202` | 已启动 |
| `409 traffic_rebuild_requires_billing` | 当前不是 Billing 模式 |
| `409 traffic_rebuild_running` | 已有重建任务 |
| `503 traffic_rebuild_unavailable` | 重建执行器不可用 |

## P95

P95 只在 `billing` 模式并对节点启用时计算。至少需要 20 个有效样本。

| 状态 | 说明 |
| --- | --- |
| `available` | P95 可用 |
| `disabled` | 节点或系统未启用 P95 |
| `lite_mode` | 当前是 Lite 模式 |
| `insufficient_samples` | 有效样本不足 |
| `snapshot_without_p95` | 旧快照没有 P95 数据 |

只有 `p95_status=available` 时，P95 数值字段才非空。

## 游客访问

游客需要同时满足：

```text
guest_access_mode = by_node
node.is_guest_visible = true
```

任一条件不满足时，不返回该节点的匿名流量数据。

## 核对项

- `traffic_retention_days` 覆盖需要复核的时间范围。
- 每个节点的账期、时区和统计方向符合实际口径。
- 需要 P95 的节点已启用 P95。
- 使用 `data_complete` 和 `coverage_ratio` 判断结果完整性。
- 网卡名变化或 Node 的 `--net` 过滤会改变统计范围。

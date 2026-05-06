---
slug: /Guides/TrafficBilling
---

# 流量计费配置

流量计费依赖 5 分钟事实表、月度汇总、账期设置和节点级开关。只看月总量用 `lite`，要 P95 和可复核数据用 `billing`。

## 先选模式

| 模式 | 写入数据 | 适用 |
| --- | --- | --- |
| `lite` | 月度入/出总量、估算峰值 | 基础展示 |
| `billing` | 5 分钟事实、日汇总、P95、覆盖率、月度快照 | 计费和复核 |

生产计费建议：

```text
usage_mode = billing
```

同时设置较长流量保留：

```yaml
database:
  traffic_retention_days: 90
```

## 账期模式

| 模式 | 行为 |
| --- | --- |
| `calendar_month` | 每月 1 日到月末 |
| `whmcs_compatible` | 使用 `billing_anchor_date` 对齐 |
| `clamp_to_month_end` | 使用开始日，月份天数不足时夹到月末 |

自然月：

```text
cycle_mode = calendar_month
billing_start_day = 1
```

固定每月 15 日：

```text
cycle_mode = clamp_to_month_end
billing_start_day = 15
```

WHMCS 风格：

```text
cycle_mode = whmcs_compatible
billing_anchor_date = 2026-01-15
billing_timezone = Asia/Hong_Kong
```

`billing_anchor_date` 可输入 `YYYY-MM-DD` 或 RFC3339，保存为 `YYYY-MM-DD`。

## 方向模式

| 模式 | 说明 |
| --- | --- |
| `out` | 只统计出站 |
| `both` | 入站加出站 |
| `max` | 入站和出站取较大值 |

普通 VPS 流量计费常用 `out`。双向带宽计费或特殊供应商规则再用 `both` 或 `max`。

## 节点级覆盖

节点可使用系统默认，也可覆盖账期：

```text
traffic_cycle_mode = default
```

覆盖示例：

```text
traffic_cycle_mode = clamp_to_month_end
traffic_billing_start_day = 20
traffic_billing_timezone = Asia/Hong_Kong
```

归一化规则：

- `default` 会重置节点级账期字段。
- `calendar_month` 会把开始日固定为 1。
- 非 WHMCS 模式会清空 `billing_anchor_date`。
- timezone 为空时回落到 app timezone。

## P95

P95 只在 `billing` 模式下有意义。系统每 5 分钟采样事实，月度快照会记录 P95 状态。

状态：

| 状态 | 说明 |
| --- | --- |
| `available` | P95 可用 |
| `disabled` | 节点或系统未启用 P95 |
| `lite_mode` | 当前是 `lite` 模式 |
| `insufficient_samples` | 样本不足 |
| `snapshot_without_p95` | 快照没有 P95 数据 |

P95 最少样本数为 20。新节点或刚开启计费时，短期内出现 `insufficient_samples` 是正常结果。

## 后台汇总

流量后台行为：

- 5 分钟事实按配置保留。
- 物化汇总每 5 分钟运行。
- 月度快照每小时运行。
- catchup 按小时分块补齐。
- 月度快照最多保留 24 个月。

汇总表应由系统维护。需要修复时先备份数据库，再按运维流程处理。

## 游客访问

流量游客访问由流量设置控制：

```text
guest_access_mode = by_node
```

仍受节点可见性限制：

```text
node.is_guest_visible = true
```

两个条件都满足，游客才能看到该节点流量。

## 配置核对

计费上线前检查：

- `usage_mode = billing`。
- `traffic_retention_days` 足够覆盖复核周期。
- `cycle_mode` 与实际账期一致。
- `billing_timezone` 与合同口径一致。
- `direction_mode` 与计费口径一致。
- 节点级覆盖只用于确实不同的节点。
- P95 开关只给需要 P95 的节点打开。
- 月度快照正常生成。

## 常见问题

月度总量不符合预期：

- 检查 `direction_mode`。
- 检查节点是否指定了 `--net`。
- 检查网卡名是否变化。
- 检查节点是否在账期内断线上报。

P95 不可用：

- 检查是否为 `billing` 模式。
- 检查节点是否启用 P95。
- 检查样本数是否达到 20。
- 检查流量事实保留是否过短。

游客看不到流量：

- 检查流量 `guest_access_mode`。
- 检查节点 `is_guest_visible`。
- 检查请求是否命中了正确节点。

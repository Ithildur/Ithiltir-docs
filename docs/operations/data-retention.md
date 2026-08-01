---
slug: /Operations/DataRetention
---

# 数据保留和存储

Dash 使用 PostgreSQL + TimescaleDB 保存历史数据和关键运行状态。Redis 保存管理员会话和可丢弃的前台缓存。

## PostgreSQL 数据

持久化内容：

- 节点元数据。
- 当前指标。
- 历史指标。
- 磁盘和网卡明细。
- 流量事实和月度快照。
- 分组和标签。
- 告警规则、事件、通知 outbox。
- 通知渠道密文和投递健康状态。
- 系统设置和主题状态。
- 流量 Usage/Facts 物化进度和节点账期修复进度。

## Redis 数据

默认保存：

- 管理会话。
- 前台热点快照。
- 游客可见性缓存。

`--no-redis` 时，会话和前台缓存改用进程内存。告警 pending/cooldown、MTProto 登录握手、节点更新请求和手工流量重建任务在两种模式下都属于进程内状态。

## 指标保留

配置：

```yaml
database:
  retention_days: 45
```

省略或设置为 `0` 时使用默认 `45` 天。负数会导致配置校验失败。

## 流量保留

配置：

```yaml
database:
  traffic_retention_days: 90
```

省略时使用：

```text
max(database.retention_days, 45)
```

需要 P95 计费、手工流量重建或更长账期回溯时，提高这个值。`traffic_5m` 保持可写并通过滚动保留策略删除旧数据，月度快照保存历史 95 计费结果。手工重建范围取普通指标保留期与流量事实保留期的交集。

## 流量后台任务

流量后台服务维护两个独立持久化进度：

- Usage 在 Lite 和 Billing 模式维护月度累计、覆盖边界和逐行源进度。
- Facts 只在 Billing 模式维护 5 分钟事实。
- 两者按 1 小时分块独立提交数据和水位。
- 每小时刷新月度快照。
- 手工重建按 6 小时分块使用同一写入门。

Lite 切换到 Billing 时，Facts 水位从最近 30 分钟开始。Lite 期间更早的数据不会自动重放；仍在原始指标保留期内时，可以在 Billing 模式按节点重建。

## 数据完整性字段

流量响应包含：

- `sample_count`
- `expected_sample_count`
- `coverage_ratio`
- `gap_count`
- `reset_count`
- `cycle_complete`
- `data_complete`
- `status`

这些字段用于判断账期内数据是否足够完整。客户端应使用 `data_complete`、`coverage_ratio`、`gap_count` 和 `reset_count`。废弃字段 `partial` 已删除。

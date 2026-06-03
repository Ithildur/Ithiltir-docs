---
slug: /Operations/DataRetention
---

# 数据保留和存储

Dash 使用 PostgreSQL + TimescaleDB 保存历史数据。Redis 主要保存运行时状态。

## PostgreSQL 数据

持久化内容：

- 节点元数据。
- 当前指标。
- 历史指标。
- 磁盘和网卡明细。
- 流量事实和月度快照。
- 分组和标签。
- 告警规则、事件、通知 outbox。
- 系统设置和主题状态。

## Redis 数据

默认保存：

- 管理会话。
- 前台热点快照。
- 游客可见性缓存。
- 节点鉴权索引同步相关缓存。
- 告警运行时状态。

`--no-redis` 时，这些运行时状态改用进程内存。

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

需要 P95 计费、手工流量重建或更长账期回溯时，提高这个值。`traffic_5m` 保持可写并通过滚动保留策略删除旧数据，月度快照保存历史 95 计费结果。

## 流量后台任务

流量后台任务使用同一组保留窗口。窗口内的数据会继续参与物化、快照和手工重建：

- 每 5 分钟按近期原始采样 upsert 可推导出的 5 分钟事实。
- 每次物化时更新近期月度用量。
- 每小时刷新月度快照。
- 与手工 5 分钟事实重建串行执行。

保留窗口越长，数据库占用越高。手工重建只能使用保留窗口内仍存在的原始网卡指标。

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
- `partial`

这些字段用于判断账期内数据是否足够完整。客户端应使用 `coverage_ratio` 展示样本覆盖率和准确性提示。`partial` 仅为兼容保留，新的展示逻辑不应依赖该字段。`partial=true` 不代表接口失败，只表示数据覆盖不足或账期未闭合。

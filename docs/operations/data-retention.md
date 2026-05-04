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

需要 P95 计费或更长账期回溯时，提高这个值。

## 流量后台任务

后台服务会：

- 每 5 分钟生成流量 5 分钟桶。
- 每小时刷新月度快照。
- 按保留窗口回填月度用量。
- 在 `billing` 模式补齐缺失桶。

保留窗口越长，数据库占用和回填时间越高。

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

这些字段用于判断账期内数据是否足够完整。`partial=true` 不代表接口失败，只表示数据覆盖不足或账期未闭合。

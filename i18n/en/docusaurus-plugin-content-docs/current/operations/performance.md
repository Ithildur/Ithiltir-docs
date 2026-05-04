---
slug: /Operations/Performance
title: Performance and Capacity
---

# 性能和容量

容量瓶颈主要来自数据库写入和历史保留窗口，不是前端。

## 最小配置

| 规模 | 推荐 |
| --- | --- |
| 小规模自用 | 1 vCPU / 2 GB RAM / 40 GB SSD |
| 4 GB RAM 以下 | 启用 SWAP |
| 长保留/P95 | 独立 PostgreSQL + SSD/NVMe |

## 写入来源

节点每轮 Push 会产生：

- 当前指标更新。
- 历史指标写入。
- 磁盘明细写入。
- 网卡明细写入。
- 前台缓存刷新。
- 告警 dirty 标记。

默认节点间隔是 3 秒。节点数量增加时，数据库写入量线性增加。

## 降低写入量

优先级从高到低：

1. 增大节点 Push 间隔，例如 `push 10`。
2. 降低历史保留天数。
3. 只在需要计费时启用 `billing` 流量模式。
4. 降低 P95 节点数量，只给需要计费的节点开启。
5. 使用独立 PostgreSQL。

## 数据保留

普通指标：

```yaml
database:
  retention_days: 45
```

流量事实：

```yaml
database:
  traffic_retention_days: 90
```

保留越长，查询和维护成本越高。

## Redis

Redis 用于运行时状态和热点缓存。生产环境不建议 `--no-redis`，否则所有热点状态随进程重启丢失。

## 反向代理

反向代理应启用 keep-alive，保留 Host、X-Forwarded-For、X-Forwarded-Proto。不要把 API 和前端拆成跨域服务。

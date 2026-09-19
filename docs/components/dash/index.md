---
slug: /Dash
---

# Dash 概览

Ithiltir Dash 是单实例、自托管的服务器监控面板。一个 Dash 进程同时提供 Web UI、HTTP API、主题资源、安装脚本和节点二进制分发入口。

## 功能

- 实时节点看板、在线率和历史指标。
- 节点搜索、分组过滤和游客可见范围控制。
- 流量统计、月度周期和 95 计费数据。
- 告警规则、告警挂载、通知渠道和通知队列。
- 主题上传、应用和预览。
- 节点部署资产和安装脚本。

## 节点 Uptime

卡片底部的 45 个日条表示最近 45 个自然日，包含今天。日期按 Dash 的 `app.timezone` 划分；悬停或聚焦后使用方向键、Home、End 选择日期，可查看当天 24 个小时的在线率。小时明细加载完成后显示，Esc 关闭弹层。

在线率统计节点上报所覆盖的在线时长，与卡片标题下的主机启动后运行时间不同。今天和当前小时只计算已结束的分钟，日统计每 60 秒刷新。无观测数据的时段显示灰色；黄色和红色阈值在系统设置中调整。

默认向游客可见节点展示 Uptime，可以在系统设置中关闭。设置方法见 [访问控制](../../configuration/access.md)，统计和保留规则见 [数据保留和存储](../../operations/data-retention.md)。

## 运行形态

默认部署形态是：

```text
Dash + PostgreSQL 16+ + TimescaleDB + Redis
```

小型单实例可以用 `--no-redis`：管理员会话和前台缓存改用进程内存，重启后丢失。告警 pending/cooldown 和 MTProto 登录握手在两种模式下都属于进程内存；开放告警事件和通知 outbox 保存在 PostgreSQL。

## 入口

| 路径 | 说明 |
| --- | --- |
| `/` | Web UI |
| `/login` | 管理员登录页 |
| `/api` | HTTP API |
| `/theme` | 主题资源 |
| `/deploy` | 节点安装脚本和节点二进制 |

## 相关文档

- [安装部署总览](../../installation/index.md)
- [安装 Dash](../../installation/dash-linux.md)
- [Dash 配置](../../configuration/dash.md)
- [Dash HTTP API](../../reference/dash-api.md)
- [Dash CLI](../../reference/dash-cli.md)
- [部署资产](./deploy.md)

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

## 运行形态

默认部署形态是：

```text
Dash + PostgreSQL 16+ + TimescaleDB + Redis
```

小型单实例可以用 `--no-redis`，但这是降级运行：会话、热点快照和告警运行时状态保存在进程内存中，重启后丢失。

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

---
slug: /About
---

# 关于 Ithiltir

Ithiltir 是一套自托管服务器监控系统。它由单实例主控端 `Ithiltir Dash` 和节点采集器 `Ithiltir-node` 组成。

## 组件

- `Ithiltir Dash`：单实例监控面板，提供 Web UI、HTTP API、主题资源、安装脚本和节点二进制分发入口。
- `Ithiltir-node`：节点指标采集器，支持本地页面模式和向 Dash 上报的 Push 模式。

## 支持能力

- 实时节点看板、在线率和历史指标。
- 节点搜索、分组过滤和游客可见范围控制。
- PVE / Proxmox VE 宿主机适配。
- RAID 状态嗅探和失效告警。
- 流量统计、月度周期和 95 计费数据。
- 节点、分组、告警、主题和系统设置管理。
- Linux、macOS、Windows 节点安装脚本。

## 部署模型

- Dash 以单实例运行，持久状态写入 PostgreSQL + TimescaleDB。
- Redis 保存会话、热点快照和告警运行时状态。
- 节点默认使用 Push 模式向 Dash 上报，不要求 Dash 主动连接节点。
- 生产环境推荐使用 HTTPS 域名和 Nginx/Caddy 反向代理，不推荐长期使用 IP+HTTP。

Ithiltir 当前不提供多 Dash 实例协调能力。多个 Dash 实例不应同时写入同一套数据库和 Redis。

## 运行要求

- PostgreSQL 16+ 和 TimescaleDB。
- Redis。小型单实例可以用 `--no-redis` 启动，但会话、热点快照和告警运行时状态会落到进程内存，重启后丢失。
- 从源码运行或打包需要 Go 1.26+。
- 构建前端需要 Bun 1.3.11。

## 文档入口

- 新用户先看 [快速开始](../get-started/quick-start.md)。
- 部署前先看 [安装部署总览](../installation/index.md)、[系统架构](./architecture.md) 和 [反向代理](../installation/reverse-proxy.md)。
- 生产环境按 [生产部署检查清单](../guides/production-deployment.md) 核对。
- 节点接入看 [节点批量接入](../guides/node-rollout.md)、[安装 Linux 节点](../installation/node-linux.md) 和 [Push 模式](../components/node/push.md)。

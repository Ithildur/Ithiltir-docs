---
slug: /
title: 文档索引
---

# 文档索引

Ithiltir 文档按目标组织：先完成安装，再理解系统边界，最后查配置、运维和稳定契约。

## 按目标阅读

| 目标 | 入口 |
| --- | --- |
| 先跑起来 | [快速开始](get-started/quick-start.md) |
| 部署生产环境 | [安装部署总览](installation/index.md)、[生产部署检查清单](guides/production-deployment.md) |
| 接入节点 | [节点批量接入](guides/node-rollout.md)、[安装 Linux 节点](installation/node-linux.md) |
| 调整配置 | [配置总览](configuration/index.md)、[高级配置路线](guides/advanced-configuration.md) |
| 排查问题 | [日志和状态检查](operations/logging.md)、[排错](operations/troubleshooting.md) |
| 查询契约 | [参考总览](reference/index.md) |

## 文档分区

### 概览

- [关于 Ithiltir](overview/about.md)
- [系统架构](overview/architecture.md)
- [Dash 概览](components/dash/index.md)
- [节点概览](components/node/index.md)

### 安装部署

- [安装部署总览](installation/index.md)
- [运行要求](installation/requirements.md)
- [安装 Dash](installation/dash-linux.md)
- [安装 Linux 节点](installation/node-linux.md)
- [安装 macOS 节点](installation/node-macos.md)
- [安装 Windows 节点](installation/node-windows.md)
- [反向代理](installation/reverse-proxy.md)
- [升级](installation/upgrade.md)
- [源码和手工运行](installation/manual.md)

### 任务指南

- [生产部署检查清单](guides/production-deployment.md)
- [单机 all-in-one 部署](guides/all-in-one.md)
- [节点批量接入](guides/node-rollout.md)
- [安全加固](guides/security-hardening.md)
- [高级配置路线](guides/advanced-configuration.md)
- [流量计费配置](guides/traffic-billing.md)
- [主题定制](guides/theme-authoring.md)

### 配置手册

- [配置总览](configuration/index.md)
- [Dash 配置](configuration/dash.md)
- [环境变量](configuration/environment.md)
- [访问控制](configuration/access.md)
- [流量统计和账期](configuration/traffic.md)
- [告警规则](configuration/alerts.md)
- [通知渠道](configuration/notifications.md)
- [主题](configuration/themes.md)
- [安全配置](configuration/security.md)

### 运维

- [运维总览](operations/index.md)
- [节点生命周期](operations/node-lifecycle.md)
- [数据保留和存储](operations/data-retention.md)
- [备份和恢复](operations/backup-restore.md)
- [日志和状态检查](operations/logging.md)
- [性能和容量](operations/performance.md)
- [排错](operations/troubleshooting.md)

### 参考

- [参考总览](reference/index.md)
- [Dash CLI](reference/dash-cli.md)
- [Node CLI](reference/node-cli.md)
- [Dash HTTP API](reference/dash-api.md)
- [节点上报协议](reference/node-protocol.md)
- [运行时指标结构](reference/metrics-schema.md)
- [磁盘结构](reference/disk-schema.md)
- [主题包格式](reference/theme-package.md)
- [文件系统布局](reference/filesystem.md)
- [错误语义](reference/errors.md)

### 组件入口

- [Dash 安装](components/dash/install.md)
- [Dash 部署资产](components/dash/deploy.md)
- [Node 安装](components/node/install.md)
- [Node 更新](components/node/update.md)

### 开发和发布

- [构建](contributing/build.md)
- [发布版本](contributing/releases.md)

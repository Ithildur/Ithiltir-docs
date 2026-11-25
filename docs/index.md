---
slug: /
title: 文档索引
---

# 文档索引

Dash 将多台主机的上报汇集到一个看板。只需查看本机状态时，Ithiltir-node 也可以独立提供监控页面。

## 按目标阅读

| 我想做什么 | 从哪里开始 |
| --- | --- |
| 看到第一台服务器的指标 | [安装 Dash 并接入节点](get-started/quick-start.md) |
| 只查看当前主机 | [运行 Node 本地模式](components/node/local.md) |
| 给已有看板添加机器 | [批量接入节点](installation/node-rollout.md) |
| 用自己的站名公开看板 | [设置站点品牌](configuration/themes.md#站点品牌)和[访客权限](configuration/access.md) |
| 查明节点离线原因 | [查看日志](operations/logging.md)和[排查上报故障](operations/troubleshooting.md) |
| 开发客户端或采集器 | [Dash HTTP API](reference/dash-api.md) 和 [Node 上报协议](reference/node-protocol.md) |

## 文档分区

<div className="guideDirectory">

<section>

### 概览

[项目简介](overview/about.md)说明 Dash 和 Node 的用途。[系统架构](overview/architecture.md)说明指标如何从节点进入存储和看板。

</section>

<section>

### 安装部署

先选择[部署方式](installation/index.md)并核对[运行要求](installation/requirements.md)。准备对外提供服务时，用[生产部署检查清单](installation/production-deployment.md)验证代理、服务和节点连接。

</section>

<section>

### 配置手册

[配置总览](configuration/index.md)列出每类设置的存储位置和修改入口。计费与通知分别见[流量统计](configuration/traffic.md)、[告警规则](configuration/alerts.md)和[通知渠道](configuration/notifications.md)。

</section>

<section>

### 运维

日常巡检见[运维总览](operations/index.md)。调整存储前，先核对[数据保留策略](operations/data-retention.md)和[备份恢复步骤](operations/backup-restore.md)。

</section>

<section>

### 参考

从[参考手册](reference/index.md)查找命令参数、报文字段和错误码。节点采集值的含义见[运行时指标结构](reference/metrics-schema.md)。

</section>

<section>

### 组件入口

[Dash](components/dash/index.md) 和 [Node](components/node/index.md) 各有独立的运行参数、配置和更新说明。

</section>

<section>

### 开发指南

[开发指南](guides/index.md)包含[源码开发环境](guides/source-development.md)、[构建发布包](guides/build.md)和[编写主题](guides/theme-authoring.md)。

</section>

<section>

### Release Notes

升级前，核对[版本说明](release-notes.md)并阅读[升级步骤](installation/upgrade.md)。

</section>

<section>

### 贡献和发布

提交改动前可查阅[开发准则](guides/development-guidelines.md)、[人工智能政策](contributing/ai-policy.md)和[版本发布流程](contributing/releases.md)。

</section>

</div>

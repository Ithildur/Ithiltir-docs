---
slug: /Guides
---

# 开发指南

本分区适用于 Ithiltir Dash、Ithiltir-node、主题包和文档站的二次开发。部署步骤见 [安装部署](../installation/index.md)，运行参数见 [配置总览](../configuration/index.md)，日常管理见 [运维总览](../operations/index.md)。

## 开发对象

| 对象 | 代码库 | 入口 |
| --- | --- | --- |
| Ithiltir Dash | [Ithiltir](https://github.com/Ithildur/Ithiltir) | [系统架构](../overview/architecture.md)、[源码开发环境](./source-development.md)、[Dash 组件](../components/dash/index.md) |
| Ithiltir-node | [Ithiltir-node](https://github.com/Ithildur/Ithiltir-node) | [源码开发环境](./source-development.md)、[Node 组件](../components/node/index.md)、[节点上报协议](../reference/node-protocol.md) |
| 主题包 | [Ithiltir](https://github.com/Ithildur/Ithiltir) | [主题开发](./theme-authoring.md)、[主题配置](../configuration/themes.md) |
| 文档站 | [Ithiltir-docs](https://github.com/Ithildur/Ithiltir-docs) | [开发准则](./development-guidelines.md)、[构建](./build.md) |

## 开发入口

- [开发准则](./development-guidelines.md)：公共契约、兼容性、测试和文档要求。
- [源码开发环境](./source-development.md)：Dash、前端开发服务器和 Ithiltir-node 的本地运行命令。
- [构建](./build.md)：Dash 前端、Dash 发布包和 Ithiltir-node 的稳定构建命令。
- [主题开发](./theme-authoring.md)：建立、打包、上传和验证自定义主题包。

## 契约位置

| 变更范围 | 文档 |
| --- | --- |
| Dash HTTP 路由、字段和状态码 | [Dash HTTP API](../reference/dash-api.md)、[错误语义](../reference/errors.md) |
| Node 命令和上报行为 | [Node CLI](../reference/node-cli.md)、[节点上报协议](../reference/node-protocol.md) |
| Dash 启动参数和运行时设置 | [配置总览](../configuration/index.md) |
| 指标、磁盘和主题包结构 | [运行时指标结构](../reference/metrics-schema.md)、[磁盘结构](../reference/disk-schema.md)、[主题包格式](../reference/theme-package.md) |

修改用户可见行为或公共契约时，同步更新中文和英文文档。

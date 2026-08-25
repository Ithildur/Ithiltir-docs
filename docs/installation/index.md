---
slug: /Install
---

# 安装部署总览

Ithiltir 的部署对象有两个：Dash 主控端和 Ithiltir-node 节点端。Dash 必须先可用，节点脚本和节点二进制都由 Dash 的 `/deploy` 分发。

## 选择部署路径

| 路径 | 适用场景 | 入口 |
| --- | --- | --- |
| 快速验证 | 单机、小规模、自用 | [快速开始](../get-started/quick-start.md) |
| 单机生产 | Dash、PostgreSQL、TimescaleDB、Redis 同机 | [单机 all-in-one 部署](./all-in-one.md) |
| 标准生产 | Dash + 反向代理 + 独立数据库运维 | [生产部署检查清单](./production-deployment.md) |
| 源码验证 | 开发、排错、验证配置 | [源码开发环境](../guides/source-development.md) |

## 部署顺序

1. 确认 Linux 架构和服务管理方式。systemd 使用服务模式；没有 systemd 时显式选择 `--service-manager=none`。
2. 下载并解压 Dash 发布包。
3. 执行 `install_dash_linux.sh`。
4. 按提示配置 `app.public_url`、数据库、Redis、管理员密码和反向代理信任网段。
5. 让安装脚本执行数据库迁移并启动 `dash.service`。
6. 配置反向代理，确认 `/api`、`/theme`、`/deploy` 和 `/` 同源可访问。
7. 在管理台创建节点。
8. 用 Dash 提供的安装脚本安装节点。

发布包安装脚本会检测 PostgreSQL 16+、TimescaleDB 和 Redis。缺失或版本不满足时，脚本会按发行版使用系统包管理器处理，必要时提示源码安装 Redis。Debian/Ubuntu 等 `apt-get` 系统不需要提前手工安装这些依赖。

生产部署使用域名 + HTTPS + Nginx/Caddy 反向代理。Dash 后端监听本机或内网端口，例如 `127.0.0.1:8080`，外部访问 `https://dash.example.com/`。`http://IP:端口` 适用于临时验证和受控内网测试。

## 部署边界

| 边界 | 约束 |
| --- | --- |
| Dash | 单实例运行，不支持多个 Dash 同时写同一套状态 |
| PostgreSQL | 保存节点、指标、流量、告警、设置和主题元数据 |
| Redis | 保存管理员会话和可丢弃的前台缓存 |
| 反向代理 | 生产环境推荐前置 Nginx/Caddy/负载均衡，并保持同源根路径 |
| 节点 | 通过 Push 模式访问 Dash 的 `/api/node/*` |

## 网络路径

Dash 对浏览器和节点公开：

```text
https://dash.example.com/
https://dash.example.com/api
https://dash.example.com/theme
https://dash.example.com/deploy
```

节点默认向：

```text
https://dash.example.com/api/node/metrics
```

上报指标。静态信息会发送到同级：

```text
https://dash.example.com/api/node/static
```

## 关键限制

- `app.public_url` 必须是根路径 URL，不能带 `/dash` 这类路径前缀。
- 生产环境 `app.public_url` 使用 HTTPS 域名。
- 反向代理保持同源路径；跨域后端地址需要同时配置 CORS、cookie 和 CSRF 策略。
- 节点 secret 仅用于 `/api/node/*`，不得放入浏览器代码。
- Dash 是单实例应用，不能多进程同时写同一个数据库。
- `--no-redis` 使会话和前台缓存改用进程内存，重启后丢失。告警 pending/cooldown 和 MTProto 登录态在两种模式下都不持久化。

## 相关文档

- [运行要求](./requirements.md)
- [安装 Dash](./dash-linux.md)
- [节点批量接入](./node-rollout.md)
- [安装 Linux 节点](./node-linux.md)
- [反向代理](./reverse-proxy.md)
- [升级](./upgrade.md)
- [生产部署检查清单](./production-deployment.md)
- [单机 all-in-one 部署](./all-in-one.md)

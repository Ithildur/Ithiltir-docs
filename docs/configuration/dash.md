---
slug: /Config/Dash
---

# Dash 配置

Dash 配置文件是 YAML。管理员密码不写入配置文件，只从环境变量 `monitor_dash_pwd` 读取。

## 查找顺序

未显式指定配置路径时按顺序查找：

1. `config.local.yaml`
2. `config.yaml`
3. `configs/config.local.yaml`
4. `configs/config.yaml`
5. `$DASH_HOME/configs/config.local.yaml`
6. `$DASH_HOME/configs/config.yaml`

## 最小可运行配置

```yaml
app:
  listen: ":8080"
  public_url: "https://dash.example.com"
database:
  driver: "postgres"
  host: "127.0.0.1"
  port: 5432
  user: "ithiltir"
  password: "secret"
  name: "ithiltir"
  sslmode: "disable"
redis:
  addr: "127.0.0.1:6379"
auth:
  jwt_signing_key: "replace-with-high-entropy-secret"
http:
  trusted_proxies: []
```

运行前设置：

```bash
export monitor_dash_pwd='<admin-password>'
```

## `app`

| 字段 | 默认/限制 | 说明 |
| --- | --- | --- |
| `name` | 无 | 应用名 |
| `env` | 无 | 影响静态资源开发模式 |
| `dash_ip` | 无 | 安装脚本中保留的地址字段 |
| `listen` | 必填 | HTTP 监听地址 |
| `grpc_port` | 当前不作为公开入口 | 保留字段 |
| `public_url` | 必填 | 公开根 URL；不能带路径前缀 |
| `timezone` | 空值用 `time.Local` | 告警消息和账期 fallback 时区 |
| `language` | 默认 `zh` | `zh`、`cn`、`chinese`、`zh-cn`、`zh_hans` 归一为 `zh`；`en`、`english` 归一为 `en` |
| `log_level` | `info` | `debug`、`info`、`warn`、`error` |
| `log_format` | `text` | `text` 或 `json` |
| `node_offline_threshold` | `14s` | Go duration，例如 `14s`、`2m` |

`public_url` 可以省略 scheme。IP 地址默认补 `http`，域名默认补 `https`。

生产环境显式配置 HTTPS 域名，例如 `https://dash.example.com`，并通过 Nginx/Caddy 反向代理到 Dash 后端。IP+HTTP 用于临时验证。

## `http`

| 字段 | 说明 |
| --- | --- |
| `trusted_proxies` | 可信代理 CIDR 列表 |

本机反代：

```yaml
http:
  trusted_proxies:
    - 127.0.0.1/32
    - ::1/128
```

没有反代：

```yaml
http:
  trusted_proxies: []
```

## `database`

| 字段 | 说明 |
| --- | --- |
| `driver` | 当前使用 `postgres` |
| `host` | PostgreSQL 地址 |
| `port` | PostgreSQL 端口 |
| `user` | 数据库用户 |
| `password` | 数据库密码 |
| `name` | 数据库名 |
| `sslmode` | PostgreSQL SSL 模式 |
| `max_open_conns` | 最大打开连接数 |
| `max_idle_conns` | 最大空闲连接数 |
| `conn_max_lifetime` | Go duration，空值表示不设置 |
| `retention_days` | 普通指标保留天数；省略或 `0` 使用 `45` |
| `traffic_retention_days` | 流量 5 分钟事实表保留天数；省略时为 `max(retention_days, 45)` |

负数保留天数会导致配置校验失败。

## `redis`

| 字段 | 默认/说明 |
| --- | --- |
| `addr` | Redis 地址 |
| `username` | Redis ACL 用户名 |
| `password` | Redis 密码 |
| `db` | Redis DB |
| `pool_size` | 连接池大小 |
| `min_idle_conns` | 最小空闲连接数 |
| `dial_timeout` | 默认 `5s` |
| `read_timeout` | 默认 `3s` |
| `write_timeout` | 默认 `3s` |

启动时不使用 `--no-redis` 时，Dash 会连接并 ping Redis，失败即退出。

## `auth`

| 字段 | 说明 |
| --- | --- |
| `jwt_signing_key` | HS256 签名密钥，必须是高熵随机值 |

管理员密码：

```bash
monitor_dash_pwd
```

密码必须是可见 ASCII 字符。

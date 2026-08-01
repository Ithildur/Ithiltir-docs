---
slug: /Config/Dash
---

# Dash 配置

Dash 配置文件是单个 YAML 文档。未知字段会导致配置加载失败。旧版顶层 `alerts` 和 `notify` 仅为兼容继续接受，但其内容会被忽略；告警和通知渠道由 PostgreSQL 中的运行时设置管理。

管理员密码不写入配置文件，只从环境变量 `monitor_dash_pwd` 读取。

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
  jwt_signing_key: "replace-with-at-least-32-random-bytes"
http:
  trusted_proxies: []
```

运行前设置：

```bash
export monitor_dash_pwd='<admin-password>'
```

`monitor_dash_pwd` 至少包含 8 个可见 ASCII 字符，且不得包含空白字符。`auth.jwt_signing_key` 至少为 32 字节，且不得包含首尾空白。

## `app`

| 字段 | 默认/限制 | 说明 |
| --- | --- | --- |
| `name` | 无 | 应用名 |
| `env` | 无 | 影响静态资源开发模式 |
| `dash_ip` | 无 | 安装脚本中保留的地址字段 |
| `listen` | 必填 | HTTP 监听地址 |
| `grpc_port` | 当前不作为公开入口 | 保留字段 |
| `public_url` | 必填 | HTTP(S) 公开根 URL；不能带路径前缀、用户信息、query 或 fragment |
| `timezone` | 空值用 `time.Local`；非空值必须是有效 IANA 时区名 | 告警消息和账期 fallback 时区 |
| `language` | 默认 `zh` | `zh`、`cn`、`chinese`、`zh-cn`、`zh_hans` 归一为 `zh`；`en`、`english` 归一为 `en` |
| `log_level` | `info` | `debug`、`info`、`warn`、`error` |
| `log_format` | `text` | `text` 或 `json` |
| `node_offline_threshold` | `14s` | Go duration，例如 `14s`、`2m` |

`public_url` 可以省略 scheme。IP 地址默认补 `http`，域名默认补 `https`。主机只接受 IP 字面量或 ASCII DNS 名称，端口范围为 `1..65535`。国际化域名必须使用 IDNA/punycode 形式。

生产环境显式配置 HTTPS 域名，例如 `https://dash.example.com`，并通过 Nginx/Caddy 反向代理到 Dash 后端。IP+HTTP 用于临时验证。

`app.timezone` 在启动时校验。无效值会导致配置加载失败，错误信息包含原始配置值。`app.node_offline_threshold` 省略时使用 `14s`；显式值必须是大于 0 的 Go duration，非法值不会回退到默认值。

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

`trusted_proxies` 用于认证来源和失败登录限流。已鉴权 Node 请求的观察 IP 仍取 `X-Forwarded-For` 中第一个有效 IP，并回退到 `RemoteAddr`；该观察值只用于展示和运维，不参与鉴权。

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

连接池数值必须非负。`max_open_conns` 为正数时，`max_idle_conns` 不得大于它；`max_open_conns=0` 保留数据库驱动的不显式限制语义。`conn_max_lifetime=0` 表示不按连接年龄淘汰，负数或非法 duration 会导致配置加载失败。

负数保留天数会导致配置校验失败。流量重建范围取普通指标保留期和 `traffic_retention_days` 的交集。

## `redis`

| 字段 | 默认/说明 |
| --- | --- |
| `addr` | Redis 地址 |
| `username` | Redis ACL 用户名 |
| `password` | Redis 密码 |
| `db` | Redis DB |
| `pool_size` | 连接池大小 |
| `min_idle_conns` | 最小空闲连接数 |
| `dial_timeout` | 默认 `5s`；必须大于 0 |
| `read_timeout` | 默认 `3s`；必须大于 0 |
| `write_timeout` | 默认 `3s`；必须大于 0 |

`pool_size` 和 `min_idle_conns` 必须非负。`pool_size=0` 使用 go-redis 默认值，此时 `min_idle_conns` 必须为 `0`；正 `pool_size` 不得小于 `min_idle_conns`。

默认模式要求 `addr` 非空。Dash 启动时对实际端点执行 `PING` 和 `INFO server`，要求 Redis `6.2.0+`；低于推荐版本 `8.2.3` 时记录 warning。连接、权限、版本读取或最低版本检查失败都会停止启动。

`--no-redis` 不读取或校验 Redis 专属环境变量、duration 和连接池配置，也不连接 Redis。迁移命令只加载数据库所需配置，同样跳过 Redis。

## `auth`

| 字段 | 说明 |
| --- | --- |
| `jwt_signing_key` | HS256 签名密钥；至少 32 字节且不得包含首尾空白 |

管理员密码：

```bash
monitor_dash_pwd
```

密码至少包含 8 个可见 ASCII 字符，且不得包含空白字符。

## 环境变量覆盖

受支持的环境变量只要存在就覆盖 YAML，即使值为空。空字符串可以显式清空凭据字段；必填字段随后会被配置校验拒绝。整数变量为空时表示 `0`，非空但无法解析为整数时会停止启动。

完整变量表见 [环境变量](./environment.md)。

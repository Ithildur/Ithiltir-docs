---
slug: /Dash/Config
title: Dash Config
---

# 配置 Dash

Dash 配置文件是 YAML。管理员密码不写入配置文件，只从环境变量 `monitor_dash_pwd` 读取。

## 查找顺序

未显式传入配置路径时，Dash 按顺序查找：

1. `config.local.yaml`
2. `config.yaml`
3. `configs/config.local.yaml`
4. `configs/config.yaml`
5. `$DASH_HOME/configs/config.local.yaml`
6. `$DASH_HOME/configs/config.yaml`

迁移命令可以用 `-config` 指定配置文件：

```bash
dash migrate -config /opt/Ithiltir-dash/configs/config.local.yaml
```

## 最小字段

运行时至少需要：

- `app.listen`
- `app.public_url`
- `database.driver`
- `database.host`
- `database.port`
- `database.user`
- `database.name`
- `auth.jwt_signing_key`

常规部署还需要 Redis：

- `redis.addr`

如果用 `dash --no-redis`，Redis 可不参与运行，但会话和热点运行时状态会变成进程内存状态。

## `app`

| 字段 | 说明 |
| --- | --- |
| `name` | 应用名 |
| `env` | 运行环境；非生产环境会启用开发静态资源行为 |
| `listen` | HTTP 监听地址，如 `:8080` |
| `public_url` | 对浏览器和节点公开的根 URL |
| `timezone` | 账期和告警消息使用的时区 |
| `language` | `zh` 或 `en`，默认 `zh` |
| `log_level` | `debug`、`info`、`warn`、`error` |
| `log_format` | `text` 或 `json` |
| `node_offline_threshold` | 节点离线判断阈值，默认 `14s` |

`public_url` may omit the scheme. IP addresses default to `http`; domain names default to `https`. The final value must not contain a path prefix.

Production deployments should explicitly use an HTTPS domain such as `https://dash.example.com`, with Nginx or Caddy reverse-proxying to the Dash backend. Do not use direct IP+HTTP as the long-term public entrypoint; it is only for local validation or temporary internal testing.

## `http`

| 字段 | 说明 |
| --- | --- |
| `trusted_proxies` | 可信反向代理 CIDR 列表 |

本机反向代理常用：

```yaml
http:
  trusted_proxies:
    - 127.0.0.1/32
    - ::1/128
```

空数组表示只信任真实连接来源，不信任代理头。

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
| `retention_days` | 普通指标保留天数，省略时为 `45` |
| `traffic_retention_days` | 流量 5 分钟事实表保留天数，省略时为 `max(retention_days, 45)` |

如果需要 95 计费历史，建议把流量保留天数设置为 `90` 或更高。

## `redis`

| 字段 | 说明 |
| --- | --- |
| `addr` | Redis 地址 |
| `username` | Redis 用户名 |
| `password` | Redis 密码 |
| `db` | Redis DB |
| `pool_size` | 连接池大小 |
| `min_idle_conns` | 最小空闲连接数 |
| `dial_timeout` | 连接超时 |
| `read_timeout` | 读取超时 |
| `write_timeout` | 写入超时 |

## `auth`

| 字段 | 说明 |
| --- | --- |
| `jwt_signing_key` | JWT HS256 签名密钥，必须使用高熵随机值 |

管理员密码：

```bash
export monitor_dash_pwd='<password>'
```

密码必须是可见 ASCII 字符。

## 环境变量覆盖

配置可由环境变量覆盖。常用项：

- `APP_LISTEN`
- `APP_PUBLIC_URL`
- `APP_TIMEZONE`
- `APP_LANGUAGE`
- `APP_LOG_LEVEL`
- `APP_LOG_FORMAT`
- `APP_NODE_OFFLINE_THRESHOLD`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_RETENTION_DAYS`
- `DB_TRAFFIC_RETENTION_DAYS`
- `REDIS_ADDR`
- `REDIS_PASSWORD`
- `monitor_dash_pwd`

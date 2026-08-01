---
slug: /Config/Environment
---

# 环境变量

环境变量只要存在就覆盖 YAML，即使值为空。

- 必填字符串被覆盖为空后会在配置校验阶段失败。
- 可选字符串按对应字段的空值语义处理；数据库、Redis 等凭据可以显式清空。
- 整数变量为空或只含空白时表示 `0`。
- 非空整数变量无法解析时属于配置错误，Dash 不会保留 YAML 原值。
- `--no-redis` 和 `dash migrate` 不读取 `REDIS_*` 覆盖。

## App

| 变量 | 字段 |
| --- | --- |
| `APP_NAME` | `app.name` |
| `APP_ENV` | `app.env` |
| `APP_DASH_IP` | `app.dash_ip` |
| `APP_LISTEN` | `app.listen` |
| `APP_GRPC_PORT` | `app.grpc_port` |
| `APP_PUBLIC_URL` | `app.public_url` |
| `APP_TIMEZONE` | `app.timezone` |
| `APP_LANGUAGE` | `app.language` |
| `APP_LOG_LEVEL` | `app.log_level` |
| `APP_LOG_FORMAT` | `app.log_format` |
| `APP_NODE_OFFLINE_THRESHOLD` | `app.node_offline_threshold` |

## Database

| 变量 | 字段 |
| --- | --- |
| `DB_DRIVER` | `database.driver` |
| `DB_HOST` | `database.host` |
| `DB_PORT` | `database.port` |
| `DB_USER` | `database.user` |
| `DB_PASSWORD` | `database.password` |
| `DB_NAME` | `database.name` |
| `DB_SSLMODE` | `database.sslmode` |
| `DB_MAX_OPEN_CONNS` | `database.max_open_conns` |
| `DB_MAX_IDLE_CONNS` | `database.max_idle_conns` |
| `DB_CONN_MAX_LIFETIME` | `database.conn_max_lifetime` |
| `DB_RETENTION_DAYS` | `database.retention_days` |
| `DB_TRAFFIC_RETENTION_DAYS` | `database.traffic_retention_days` |

数据库连接池值必须非负。正 `DB_MAX_OPEN_CONNS` 不得小于 `DB_MAX_IDLE_CONNS`。

## Redis

| 变量 | 字段 |
| --- | --- |
| `REDIS_ADDR` | `redis.addr` |
| `REDIS_USERNAME` | `redis.username` |
| `REDIS_PASSWORD` | `redis.password` |
| `REDIS_DB` | `redis.db` |
| `REDIS_POOL_SIZE` | `redis.pool_size` |
| `REDIS_MIN_IDLE_CONNS` | `redis.min_idle_conns` |
| `REDIS_DIAL_TIMEOUT` | `redis.dial_timeout` |
| `REDIS_READ_TIMEOUT` | `redis.read_timeout` |
| `REDIS_WRITE_TIMEOUT` | `redis.write_timeout` |

Redis 模式下，连接池值必须非负。`REDIS_POOL_SIZE=0` 要求 `REDIS_MIN_IDLE_CONNS=0`；正 pool size 不得小于最小空闲连接数。

## Auth

| 变量 | 说明 |
| --- | --- |
| `monitor_dash_pwd` | 管理员登录密码；至少 8 个可见 ASCII 字符且不含空白 |

## 运行目录

| 变量 | 说明 |
| --- | --- |
| `DASH_HOME` | Dash 稳定安装根目录，用于发现配置、主题、`install_id`、通知密钥和更新状态 |

发布包 systemd unit 会设置：

```text
DASH_HOME=/opt/Ithiltir-dash
monitor_dash_pwd=<安装时填写的密码>
```

## Node

| 变量 | 说明 |
| --- | --- |
| `NODE_HOST` | Local 模式监听地址 |
| `NODE_PORT` | Local 模式监听端口；Push debug 端口 |
| `ITHILTIR_NODE_REPORT_CONFIG` | 覆盖 `report.yaml` 路径 |
| `ITHILTIR_NODE_LOCAL_PAGE_DIR` | 覆盖本地页面目录 |
| `ITHILTIR_NODE_RUNNER` | Windows runner 设置为 `1`，启用暂存更新 |

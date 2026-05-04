---
slug: /Config/Environment
---

# 环境变量

环境变量会覆盖 YAML 配置。空字符串不会覆盖。

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

整数变量解析失败会记录 warning，并保留配置文件里的值。

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

## Auth

| 变量 | 说明 |
| --- | --- |
| `monitor_dash_pwd` | 管理员登录密码 |

## 运行目录

| 变量 | 说明 |
| --- | --- |
| `DASH_HOME` | Dash 运行目录，用于发现配置、主题目录和 `install_id` |

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

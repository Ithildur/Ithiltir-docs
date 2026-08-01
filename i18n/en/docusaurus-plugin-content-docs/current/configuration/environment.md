---
slug: /Config/Environment
title: Environment Variables
---

# Environment Variables

A present environment variable overrides YAML even when its value is empty.

- Required strings overridden to empty fail normal config validation.
- Optional strings use the field's empty-value semantics; credentials can be explicitly cleared.
- An empty or whitespace-only integer variable means `0`.
- A non-empty invalid integer is a configuration error; Dash does not keep the YAML value.
- `--no-redis` and `dash migrate` do not read `REDIS_*` overrides.

## App

| Variable | Field |
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

| Variable | Field |
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

Pool values must be non-negative. A positive `DB_MAX_OPEN_CONNS` must be at least `DB_MAX_IDLE_CONNS`.

## Redis

| Variable | Field |
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

Redis pool values must be non-negative. `REDIS_POOL_SIZE=0` requires `REDIS_MIN_IDLE_CONNS=0`; a positive pool size must be at least the minimum idle count.

## Auth

| Variable | Description |
| --- | --- |
| `monitor_dash_pwd` | Admin password; at least 8 visible ASCII characters with no whitespace |

## Runtime Root

| Variable | Description |
| --- | --- |
| `DASH_HOME` | Stable Dash install root used for config, themes, `install_id`, notification key, and update state |

Release systemd units set:

```text
DASH_HOME=/opt/Ithiltir-dash
monitor_dash_pwd=<password entered during install>
```

## Node

| Variable | Description |
| --- | --- |
| `NODE_HOST` | Local mode listen address |
| `NODE_PORT` | Local mode and Push debug port |
| `ITHILTIR_NODE_REPORT_CONFIG` | Override `report.yaml` path |
| `ITHILTIR_NODE_LOCAL_PAGE_DIR` | Override local page directory |
| `ITHILTIR_NODE_RUNNER` | Set to `1` by the Windows runner to enable staged updates |

---
slug: /Config/Environment
title: Environment Variables
---

# Environment Variables

Environment variables override YAML config. Empty strings do not override values.

## Dash App

| Variable | Field |
| --- | --- |
| `DASH_LISTEN` | `app.listen` |
| `DASH_PUBLIC_URL` | `app.public_url` |
| `DASH_NODE_OFFLINE_THRESHOLD` | `app.node_offline_threshold` |

## Database and Redis

| Variable | Field |
| --- | --- |
| `DASH_DB_HOST` | `database.host` |
| `DASH_DB_PORT` | `database.port` |
| `DASH_DB_USER` | `database.user` |
| `DASH_DB_PASSWORD` | `database.password` |
| `DASH_DB_NAME` | `database.name` |
| `DASH_REDIS_ADDR` | `redis.addr` |
| `DASH_REDIS_PASSWORD` | `redis.password` |
| `DASH_REDIS_DB` | `redis.db` |

Integer parse failures are logged as warnings and keep the config file value.

## Admin Password

| Variable | Description |
| --- | --- |
| `monitor_dash_pwd` | Admin login password |

## Runtime Directory

| Variable | Description |
| --- | --- |
| `DASH_HOME` | Dash runtime directory used to find config, themes, and `install_id` |

Release systemd unit sets:

```text
DASH_HOME=/opt/Ithiltir-dash
monitor_dash_pwd=<password entered during install>
```

## Node

| Variable | Description |
| --- | --- |
| `NODE_HOST` | Local mode listen address |
| `NODE_PORT` | Local mode listen port and push debug port |
| `ITHILTIR_NODE_REPORT_CONFIG` | Override `report.yaml` path |
| `ITHILTIR_NODE_LOCAL_PAGE_DIR` | Override local page directory |
| `ITHILTIR_NODE_RUNNER` | Set to `1` by Windows runner to enable staged updates |

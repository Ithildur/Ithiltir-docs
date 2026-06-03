---
slug: /Dash/Config
title: Dash Config
---

# Dash Config

Dash config is YAML. The admin password is read only from `monitor_dash_pwd`, not from the config file.

## File Path

Release install writes:

```text
/opt/Ithiltir-dash/configs/config.local.yaml
```

Source runs can use any path passed with `-config`.

## App

```yaml
app:
  listen: ":8080"
  public_url: "https://dash.example.com"
  timezone: "UTC"
  node_offline_threshold: "30s"
http:
  trusted_proxies:
    - "127.0.0.1/32"
```

| Field | Description |
| --- | --- |
| `app.listen` | Dash listen address |
| `app.public_url` | Public root URL used for generated node commands and callbacks |
| `app.timezone` | Billing cycle and alert message timezone; empty uses local time, non-empty values must be valid IANA timezone names |
| `app.node_offline_threshold` | Offline threshold for node reports |
| `http.trusted_proxies` | CIDRs trusted for forwarded headers |

`app.public_url` must be a root URL. URL subpaths such as `/dash` are not supported.

Invalid `app.timezone` values stop Dash during config loading.

## Database

```yaml
database:
  host: "127.0.0.1"
  port: 5432
  user: "ithiltir"
  password: "secret"
  name: "ithiltir"
  retention_days: 45
  traffic_retention_days: 90
```

Dash requires PostgreSQL 16+ and TimescaleDB. `traffic_retention_days` defaults to `max(retention_days, 45)`. Set it to `90` or higher when 95th percentile billing history, manual traffic rebuilds, or longer review windows are required. `traffic_5m` stays writable, and old rows are removed by rolling retention.

## Redis

```yaml
redis:
  addr: "127.0.0.1:6379"
  password: ""
  db: 0
```

Without `--no-redis`, Dash connects to Redis and exits on failure.

## Auth

```yaml
auth:
  jwt_signing_key: "<random>"
```

Changing `auth.jwt_signing_key` invalidates existing browser sessions.

## Logging

```yaml
log:
  level: "info"
```

Use `-debug` for temporary diagnosis.

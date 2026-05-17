---
slug: /Config/Dash
title: Dash Config
---

# Dash Config

Dash config is YAML. The admin password is read only from `monitor_dash_pwd`.

## File

Release install path:

```text
/opt/Ithiltir-dash/configs/config.local.yaml
```

## App

```yaml
app:
  listen: ":8080"
  public_url: "https://dash.example.com"
  node_offline_threshold: "30s"
  trusted_proxies:
    - "127.0.0.1/32"
```

Production deployments should use an HTTPS domain root URL such as `https://dash.example.com`, with Nginx or Caddy reverse-proxying to Dash. IP+HTTP is only for temporary validation.

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

## Redis

```yaml
redis:
  addr: "127.0.0.1:6379"
  password: ""
  db: 0
```

Dash connects to Redis on startup unless `--no-redis` is used. Connection failure exits the process.

## Security

```yaml
security:
  jwt_secret: "<random>"
  cookie_hash_key: "<random>"
  cookie_block_key: "<random>"
```

Changing these values invalidates active sessions.

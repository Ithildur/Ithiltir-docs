---
slug: /Config/Dash
title: Dash Config
---

# Dash Config

Dash accepts one YAML document and rejects unknown fields. Legacy top-level `alerts` and `notify` keys remain parseable but are ignored; alert and notification settings come from PostgreSQL.

The admin password is read only from `monitor_dash_pwd`, not YAML.

## Search Order

Without an explicit path, Dash searches:

1. `config.local.yaml`
2. `config.yaml`
3. `configs/config.local.yaml`
4. `configs/config.yaml`
5. `$DASH_HOME/configs/config.local.yaml`
6. `$DASH_HOME/configs/config.yaml`

## Minimum Runtime Config

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

```bash
export monitor_dash_pwd='<admin-password>'
```

`monitor_dash_pwd` requires at least 8 visible ASCII characters and no whitespace. `auth.jwt_signing_key` requires at least 32 bytes and no surrounding whitespace.

## `app`

| Field | Default or limit | Description |
| --- | --- | --- |
| `listen` | required | HTTP listen address |
| `public_url` | required | HTTP(S) root URL; no path prefix, user info, query, or fragment |
| `timezone` | empty uses `time.Local` | Valid IANA timezone |
| `language` | `zh` | Chinese or English aliases normalize to `zh` or `en` |
| `log_level` | `info` | `debug`, `info`, `warn`, or `error` |
| `log_format` | `text` | `text` or `json` |
| `node_offline_threshold` | `14s` | Positive Go duration |

`public_url` may omit its scheme. Bare IP addresses default to HTTP; bare DNS names default to HTTPS. Hosts must be IP literals or ASCII DNS names, ports must be in `1..65535`, and internationalized domains must use IDNA/punycode.

Production should use an HTTPS domain behind Nginx or Caddy. Explicit invalid timezone or non-positive duration values stop config loading and do not fall back to defaults.

## `http`

`trusted_proxies` is a list of proxy CIDRs. Use an empty list when no reverse proxy headers should be trusted.

It controls authentication source handling and failed-login rate limiting. For an authenticated Node request, the displayed observation still uses the first valid `X-Forwarded-For` IP and falls back to `RemoteAddr`; that value is operational metadata, not an authentication boundary.

## `database`

| Field | Description |
| --- | --- |
| `driver` | `postgres` |
| `host`, `port`, `user`, `password`, `name`, `sslmode` | PostgreSQL connection |
| `max_open_conns` | Maximum open connections |
| `max_idle_conns` | Maximum idle connections |
| `conn_max_lifetime` | Go duration; empty or `0` disables age-based retirement |
| `retention_days` | Normal metric retention; omitted or `0` uses `45` |
| `traffic_retention_days` | 5-minute traffic fact retention; defaults to `max(retention_days, 45)` |

Pool values must be non-negative. A positive `max_open_conns` must be at least `max_idle_conns`. Negative or invalid connection lifetimes and negative retention values fail validation.

## `redis`

| Field | Default or description |
| --- | --- |
| `addr` | Redis endpoint |
| `username`, `password`, `db` | Authentication and database |
| `pool_size`, `min_idle_conns` | Pool sizing |
| `dial_timeout` | `5s`, must be positive |
| `read_timeout` | `3s`, must be positive |
| `write_timeout` | `3s`, must be positive |

Pool values must be non-negative. `pool_size=0` uses the go-redis default and requires `min_idle_conns=0`; a positive pool size must be at least the minimum idle count.

Dash runs `PING` and `INFO server` against the configured endpoint. Redis `6.2.0+` is required; versions below the recommended `8.2.3` produce a warning. Connection, permission, version-read, or minimum-version failures stop startup.

`--no-redis` does not load or validate Redis-specific environment variables, durations, or pools. `dash migrate` also skips Redis config.

## Environment Overrides

A supported environment variable overrides YAML whenever it is present, even when empty. An empty integer means `0`; a non-empty invalid integer stops startup. See [Environment Variables](./environment.md).

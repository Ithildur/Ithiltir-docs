---
slug: /Install
title: Install Overview
---

# Install Overview

Ithiltir has two deployment targets: the Dash control plane and Ithiltir-node agents. Dash must be available first because node install scripts and node binaries are distributed from Dash under `/deploy`.

## Choose an Installation Path

| Path | Use case | Start here |
| --- | --- | --- |
| Quick validation | Single host, small scale, personal use | [Quick Start](../get-started/quick-start.md) |
| Single-host production | Dash, PostgreSQL, TimescaleDB, and Redis on one host | [All-in-One Deployment](../guides/all-in-one.md) |
| Standard production | Dash + reverse proxy + managed database operations | [Production Deployment Checklist](../guides/production-deployment.md) |
| Source validation | Development, troubleshooting, config validation | [Source and Manual Run](./manual.md) |

## Deployment Order

1. Confirm the host is a supported systemd Linux distribution.
2. Download and extract the Dash release package.
3. Run `install_dash_linux.sh`.
4. Follow the prompts for `app.public_url`, database, Redis, admin password, and trusted reverse proxies.
5. Let the installer run migrations and start `dash.service`.
6. Configure the reverse proxy and verify `/api`, `/theme`, `/deploy`, and `/` are same-origin.
7. Create nodes in the admin console.
8. Install nodes with the scripts served by Dash.

The release package installer checks PostgreSQL 16+, TimescaleDB, and Redis. If they are missing or too old, it uses the distribution package manager when possible and may prompt for a Redis source build. Debian/Ubuntu systems that use `apt-get` do not need these dependencies installed manually first.

The recommended deployment shape is: domain + HTTPS + Nginx/Caddy reverse proxy. Dash listens on a local or private backend address such as `127.0.0.1:8080`; external clients only access `https://dash.example.com/`. Direct `http://IP:port` exposure is only for temporary validation or controlled internal testing.

## Deployment Boundaries

| Boundary | Constraint |
| --- | --- |
| Dash | Single instance; multiple Dash writers against the same state are not supported |
| PostgreSQL | Stores nodes, metrics, traffic, alerts, settings, and theme metadata |
| Redis | Stores sessions, hot snapshots, and alert runtime state |
| Reverse proxy | Recommended for production; keep same-origin root paths through Nginx, Caddy, or a load balancer |
| Nodes | Use push mode to call Dash `/api/node/*` endpoints |

## Public Paths

Dash exposes these paths to browsers and nodes:

```text
https://dash.example.com/
https://dash.example.com/api
https://dash.example.com/theme
https://dash.example.com/deploy
```

Nodes report metrics to:

```text
https://dash.example.com/api/node/metrics
```

Static inventory is sent to:

```text
https://dash.example.com/api/node/static
```

## Hard Constraints

- `app.public_url` must be a root URL and must not contain a path prefix such as `/dash`.
- Production `app.public_url` should be an HTTPS domain, not direct IP+HTTP.
- The reverse proxy must keep same-origin paths; cross-origin backend addresses require CORS, cookie, and CSRF policies to be configured together.
- Node secrets are only for `/api/node/*`; never embed them in browser code.
- Dash is a single-instance application; do not run multiple writers against the same database.
- `--no-redis` is a fallback mode. Runtime state is lost after restart.

## Related

- [Requirements](./requirements.md)
- [Install Dash](./dash-linux.md)
- [Install Linux Node](./node-linux.md)
- [Reverse Proxy](./reverse-proxy.md)
- [Upgrade](./upgrade.md)
- [Production Deployment Checklist](../guides/production-deployment.md)
- [All-in-One Deployment](../guides/all-in-one.md)

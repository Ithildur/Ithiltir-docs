---
slug: /Install
title: Install Overview
---

# Install Overview

Ithiltir has two deployment targets: the Dash control plane and Ithiltir-node instances. Dash must be available first because Node install scripts and binaries are distributed from Dash under `/deploy`.

## Choose an Installation Path

| Path | Use case | Start here |
| --- | --- | --- |
| Quick validation | Install Dash and verify the first node report | [Quick Start](../get-started/quick-start.md) |
| Standard production | Dash, PostgreSQL with TimescaleDB, and Redis on one host behind a local HTTPS reverse proxy | [Single-Host Production Deployment](./all-in-one.md) · [Go-live checklist](./production-deployment.md) |
| Source validation | Development, troubleshooting, config validation | [Source Development](../guides/source-development.md) |
| PVE VMs | QEMU snapshots, Guest Agent IPs, and history queries | [PVE Monitoring](./pve.md) |

## Deployment Order

1. Confirm the Linux architecture and runtime mode. Use systemd service mode or explicit `--service-manager=none`.
2. Download and extract the Dash release package.
3. Run `install_dash_linux.sh`.
4. Follow the prompts for `app.public_url`, database, Redis, admin password, and trusted reverse proxies.
5. Let the installer run migrations and start `dash.service`.
6. Configure the reverse proxy and verify `/api`, `/theme`, `/deploy`, and `/` are same-origin.
7. Create nodes in the admin console.
8. Install nodes with the scripts served by Dash.

The release package installer checks PostgreSQL 16+, TimescaleDB, and Redis. If they are missing or too old, it uses the distribution package manager when possible and may prompt for a Redis source build. Debian/Ubuntu systems that use `apt-get` do not need these dependencies installed manually first.

Browsers and nodes use `https://dash.example.com/`. Nginx or Caddy forwards requests to Dash on the same host (for example, `127.0.0.1:8080`). Direct `http://IP:port` access is for temporary checks.

## Deployment Boundaries

| Boundary | Constraint |
| --- | --- |
| Dash | Single instance; multiple Dash writers against the same state are not supported |
| PostgreSQL | Stores nodes, metrics, traffic, alerts, settings, and theme metadata |
| Redis | Stores admin sessions and disposable frontend caches |
| Reverse proxy | Forward requests from the same domain root to the local Dash listener |
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
- `--no-redis` moves sessions and frontend cache to process memory. Alert pending/cooldown and MTProto login state are process-local in both modes.

## Related

- [Requirements](./requirements.md)
- [Install Dash](./dash-linux.md)
- [Node Rollout](./node-rollout.md)
- [Install Linux Node](./node-linux.md)
- [Reverse Proxy](./reverse-proxy.md)
- [Upgrade](./upgrade.md)
- [Production Deployment Checklist](./production-deployment.md)
- [Single-Host Production Deployment](./all-in-one.md)

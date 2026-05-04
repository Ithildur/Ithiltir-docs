---
slug: /Dash
title: Dash Overview
---

# Dash Overview

Ithiltir Dash is a single-instance, self-hosted server monitoring dashboard. One Dash process serves the Web UI, HTTP API, theme assets, install scripts, and node binary downloads.

## Features

- Real-time node dashboard, online status, and historical metrics.
- Node search, group filtering, and guest visibility controls.
- Traffic accounting, monthly cycles, and 95th percentile billing data.
- Alert rules, alert mounts, notification channels, and notification queue.
- Theme upload, activation, and preview.
- Node deployment assets and install scripts.

## Runtime Shape

Default deployment:

```text
Dash + PostgreSQL 16+ + TimescaleDB + Redis
```

Small single-instance deployments can use `--no-redis`, but this is degraded mode: sessions, hot snapshots, and alert runtime state live in process memory and disappear after restart.

## Entrypoints

| Path | Meaning |
| --- | --- |
| `/` | Web UI |
| `/login` | Admin login |
| `/api` | HTTP API |
| `/theme` | Theme assets |
| `/deploy` | Node install scripts and node binaries |

## Related

- [Install Overview](../../installation/index.md)
- [Install Dash](../../installation/dash-linux.md)
- [Dash Config](../../configuration/dash.md)
- [Dash HTTP API](../../reference/dash-api.md)
- [Dash CLI](../../reference/dash-cli.md)
- [Deployment Assets](./deploy.md)

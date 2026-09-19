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

## Node Uptime

The 45 bars at the bottom of each card represent the latest 45 calendar days, including today, in Dash's `app.timezone`. Hover over a day or focus the row and use the arrow keys, Home, or End to inspect its 24 hourly rates. The tooltip appears after hourly data loads; Escape dismisses it.

Uptime measures online durations covered by node reports. It differs from the host time since boot shown below the card title. Today and the current hour include only completed minutes, and daily statistics refresh every 60 seconds. Unobserved periods are gray; system settings control the yellow and red thresholds.

Uptime is enabled for guest-visible nodes by default and can be disabled in system settings. See [Access Control](../../configuration/access.md) for settings and [Data Retention](../../operations/data-retention.md) for calculation and retention rules.

## Runtime Shape

Default deployment:

```text
Dash + PostgreSQL 16+ + TimescaleDB + Redis
```

Small single-instance deployments can use `--no-redis`: admin sessions and frontend caches move to process memory and disappear on restart. Alert pending/cooldown and MTProto login state are process-local in both modes; open alerts and notification outbox rows persist in PostgreSQL.

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

---
slug: /About
title: About Ithiltir
---

# About Ithiltir

Ithiltir is a self-hosted server monitoring system built from a single-instance control plane, `Ithiltir Dash`, and a node collector, `Ithiltir-node`.

## Components

- `Ithiltir Dash`: a single-instance monitoring dashboard that serves the Web UI, HTTP API, theme assets, install scripts, and node binary downloads.
- `Ithiltir-node`: a node metrics collector that can run in local page mode or push mode.

## Capabilities

- Real-time node dashboard, online status, and historical metrics.
- Node search, group filtering, and guest visibility controls.
- PVE / Proxmox VE host support.
- RAID state detection and failure alerts.
- Traffic accounting, monthly cycles, and 95th percentile billing data.
- Node, group, alert, theme, and system settings management.
- Linux, macOS, and Windows node install scripts.

## Deployment Model

- Dash runs as a single instance and stores persistent state in PostgreSQL + TimescaleDB.
- Redis stores sessions, hot snapshots, and alert runtime state.
- Nodes usually use push mode to report to Dash; Dash does not need to connect back to nodes.
- Production deployments should use an HTTPS domain and Nginx/Caddy reverse proxy. Long-term IP+HTTP exposure is not recommended.

Ithiltir does not currently provide multi-Dash coordination. Do not run multiple Dash instances writing to the same PostgreSQL and Redis state.

## Requirements

- PostgreSQL 16+ and TimescaleDB.
- Redis. Small single-instance deployments can start with `--no-redis`, but sessions, hot snapshots, and alert runtime state will live in process memory and disappear after restart.
- Go 1.26+ for source builds or packaging.
- Bun 1.3.11 for frontend builds.

## Start Here

- New users: [Quick Start](../get-started/quick-start.md).
- Before deployment: [Install Overview](../installation/index.md), [Architecture](./architecture.md), and [Reverse Proxy](../installation/reverse-proxy.md).
- Production: [Production Deployment Checklist](../guides/production-deployment.md).
- Node rollout: [Node Rollout](../guides/node-rollout.md), [Install Linux Node](../installation/node-linux.md), and [Push Mode](../components/node/push.md).

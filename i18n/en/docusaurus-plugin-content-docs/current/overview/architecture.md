---
slug: /Architect
title: Architecture
---

# Architecture

Ithiltir Dash is a single-instance application. One Dash process serves the Web UI, HTTP API, theme assets, install scripts, node binary downloads, and background services.

## Runtime Boundary

```text
Browser / Node
      |
Reverse proxy
      |
Ithiltir Dash
      |
PostgreSQL + TimescaleDB
Redis
```

Dash is not designed for multiple active instances writing the same runtime state. Keep one active Dash process for one deployment.

## Storage

| Store | Data |
| --- | --- |
| PostgreSQL | nodes, groups, metrics, traffic facts, alert rules, settings, theme metadata |
| TimescaleDB | hypertables, retention policy, time-series compression path |
| Redis | admin sessions, hot snapshots, alert runtime state |
| Filesystem | Dash config, install identity, static assets, custom themes |

`--no-redis` moves Redis-backed runtime state into process memory. It is a fallback mode, not a production topology.

## Node Reporting

Nodes normally run in push mode:

```text
Ithiltir-node -> /api/node/metrics
Ithiltir-node -> /api/node/static
```

Dash does not need to open inbound connections to nodes. The node secret only authenticates `/api/node/*` requests and must not be exposed in browser code.

## Public URL

`app.public_url` is the deployment root:

```text
https://dash.example.com
```

It affects browser links, install script output, node target URLs, and reverse-proxy behavior. It must not contain a path prefix such as `/dash`.

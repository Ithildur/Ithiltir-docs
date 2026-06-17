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
| PostgreSQL | nodes, groups, metrics, traffic facts, alert rules, alert events, notification outbox, settings, theme metadata |
| TimescaleDB | hypertables, retention policy, time-series compression path |
| Redis | admin sessions, hot snapshots, alert runtime state |
| Filesystem | Dash config, install identity, static assets, custom themes |

Process memory holds the node auth index, volatile agent update requests, and traffic rebuild state. `--no-redis` moves Redis-backed runtime state into process memory. It is a fallback mode, not a production topology.

`app.timezone` is compiled during startup. Empty uses the local timezone; non-empty values must be valid IANA timezone names, otherwise config loading fails with the configured value in the error.

SMART, thermal, and full RAID details are runtime state. On Linux, a root-side `smartctl` helper writes `/run/ithiltir-node/smart.json`, and a root-side `/proc` netns helper writes `/run/ithiltir-node/connections.json`; Ithiltir-node only reads those caches. SMART cache freshness, helper availability, device health, full thermal sensor payloads, and full RAID array/member payloads are kept in current snapshots or hot caches rather than historical PostgreSQL metric rows. SMART temperature for confirmed physical disks is reduced into `disk_physical_metrics.temp_c`; virtual disks and RAID devices are ignored. Thermal data is reduced into `cpu_temp_c` for host history, while full thermal details are split into a separate frontend field cache and composed back into front node JSON on read.

TCP/UDP connection counts are persisted numeric metrics. They are written to `tcp_conn` and `udp_conn` and remain available to history queries as `conn.tcp` and `conn.udp`. On Linux, full host/netns connection counts come from the root-side connections cache because the agent runs with low privileges. The Linux installer compiles this helper locally when `cc`, `gcc`, or `clang` is available. If the cache is missing or stale, or the helper cannot be compiled, the agent uses its built-in connection counting, which may miss container connections.

Linux PSI pressure metrics are fixed numeric time-series data. PSI `avg10`, `avg60`, `avg300`, and `total` values are stored as nullable columns on `server_metrics` and `server_current_metrics`; missing columns mean unavailable data, not zero pressure. Collection reason/status strings are ignored by dashboard persistence. PSI is not currently wired into alert evaluation.

## Node Reporting

Nodes normally run in push mode:

```text
Ithiltir-node -> /api/node/metrics
Ithiltir-node -> /api/node/static
```

Dash does not need to open inbound connections to nodes. The node secret authenticates `/api/node/*` requests and packaged `/deploy/*` asset downloads, and must not be exposed in browser code.

Node IP is an observation from authenticated agent requests. Dash reads the first IP in `X-Forwarded-For` when that header is present, otherwise it falls back to `RemoteAddr`; invalid values are not used. This field is for display and operations, not an auth boundary.

## Alerts

Alert transitions commit independently from notification delivery. When notification targets are available, notification payloads are stored in the PostgreSQL outbox and delivered by a leased retry worker. If targets cannot be loaded, the transition is committed without new outbox rows.

## Traffic State

Durable history retention defaults to `45 days`. Regular monitoring uses `database.retention_days`; 5-minute traffic facts use `database.traffic_retention_days`. Traffic retention is both a cleanup boundary and a rebuild boundary: `traffic_5m` stays writable and old rows are removed by rolling retention, while historical 95th percentile billing values live in monthly snapshots.

Traffic `lite` mode keeps monthly inbound/outbound totals and estimated peaks from recent raw NIC sample pairs, using each node's effective billing cycle. Traffic `billing` mode uses the same background path to maintain current 5-minute facts by upserting only buckets derived from recent raw samples.

Historical 5-minute facts can be rebuilt per node through a single in-process admin task clipped to `database.traffic_retention_days`. The task rewrites only 5-minute facts and invalidates overlapping monthly snapshots. Daily summaries, P95, coverage, and billing monthly snapshots remain derived from 5-minute traffic facts and are not synchronously rewritten when the rebuild starts; one process runs automatic materialization, monthly snapshot persistence, and manual 5-minute rebuilds serially.

Global billing cycle and direction settings are defaults. Nodes may override cycle mode, billing start day, anchor date, timezone, and direction. Traffic reads use each node's effective cycle and direction; monthly usage and snapshots keep raw inbound/outbound values for direction selection at read time.

## Public URL

`app.public_url` is the deployment root:

```text
https://dash.example.com
```

It affects browser links, install script output, node target URLs, and reverse-proxy behavior. It must not contain a path prefix such as `/dash`.

Keep browser API calls same-origin. Cross-origin backend addresses require CORS, cookie, and CSRF policies to be configured together.

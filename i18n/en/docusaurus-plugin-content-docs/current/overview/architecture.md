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
| Redis | admin sessions and disposable frontend caches |
| Filesystem | Dash config, notification encryption key, install identity, immutable releases, themes, and persistent update state |

Process memory holds the node auth index, alert pending/cooldown state, MTProto login handshakes, volatile Node update requests, and traffic rebuild state. `--no-redis` additionally moves sessions and frontend cache into process memory.

`app.timezone` is compiled during startup. Empty uses the local timezone; non-empty values must be valid IANA timezone names, otherwise config loading fails with the configured value in the error.

The admin update controller requires Linux/systemd. Manual `dash update` also supports explicit `--service-manager=none`. Jobs and transactions persist under `$DASH_HOME/runtime/dash-update`.

SMART, thermal, and full RAID details are runtime state. On Linux, a root-side `smartctl` helper writes `/run/ithiltir-node/smart.json`, and a root-side `/proc` netns helper writes `/run/ithiltir-node/connections.json`; Ithiltir-node only reads those caches. SMART cache freshness, helper availability, device health, full thermal sensor payloads, and full RAID array/member payloads are kept in current snapshots or hot caches rather than historical PostgreSQL metric rows. SMART temperature for confirmed physical disks is reduced into `disk_physical_metrics.temp_c`; virtual disks and RAID devices are ignored. Thermal data is reduced into `cpu_temp_c` for host history, while full thermal details are split into a separate frontend field cache and composed back into front node JSON on read.

TCP/UDP connection counts are persisted numeric metrics. They are written to `tcp_conn` and `udp_conn` and remain available to history queries as `conn.tcp` and `conn.udp`. On Linux, full host/netns connection counts come from the root-side connections cache because Node runs with low privileges. The Linux installer compiles this helper locally when `cc`, `gcc`, or `clang` is available. If the cache is missing or stale, or the helper cannot be compiled, Node uses its built-in connection counting, which may miss container connections.

Linux PSI pressure metrics are fixed numeric time-series data. PSI `avg10`, `avg60`, `avg300`, and `total` values are stored as nullable columns on `server_metrics` and `server_current_metrics`; missing columns mean unavailable data, not zero pressure. Collection reason/status strings are ignored by dashboard persistence. PSI is not currently wired into alert evaluation.

## Node Reporting

Nodes normally run in push mode:

```text
Ithiltir-node -> /api/node/metrics
Ithiltir-node -> /api/node/static
```

Dash does not need to open inbound connections to nodes. The node secret authenticates `/api/node/*` requests and packaged `/deploy/*` asset downloads, and must not be exposed in browser code.

Node IP is an observation from authenticated Node requests. Dash reads the first IP in `X-Forwarded-For` when that header is present, otherwise it falls back to `RemoteAddr`; invalid values are not used. This field is for display and operations, not an auth boundary.

## Alerts

Alert evaluation reads the latest process-local report snapshot or the current PostgreSQL projection, never the frontend Redis cache.

Alert notifications enter the PostgreSQL outbox and are delivered by one process-local worker without runtime leases. If the first target load fails without a last-good snapshot, the transition is delayed; with a last-good snapshot, the event and outbox commit against that snapshot. Remote delivery failure does not roll back the alert event.

## Traffic State

Durable history retention defaults to `45 days`. Regular monitoring uses `database.retention_days`; 5-minute traffic facts use `database.traffic_retention_days`. Traffic retention is both a cleanup boundary and a rebuild boundary: `traffic_5m` stays writable and old rows are removed by rolling retention, while historical 95th percentile billing values live in monthly snapshots.

Usage and Facts use independent PostgreSQL progress. Usage keeps monthly totals in Lite and Billing; Facts keeps 5-minute facts only in Billing. Switching Lite to Billing starts Facts at the latest 30 minutes; older retained raw data requires per-node rebuild.

Historical 5-minute facts use one process-local, Billing-only rebuild task. It rewrites each node in 6-hour chunks and invalidates overlapping snapshots. Switching to Lite finishes the current chunk and stops. Rebuild state resets on Dash restart.

Every node stores an explicit billing cycle. Global settings provide only the default direction; `traffic_direction_mode=default` inherits it. A node cycle change invalidates and locally repairs only that node's derived monthly rows.

## Public URL

`app.public_url` is the deployment root:

```text
https://dash.example.com
```

It affects browser links, install script output, node target URLs, and reverse-proxy behavior. It must not contain a path prefix such as `/dash`.

Keep browser API calls same-origin. Cross-origin backend addresses require CORS, cookie, and CSRF policies to be configured together.

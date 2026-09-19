---
slug: /Operations/DataRetention
title: Data Retention
---

# Data Retention

Dash stores durable history and control state in PostgreSQL + TimescaleDB. Redis stores sessions and disposable frontend caches.

## Data Classes

- Metrics history.
- Five-minute traffic records and aggregates.
- Nodes, groups, and system settings.
- Alert rules, open/closed events, and notification outbox.
- Monthly traffic usage, five-minute traffic generation progress, and cycle-repair progress.
- Theme package metadata.

## Regular Metrics

Configuration:

```yaml
database:
  metrics_raw_retention_days: 8
```

This field controls raw sample retention only for `server_metrics`, `disk_metrics`, `disk_usage_metrics`, and `disk_physical_metrics`. When omitted or set to `0`, the default is `8` days. An explicit value must be at least `2`.

Raw samples and both aggregate levels have independent retention policies:

| Dataset | Retention window | Storage form |
| --- | --- | --- |
| Raw samples | Configured value, eight days by default | New one-hour chunks; uncompressed for one day, then losslessly compressed |
| 15-minute aggregates | 16 days | Continuous aggregates |
| One-hour aggregates | 32 days | Continuous aggregates |

Each dataset is removed after its own retention period. Increasing raw sample retention does not extend aggregate retention. With the defaults, raw samples expire after 8 days, 15-minute aggregates expire after 16 days, and regular metric history expires after 32 days.

History ranges use fixed data sources:

| Range | Data source |
| --- | --- |
| `30m`, `1h`, `12h`, `24h` | Raw samples |
| `1w` | 15-minute aggregates |
| `15d` | Sample-weighted 15-minute aggregates, returned as 30-minute points |
| `30d` | One-hour aggregates |

History aggregates refresh continuously and include the latest raw samples. Exact sample points remain available during the raw retention period.

`server_online_30m` is retained separately for eight days and includes completed 30-minute periods only.

Raw NIC metrics and service checks remain controlled by `database.retention_days`, which defaults to `45` when omitted or `0`. NIC data keeps one-day chunks and compresses after seven days.

Dash synchronizes TimescaleDB policies at startup or during `dash migrate` after retention configuration changes. Data already outside the new window is removed by a later policy job rather than by a synchronous scan while loading configuration.

## Uptime History

Node cards use separate uptime datasets:

| Dataset | Retention | Contents |
| --- | --- | --- |
| `node_online` | 46 days | Online and observed milliseconds for each node and completed minute |
| `node_online_1h` | 46 days | Hourly sums of online and observed durations |
| Dashboard window | Latest 45 calendar days, including today | Calendar boundaries use `app.timezone` |

The rate is `100 × online duration / observed duration`, weighted by duration. Each report covers the interval from server receipt until `app.node_offline_threshold` later; overlapping intervals count once. No observations are generated before a node's first valid report or after deletion. Nodes that have never reported have no uptime records.

A PostgreSQL/TimescaleDB job calculates the previous minute about 6 seconds after each minute boundary. Only completed minutes count. Queries include minute data for the current hour, while database jobs refresh hourly aggregates. Today and the current hour can lag by approximately one minute plus the sampling delay.

A missing minute is unknown and excluded from the denominator. Missed job windows and minutes spanning a database restart are not backfilled automatically. The API's `observed_ms` reports actual observed duration; 100% does not imply full-day coverage.

Both retention periods are independent of `database.metrics_raw_retention_days` and `database.retention_days`. Disabling guest visibility does not stop sampling. Enabling uptime through an upgrade starts collecting new records; Dash has no general feature to reconstruct uptime from historical CPU or other metric charts.

## Traffic Retention

Configuration:

```yaml
database:
  traffic_retention_days: 90
```

When omitted or set to `0`, the default is `max(database.retention_days, 45)`. This setting controls writable five-minute traffic records. Old rows are removed by rolling retention.

Monthly snapshots are retained separately and preserve historical 95th-percentile billing values.

Manual traffic rebuilds are available only in `billing` mode and can read only retained raw NIC metrics. Rebuilds rewrite five-minute records in six-hour ranges.

Monthly usage aggregation and five-minute traffic generation keep independent durable progress. Rebuild task state is process-local.

Clients use `data_complete`, `coverage_ratio`, `gap_count`, and `reset_count` for completeness. Deprecated `partial` has been removed.

## Backup Boundary

Retention policy is not a backup strategy. Back up PostgreSQL before upgrades, migration work, retention changes, and storage migration.

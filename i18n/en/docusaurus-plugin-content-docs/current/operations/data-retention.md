---
slug: /Operations/DataRetention
title: Data Retention
---

# Data Retention

Dash stores durable history and control state in PostgreSQL + TimescaleDB. Redis stores sessions and disposable frontend caches.

## Data Classes

- Metrics history.
- Network traffic facts and rollups.
- Nodes, groups, and system settings.
- Alert rules, open/closed events, and notification outbox.
- Traffic Usage/Facts materialization progress and monthly usage.
- Theme package metadata.

## Retention Config

Normal metric retention:

```yaml
database:
  retention_days: 45
```

Traffic fact retention:

```yaml
database:
  traffic_retention_days: 90
```

Changing retention affects future policy sync. Existing chunks are removed by TimescaleDB policy execution.

## Tables

Normal metrics retention covers the metric hypertables, including disk IO, disk usage, NIC metrics, and physical disk temperature.

Traffic retention covers writable 5-minute traffic facts. Old rows are removed by rolling retention, while monthly snapshots are retained separately as accounting output and store historical 95th percentile billing values.

Manual traffic rebuilds are Billing-only and can read only retained raw NIC metrics. They rewrite facts in 6-hour chunks. Usage and Facts have independent durable progress; rebuild job state itself is process-local.

Clients use `data_complete`, `coverage_ratio`, `gap_count`, and `reset_count` for completeness. Deprecated `partial` has been removed.

## Backup Boundary

Retention policy is not a backup strategy. Back up PostgreSQL before upgrades, migration work, retention changes, and storage migration.

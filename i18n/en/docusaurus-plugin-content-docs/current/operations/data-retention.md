---
slug: /Operations/DataRetention
title: Data Retention
---

# Data Retention

Dash stores history data in PostgreSQL + TimescaleDB. Redis primarily stores runtime state.

## Data Classes

- Metrics history.
- Network traffic facts and rollups.
- Nodes, groups, and system settings.
- Alert rules, events, runtime state, and notification outbox.
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

Manual traffic rebuilds use the same retention boundary. They can read only retained raw NIC metrics, so longer retention increases database size but expands the rebuild and review window.

## Backup Boundary

Retention policy is not a backup strategy. Back up PostgreSQL before upgrades, migration work, retention changes, and storage migration.

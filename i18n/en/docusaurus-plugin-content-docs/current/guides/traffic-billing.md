---
slug: /Guides/TrafficBilling
title: Traffic Billing
---

# Traffic Billing

Use `lite` for monthly totals. Use `billing` for 5-minute facts, daily output, P95, coverage, and snapshots.

## Retention

```yaml
database:
  retention_days: 30
  traffic_retention_days: 90
```

The rebuildable window is the intersection of relevant raw and traffic retention.

## Per-Node Cycles

Every node stores an explicit cycle. New nodes default to:

```text
traffic_cycle_mode = calendar_month
traffic_billing_start_day = 1
traffic_billing_timezone = Asia/Hong_Kong
```

`calendar_month`, `clamp_to_month_end`, and `whmcs_compatible` require their corresponding timezone, start-day, or anchor fields. Cycle fields are submitted atomically.

Legacy `traffic_cycle_mode=default` is only an input alias without other cycle fields and is stored as an explicit calendar month. Upgrade migration freezes old inherited cycles to their pre-upgrade effective values.

Global settings contain only guest access, usage mode, and default direction. Sending billing-cycle fields to global settings returns `400 billing_cycle_is_per_node`. Only `traffic_direction_mode=default` inherits globally.

## Materialization

Usage and Facts have independent PostgreSQL progress. Usage maintains monthly totals in both modes; Facts runs only in Billing. Both advance in hourly chunks on a 5-minute schedule.

Switching Lite to Billing starts Facts at the latest 30 minutes. Older retained raw data requires per-node rebuild. Switching to Lite lets a running rebuild finish its current 6-hour chunk, then stops it.

A node cycle change invalidates only that node's affected monthly derived rows and schedules local repair. Other nodes continue realtime materialization.

## Rebuild

```text
POST /api/admin/nodes/{id}/traffic/rebuild
```

Rebuild is Billing-only, process-local, and singleton per Dash process. It rewrites 5-minute facts in 6-hour chunks and invalidates overlapping snapshots. Dash restart resets status to `idle`.

## Completeness and P95

Clients use `data_complete`, `coverage_ratio`, `gap_count`, and `reset_count`. The deprecated `partial` field has been removed.

P95 requires Billing, the per-node switch, and at least 20 valid samples. Numeric P95 is present only when `p95_status=available`.

## Guest Access

Anonymous traffic requires both `guest_access_mode=by_node` and `node.is_guest_visible=true`.

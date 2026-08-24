---
slug: /Guides/TrafficBilling
title: Traffic Billing
---

# Traffic Billing

Use `lite` for monthly totals. Use `billing` for five-minute traffic records, daily output, P95, coverage, and snapshots.

## Retention

```yaml
database:
  retention_days: 30
  traffic_retention_days: 90
```

The rebuildable window is the intersection of raw NIC retention and five-minute traffic retention.

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

## Background Aggregation

Monthly usage aggregation and five-minute traffic generation keep independent progress in PostgreSQL. Monthly totals are maintained in both modes. Five-minute records are generated only in `billing` mode. Both tasks run every five minutes and process one-hour ranges.

After a switch from `lite` to `billing`, Dash generates five-minute records starting 30 minutes before the switch. Earlier retained raw NIC data requires a per-node rebuild.

After a switch to `lite`, a running rebuild completes its current six-hour range and then stops.

A node cycle change invalidates only the affected monthly data for that node and schedules local repair. Other nodes continue real-time aggregation.

## Rebuild

```text
POST /api/admin/nodes/{id}/traffic/rebuild
```

Rebuild is available only in `billing` mode. One rebuild can run in each Dash process. It rewrites five-minute traffic records in six-hour ranges and invalidates overlapping snapshots. A Dash restart resets its status to `idle`.

## Completeness and P95

Clients use `data_complete`, `coverage_ratio`, `gap_count`, and `reset_count`. The deprecated `partial` field has been removed.

P95 requires `billing` mode, the per-node switch, and at least 20 valid samples. Numeric P95 is present only when `p95_status=available`.

## Guest Access

Anonymous traffic requires both `guest_access_mode=by_node` and `node.is_guest_visible=true`.

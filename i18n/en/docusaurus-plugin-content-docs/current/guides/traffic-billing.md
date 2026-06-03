---
slug: /Guides/TrafficBilling
title: Traffic Billing
---

# Traffic Billing

Traffic accounting uses node network counters. Dash stores raw inbound and outbound counters and derives the accounting view from settings.

## Modes

| Mode | Value | Behavior |
| --- | --- | --- |
| Lite | `lite` | Stores monthly inbound/outbound totals and estimated peak |
| Billing | `billing` | Maintains 5-minute facts, daily summaries, P95, coverage, and monthly snapshots |

Use `billing` only when daily traffic, monthly accounting, or P95 is needed. `traffic_retention_days` controls both retained 5-minute facts and the raw metrics window available for manual rebuilds.

## Direction Mode

| Mode | Accounting view |
| --- | --- |
| `out` | Outbound only |
| `both` | Inbound + outbound |
| `max` | Larger value from inbound and outbound for each metric |

Responses keep raw `in_*` and `out_*` fields. The selected view is exposed through `selected_*` fields.

## Billing Cycle

Global fields:

| Field | Description |
| --- | --- |
| `cycle_mode` | Billing cycle mode |
| `billing_start_day` | Day from 1 to 31 |
| `billing_anchor_date` | WHMCS-compatible anchor date |
| `billing_timezone` | IANA timezone |

Cycle modes:

| Mode | Behavior |
| --- | --- |
| `calendar_month` | Calendar month; `billing_start_day` is fixed to `1` |
| `clamp_to_month_end` | Starts on configured day; short months clamp to month end |
| `whmcs_compatible` | WHMCS-compatible cycle; can use `billing_anchor_date` |

Node-level overrides use `traffic_cycle_mode`, `traffic_billing_start_day`, `traffic_billing_anchor_date`, `traffic_billing_timezone`, and `traffic_direction_mode`. `traffic_cycle_mode=default` inherits global cycle settings. `traffic_direction_mode=default` inherits the global direction mode.

## P95

P95 can be enabled per node. `p95_status` can be:

- `available`
- `disabled`
- `lite_mode`
- `insufficient_samples`
- `snapshot_without_p95`

P95 fields are non-null only when status is `available`. P95 requires at least 20 samples, so new nodes or newly enabled billing can return `insufficient_samples` for a short period.

## Coverage

Clients should display `coverage_ratio` for sample coverage and accuracy hints. `partial` is kept only for compatibility and should not drive new UI logic.

## Queries

- `GET /api/statistics/traffic/summary`: current cycle summary.
- `GET /api/statistics/traffic/daily`: daily data, requires `usage_mode=billing`.
- `GET /api/statistics/traffic/monthly`: monthly snapshots.

`daily` and `monthly` accept `period=current` or `period=previous`. `monthly` also accepts `months`, up to 24.

## Manual Rebuild

The admin console can rebuild one node's retained 5-minute traffic facts from raw NIC metrics. A rebuild invalidates overlapping monthly snapshots and runs serially with automatic traffic materialization. Data outside retention is not recovered automatically.

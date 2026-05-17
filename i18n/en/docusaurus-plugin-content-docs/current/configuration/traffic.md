---
slug: /Config/Traffic
title: Traffic Accounting and Billing Cycles
---

# Traffic Accounting and Billing Cycles

Dash builds traffic statistics from network counters reported by nodes. The system stores raw inbound and outbound counters; the accounting view is determined by direction mode.

## Modes

| Mode | Value | Behavior |
| --- | --- | --- |
| Lite | `lite` | Stores monthly inbound/outbound totals and estimated peak |
| Billing | `billing` | Maintains 5-minute facts, daily summaries, P95, coverage, and monthly snapshots |

`GET /api/statistics/traffic/daily` is available only in `billing` mode. Otherwise it returns `409 traffic_daily_requires_billing`.

## Global Settings

| Field | Description |
| --- | --- |
| `guest_access_mode` | Anonymous access mode |
| `usage_mode` | `lite` or `billing` |
| `cycle_mode` | Billing cycle mode |
| `billing_start_day` | Day from 1 to 31 |
| `billing_anchor_date` | WHMCS anchor date |
| `billing_timezone` | IANA timezone |
| `direction_mode` | Accounting direction mode |

## Billing Cycle Modes

| Mode | Behavior |
| --- | --- |
| `calendar_month` | Calendar month, `billing_start_day=1` |
| `clamp_to_month_end` | Starts on configured day; short months clamp to month end |
| `whmcs_compatible` | WHMCS-compatible cycle; can use `billing_anchor_date` |

`billing_anchor_date` accepts `YYYY-MM-DD` or RFC3339 and is stored as `YYYY-MM-DD`.

`billing_timezone` must be an IANA timezone loadable by Go.

## Node Override

Nodes can override global billing cycle fields:

| Field | Description |
| --- | --- |
| `traffic_cycle_mode` | `default` inherits global settings; otherwise one of the cycle modes |
| `traffic_billing_start_day` | 1 to 31 |
| `traffic_billing_anchor_date` | WHMCS anchor date |
| `traffic_billing_timezone` | Node billing timezone |
| `traffic_p95_enabled` | Whether P95 is calculated for the node |

Normalization:

- `default` clears node billing fields and inherits global settings.
- `calendar_month` stores `traffic_billing_start_day=1`.
- Non-`whmcs_compatible` modes store an empty `traffic_billing_anchor_date`.
- Empty `traffic_billing_timezone` in non-default mode uses the app timezone on read.

## Direction Mode

| Mode | Accounting view |
| --- | --- |
| `out` | Outbound only |
| `both` | Inbound + outbound |
| `max` | Larger value from inbound and outbound for each metric |

Responses keep raw fields and expose selected view fields such as `selected_bytes`, `selected_peak_bytes_per_sec`, and `selected_p95_bytes_per_sec`.

## Background Service

The traffic background service:

- Materializes 5-minute traffic facts every 5 minutes.
- Refreshes monthly snapshots hourly.
- Backfills monthly usage in chunks.
- Fills missing 5-minute buckets in `billing` mode.

`traffic_retention_days` controls the 5-minute fact retention window.

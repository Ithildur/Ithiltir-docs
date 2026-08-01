---
slug: /Config/Traffic
title: Traffic Accounting and Billing Cycles
---

# Traffic Accounting and Billing Cycles

Dash stores raw inbound and outbound counters. Direction mode selects the accounting view; every node owns an explicit billing cycle.

## Global Settings

Only these fields are writable globally:

| Field | Values |
| --- | --- |
| `guest_access_mode` | `disabled`, `by_node` |
| `usage_mode` | `lite`, `billing` |
| `direction_mode` | `out`, `both`, `max` |

The settings response retains `cycle_mode`, `billing_start_day`, `billing_anchor_date`, and `billing_timezone` only as a fixed compatibility shape representing a calendar month. Sending any billing-cycle field to the global PATCH returns `400 billing_cycle_is_per_node`.

## Node Billing Cycles

| Mode | Required fields | Behavior |
| --- | --- | --- |
| `calendar_month` | `traffic_billing_timezone` | Starts on day 1 |
| `clamp_to_month_end` | start day and timezone | Starts on configured day; short months clamp to month end |
| `whmcs_compatible` | anchor date and timezone | Aligns to the anchor date |

Node cycle fields are atomic: a request that includes one must include `traffic_cycle_mode` and every field required by that mode.

New nodes store `calendar_month` and day 1. Legacy clients may send `traffic_cycle_mode=default` only without other cycle fields; it is stored as an explicit calendar month and is never returned. Upgrade migration freezes old inherited cycles to their pre-upgrade effective values.

`traffic_billing_anchor_date` accepts `YYYY-MM-DD` or RFC3339 and is stored as `YYYY-MM-DD`. Empty timezone falls back to the app timezone on read.

Only `traffic_direction_mode=default` inherits the global direction. `out`, `both`, and `max` override it per node.

## Usage Modes

| Mode | Stored data |
| --- | --- |
| `lite` | Monthly per-interface inbound/outbound totals and estimated peaks |
| `billing` | The same monthly usage plus 5-minute facts, daily output, P95, coverage, and snapshots |

Usage and Facts have independent PostgreSQL progress. Both advance in hourly chunks on a 5-minute schedule; Facts runs only in Billing mode.

Switching Lite to Billing starts Facts from the latest 30 minutes and does not automatically replay older Lite history. Older raw samples still inside retention can be recovered with a per-node rebuild. Switching Billing to Lite lets the current rebuild chunk finish, then stops further chunks.

## Billing-Cycle Changes

A per-node cycle change immediately invalidates affected monthly derived rows and schedules a local repair from the earlier of the old and new current-cycle starts. Only that node pauses realtime Usage while repair catches up; other nodes continue.

Coverage is limited by retained raw data. Clients use `data_complete`, `coverage_ratio`, `gap_count`, and `reset_count`. The deprecated `partial` field has been removed.

## Manual Rebuild

Per-node rebuild is Billing-only. It is a process-local singleton, rewrites 5-minute facts in 6-hour chunks, and invalidates overlapping snapshots. Dash restart resets its state to `idle`.

Lite mode returns `409 traffic_rebuild_requires_billing`; a concurrent task returns `409 traffic_rebuild_running`.

## Queries

- Daily traffic requires Billing and otherwise returns `409 traffic_daily_requires_billing`.
- Monthly `months` must be in `1..24`.
- Responses keep raw `in_*` and `out_*` fields and expose selected-view fields.
- P95 fields are non-null only when `p95_status=available`.

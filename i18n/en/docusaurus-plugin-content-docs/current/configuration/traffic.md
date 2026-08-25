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
| `billing` | The same monthly usage plus five-minute traffic records, daily output, P95, coverage, and snapshots |

Monthly usage aggregation and five-minute traffic generation keep independent progress in PostgreSQL. Both run every five minutes and process one-hour ranges. Five-minute records are generated only in `billing` mode.

After a switch from `lite` to `billing`, Dash generates five-minute records starting 30 minutes before the switch. Earlier data is not generated automatically. Retained raw NIC samples can be processed through a per-node rebuild.

After a switch from `billing` to `lite`, a running rebuild completes its current six-hour range and then stops.

## Billing-Cycle Changes

A per-node cycle change immediately invalidates the affected monthly data and schedules repair from the earlier of the old and new current-cycle starts. Only that node pauses real-time monthly aggregation during repair. Other nodes continue without interruption.

Coverage is limited by retained raw NIC data. Clients use `data_complete`, `coverage_ratio`, `gap_count`, and `reset_count`. The deprecated `partial` field has been removed.

## Manual Rebuild

Per-node rebuild is available only in `billing` mode. One rebuild can run in each Dash process. It rewrites five-minute traffic records in six-hour ranges and invalidates overlapping snapshots. A Dash restart resets the rebuild state to `idle`.

The rebuild range is the intersection of raw NIC retention in `database.retention_days` and `database.traffic_retention_days`.

`lite` mode returns `409 traffic_rebuild_requires_billing`; a concurrent task returns `409 traffic_rebuild_running`.

## Queries

- Daily traffic requires `billing` mode and otherwise returns `409 traffic_daily_requires_billing`.
- Monthly `months` must be in `1..24`.
- Responses keep raw `in_*` and `out_*` fields and expose selected-view fields.
- P95 fields are non-null only when `p95_status=available`.

P95 is calculated only in `billing` mode for nodes with `traffic_p95_enabled`. It requires at least 20 valid samples.

## Guest Access

Anonymous traffic data requires both traffic setting `guest_access_mode=by_node` and `node.is_guest_visible=true`. If either condition is false, the node's anonymous traffic data is not returned. See [Access Control](./access.md) for the complete visibility rules.

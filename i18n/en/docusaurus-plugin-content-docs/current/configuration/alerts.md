---
slug: /Config/Alerts
title: Alert Rules
---

# Alert Rules

Alerts are composed of rules, mounts, global settings, and notification channels.

## Built-in Rules

| ID | Name | Metric | Condition | Cooldown |
| --- | --- | --- | --- | --- |
| `-1` | `node_offline` | `node.offline` | `>= 1` | 0 |
| `-2` | `raid_failed` | `raid.failed` | `>= 1` | 30 minutes |
| `-3` | `smart_failed` | `disk.smart.failed` | `>= 1` | 30 minutes |
| `-4` | `smart_nvme_critical_warning` | `disk.smart.nvme.critical_warning` | `>= 1` | 30 minutes |

Built-in rules are mounted by default. Rule mounts can disable or enable rules for specific nodes.

## Supported Metrics

| Metric | Description | Supports `core_plus` |
| --- | --- | --- |
| `cpu.usage_ratio` | CPU usage ratio `0..1` | No |
| `cpu.load1` | 1-minute load | Yes |
| `cpu.load5` | 5-minute load | Yes |
| `cpu.load15` | 15-minute load | Yes |
| `mem.used` | Used memory bytes | No |
| `mem.used_ratio` | Memory usage ratio `0..1` | No |
| `disk.usage.used_ratio` | Main mount disk usage ratio | No |
| `disk.smart.failed` | Count of devices with `health=failed` | No |
| `disk.smart.nvme.critical_warning` | Count of NVMe devices with non-zero `critical_warning` | No |
| `disk.smart.attribute_failing` | Count of ATA SMART attributes currently in `FAILING_NOW` | No |
| `disk.smart.max_temp_c` | Max SMART device temperature in C | No |
| `net.recv_bps` | Receive rate in B/s | No |
| `net.sent_bps` | Send rate in B/s | No |
| `conn.tcp` | TCP connection count | No |
| `raid.failed` | Failed RAID members or unhealthy arrays | No |
| `thermal.max_temp_c` | Max thermal sensor temperature in C | No |

`disk.usage.used_ratio` uses `/` first. If `/` is missing, it falls back to the first mount for compatibility.

`disk.smart.failed` counts only `health=failed`. Collection states such as `no_cache`, `no_tool`, `unsupported`, and `stale` are not counted as disk failures.

`disk.smart.nvme.critical_warning` counts only devices that report `critical_warning` with a non-zero value. If no device reports the field, the metric is not evaluated.

`disk.smart.attribute_failing` counts only `failing_attrs[].when_failed=FAILING_NOW`. If no failing attribute data is available, the metric is not evaluated.

SMART notifications list at most 3 affected devices in the title, 5 devices in detail, and 8 failing attributes per device. Device and attribute labels replace control/format characters with spaces and are limited to 128 Unicode characters; the full detail is limited to 2048 characters. NVMe details include the raw critical warning and `media_errors` when available, labeled with SMART UI item `0E`.

## Operators

- `>`
- `>=`
- `<`
- `<=`
- `==`
- `!=`

## Duration

Allowed values:

- `0`
- `60`
- `300`

Unit is seconds. Missing `duration_sec` defaults to `60` when creating a rule.

Rule names are trimmed, contain 1–128 Unicode characters, and cannot contain control characters. `threshold` and `threshold_offset` must be finite. `cooldown_min` must be in `0..525600`.

## Threshold Mode

| Mode | Description |
| --- | --- |
| `static` | Use `threshold` directly |
| `core_plus` | Load metrics only; threshold is CPU cores + `threshold` + `threshold_offset` |

In `static` mode, `threshold_offset` must be `0`.

CPU core count uses logical cores first, then physical cores.

## Lifecycle

1. A node report places the latest snapshot in a process-local dirty queue.
2. The alert service reads that snapshot or the current PostgreSQL projection.
3. Enabled rules and node mount state are compiled.
4. Matching conditions open events after duration is met.
5. Non-matching conditions close events.
6. If notification targets can be loaded, payloads are written to the notification outbox according to global settings.
7. One process-local worker delivers PostgreSQL outbox rows without runtime leases.

The alert service does not open new alert events during the first minute after startup.

Open firing events persist in PostgreSQL and are restored after restart. Pending and cooldown state and the dirty queue are process-local and reset on restart. Startup reconciliation, restored open events, and later reports resume evaluation.

Alert events and notification outbox rows share one persistence boundary. If the first target load fails without a last-good snapshot, the transition is delayed; an available last-good snapshot is used to commit the event and outbox. Delivery failures do not roll back alert events. Retry, pause, block, and discard behavior is documented under [Notifications](./notifications.md).

## Alert Records

Alert records store events after rules open and close. The admin console can filter records by node, status, metric, and time range.

Endpoints:

```text
GET /api/admin/alerts/events
GET /api/admin/alerts/events/summary
GET /api/admin/alerts/events/servers
```

`GET /api/admin/alerts/events` supports `server_id`, `status`, `metric`, `from`, `to`, `cursor`, and `limit`. `status` allows `open`, `closed`, or `all`; omitted status returns only open events.

`GET /api/admin/alerts/events/summary` returns open-alert summaries grouped by node. The node list alert entry uses this summary. It is loaded when entering the node page and is not realtime polling.

Its `open_count` is the number of open alert events. The dashboard summary “Anomalies” count uses offline, RAID, CPU, and disk conditions and is not this field.

## Rule Mounts

Rule mounts are `(rule_id, server_id) -> enabled`.

Endpoint:

```text
PUT /api/admin/alerts/mounts
```

Request:

```json
{
  "rule_ids": [-1, 10],
  "server_ids": [1, 2],
  "mounted": true
}
```

`rule_ids` may include built-in rule IDs. `server_ids` must reference existing nodes.

## Global Alert Settings

Endpoint:

```text
PUT /api/admin/alerts/settings
```

Request:

```json
{
  "enabled": true,
  "channel_ids": [1, 2]
}
```

`channel_ids` can be an empty array, which enables alerts without sending notifications.

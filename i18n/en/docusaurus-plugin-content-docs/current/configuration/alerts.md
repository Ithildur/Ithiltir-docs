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

## Threshold Mode

| Mode | Description |
| --- | --- |
| `static` | Use `threshold` directly |
| `core_plus` | Load metrics only; threshold is CPU cores + `threshold` + `threshold_offset` |

In `static` mode, `threshold_offset` must be `0`.

CPU core count uses logical cores first, then physical cores.

## Lifecycle

1. A node report marks the node for alert evaluation.
2. The alert service reads the hot snapshot.
3. Enabled rules and node mount state are compiled.
4. Matching conditions open events after duration is met.
5. Non-matching conditions close events.
6. If notification targets can be loaded, payloads are written to the notification outbox according to global settings.
7. A leased worker retries notification delivery.

The alert service does not open new alert events during the first minute after startup.

If notification targets are unavailable, alert events and runtime state are still committed, but no notification outbox item is added.

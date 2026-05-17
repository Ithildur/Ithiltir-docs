---
slug: /Reference/MetricsSchema
title: Runtime Metrics Schema
---

# Runtime Metrics Schema

JSON uses UTF-8. Timestamps are UTC RFC3339. All `*Ratio` fields are `0..1`, not percentages. Arrays return `[]`, not `null`.

## `NodeReport`

```json
{
  "version": "1.2.3",
  "hostname": "node-a",
  "timestamp": "2026-05-04T00:00:00Z",
  "metrics": {}
}
```

| Field | Description |
| --- | --- |
| `version` | Node version |
| `hostname` | Hostname |
| `timestamp` | Node sample time |
| `metrics` | `Snapshot` |

## `Snapshot`

| Field | Description |
| --- | --- |
| `cpu` | CPU runtime data |
| `memory` | Memory runtime data |
| `disk` | Disk runtime data, see [Disk Schema](./disk-schema.md) |
| `network[]` | Network interface runtime data |
| `system` | System runtime data |
| `processes` | Process count |
| `connections` | TCP/UDP connection counts |
| `raid` | RAID runtime data |
| `thermal` | Thermal sensor runtime data, optional |

## CPU

```json
{
  "usage_ratio": 0.34,
  "load1": 0.42,
  "load5": 0.39,
  "load15": 0.37,
  "times": {
    "user": 1,
    "system": 1,
    "idle": 1,
    "iowait": 0,
    "steal": 0
  }
}
```

## Memory

```json
{
  "used": 123,
  "available": 123,
  "buffers": 123,
  "cached": 123,
  "used_ratio": 0.58,
  "swap_used": 0,
  "swap_free": 0,
  "swap_used_ratio": 0
}
```

Byte fields are raw byte counts.

## Network

```json
{
  "name": "eth0",
  "bytes_recv": 123,
  "bytes_sent": 456,
  "recv_rate_bytes_per_sec": 1024,
  "sent_rate_bytes_per_sec": 2048,
  "packets_recv": 1,
  "packets_sent": 2,
  "recv_rate_packets_per_sec": 1.2,
  "sent_rate_packets_per_sec": 1.3,
  "err_in": 0,
  "err_out": 0,
  "drop_in": 0,
  "drop_out": 0
}
```

## System

```json
{
  "alive": true,
  "uptime_seconds": 123456,
  "uptime": "01d 10h 17m 36s"
}
```

## Processes

```json
{ "process_count": 182 }
```

## Connections

```json
{ "tcp_count": 86, "udp_count": 37 }
```

## RAID

```json
{
  "supported": true,
  "available": true,
  "arrays": [
    {
      "name": "md0",
      "status": "clean",
      "active": 2,
      "working": 2,
      "failed": 0,
      "health": "healthy",
      "members": [
        { "name": "sda1", "state": "up" }
      ],
      "sync_status": "resync",
      "sync_progress": "50%"
    }
  ]
}
```

## Thermal

```json
{
  "status": "ok",
  "updated_at": "2026-05-04T00:00:00Z",
  "sensors": [
    {
      "kind": "cpu",
      "name": "Package id 0",
      "sensor_key": "coretemp_package_id_0",
      "source": "gopsutil",
      "status": "ok",
      "temp_c": 52.5,
      "high_c": 90,
      "critical_c": 100
    }
  ]
}
```

`sensors[]` returns `[]` when empty. `updated_at`, `temp_c`, `high_c`, and `critical_c` are omitted when unavailable.

Required:

- `status`
- `sensors[]`

Required `sensors[]` fields:

- `kind`
- `name`
- `sensor_key`
- `source`
- `status`

`kind` can be:

- `cpu`
- `gpu`
- `chipset`
- `board`
- `acpi`
- `unknown`

Common `status` values:

- `ok`
- `partial`
- `unsupported`
- `not_found`
- `no_permission`
- `timeout`
- `error`

## `Static`

```json
{
  "version": "1.2.3",
  "timestamp": "2026-05-04T00:00:00Z",
  "report_interval_seconds": 3,
  "cpu": {},
  "memory": {},
  "disk": {},
  "system": {},
  "raid": {}
}
```

Fields:

- `cpu.info.model_name`
- `cpu.info.vendor_id`
- `cpu.info.sockets`
- `cpu.info.cores_physical`
- `cpu.info.cores_logical`
- `cpu.info.frequency_mhz`
- `memory.total`
- `memory.swap_total`
- `disk`
- `system.hostname`
- `system.os`
- `system.platform`
- `system.platform_version`
- `system.kernel_version`
- `system.arch`
- `raid.supported`
- `raid.available`
- `raid.arrays[]`

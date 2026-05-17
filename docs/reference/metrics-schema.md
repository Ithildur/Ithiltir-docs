---
slug: /Reference/MetricsSchema
---

# 运行时指标结构

JSON 使用 UTF-8。时间戳是 UTC RFC3339。所有 `*Ratio` 字段都是 `0..1`，不是百分比。数组返回 `[]`，不是 `null`。

## `NodeReport`

```json
{
  "version": "1.2.3",
  "hostname": "node-a",
  "timestamp": "2026-05-04T00:00:00Z",
  "metrics": {}
}
```

| 字段 | 说明 |
| --- | --- |
| `version` | 节点版本 |
| `hostname` | 主机名 |
| `timestamp` | 节点采样时间 |
| `metrics` | `Snapshot` |

## `Snapshot`

| 字段 | 说明 |
| --- | --- |
| `cpu` | CPU 运行时 |
| `memory` | 内存运行时 |
| `disk` | 磁盘运行时，见 [磁盘结构](./disk-schema.md) |
| `network[]` | 网卡运行时 |
| `system` | 系统运行时 |
| `processes` | 进程数 |
| `connections` | TCP/UDP 连接数 |
| `raid` | RAID 运行时 |
| `thermal` | 温度传感器运行时，可缺省 |

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

字节字段都是原始字节数。

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

`sensors[]` 为空时返回 `[]`。`updated_at`、`temp_c`、`high_c`、`critical_c` 读不到时省略。

必填：

- `status`
- `sensors[]`

`sensors[]` 必填字段：

- `kind`
- `name`
- `sensor_key`
- `source`
- `status`

`kind` 可为：

- `cpu`
- `gpu`
- `chipset`
- `board`
- `acpi`
- `unknown`

常见 `status`：

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

字段：

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

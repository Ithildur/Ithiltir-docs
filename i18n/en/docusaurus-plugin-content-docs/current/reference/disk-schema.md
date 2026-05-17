---
slug: /Reference/DiskSchema
title: Disk Schema
---

# Disk Schema

Disk data has runtime and static shapes. Runtime data describes current capacity and IO. Static data describes stable metadata.

## Runtime: `metrics.disk`

```json
{
  "physical": [],
  "logical": [],
  "filesystems": [],
  "base_io": [],
  "smart": {
    "status": "ok",
    "updated_at": "2026-05-04T00:00:00Z",
    "ttl_seconds": 300,
    "devices": []
  }
}
```

## `physical[]`

Each item represents a block device.

Required:

- `name`
- `read_bytes`
- `write_bytes`
- `read_rate_bytes_per_sec`
- `write_rate_bytes_per_sec`
- `iops`
- `read_iops`
- `write_iops`
- `util_ratio`
- `queue_length`
- `wait_ms`
- `service_ms`

Optional:

- `device_path`
- `ref`

## `logical[]`

Logical storage capacity view.

Required:

- `kind`
- `name`
- `used`
- `free`
- `used_ratio`

Optional:

- `device_path`
- `ref`
- `health`

Common `kind` values:

- `disk`
- `raid`
- `raid_md`
- `lvm_vg`
- `lvm_thinpool`
- `lvm_lv`
- `zfs_pool`

## `filesystems[]`

Mount point view.

Required:

- `path`
- `used`
- `free`
- `used_ratio`
- `inodes_used`
- `inodes_free`
- `inodes_used_ratio`

Optional:

- `device`
- `mountpoint`

## `base_io[]`

IO view used for display and sorting.

Required:

- `kind`
- `name`
- `read_rate_bytes_per_sec`
- `write_rate_bytes_per_sec`
- `read_iops`
- `write_iops`
- `iops`

Optional:

- `device_path`
- `ref`
- `read_bytes`
- `write_bytes`
- `util_ratio`
- `queue_length`
- `wait_ms`
- `service_ms`

`logical` items may not have cumulative byte, latency, or utilization fields.

## `smart`

SMART data comes from a root-side cache file. It is runtime state, not static disk inventory.

Required:

- `status`
- `devices[]`

Optional:

- `updated_at`
- `ttl_seconds`

Required `devices[]` fields:

- `name`
- `source`
- `status`

Optional `devices[]` fields:

- `ref`
- `device_path`
- `device_type`
- `protocol`
- `model`
- `serial`
- `wwn`
- `exit_status`
- `health`
- `temp_c`
- `power_on_hours`
- `lifetime_used_percent`
- `critical_warning`
- `failing_attrs[]`

`devices[]` returns `[]` when empty. Unavailable SMART values are omitted.

`critical_warning` is the raw NVMe critical warning bitset. `failing_attrs[]` contains only ATA SMART attributes that are currently failing:

- `id`
- `name`
- `when_failed`

Common `status` values:

- `ok`
- `partial`
- `unsupported`
- `not_found`
- `no_permission`
- `timeout`
- `error`
- `no_cache`
- `stale`
- `no_tool`
- `standby`

`status` is the collection state. `health` is the disk health result. A device can have `status=ok` and `health=failed` when collection succeeds but the disk health check fails.

`no_cache`, `no_tool`, and `unsupported` do not indicate disk failure. `stale` means the cache has expired, but the last `devices[]` data is retained.

`devices[].ref` points to `physical[].ref` or `logical[].ref` only when it can be matched safely.

## Static: `disk`

```json
{
  "physical": [],
  "logical": [],
  "filesystems": [],
  "base_io": []
}
```

### `physical[]`

- `name`
- Optional: `device_path`
- Optional: `ref`

### `logical[]`

- `kind`
- `name`
- Optional: `device_path`
- Optional: `ref`
- Optional: `total`
- Optional: `mountpoint`
- Optional: `fs_type`
- Optional: `devices[]`

### `filesystems[]`

- `path`
- `total`
- `fs_type`
- `inodes_total`
- Optional: `device`
- Optional: `mountpoint`

### `base_io[]`

- `kind`
- `name`
- Optional: `device_path`
- Optional: `ref`
- Optional: `role`

## Platform Behavior

- Linux collects filesystems, block devices, RAID, LVM, and ZFS.
- Non-Linux platforms still populate `filesystems[]` from `gopsutil` partition data.
- Non-Linux RAID always returns `supported=false`.
- Arrays return `[]`, not `null`.

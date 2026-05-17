---
slug: /Node/Disk
title: Disk Metrics
---

# Disk Schema

Runtime disk data and static disk data have different purposes and should be handled separately.

## Runtime: `metrics.disk`

`metrics.disk` contains four arrays and SMART runtime state:

- `physical[]`
- `logical[]`
- `filesystems[]`
- `base_io[]`
- `smart`

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

`logical` items may not have cumulative byte or underlying latency/utilization fields.

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

`critical_warning` is the raw NVMe critical warning bitset. `failing_attrs[]` contains only ATA SMART attributes that are currently failing.

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

`status` is the collection state. `health` is the disk health result. `no_cache`, `no_tool`, and `unsupported` do not indicate disk failure.

## Runtime: `metrics.raid`

Required:

- `supported`
- `available`
- `arrays[]`

`arrays[]` fields:

- `name`
- `status`
- `active`
- `working`
- `failed`
- `health`
- `members`
- Optional: `sync_status`
- Optional: `sync_progress`

`members[]` fields:

- `name`
- `state`

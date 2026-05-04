---
slug: /Reference/DiskSchema
title: Disk Schema
---

# 磁盘结构

磁盘结构分运行时和静态两套。运行时描述当前容量和 IO，静态描述稳定元数据。

## 运行时：`metrics.disk`

```json
{
  "physical": [],
  "logical": [],
  "filesystems": [],
  "base_io": []
}
```

## `physical[]`

每条对应一个块设备。

必填：

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

可选：

- `device_path`
- `ref`

## `logical[]`

逻辑存储容量视图。

必填：

- `kind`
- `name`
- `used`
- `free`
- `used_ratio`

可选：

- `device_path`
- `ref`
- `health`

常见 `kind`：

- `disk`
- `raid`
- `raid_md`
- `lvm_vg`
- `lvm_thinpool`
- `lvm_lv`
- `zfs_pool`

## `filesystems[]`

挂载点视图。

必填：

- `path`
- `used`
- `free`
- `used_ratio`
- `inodes_used`
- `inodes_free`
- `inodes_used_ratio`

可选：

- `device`
- `mountpoint`

## `base_io[]`

用于展示和排序的 IO 视图。

必填：

- `kind`
- `name`
- `read_rate_bytes_per_sec`
- `write_rate_bytes_per_sec`
- `read_iops`
- `write_iops`
- `iops`

可选：

- `device_path`
- `ref`
- `read_bytes`
- `write_bytes`
- `util_ratio`
- `queue_length`
- `wait_ms`
- `service_ms`

`logical` 项可能没有累计字节、延迟或利用率字段。

## 静态：`disk`

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
- 可选：`device_path`
- 可选：`ref`

### `logical[]`

- `kind`
- `name`
- 可选：`device_path`
- 可选：`ref`
- 可选：`total`
- 可选：`mountpoint`
- 可选：`fs_type`
- 可选：`devices[]`

### `filesystems[]`

- `path`
- `total`
- `fs_type`
- `inodes_total`
- 可选：`device`
- 可选：`mountpoint`

### `base_io[]`

- `kind`
- `name`
- 可选：`device_path`
- 可选：`ref`
- 可选：`role`

## 平台行为

- Linux 采集文件系统、块设备、RAID、LVM、ZFS。
- 非 Linux 仍会从 `gopsutil` 分区结果填充 `filesystems[]`。
- 非 Linux RAID 固定返回 `supported=false`。
- 数组返回 `[]`，不是 `null`。

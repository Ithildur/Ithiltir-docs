---
slug: /Config/Alerts
---

# 告警规则

告警由规则、规则挂载、全局告警设置和通知渠道组成。

## 内置规则

| ID | 名称 | 指标 | 条件 | 冷却 |
| --- | --- | --- | --- | --- |
| `-1` | `node_offline` | `node.offline` | `>= 1` | 0 |
| `-2` | `raid_failed` | `raid.failed` | `>= 1` | 30 分钟 |
| `-3` | `smart_failed` | `disk.smart.failed` | `>= 1` | 30 分钟 |
| `-4` | `smart_nvme_critical_warning` | `disk.smart.nvme.critical_warning` | `>= 1` | 30 分钟 |

内置规则默认挂载。规则挂载表可以对具体节点禁用或启用规则。

## 支持的指标

| 指标 | 说明 | 支持 `core_plus` |
| --- | --- | --- |
| `cpu.usage_ratio` | CPU 使用率，比例值 `0..1` | 否 |
| `cpu.load1` | 1 分钟 load | 是 |
| `cpu.load5` | 5 分钟 load | 是 |
| `cpu.load15` | 15 分钟 load | 是 |
| `mem.used` | 已用内存字节 | 否 |
| `mem.used_ratio` | 内存使用率，比例值 `0..1` | 否 |
| `disk.usage.used_ratio` | 主挂载点磁盘使用率 | 否 |
| `disk.smart.failed` | SMART 健康结果为 `failed` 的设备数量 | 否 |
| `disk.smart.nvme.critical_warning` | NVMe `critical_warning` 非零的设备数量 | 否 |
| `disk.smart.attribute_failing` | 当前 `FAILING_NOW` 的 ATA SMART 属性数量 | 否 |
| `disk.smart.max_temp_c` | SMART 设备最高温度，单位 C | 否 |
| `net.recv_bps` | 接收速率 B/s | 否 |
| `net.sent_bps` | 发送速率 B/s | 否 |
| `conn.tcp` | TCP 连接数 | 否 |
| `raid.failed` | RAID 失败成员或非健康阵列数量 | 否 |
| `thermal.max_temp_c` | 普通温度传感器最高温度，单位 C | 否 |

`disk.usage.used_ratio` 优先使用 `/` 挂载点；没有 `/` 时，为兼容旧行为回退到第一个挂载点。

`disk.smart.failed` 只统计 `health=failed`。`no_cache`、`no_tool`、`unsupported`、`stale` 等采集状态不会按磁盘故障计数。

`disk.smart.nvme.critical_warning` 只统计上报了 `critical_warning` 且值非零的设备。没有设备上报该字段时，该指标不参与评估。

`disk.smart.attribute_failing` 只统计 `failing_attrs[].when_failed=FAILING_NOW`。没有属性失败数据时，该指标不参与评估。

## 操作符

- `>`
- `>=`
- `<`
- `<=`
- `==`
- `!=`

## 持续时间

允许值：

- `0`
- `60`
- `300`

单位是秒。创建规则时未传 `duration_sec` 默认 `60`。

## 阈值模式

| 模式 | 说明 |
| --- | --- |
| `static` | 直接使用 `threshold` |
| `core_plus` | 只支持 load 指标，阈值为 CPU 核心数 + `threshold` + `threshold_offset` |

`static` 模式下 `threshold_offset` 必须为 `0`。

CPU 核心数优先使用逻辑核心，其次物理核心。

## 告警生命周期

1. 节点上报后标记该节点告警需要评估。
2. 告警服务读取热点快照。
3. 编译启用的规则和该节点挂载状态。
4. 满足条件并达到持续时间后打开事件。
5. 不满足条件后关闭事件。
6. 可加载通知目标时，按全局设置选择通知渠道并写入通知 outbox。
7. worker 带租约重试发送通知。

告警服务启动后 1 分钟内不会新开告警事件。

通知目标不可用时，告警事件和运行时状态仍会提交，但不会新增通知 outbox。

## 规则挂载

规则挂载是 `(rule_id, server_id) -> enabled`。

接口：

```text
PUT /api/admin/alerts/mounts
```

请求：

```json
{
  "rule_ids": [-1, 10],
  "server_ids": [1, 2],
  "mounted": true
}
```

`rule_ids` 可包含内置规则 ID。`server_ids` 必须是存在的节点。

## 全局告警设置

接口：

```text
PUT /api/admin/alerts/settings
```

请求：

```json
{
  "enabled": true,
  "channel_ids": [1, 2]
}
```

`channel_ids` 可以为空数组，表示启用告警但不发送通知。

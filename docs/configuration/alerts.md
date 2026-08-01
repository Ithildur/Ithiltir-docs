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

SMART 告警通知会在标题中列出最多 3 个受影响设备，在正文中列出最多 5 个设备。每个设备最多列出 8 个失败属性。设备名、路径、序列号、型号和属性名中的控制/格式字符会替换为空格，单项最多 128 个 Unicode 字符，SMART 详情最多 2048 个 Unicode 字符。

可用时，NVMe 通知包含原始 critical warning、已知 bit 含义和 `media_errors`；文案按 SMART UI 条目号 `0E` 标识媒体/数据完整性错误。

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

规则名会 trim，不能为空，最多 128 个 Unicode 字符，且不得包含控制字符。`threshold` 和 `threshold_offset` 必须是有限数值。`cooldown_min` 必须在 `0..525600`。

## 阈值模式

| 模式 | 说明 |
| --- | --- |
| `static` | 直接使用 `threshold` |
| `core_plus` | 只支持 load 指标，阈值为 CPU 核心数 + `threshold` + `threshold_offset` |

`static` 模式下 `threshold_offset` 必须为 `0`。

CPU 核心数优先使用逻辑核心，其次物理核心。

## 告警生命周期

1. Node 上报后把最新快照放入进程内告警脏队列；控制变更可以只放节点 ID。
2. 告警服务读取最新进程内快照或 PostgreSQL 当前投影。
3. 编译启用的规则和该节点挂载状态。
4. 满足条件并达到持续时间后打开事件。
5. 不满足条件后关闭事件。
6. 可加载通知目标时，按全局设置选择通知渠道并写入通知 outbox。
7. 单进程 worker 从 PostgreSQL outbox 取任务并发送通知。

告警服务启动后 1 分钟内不会新开告警事件。

开放中的 firing 事件保存在 PostgreSQL，并在重启后恢复。Pending 和 cooldown 只保存在当前进程中，重启后重置。脏队列也不持久化；启动后的全量协调、开放事件和后续指标上报负责恢复评估。

告警事件和通知 outbox 在同一持久化边界内提交。首次加载通知目标失败且没有 last-good 快照时，本次状态转换会延后重试，不会提交一个缺少 outbox 的终态；已有 last-good 快照时继续使用该快照。

通知发送失败不会回滚告警事件。投递重试、暂停、阻塞和丢弃语义见 [通知渠道](./notifications.md)。

## 告警记录

告警记录保存规则打开和关闭后的事件。管理台可以按节点、状态、指标和时间范围筛选记录。

接口：

```text
GET /api/admin/alerts/events
GET /api/admin/alerts/events/summary
GET /api/admin/alerts/events/servers
```

`GET /api/admin/alerts/events` 支持 `server_id`、`status`、`metric`、`from`、`to`、`cursor` 和 `limit`。`status` 允许 `open`、`closed` 或 `all`，未传时只返回未恢复事件。

`GET /api/admin/alerts/events/summary` 返回按节点聚合的未恢复告警摘要。节点列表里的告警入口使用该摘要；它是进入节点页时加载的快照，不是实时轮询。

摘要的 `open_count` 是未恢复告警事件数量。看板顶栏“异常项”统计的是离线、RAID、CPU 和磁盘条件，不是该字段。

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

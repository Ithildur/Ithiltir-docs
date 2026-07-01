---
slug: /Reference/DashAPI
---

# Dash HTTP API

基础路径：

```text
/api
```

错误格式：

```json
{ "code": "<string>", "message": "<string>" }
```

## 鉴权

| 方式 | 用途 |
| --- | --- |
| 管理员密码 | `POST /api/auth/login` |
| refresh cookie + `X-CSRF-Token` | `POST /api/auth/refresh`、`POST /api/auth/logout` |
| `Authorization: Bearer <access_token>` | 管理 API 和可选鉴权读取 |
| `X-Node-Secret` | 节点上报、节点身份读取和 deploy 资产下载 |
| `upgrade_token` query | 只给旧 Agent 自动升级使用的临时 deploy 资产下载授权 |

## 公开和可选鉴权

| 方法 | 路径 | 鉴权 | 说明 |
| --- | --- | --- | --- |
| `GET` | `/api/version/` | 无 | Dash 和打包 node 版本 |
| `GET` | `/api/front/brand` | 可选 Bearer | 品牌信息 |
| `GET` | `/api/front/metrics` | 可选 Bearer | 当前看板指标 |
| `GET` | `/api/front/groups` | 可选 Bearer | 前台分组 |
| `GET` | `/api/metrics/online` | 可选 Bearer | 在线率 |
| `GET` | `/api/metrics/history` | 可选 Bearer | 历史指标 |
| `GET` | `/api/statistics/access` | 可选 Bearer | 匿名访问设置 |
| `GET` | `/api/statistics/traffic/settings` | 可选 Bearer | 流量设置 |
| `GET` | `/api/statistics/traffic/ifaces` | 可选 Bearer | 节点网卡列表 |
| `GET` | `/api/statistics/traffic/summary` | 可选 Bearer | 当前账期流量 |
| `GET` | `/api/statistics/traffic/daily` | 可选 Bearer | 日流量，要求 billing 模式 |
| `GET` | `/api/statistics/traffic/monthly` | 可选 Bearer | 月流量 |

Bearer 可选端点会把无效 Bearer 当作匿名请求。

## 认证会话

`POST /api/auth/login` 请求体必须包含 `password` 和 `persistence`。`persistence` 允许 `session` 或 `persistent`。成功响应包含 `access_token`、`expires_at` 和 `csrf_token`，并写入 refresh/CSRF cookie。

| 方法 | 路径 | 鉴权 | 成功 |
| --- | --- | --- | --- |
| `GET` | `/api/auth/sessions/` | Bearer | `200` |
| `DELETE` | `/api/auth/sessions/current` | Bearer | `204` |
| `DELETE` | `/api/auth/sessions/` | Bearer | `204` |
| `DELETE` | `/api/auth/sessions/{sid}` | Bearer | `204` |

`GET /api/auth/sessions/` 返回当前 Bearer token 用户的 `{ "sessions": [...] }`。每项包含 `id`、`expires_at`、`session_only` 和 `current`。

## 节点接口

| 方法 | 路径 | 鉴权 | Body | 成功 |
| --- | --- | --- | --- | --- |
| `POST` | `/api/node/identity` | `X-Node-Secret` | `{}` | `200` |
| `POST` | `/api/node/metrics` | `X-Node-Secret` | `NodeReport` | `200` |
| `POST` | `/api/node/static` | `X-Node-Secret` | `Static` | `200` |

`/api/node/metrics` 成功响应：

```json
{
  "ok": true,
  "update": null
}
```

或：

```json
{
  "ok": true,
  "update": {
    "id": "release-id",
    "version": "1.2.3",
    "url": "https://dash.example.com/deploy/windows/node_windows_amd64.exe?upgrade_token=...",
    "sha256": "...",
    "size": 12345678
  }
}
```

`url` 可能包含短期有效的 `upgrade_token`，让旧 Agent 不发送 `X-Node-Secret` 也能下载本次升级的精确资产。客户端必须按原样使用返回的 URL。

待升级任务是易失状态，Agent 上报完全相同的目标版本或 SemVer 优先级更高的版本后清除。同一 SemVer 优先级但 build metadata 不同的版本视为不同节点二进制，仍可下发。

## 管理：分组

| 方法 | 路径 | Body | 成功 |
| --- | --- | --- | --- |
| `GET` | `/api/admin/groups/` | 无 | `200` |
| `GET` | `/api/admin/groups/map` | 无 | `200` |
| `POST` | `/api/admin/groups/` | `{ "name": "...", "remark": "..." }` | `204` |
| `PATCH` | `/api/admin/groups/{id}` | `{ "name": "...", "remark": "..." }` | `204` |
| `DELETE` | `/api/admin/groups/{id}` | 无 | `204` |

`name` 会 trim，不能为空。

## 管理：节点

| 方法 | 路径 | Body | 成功 |
| --- | --- | --- | --- |
| `GET` | `/api/admin/nodes/` | 无 | `200` |
| `GET` | `/api/admin/nodes/deploy` | 无 | `200` |
| `POST` | `/api/admin/nodes/` | 无 | `204` |
| `PUT` | `/api/admin/nodes/display-order` | 节点 ID 顺序 | `204` |
| `PATCH` | `/api/admin/nodes/traffic-p95` | `{ "ids": [1, 2], "enabled": true }` | `204` |
| `PATCH` | `/api/admin/nodes/{id}` | 节点补丁 | `204` |
| `POST` | `/api/admin/nodes/{id}/upgrade` | 无 | `204` |
| `GET` | `/api/admin/nodes/traffic/rebuild` | 无 | `200` |
| `POST` | `/api/admin/nodes/{id}/traffic/rebuild` | 无 | `202` |
| `DELETE` | `/api/admin/nodes/{id}` | 无 | `204` |

节点补丁字段：

```json
{
  "name": "node-a",
  "is_guest_visible": true,
  "traffic_p95_enabled": true,
  "traffic_cycle_mode": "default",
  "traffic_billing_start_day": 1,
  "traffic_billing_anchor_date": "",
  "traffic_billing_timezone": "Asia/Shanghai",
  "traffic_direction_mode": "default",
  "display_order": 1,
  "tags": ["prod", "hk"],
  "secret": "new-secret",
  "group_ids": [1, 2]
}
```

`tags` 必须是字符串数组，空值和重复值会被移除。

提交空 `secret` 时返回 `400 invalid_secret`；提交的 `secret` 已属于其他节点时返回 `409 duplicate_secret`。

节点账期覆盖字段是原子组。只要提交 `traffic_cycle_mode`、`traffic_billing_start_day`、`traffic_billing_anchor_date` 或 `traffic_billing_timezone` 中任意字段，就必须同时提交 `traffic_cycle_mode` 和该模式使用的全部字段，否则返回 `400 invalid_traffic_cycle_settings`。`traffic_cycle_mode` 允许 `default`、`calendar_month`、`whmcs_compatible` 和 `clamp_to_month_end`。

`traffic_direction_mode` 允许 `default`、`out`、`both` 和 `max`。`default` 继承全局统计方向，其他值覆盖该节点。

`/api/admin/nodes/traffic-p95` 接受 `ids` 和 `enabled`。`enabled` 必填。`ids` 必须是非空正整数数组，不能重复，最多 10000 项。该命令先校验全部节点 ID，再在一个事务中更新 P95 开关。成功返回 `204`；任一节点不存在或已删除时返回 `404 not_found`，且不会更新任何节点。

`GET /api/admin/nodes/traffic/rebuild` 返回最近一次进程内重建任务状态。还没有任务时返回 `status=idle`；运行中时包含 `server_id`、`running=true` 和 `started_at`；任务结束后可能继续返回 `completed` 或 `failed`，直到下一次任务替换。该状态不会跨进程重启持久化。失败状态只暴露稳定的 `code` 和 `error`，不会返回内部错误字符串。

`POST /api/admin/nodes/{id}/traffic/rebuild` 按节点启动流量重建，基于保留窗口内的 `nic_metrics` 重写该节点的 5 分钟事实。成功返回 `202` 和状态体；节点不存在或已删除时返回 `404 not_found`；已有任意重建任务运行时返回 `409 traffic_rebuild_running`；重建任务不可用时返回 `503 traffic_rebuild_unavailable`。任务启动时会让该节点保留窗口内重叠的月度快照失效，不同步重写月度快照。

`GET /api/admin/nodes/` 的 `version.supports_auto_update` 表示当前节点版本是否满足 Dash 管理台自动下发更新要求。最低版本为 `0.2.3`。

`POST /api/admin/nodes/{id}/upgrade` 要求 `version.supports_auto_update=true`。当前节点版本低于 `0.2.3` 时返回 `409 node_upgrade_unsupported`；打包版本、平台或资产不可用时返回 `409`；Dash 无法生成旧 Agent 临时下载授权时返回 `503 node_upgrade_grant_error`。

## 管理：流量设置

| 方法 | 路径 | Body | 成功 |
| --- | --- | --- | --- |
| `PATCH` | `/api/statistics/traffic/settings` | 局部字段 | `204` |

字段见 [流量统计和账期](../configuration/traffic.md)。

## 流量查询

- `GET /api/statistics/traffic/daily` 要求 `usage_mode=billing`，否则返回 `409 traffic_daily_requires_billing`。`period` 可选，允许 `current`、`previous`，省略时为 `current`。
- `GET /api/statistics/traffic/monthly` 支持 `months` 和 `period`。`months` 最大 24；`period=current` 从本账期开始，`period=previous` 从上账期开始，省略时为 `current`。响应字段 `includes_current` 在 `period=current` 时为 `true`，在 `period=previous` 时为 `false`。
- 流量查询使用节点有效流量配置。节点 `traffic_cycle_mode=default` 时继承全局账期；节点 `traffic_direction_mode=default` 时继承全局统计方向。
- 流量 summary、daily、monthly 响应保留原始 `in_*` 和 `out_*` 字段，并通过 `selected_bytes`、`selected_p95_bytes_per_sec`、`selected_peak_bytes_per_sec` 及其方向字段暴露当前计费视图。
- 客户端应使用 `coverage_ratio` 展示样本覆盖率和准确性提示。`partial` 仅为兼容保留，新的展示逻辑不应依赖该字段。

## 历史指标

`GET /api/front/metrics` 的节点结构可以包含 `node.tags`、`disk.smart`、`disk.temperature_devices[]`、顶层 `thermal` 和顶层 `pressure`。SMART、thermal 和 pressure 运行时 payload 与前台节点快照分开缓存，只有 `received_at` 匹配时才会重新挂回节点快照。

`GET /api/metrics/history` 支持温度指标：

| 指标 | 来源 | 设备参数 |
| --- | --- | --- |
| `cpu.temp_c` | CPU 温度传感器最高温度 | 不需要 |
| `disk.temp_c` | SMART 物理磁盘温度历史 | 必须传 `device` |

`disk.temp_c` 的 `device` 可以匹配物理磁盘 `name`、`ref` 或 `path`。温度历史不使用 rollup 前缀。

SMART 温度历史只来自后端确认的物理盘。虚拟盘和 RAID 设备不会写入 `disk.temp_c` 历史。

`GET /api/metrics/history` 也支持 PSI 平均值指标：

- `pressure.cpu.some_avg10`、`pressure.cpu.some_avg60`、`pressure.cpu.some_avg300`
- `pressure.memory.some_avg10`、`pressure.memory.some_avg60`、`pressure.memory.some_avg300`
- `pressure.memory.full_avg10`、`pressure.memory.full_avg60`、`pressure.memory.full_avg300`
- `pressure.io.some_avg10`、`pressure.io.some_avg60`、`pressure.io.some_avg300`
- `pressure.io.full_avg10`、`pressure.io.full_avg60`、`pressure.io.full_avg300`

## 管理：告警

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/admin/alerts/rules/` | 列出规则 |
| `POST` | `/api/admin/alerts/rules/` | 创建规则 |
| `PATCH` | `/api/admin/alerts/rules/{id}` | 更新规则 |
| `DELETE` | `/api/admin/alerts/rules/{id}` | 删除规则 |
| `GET` | `/api/admin/alerts/mounts/` | 列出挂载 |
| `PUT` | `/api/admin/alerts/mounts/` | 设置挂载 |
| `GET` | `/api/admin/alerts/settings/` | 读取全局设置 |
| `PUT` | `/api/admin/alerts/settings/` | 替换全局设置 |
| `GET` | `/api/admin/alerts/events/` | 列出告警记录 |
| `GET` | `/api/admin/alerts/events/summary` | 列出未恢复告警摘要 |
| `GET` | `/api/admin/alerts/events/servers` | 列出告警记录筛选节点 |
| `GET` | `/api/admin/alerts/channels/` | 列出渠道 |
| `POST` | `/api/admin/alerts/channels/` | 创建渠道 |
| `GET` | `/api/admin/alerts/channels/{id}` | 读取渠道 |
| `PUT` | `/api/admin/alerts/channels/{id}` | 替换渠道 |
| `PUT` | `/api/admin/alerts/channels/{id}/enabled` | 切换启用 |
| `POST` | `/api/admin/alerts/channels/{id}/test` | 测试发送 |
| `DELETE` | `/api/admin/alerts/channels/{id}` | 删除渠道 |

`GET /api/admin/alerts/events/` 支持 `server_id`、`status=open|closed|all`、`metric`、`from`、`to`、`cursor` 和 `limit`。`from`、`to` 使用 RFC3339；`limit` 默认 200，最大 500。默认 `status=open`。

告警记录响应包含 `items`、`next_cursor` 和 `has_more`。记录项包含节点、规则、指标、状态、首次触发时间、最后触发时间、关闭时间、当前值、有效阈值和关闭原因。

## 管理：系统

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/admin/system/settings/` | 读取系统设置 |
| `PUT` | `/api/admin/system/settings/` | 替换系统设置 |
| `PATCH` | `/api/admin/system/settings/` | 局部更新 |
| `GET` | `/api/admin/system/dash-update/status` | 读取 Dash 更新器状态 |
| `GET` | `/api/admin/system/dash-update/check` | 检查 Dash 更新 |
| `POST` | `/api/admin/system/dash-update/run` | 启动 Dash 更新任务 |
| `GET` | `/api/admin/system/dash-update/release-notes` | 读取 Release Notes HTML |
| `GET` | `/api/admin/system/themes/` | 列出主题 |
| `POST` | `/api/admin/system/themes/upload` | 上传主题 zip |
| `POST` | `/api/admin/system/themes/{id}/apply` | 应用主题 |
| `DELETE` | `/api/admin/system/themes/{id}` | 删除主题 |

系统设置包含 `history_guest_access_mode`、`dash_update_channel`、`dash_update_mode`、`logo_url`、`page_title` 和 `topbar_text`。`PATCH` 接受局部更新；`PUT` 是全量替换。

`dash_update_channel` 允许 `release` 或 `prerelease`。`dash_update_mode` 允许 `manual`、`notify` 或 `auto`。

`GET /api/admin/system/dash-update/check` 的 `channel` query 允许 `release` 或 `prerelease`。`POST /api/admin/system/dash-update/run` 请求体包含 `action`、`channel` 和 `lang`。任务成功启动返回 `202`；已有任务运行时返回 `409` 和当前状态；更新器不可用返回 `503 dash_update_unavailable`。

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
| `upgrade_token` query | 只给旧 Node 自动升级使用的临时 deploy 资产下载授权 |

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

`POST /api/auth/login` 请求体必须包含 `password` 和 `persistence`。`persistence` 允许 `session` 或 `persistent`。成功响应包含 `access_token`、`expires_at` 和 `csrf_token`，并写入 refresh/CSRF cookie。格式错误的登录 JSON 返回 `400 invalid_json`，非法 `persistence` 返回 `400 invalid_persistence`，登录限流返回 `429 rate_limited`。

| 方法 | 路径 | 鉴权 | 成功 |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | 管理员密码 | `200` |
| `POST` | `/api/auth/refresh` | refresh cookie + `X-CSRF-Token` | `200` |
| `POST` | `/api/auth/logout` | refresh cookie + `X-CSRF-Token` | `204` |
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

`url` 可能包含短期有效的 `upgrade_token`，让旧 Node 不发送 `X-Node-Secret` 也能下载本次升级的精确资产。客户端必须按原样使用返回的 URL。

待升级任务是易失状态。Node 上报完全相同的目标版本或 SemVer 优先级更高的版本后清除；同一 SemVer 优先级但 build metadata 不同的版本仍视为不同二进制。

## 管理：分组

| 方法 | 路径 | Body | 成功 |
| --- | --- | --- | --- |
| `GET` | `/api/admin/groups/` | 无 | `200` |
| `GET` | `/api/admin/groups/map` | 无 | `200` |
| `POST` | `/api/admin/groups/` | `{ "name": "...", "remark": "..." }` | `204` |
| `PATCH` | `/api/admin/groups/{id}` | `{ "name": "...", "remark": "..." }` | `204` |
| `DELETE` | `/api/admin/groups/{id}` | 无 | `204` |

分组 `name` 会 trim，必须包含 1～64 个 Unicode 字符且不得含控制字符。`remark` 会 trim，最多 255 个 Unicode 字符且不得含控制字符。

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
  "traffic_cycle_mode": "calendar_month",
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

节点名会 trim，必须包含 1～64 个 Unicode 字符且不得含控制字符。`tags` 最多 32 项；每项 trim 后最多 64 个 Unicode 字符且不得含控制字符，空值和重复值会被移除。

读取存量标签时，Dash 会记录 warning 并丢弃非法项和超过数量上限的项；存量 JSON 无法解析时返回空标签组，不影响节点其他指标进入前台投影。

`secret` 会 trim，必须包含 8～128 个 Unicode 字符。非法值返回 `400 invalid_secret`；已属于其他节点时返回 `409 duplicate_secret`。

节点账期字段是原子组。只要提交 `traffic_cycle_mode`、`traffic_billing_start_day`、`traffic_billing_anchor_date` 或 `traffic_billing_timezone` 中任意字段，就必须同时提交 `traffic_cycle_mode` 和该模式需要的全部字段，否则返回 `400 invalid_traffic_cycle_settings`。保存值只允许 `calendar_month`、`whmcs_compatible` 和 `clamp_to_month_end`。兼容输入 `default` 仅可在不带其他账期字段时提交，并会保存为显式 `calendar_month`。

账期变更立即生效。Dash 会使该节点受影响的月度派生数据失效，并在后台局部修复仍位于原始指标保留期内的数据。

`traffic_direction_mode` 允许 `default`、`out`、`both` 和 `max`。`default` 继承全局统计方向，其他值覆盖该节点。

`/api/admin/nodes/traffic-p95` 接受 `ids` 和 `enabled`。`enabled` 必填。`ids` 必须是非空正整数数组，不能重复，最多 10000 项。该命令先校验全部节点 ID，再在一个事务中更新 P95 开关。成功返回 `204`；任一节点不存在或已删除时返回 `404 not_found`，且不会更新任何节点。

`GET /api/admin/nodes/traffic/rebuild` 返回最近一次进程内重建任务状态。还没有任务时返回 `status=idle`；运行中时包含 `server_id`、`running=true` 和 `started_at`；任务结束后可能继续返回 `completed` 或 `failed`，直到下一次任务替换。该状态不会跨进程重启持久化。失败状态只暴露稳定的 `code` 和 `error`，不会返回内部错误字符串。

`POST /api/admin/nodes/{id}/traffic/rebuild` 是 Billing 专用接口，基于保留窗口内的 `nic_metrics` 重写该节点的 5 分钟事实。成功返回 `202`；Lite 模式返回 `409 traffic_rebuild_requires_billing`；已有任务返回 `409 traffic_rebuild_running`；执行器不可用返回 `503 traffic_rebuild_unavailable`。任务按 6 小时分块运行并使重叠月度快照失效。切换到 Lite 后，当前分块完成，后续分块停止。

`GET /api/admin/nodes/` 的 `version.supports_auto_update` 表示当前节点版本是否满足 Dash 管理台自动下发更新要求。最低版本为 `0.2.3`。

`POST /api/admin/nodes/{id}/upgrade` 要求 `version.supports_auto_update=true`。当前节点版本低于 `0.2.3` 时返回 `409 node_upgrade_unsupported`；打包版本、平台或资产不可用时返回 `409`；Dash 无法生成旧 Node 临时下载授权时返回 `503 node_upgrade_grant_error`。

## 管理：流量设置

| 方法 | 路径 | Body | 成功 |
| --- | --- | --- | --- |
| `PATCH` | `/api/statistics/traffic/settings` | 局部字段 | `204` |

字段见 [流量统计和账期](../configuration/traffic.md)。

该接口只接受 `guest_access_mode`、`usage_mode` 和 `direction_mode`。提交全局账期字段返回 `400 billing_cycle_is_per_node`。

## 流量查询

- `GET /api/statistics/traffic/daily` 要求 `usage_mode=billing`，否则返回 `409 traffic_daily_requires_billing`。`period` 可选，允许 `current`、`previous`，省略时为 `current`。
- `GET /api/statistics/traffic/monthly` 支持 `months` 和 `period`。`months` 必须在 `1..24`；`period=current` 从本账期开始，`period=previous` 从上账期开始，省略时为 `current`。响应字段 `includes_current` 在 `period=current` 时为 `true`，在 `period=previous` 时为 `false`。
- 流量查询使用节点显式保存的账期。只有 `traffic_direction_mode=default` 继承全局统计方向。
- 流量 summary、daily、monthly 响应保留原始 `in_*` 和 `out_*` 字段，并通过 `selected_bytes`、`selected_p95_bytes_per_sec`、`selected_peak_bytes_per_sec` 及其方向字段暴露当前计费视图。
- 客户端应使用 `data_complete`、`coverage_ratio`、`gap_count` 和 `reset_count` 展示完整性。废弃字段 `partial` 已删除。

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
| `POST` | `/api/admin/alerts/channels/telegram/mtproto/code` | 发起 MTProto 登录并发送验证码 |
| `POST` | `/api/admin/alerts/channels/telegram/mtproto/verify` | 校验登录验证码 |
| `POST` | `/api/admin/alerts/channels/telegram/mtproto/password` | 提交二次验证密码 |
| `POST` | `/api/admin/alerts/channels/telegram/mtproto/ping` | 检查已保存的 MTProto 会话 |

`GET /api/admin/alerts/events/` 支持 `server_id`、`status=open|closed|all`、`metric`、`from`、`to`、`cursor` 和 `limit`。`from`、`to` 使用 RFC3339；`limit` 默认 200，最大 500。默认 `status=open`。

告警记录响应包含 `items`、`next_cursor` 和 `has_more`。记录项包含节点、规则、指标、状态、首次触发时间、最后触发时间、关闭时间、当前值、有效阈值和关闭原因。

通知渠道读取同时返回 `delivery_status`、最近成功/失败时间、连续失败次数、下次重试或探测时间以及待发送/阻塞计数。无法按当前 schema 解码的存量渠道仍可列出，但 `config=null`，只能删除。Telegram MTProto 登录状态故障返回 `503 login_state_error`；渠道 revision 并发变化返回 `409 channel_changed`。完整约束见 [通知](../configuration/notifications.md)。

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

新写入的 `logo_url` 只接受同源绝对路径、受支持图片类型的 base64 data URL 或外部 HTTPS URL。存量外部 HTTP Logo 继续读取；`PATCH` 修改其他字段时不会重新校验未提交的 Logo。

`dash_update_channel` 允许 `release` 或 `prerelease`。`dash_update_mode` 允许 `manual`、`notify` 或 `auto`。

`GET /api/admin/system/dash-update/check` 的 `channel` query 允许 `release` 或 `prerelease`，响应包含目标版本和不透明的 `install_revision`。

`POST /api/admin/system/dash-update/run` 请求体包含 `action=update|reinstall`、`channel` 和 `lang`。当前客户端还应提交前次检查返回的 `target_version`、`expected_current_version` 和 `expected_install_revision`，形成不可变计划。旧客户端可以省略三者，由服务端在入队前重新检查。计划过期时任务以 `failure_code=install_changed` 失败，不会改选目标版本。成功启动返回 `202`；已有任务返回 `409`；当前版本执行普通更新返回 `409 dash_update_current`；更新器不可用返回 `503 dash_update_unavailable`。

状态响应可能包含 `phase`、`failure_code` 和 `recovery_path`。`failure_code=recovery_required` 时必须以 root 执行 `dash update recover`。更新任务和事务持久化在 `$DASH_HOME/runtime/dash-update`，不会因 Dash 进程重启丢失。

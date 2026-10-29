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

## 请求约定

- `/api` 及其子路径的响应均带 `Cache-Control: no-store`，包括鉴权和路由错误。API 请求体上限为 24 MiB，部分端点使用更小限制；只在读取请求体时检查大小。
- 方法名区分大小写。Dash 实现 GET、HEAD、POST、PUT、PATCH、DELETE；其他方法（包括 OPTIONS 和小写 `get`）返回 `501 not_implemented`。已实现的方法访问未知路径返回 `404 not_found`，访问已有端点但方法不匹配返回 `405 method_not_allowed` 和 `Allow`。GET API 不隐含 HEAD。
- 下面表格中的 `/api/version/` 和管理模块根路径同时接受无尾斜线形式，不发生重定向。节点 ID 的 PATCH、DELETE 也接受尾斜线；其他端点不会自动增加别名。
- JSON 请求要求合法的 `application/json` 媒体类型，允许合法参数；非法媒体类型或参数返回 `415 unsupported_media_type`。
- JSON 字段名区分大小写；接口未另行约束时忽略未知字段。重复对象键和无效 UTF-8 会被拒绝。客户端不得依赖响应的空白、对象键顺序或 HTML 字符转义形式。
- 节点指标入库截止时间为服务端接收后 5 秒，鉴权、读取请求体和等待节点锁均消耗该预算；超时上报返回 `503 service_unavailable`，不写入指标。

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
| `GET` | `/api/metrics/uptime` | 可选 Bearer | 最近 45 个自然日的 Uptime |
| `GET` | `/api/metrics/uptime/day` | 可选 Bearer | 指定日期的 24 小时 Uptime |
| `GET` | `/api/metrics/history` | 可选 Bearer | 历史指标 |
| `GET` | `/api/statistics/access` | 可选 Bearer | 匿名访问设置 |
| `GET` | `/api/statistics/traffic/settings` | 可选 Bearer | 流量设置 |
| `GET` | `/api/statistics/traffic/ifaces` | 可选 Bearer | 节点网卡列表 |
| `GET` | `/api/statistics/traffic/summary` | 可选 Bearer | 当前账期流量 |
| `GET` | `/api/statistics/traffic/daily` | 可选 Bearer | 日流量，要求 billing 模式 |
| `GET` | `/api/statistics/traffic/monthly` | 可选 Bearer | 月流量 |

Bearer 可选端点会把无效 Bearer 当作匿名请求。

`GET /api/statistics/traffic/ifaces?server_id=<id>` 返回该节点历史上报过的网卡名。结果按最后采样时间倒序排列，最近仍在上报的网卡优先；采样时间相同时按网卡名升序排列。历史网卡不会从列表中删除，可继续用于查询旧流量数据。

## 节点 Uptime

- `GET /api/metrics/uptime`（兼容尾斜线）返回 `{enabled, timezone, generated_at, warning_sla, error_sla, nodes}`。每个节点包含字符串 `server_id` 和按日期升序排列的 45 个 `days`，包括今天；每天包含 `date`（`YYYY-MM-DD`）、`percent`（0～100 或 `null`）和 `observed_ms`（已观测毫秒数）。日期使用 `app.timezone`，未配置时使用服务端本地时区；没有观测的日期也始终返回。
- 已认证请求返回全部未删除节点。游客只有在 `uptime_guest_visible` 开启时才能读取游客可见节点；关闭时日统计返回 `200`、`enabled: false` 和空节点列表。SLA 阈值来自系统设置，不影响采样。
- `GET /api/metrics/uptime/day?server_id=<id>&date=YYYY-MM-DD`（兼容 `/day/`）返回 `{date, hours, observed_ms}`，两个数组各有 24 项，按当地钟表小时索引。缺失和未来小时的百分比为 `null`、观测毫秒数为零；夏令时跳过的小时为未知，重复小时合并时长。游客访问关闭返回 `403 forbidden`；对游客，隐藏、删除或不存在的节点统一返回 `404 not_found`。节点 ID 非法或日期超出同一 45 天窗口时返回 `400 invalid_request`，数据库故障返回 `503 service_unavailable`。
- 在线率为 `100 × 在线毫秒数 / 观测毫秒数`，按时长加权。一次上报的有效区间从服务端接收时间延续至 `app.node_offline_threshold` 之后，重叠区间只计算一次；节点首次创建当前指标行时开始统计。只计入已结束的分钟，正常在整分后 6 秒归集，今天和当前小时的值最多约滞后一分钟加归集延时。缺失分钟表示未知，不计入分母；百分比不保证覆盖完整，`observed_ms` 表明已观测时长。既有 `/api/metrics/online` 保持原有契约和数据来源。
- 卡片的日统计独立每 60 秒刷新，仅在展开某天时加载小时明细。关闭游客访问会隐藏 Uptime；退出登录后丢弃已认证状态下读取的 Uptime 数据。

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

账期变更立即生效。Dash 会使该节点受影响的月度派生数据失效，并在后台修复仍位于网卡原始指标保留期内的数据。

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
| `disk.temp_c` | SMART 物理磁盘温度历史 | 可选；省略时聚合物理盘记录 |

`disk.temp_c` 的 `device` 可以匹配物理磁盘 `name`、`ref` 或 `path`。

SMART 温度历史只来自后端确认的物理盘。虚拟盘和 RAID 设备不会写入 `disk.temp_c` 历史。

`GET /api/metrics/history` 也支持 PSI 平均值指标：

- `pressure.cpu.some_avg10`、`pressure.cpu.some_avg60`、`pressure.cpu.some_avg300`
- `pressure.memory.some_avg10`、`pressure.memory.some_avg60`、`pressure.memory.some_avg300`
- `pressure.memory.full_avg10`、`pressure.memory.full_avg60`、`pressure.memory.full_avg300`
- `pressure.io.some_avg10`、`pressure.io.some_avg60`、`pressure.io.some_avg300`
- `pressure.io.full_avg10`、`pressure.io.full_avg60`、`pressure.io.full_avg300`

历史查询根据 `range` 使用固定数据源。HTTP 参数、响应字段、数据点数量和排序保持不变：

| `range` | 数据源 | 数据点间隔 |
| --- | --- | --- |
| `30m`、`1h`、`12h`、`24h` | 原始采样 | 3 秒、6 秒、60 秒、120 秒 |
| `1w` | 15 分钟聚合 | 15 分钟 |
| `15d` | 15 分钟聚合加权重组 | 30 分钟 |
| `30d` | 1 小时聚合 | 1 小时 |

温度和公开的压力停顿信息（PSI）平均值与其他常规指标使用相同的聚合模型。聚合查询包含最新的实时采样。原始采样默认保留 8 天；15 分钟和 1 小时聚合分别保留 16 天和 32 天。

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

系统设置包含 `history_guest_access_mode`、`dash_update_channel`、`dash_update_mode`、`logo_url`、`page_title`、`topbar_text`、`uptime_guest_visible`、`uptime_warning_sla` 和 `uptime_error_sla`。`PATCH` 接受局部更新；`PUT` 必须提交前六个字段。

`uptime_guest_visible` 默认为 `true`；警告和错误阈值默认为 `99`、`95`，允许小数，必须满足 `0 <= error < warning <= 100`。PATCH 和 PUT 中省略或为 `null` 的 Uptime 字段保留原值。非法阈值返回 `400 invalid_fields`，整次更新回滚。开关和阈值只控制访问与展示，不改变采样。

新写入的 `logo_url` 只接受同源绝对路径、受支持图片类型的 base64 data URL 或外部 HTTPS URL。存量外部 HTTP Logo 继续读取；`PATCH` 修改其他字段时不会重新校验未提交的 Logo。

`dash_update_channel` 允许 `release` 或 `prerelease`。`dash_update_mode` 允许 `manual`、`notify` 或 `auto`。

`GET /api/admin/system/dash-update/check` 的 `channel` query 允许 `release` 或 `prerelease`，响应包含目标版本和不透明的 `install_revision`。

`POST /api/admin/system/dash-update/run` 请求体包含 `action=update|reinstall`、`channel` 和 `lang`。当前客户端还应提交前次检查返回的 `target_version`、`expected_current_version` 和 `expected_install_revision`，形成不可变计划。旧客户端可以省略三者，由服务端在入队前重新检查。计划过期时任务以 `failure_code=install_changed` 失败，不会改选目标版本。成功启动返回 `202`；已有任务返回 `409`；当前版本执行普通更新返回 `409 dash_update_current`；更新器不可用返回 `503 dash_update_unavailable`。

状态响应可能包含 `phase`、`failure_code` 和 `recovery_path`。`failure_code=recovery_required` 时必须以 root 执行 `dash update recover`。更新任务和事务持久化在 `$DASH_HOME/runtime/dash-update`，不会因 Dash 进程重启丢失。

## PVE 访问权限

系统设置接口（`GET`、`PATCH` 和 `PUT /api/admin/system/settings`）包含布尔字段 `pve_guest_visible`，默认 `false`。PATCH、PUT 中未提交或为 `null` 时保持原值；显式 `false` 关闭游客访问。

`GET /api/virt/{id}` 和 `GET /api/virt/{id}/vms/{vmid}/history` 使用相同权限：

- 管理员使用有效 Bearer token 访问，不受游客开关限制。
- 游客仅能在开关开启时查看游客可见宿主机的 VM 名称、IP、快照和历史。开关关闭返回 `403 forbidden`；开启后宿主隐藏、不存在或已删除返回 `404 not_found`。
- 读取访问设置或节点可见性失败返回 `503 virt_unavailable`。响应使用 `Cache-Control: no-store`。

## 虚拟机当前快照

- `POST /api/node/virt`：使用 `X-Node-Secret`，节点归属由密钥决定；JSON body 上限 4 MiB。成功返回 `204`，不携带更新 manifest。
- `GET /api/virt/{id}`：返回 `{ "snapshot": ..., "received_at": ..., "stale": false }` 及下述图表设置。无快照时，前两项为 `null`、`stale` 为 `true`。
- `GET /api/admin/nodes/deploy` 的布尔字段 `pve` 表示发布包中是否有与 Node 版本匹配且校验通过的 PVE helper。安装方法见 [PVE 监控](../installation/pve.md)。

上报体和 `snapshot` 使用同一结构：

```json
{
  "schema": 1,
  "provider": "pve",
  "host": "pve-a",
  "collected_at": "2026-09-28T10:00:00Z",
  "last_success_at": "2026-09-28T10:00:00Z",
  "ttl_seconds": 90,
  "status": "ok",
  "vms": [{"id": 100, "name": "guest", "status": "running", "template": false, "collected_at": "2026-09-28T10:00:00Z", "ttl_seconds": 90, "cpus": 2, "cpu_ratio": 0.25}]
}
```

`status` 为 `ok` 或 `error`。成功时，`last_success_at` 是最近一次成功读取 VM 清单的时间，可早于快照组装时间 `collected_at`；`vms: []` 表示成功枚举且没有 VM。失败时须提供 `error`，可保留上次成功的清单及时间；没有历史样本时允许 `vms: null`。

### VM 字段

必填字段为 `id`、`name`、`status`、`template`。以下字段可选，缺失表示未知：

| 字段 | 含义 |
| --- | --- |
| `qmp_status` | QEMU 状态，保留暂停等状态 |
| `cpus`、`cpu_ratio` | vCPU 数及 CPU 使用比例；比例按相邻 `/proc` 进程计数差值除以时间和 vCPU 数计算，首次采样未知 |
| `memory_bytes`、`memory_limit_bytes` | 内存用量和上限；用量取 cgroup 用量减文件缓存，有 balloon 数据时取来宾总量减空闲量 |
| `disk_capacity_bytes` | 低频查询的 PVE `maxdisk`，不是来宾文件系统用量 |
| `disk_read_bytes`、`disk_write_bytes`、`net_in_bytes`、`net_out_bytes` | 磁盘和网络累计字节数 |
| `uptime_seconds` | 运行时长，单位秒 |
| `net_rate_limits_mbps`、`ips` | 网卡限速和 IP，规则见下文 |

清单保留关机 VM、排除模板。只有 QMP 状态为 `running` 才上报动态指标和 IP。

可选字段 `collected_at`、`ttl_seconds` 记录 VM 的实际观测时间和有效期（helper 使用 90 秒），独立于外层快照。缺少观测时间表示动态指标未知。观测过期后，helper 和 Dash 省略 CPU、内存用量、磁盘/网络计数及运行时长，将状态标为 `unknown`，保留原观测时间和配置；IP 有效期独立判断。

### 网卡限速和 IP

`net_rate_limits_mbps` 按网卡名（如 `net0`）记录限速，值为 JSON 数字，单位 Mbps（1 Mbps = 1,000,000 bit/s），四舍五入至两位小数。PVE `rate` 从 MiB/s 换算，例如 `12.5` 上报 `104.86`。每个值分别适用于该网卡的收、发方向。`0` 表示未配置限速；字段缺失表示未采集到网卡配置。

helper 读取 `/etc/pve/qemu-server/<vmid>.conf` 的当前配置，忽略待应用修改和快照段。限速解析失败时省略该字段并记录日志，基础指标继续上报。

可选 `ips` 数组最多包含 1024 个不重复 IPv4/IPv6 地址，包含私网地址，排除回环、链路本地、未指定、多播及非法地址。IP 来自运行中的 VM Guest Agent。采集频率和退避见 [PVE 监控](../installation/pve.md)。

`ips_collected_at`、`ips_ttl_seconds` 独立描述 IP 有效期，不能用快照 `stale` 代替。helper 使用 900 秒 TTL；查询失败时可沿用未过期样本并保留原时间，过期或已知早于 VM 本次启动的样本会被省略。成功查询无地址时可以只有时间和 TTL 而没有 `ips`。

这两个字段可省略，此时 IP 新鲜度未知。提供时，时间须非零且不晚于外层快照 `collected_at`，可以晚于 VM 的 `collected_at`；TTL 为 1–3600 秒。

### 上报限制和缓存

最多 4096 台 VM，ID 不得重复；名称和宿主名最多 255 字节，状态字符串最多 64 字节，错误最多 1024 字节。计数器须为非负有符号 64 位整数；`ttl_seconds` 为 1–3600 秒；采集时间最多超前服务端 5 分钟。

非法 JSON 或数据返回 `400 invalid_virt`；body 超限返回 `413 body_too_large`；密钥无效返回 `401 unauthorized`，失败鉴权按 IP 限流；快照更新失败返回 `503 virt_unavailable`。

Dash 在 Redis 中缓存每宿主最新一份快照，`--no-redis` 使用进程内存。快照从接收起保留 10 分钟。重复或较旧报告返回 `204`，不覆盖快照或刷新接收时间；采样时间已超过 10 分钟的报告也返回 `204`，不再缓存。

`stale` 根据成功采样时间、接收时间和报告的 `ttl_seconds` 判断，可在缓存删除前变为 `true`。缓存到期或内存模式重启后返回空快照；Dash 重启不延长 Redis 缓存的有效期。Redis 读写失败返回 `503 virt_unavailable`，不切换到内存。

VM 数据不生成独立节点、不更新宿主在线率、不写宿主历史或流量统计。不支持 LXC、HA 配置和 VM 控制。

### VM 图表设置

快照读取接口还返回 `vm_cpu_threshold`（整数，默认 80）、`vm_memory_threshold`（整数，默认 90）、`vm_memory_enabled`（布尔值，默认 false），没有快照时也返回这些字段。`GET /api/admin/nodes` 返回上述持久化节点设置，并提供可选的 `os`、`platform`、`kernel_version` 字段用于识别系统。`PATCH /api/admin/nodes/{id}` 接受这三个设置字段；未提交或为 null 时保留原值。阈值必须为 1–100 的整数，范围错误返回 `400 invalid_vm_threshold`，字段类型错误返回 `400 invalid_request`。

这些设置用于 VM 历史图表标注，不发送通知；管理台仅对 PVE 节点启用设置入口。CPU 阈值为百分比。内存标注需开启，并按每个历史点的 `memory_limit_bytes` 计算；上限缺失或为零时不参与判断。标注统计所选 AVERAGE/MAX 值严格超过阈值的采样点数，缺失值不补零，点数不代表持续超限时长。

## PVE 历史查询

`GET /api/virt/{id}/vms/{vmid}/history` 从已连接节点读取 PVE RRD。参数：`timeframe=hour|day|week|month|year`，默认 `hour`；`consolidation=AVERAGE|MAX`，默认 `AVERAGE`。

响应包含 `source: "pve_rrd"`、`vm_id`、`timeframe`、`consolidation`、`collected_at`、`points`。`collected_at` 是读取时间；每点的 `timestamp` 是采样时间，可选字段为 `cpu_ratio`、`memory_bytes`、`memory_limit_bytes`、`disk_read_bytes_per_second`、`disk_write_bytes_per_second`、`net_in_bytes_per_second`、`net_out_bytes_per_second`。缺失值表示未知，历史聚合和分辨率由 PVE 决定。

历史查询错误：`400 invalid_query`/`invalid_id`、`403 forbidden`、`404 not_found`（节点）/`vm_not_found`（VM）、`429 busy`、`501 unsupported`、`503 node_offline`/`virt_unavailable`、`504 deadline_exceeded`、`502 source_unavailable`/`invalid_result`。查询要求本地新鲜的成功 VM 清单及支持历史查询的 helper 服务。Dash 不持久化 VM 历史，不将其计入宿主流量、在线率或计费。

`GET /api/admin/nodes/{id}/virt/capabilities` 仅供管理员进行安装诊断，返回 `{"connected":true,"pve_history":true,"version":"...","helper_version":"..."}`；会话断开时能力标志为 false。缺少鉴权时返回 `401 unauthorized`。

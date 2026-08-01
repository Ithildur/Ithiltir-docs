---
slug: /Dash/API
---

# Dash HTTP API

本文档汇总 Dash HTTP 边界。完整端点表和错误语义见 [Dash HTTP API](../../reference/dash-api.md) 与 [错误语义](../../reference/errors.md)。

## 基础

- API 基础路径：`/api`
- Dash 只支持根路径部署，不支持在 `app.public_url` 中配置路径前缀
- JSON 错误包装：

```json
{ "code": "<string>", "message": "<string>" }
```

## 鉴权模型

| 方式 | 用途 |
| --- | --- |
| 管理员密码 | `POST /api/auth/login` |
| refresh cookie + `X-CSRF-Token` | `POST /api/auth/refresh`、`POST /api/auth/logout` |
| `Authorization: Bearer <access_token>` | 管理 API 和可选鉴权读取 |
| `X-Node-Secret` | 节点上报、节点身份读取和 deploy 资产下载 |
| `upgrade_token` query | 只给旧 Node 自动升级使用的临时 deploy 资产下载授权 |

Bearer 可选端点会把缺失、格式错误、过期、已撤销或其他无法通过校验的 Bearer token 当作匿名请求处理。需要管理视图的客户端必须自行区分响应是已鉴权视图还是游客过滤视图。

JSON 请求超过路由 body 上限时返回 `413 body_too_large`。Refresh cookie 使用 `SameSite=Strict`。

## 命名空间

| 前缀 | 鉴权 | 资源 |
| --- | --- | --- |
| `/api/auth` | 登录用管理员密码；刷新和登出用 refresh cookie + `X-CSRF-Token`；`/sessions*` 用 Bearer | `POST /login`、`POST /refresh`、`POST /logout`、会话列表和撤销 |
| `/api/version` | 无 | `GET /` |
| `/api/front` | Bearer 可选 | `GET /brand`、`GET /metrics`、`GET /groups` |
| `/api/metrics` | Bearer 可选；历史指标默认只对已授权用户开放 | `GET /online`、`GET /history` |
| `/api/statistics` | Bearer 可选 | `GET /access` |
| `/api/statistics/traffic` | Bearer 可选；`PATCH /settings` 需要 Bearer | `GET /settings`、`PATCH /settings`、`GET /ifaces`、`GET /summary`、`GET /daily`、`GET /monthly` |
| `/api/node` | `X-Node-Secret` | `POST /identity`、`POST /metrics`、`POST /static` |
| `/api/admin/groups` | Bearer | `GET /`、`GET /map`、`POST /`、`PATCH /{id}`、`DELETE /{id}` |
| `/api/admin/nodes` | Bearer | `GET /`、`GET /deploy`、`POST /`、`PUT /display-order`、`PATCH /traffic-p95`、`PATCH /{id}`、`POST /{id}/upgrade`、`GET /traffic/rebuild`、`POST /{id}/traffic/rebuild`、`DELETE /{id}` |
| `/api/admin/alerts/rules` | Bearer | `GET /`、`POST /`、`PATCH /{id}`、`DELETE /{id}` |
| `/api/admin/alerts/mounts` | Bearer | `GET /`、`PUT /` |
| `/api/admin/alerts/settings` | Bearer | `GET /`、`PUT /` |
| `/api/admin/alerts/events` | Bearer | `GET /`、`GET /summary`、`GET /servers` |
| `/api/admin/alerts/channels` | Bearer | `GET /`、`POST /`、`GET /{id}`、`PUT /{id}`、`PUT /{id}/enabled`、`POST /{id}/test`、`DELETE /{id}` |
| `/api/admin/alerts/channels/telegram/mtproto` | Bearer | `POST /code`、`POST /verify`、`POST /password`、`POST /ping` |
| `/api/admin/system/settings` | Bearer | `GET /`、`PUT /`、`PATCH /` |
| `/api/admin/system/dash-update` | Bearer | `GET /status`、`GET /check`、`POST /run`、`GET /release-notes` |
| `/api/admin/system/themes` | Bearer | `GET /`、`POST /upload`、`POST /{id}/apply`、`DELETE /{id}` |

## 匿名读取

- `/api/front/brand` 可匿名读取。
- `/api/front/metrics` 和 `/api/front/groups` 允许匿名读取，但匿名结果只包含游客可见节点。
- 匿名 `/api/front/groups` 会省略没有游客可见节点的分组。
- `GET /api/front/metrics` 在节点配置了标签时，会在节点元数据中包含字符串数组 `node.tags`。
- `/api/metrics/online` 允许匿名读取游客可见节点。
- `/api/metrics/history` 默认需要 Bearer。只有 `history_guest_access_mode` 为 `by_node` 时，匿名读取才按游客可见节点放开。
- `/api/statistics/access` 可匿名读取。
- `/api/statistics/traffic/*` 的匿名读取由流量设置控制，并仍受节点游客可见性限制。

## 认证会话

- `POST /api/auth/login` 接受 `password` 和必填 `persistence`。`persistence` 允许 `session` 或 `persistent`；非法值返回 `400 invalid_persistence`。登录成功返回 `access_token`、`expires_at` 和 `csrf_token`，并写入 refresh/CSRF cookie。
- `GET /api/auth/sessions/` 返回当前 Bearer token 用户的 `{ "sessions": [...] }`。每项包含 `id`、`expires_at`、`session_only` 和 `current`。
- `DELETE /api/auth/sessions/current`、`DELETE /api/auth/sessions/` 和 `DELETE /api/auth/sessions/{sid}` 成功时返回 `204`。

## 管理节点

- `GET /api/admin/nodes/` 包含 `traffic_p95_enabled`、`traffic_cycle_mode`、`traffic_billing_start_day`、`traffic_billing_anchor_date`、`traffic_billing_timezone`、`traffic_direction_mode`、`tags` 和 `version`。
- `tags` 始终是字符串数组。
- `version.version` 是节点最后上报版本；缺失、非法或低于受支持节点版本下限时，`version.is_outdated` 为 true。
- `version.supports_auto_update` 表示当前节点版本是否满足 Dash 管理台自动下发更新要求。最低版本为 `0.2.3`。
- `PATCH /api/admin/nodes/{id}` 接受 `traffic_p95_enabled`、`tags`、节点流量覆盖字段、secret、分组和展示字段。未提交字段保持不变。
- 节点账期字段是原子组。只要提交 `traffic_cycle_mode`、`traffic_billing_start_day`、`traffic_billing_anchor_date` 或 `traffic_billing_timezone` 中任意字段，就必须同时提交 `traffic_cycle_mode` 和该模式使用的全部字段，否则返回 `400 invalid_traffic_cycle_settings`。
- 保存的 `traffic_cycle_mode` 允许 `calendar_month`、`whmcs_compatible`、`clamp_to_month_end`。旧输入 `default` 仅作为不带账期字段时的兼容别名，并保存为显式 `calendar_month`。
- `traffic_direction_mode` 允许 `default`、`out`、`both`、`max`。`default` 继承全局统计方向；其他值覆盖该节点。
- 节点名为 1～64 个 Unicode 字符且不得含控制字符。`secret` trim 后必须为 8～128 个 Unicode 字符；已属于其他节点时返回 `409 duplicate_secret`。
- `PATCH /api/admin/nodes/traffic-p95` 接受 `ids` 和 `enabled`。`enabled` 必填。`ids` 必须是非空正整数数组，不能重复，最多 10000 项。该命令先校验全部节点 ID，再在一个事务中更新全部选中节点。成功返回 `204`；任一节点不存在或已删除时返回 `404 not_found`，且不会更新任何节点。
- `GET /api/admin/nodes/traffic/rebuild` 返回最近一次进程内重建任务状态；状态不会跨进程重启持久化。失败状态只暴露稳定的 `code` 和 `error`。
- `POST /api/admin/nodes/{id}/traffic/rebuild` 只在 Billing 模式按节点重建保留窗口内的 5 分钟流量事实。Lite 模式返回 `409 traffic_rebuild_requires_billing`；已有任务返回 `409 traffic_rebuild_running`；任务不可用返回 `503 traffic_rebuild_unavailable`。
- `tags` 接受字符串数组，最多 32 项；每项 trim 后最多 64 个 Unicode 字符且不得含控制字符。空值和重复值会被删除，`[]` 表示清空标签。
- 非法 `tags` 返回 `400 invalid_tags`。
- `POST /api/admin/nodes/{id}/upgrade` 成功返回 `204`；节点无法接收自动下发更新时返回 `409 node_upgrade_unsupported`；打包版本、平台或资产不可用时返回 `409`；Dash 无法生成旧 Node 临时下载授权时返回 `503 node_upgrade_grant_error`。

## Node 更新

- `POST /api/node/metrics` 成功响应包含 `update`。
- 无待升级任务时，`update` 为 `null`。
- 有待升级任务时，`update` 包含 `id`、`version`、`url`、`sha256` 和 `size`。
- `url` 可能包含短期有效的 `upgrade_token`，让旧 Node 不发送 `X-Node-Secret` 也能下载本次升级的精确资产。客户端必须按原样使用返回的 URL。
- 待升级任务是易失状态，Node 上报完全相同的目标版本或 SemVer 优先级更高的版本后清除。

## 管理：系统设置和 Dash 更新

- `GET /api/admin/system/settings/` 返回 `history_guest_access_mode`、`dash_update_channel`、`dash_update_mode`、`logo_url`、`page_title` 和 `topbar_text`。
- `PATCH /api/admin/system/settings/` 接受局部更新。`PUT /api/admin/system/settings/` 是全量替换，必须提交全部系统设置字段。
- `dash_update_channel` 允许 `release` 或 `prerelease`；`dash_update_mode` 允许 `manual`、`notify` 或 `auto`。
- `GET /api/admin/system/dash-update/status` 返回 Dash 更新器可用性、当前任务状态和最近日志。
- `GET /api/admin/system/dash-update/check?channel=release|prerelease` 返回目标版本和 `install_revision`。非法通道返回 `400 invalid_fields`；更新器不可用返回 `503 dash_update_unavailable`。
- `POST /api/admin/system/dash-update/run` 接受 `action`、`channel`、`lang` 和检查阶段得到的不可变计划字段。执行器取得锁后再次校验当前版本与安装修订号；过期计划以 `failure_code=install_changed` 失败，不会改选目标。
- 更新任务、事务和恢复路径持久化在 `$DASH_HOME/runtime/dash-update`。`failure_code=recovery_required` 时执行 `dash update recover`。
- `GET /api/admin/system/dash-update/release-notes?lang=zh|en` 返回文档站 Release Notes HTML。非法语言返回 `400 invalid_fields`；拉取失败返回 `502 release_notes_fetch_failed`。

## 前台指标和历史指标

`GET /api/front/metrics` 的节点结构可以包含：

- `disk.smart`：最新 SMART 运行时状态。
- `disk.temperature_devices[]`：有磁盘温度历史的物理磁盘名称。
- `thermal`：最新温度传感器运行时状态。
- `pressure`：最新 Linux PSI pressure 运行时状态。

SMART、thermal 和 pressure 运行时 payload 与前台节点快照分开缓存。只有 `received_at` 匹配时才会重新挂回节点快照。

`POST /api/node/metrics` 接受可选的 `metrics.pressure`。它可以包含 `cpu`、`memory`、`io`，每项可带 `some` 和 `full` 数值组。每个组包含 `avg10`、`avg60`、`avg300` 百分比和累计 `total` 微秒。缺失的组表示不可用，不会当成 0 压力。

`GET /api/metrics/history` 支持温度指标：

| 指标 | 来源 | 设备参数 |
| --- | --- | --- |
| `cpu.temp_c` | CPU 温度传感器最高温度 | 不需要 |
| `disk.temp_c` | SMART 物理磁盘温度历史 | 必须传 `device` |

`disk.temp_c` 的 `device` 可以匹配物理磁盘 `name`、`ref` 或 `path`。温度历史不使用 rollup 前缀。

SMART 温度历史只来自后端确认的物理盘。虚拟盘和 RAID 设备不会写入 `disk.temp_c` 历史。

`GET /api/metrics/history` 也支持 PSI 平均值指标：`pressure.cpu.some_avg10|avg60|avg300`、`pressure.memory.some_avg10|avg60|avg300`、`pressure.memory.full_avg10|avg60|avg300`、`pressure.io.some_avg10|avg60|avg300`、`pressure.io.full_avg10|avg60|avg300`。

通知渠道列表包含投递健康、重试和阻塞计数。无法按当前 schema 解码的存量渠道以 `config=null` 返回，只能删除。MTProto 登录状态故障返回 `503 login_state_error`；并发 revision 变化返回 `409 channel_changed`。

## 流量统计

- `GET /api/statistics/traffic/settings` 返回 `guest_access_mode`、`usage_mode`、`direction_mode` 和固定的兼容账期形状。
- `PATCH /api/statistics/traffic/settings` 只接受 `guest_access_mode`、`usage_mode` 和 `direction_mode`。提交账期字段返回 `400 billing_cycle_is_per_node`。
- 允许值：
  - `guest_access_mode`: `disabled`、`by_node`
  - `usage_mode`: `lite`、`billing`
  - `direction_mode`: `out`、`both`、`max`
- 流量查询使用节点显式保存的账期。只有 `traffic_direction_mode=default` 继承全局统计方向。
- `GET /daily` 要求 `usage_mode=billing`，否则返回 `409 traffic_daily_requires_billing`。`period` 可选，允许 `current`、`previous`，省略时为 `current`。
- `GET /monthly` 支持 `months` 和 `period`。`months` 必须在 `1..24`；`period=current` 从本账期开始，`period=previous` 从上账期开始。
- 流量 summary、daily、monthly 响应保留原始 `in_*` 和 `out_*` 字段，并通过 `selected_bytes`、`selected_p95_bytes_per_sec`、`selected_peak_bytes_per_sec` 及其方向字段暴露当前计费视图。
- 客户端使用 `data_complete`、`coverage_ratio`、`gap_count` 和 `reset_count` 判断完整性。废弃字段 `partial` 已删除。
- 只有 `p95_status` 为 `available` 时，P95 字段才不是 `null`。

## 非 API HTTP 路径

| 路径 | 作用 |
| --- | --- |
| `/theme/active.css` | 当前主题 CSS |
| `/theme/active.json` | 当前主题 manifest；默认主题可能返回 404 |
| `/theme/preview/{id}.png` | 主题预览图 |
| `/deploy/linux/install.sh` | Linux 节点安装脚本 |
| `/deploy/macos/install.sh` | macOS 节点安装脚本 |
| `/deploy/windows/install.ps1` | Windows 节点安装脚本 |
| `/deploy/*` | 打包携带的节点发布资产；需要 `X-Node-Secret` 或临时 `upgrade_token` |
| `/` | SPA |

## 兼容性边界

0.3.0 的显式破坏性变化包括删除流量 `partial`、把账期所有权移到单节点，以及拒绝缺少格式 v1 manifest 的新更新包。迁移和旧输入别名只覆盖文档声明的过渡路径。

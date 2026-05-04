---
slug: /Dash/API
---

# Dash HTTP API

本文档汇总稳定 HTTP 契约。公开路径、方法和字段语义属于兼容边界：既有语义不在原路径上硬改，新行为通过新增端点或追加字段提供。

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
| `X-Node-Secret` | 节点上报和节点身份读取 |

Bearer 可选端点会把缺失、格式错误、过期、已撤销或其他无法通过校验的 Bearer token 当作匿名请求处理。需要管理视图的客户端必须自行区分响应是已鉴权视图还是游客过滤视图。

## 命名空间

| 前缀 | 鉴权 | 资源 |
| --- | --- | --- |
| `/api/auth` | 登录用管理员密码；刷新和登出用 refresh cookie + `X-CSRF-Token`；`/sessions*` 用 Bearer | `POST /login`、`POST /refresh`、`POST /logout`、会话撤销 |
| `/api/version` | 无 | `GET /` |
| `/api/front` | Bearer 可选 | `GET /brand`、`GET /metrics`、`GET /groups` |
| `/api/metrics` | Bearer 可选；历史指标默认只对已授权用户开放 | `GET /online`、`GET /history` |
| `/api/statistics` | Bearer 可选 | `GET /access` |
| `/api/statistics/traffic` | Bearer 可选；`PATCH /settings` 需要 Bearer | `GET /settings`、`PATCH /settings`、`GET /ifaces`、`GET /summary`、`GET /daily`、`GET /monthly` |
| `/api/node` | `X-Node-Secret` | `POST /identity`、`POST /metrics`、`POST /static` |
| `/api/admin/groups` | Bearer | `GET /`、`GET /map`、`POST /`、`PATCH /{id}`、`DELETE /{id}` |
| `/api/admin/nodes` | Bearer | `GET /`、`GET /deploy`、`POST /`、`PUT /display-order`、`PATCH /{id}`、`POST /{id}/upgrade`、`DELETE /{id}` |
| `/api/admin/alerts/rules` | Bearer | `GET /`、`POST /`、`PATCH /{id}`、`DELETE /{id}` |
| `/api/admin/alerts/mounts` | Bearer | `GET /`、`PUT /` |
| `/api/admin/alerts/settings` | Bearer | `GET /`、`PUT /` |
| `/api/admin/alerts/channels` | Bearer | `GET /`、`POST /`、`GET /{id}`、`PUT /{id}`、`PUT /{id}/enabled`、`POST /{id}/test`、`DELETE /{id}` |
| `/api/admin/alerts/channels/telegram/mtproto` | Bearer | `POST /code`、`POST /verify`、`POST /password`、`POST /ping` |
| `/api/admin/system/settings` | Bearer | `GET /`、`PUT /`、`PATCH /` |
| `/api/admin/system/themes` | Bearer | `GET /`、`POST /upload`、`POST /{id}/apply`、`DELETE /{id}` |

## 匿名读取

- `/api/front/brand` 可匿名读取。
- `/api/front/metrics` 和 `/api/front/groups` 允许匿名读取，但匿名结果只包含游客可见节点。
- `/api/metrics/online` 允许匿名读取游客可见节点。
- `/api/metrics/history` 默认需要 Bearer。只有 `history_guest_access_mode` 为 `by_node` 时，匿名读取才按游客可见节点放开。
- `/api/statistics/access` 可匿名读取。
- `/api/statistics/traffic/*` 的匿名读取由流量设置控制，并仍受节点游客可见性限制。

## 管理节点

- `GET /api/admin/nodes/` 包含 `traffic_p95_enabled`、`traffic_cycle_mode`、`traffic_billing_start_day`、`traffic_billing_anchor_date`、`traffic_billing_timezone`、`tags` 和 `version`。
- `tags` 始终是字符串数组。
- `version.version` 是节点最后上报版本；缺失、非法或低于打包节点版本时，`version.is_outdated` 为 true。
- `PATCH /api/admin/nodes/{id}` 接受 `traffic_p95_enabled`、`tags` 和节点账期覆盖字段。未提交字段保持不变。
- `tags` 接受字符串数组；值会 trim，空值和重复值会被删除，`[]` 表示清空标签。
- 非法 `tags` 返回 `400 invalid_tags`。
- `POST /api/admin/nodes/{id}/upgrade` 成功返回 `204`；打包版本、平台或资产不可用时返回 `409`。

## Agent 更新

- `POST /api/node/metrics` 成功响应包含 `update`。
- 无待升级任务时，`update` 为 `null`。
- 有待升级任务时，`update` 包含 `id`、`version`、`url`、`sha256` 和 `size`。
- 待升级任务是易失状态，节点上报目标版本或更新版本后清除。

## 流量统计

- `GET /api/statistics/traffic/settings` 返回 `guest_access_mode`、`usage_mode`、`cycle_mode`、`billing_start_day`、`billing_anchor_date`、`billing_timezone` 和 `direction_mode`。
- `PATCH /api/statistics/traffic/settings` 接受局部更新，未知值返回 `400 invalid_fields`。
- 允许值：
  - `guest_access_mode`: `disabled`、`by_node`
  - `usage_mode`: `lite`、`billing`
  - `cycle_mode`: `calendar_month`、`whmcs_compatible`、`clamp_to_month_end`
  - `direction_mode`: `out`、`both`、`max`
- `GET /daily` 要求 `usage_mode=billing`，否则返回 `409 traffic_daily_requires_billing`。
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
| `/deploy/*` | 打包携带的节点发布资产 |
| `/` | SPA |

## 兼容性规则

- 既有路径、方法和字段语义保持稳定。
- 新行为通过新端点或追加字段提供。
- 需要废弃时先保留旧入口，再新增替代入口。

---
slug: /Reference/DashAPI
title: Dash HTTP API
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
| `X-Node-Secret` | 节点上报和节点身份读取 |

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
    "url": "https://dash.example.com/deploy/windows/node_windows_amd64.exe",
    "sha256": "...",
    "size": 12345678
  }
}
```

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
  "display_order": 1,
  "tags": ["prod", "hk"],
  "secret": "new-secret",
  "group_ids": [1, 2]
}
```

`tags` 必须是字符串数组，空值和重复值会被移除。

`/api/admin/nodes/traffic-p95` 先校验全部节点 ID，再在一个事务中更新 P95 开关；任一节点不存在或已删除时整个请求失败。

## 管理：流量设置

| 方法 | 路径 | Body | 成功 |
| --- | --- | --- | --- |
| `PATCH` | `/api/statistics/traffic/settings` | 局部字段 | `204` |

字段见 [流量统计和账期](../configuration/traffic.md)。

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
| `GET` | `/api/admin/alerts/channels/` | 列出渠道 |
| `POST` | `/api/admin/alerts/channels/` | 创建渠道 |
| `GET` | `/api/admin/alerts/channels/{id}` | 读取渠道 |
| `PUT` | `/api/admin/alerts/channels/{id}` | 替换渠道 |
| `PUT` | `/api/admin/alerts/channels/{id}/enabled` | 切换启用 |
| `POST` | `/api/admin/alerts/channels/{id}/test` | 测试发送 |
| `DELETE` | `/api/admin/alerts/channels/{id}` | 删除渠道 |

## 管理：系统

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/admin/system/settings/` | 读取系统设置 |
| `PUT` | `/api/admin/system/settings/` | 替换系统设置 |
| `PATCH` | `/api/admin/system/settings/` | 局部更新 |
| `GET` | `/api/admin/system/themes/` | 列出主题 |
| `POST` | `/api/admin/system/themes/upload` | 上传主题 zip |
| `POST` | `/api/admin/system/themes/{id}/apply` | 应用主题 |
| `DELETE` | `/api/admin/system/themes/{id}` | 删除主题 |

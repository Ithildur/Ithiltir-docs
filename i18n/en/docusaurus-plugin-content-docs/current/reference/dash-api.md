---
slug: /Reference/DashAPI
title: Dash HTTP API
---

# Dash HTTP API

Base path:

```text
/api
```

Error format:

```json
{ "code": "<string>", "message": "<string>" }
```

## Authentication

| Method | Use |
| --- | --- |
| Admin password | `POST /api/auth/login` |
| refresh cookie + `X-CSRF-Token` | `POST /api/auth/refresh`, `POST /api/auth/logout` |
| `Authorization: Bearer <access_token>` | Admin APIs and optionally authenticated reads |
| `X-Node-Secret` | Node reporting and node identity reads |

## Public and Optional Auth

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/version/` | None | Dash and bundled node version |
| `GET` | `/api/front/brand` | Optional Bearer | Brand info |
| `GET` | `/api/front/metrics` | Optional Bearer | Current front metrics |
| `GET` | `/api/front/groups` | Optional Bearer | Front groups |
| `GET` | `/api/metrics/online` | Optional Bearer | Online rate |
| `GET` | `/api/metrics/history` | Optional Bearer | History metrics |
| `GET` | `/api/statistics/access` | Optional Bearer | Anonymous access settings |
| `GET` | `/api/statistics/traffic/settings` | Optional Bearer | Traffic settings |
| `GET` | `/api/statistics/traffic/ifaces` | Optional Bearer | Node interface list |
| `GET` | `/api/statistics/traffic/summary` | Optional Bearer | Current billing cycle traffic |
| `GET` | `/api/statistics/traffic/daily` | Optional Bearer | Daily traffic, requires billing mode |
| `GET` | `/api/statistics/traffic/monthly` | Optional Bearer | Monthly traffic |

Optional Bearer endpoints treat invalid Bearer tokens as anonymous requests.

## Node Endpoints

| Method | Path | Auth | Body | Success |
| --- | --- | --- | --- | --- |
| `POST` | `/api/node/identity` | `X-Node-Secret` | `{}` | `200` |
| `POST` | `/api/node/metrics` | `X-Node-Secret` | `NodeReport` | `200` |
| `POST` | `/api/node/static` | `X-Node-Secret` | `Static` | `200` |

Successful `/api/node/metrics` response:

```json
{
  "ok": true,
  "update": null
}
```

Or:

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

## Admin: Groups

| Method | Path | Body | Success |
| --- | --- | --- | --- |
| `GET` | `/api/admin/groups/` | None | `200` |
| `GET` | `/api/admin/groups/map` | None | `200` |
| `POST` | `/api/admin/groups/` | `{ "name": "...", "remark": "..." }` | `204` |
| `PATCH` | `/api/admin/groups/{id}` | `{ "name": "...", "remark": "..." }` | `204` |
| `DELETE` | `/api/admin/groups/{id}` | None | `204` |

`name` is trimmed and cannot be empty.

## Admin: Nodes

| Method | Path | Body | Success |
| --- | --- | --- | --- |
| `GET` | `/api/admin/nodes/` | None | `200` |
| `GET` | `/api/admin/nodes/deploy` | None | `200` |
| `POST` | `/api/admin/nodes/` | None | `204` |
| `PUT` | `/api/admin/nodes/display-order` | Node ID order | `204` |
| `PATCH` | `/api/admin/nodes/traffic-p95` | `{ "ids": [1, 2], "enabled": true }` | `204` |
| `PATCH` | `/api/admin/nodes/{id}` | Node patch | `204` |
| `POST` | `/api/admin/nodes/{id}/upgrade` | None | `204` |
| `DELETE` | `/api/admin/nodes/{id}` | None | `204` |

Node patch fields:

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

`tags` must be a string array. Empty and duplicate values are removed.

`/api/admin/nodes/traffic-p95` accepts `ids` and `enabled`. `enabled` is required. `ids` must be a non-empty positive integer array, cannot contain duplicates, and can contain at most 10000 items. The command validates all node IDs first, then updates them in one transaction. Success returns `204`; any missing or deleted node returns `404 not_found`, and no node is updated.

## Admin: Traffic Settings

| Method | Path | Body | Success |
| --- | --- | --- | --- |
| `PATCH` | `/api/statistics/traffic/settings` | Partial fields | `204` |

Fields are documented in [Traffic Accounting and Billing Cycles](../configuration/traffic.md).

## Traffic Queries

- `GET /api/statistics/traffic/daily` requires `usage_mode=billing`; otherwise it returns `409 traffic_daily_requires_billing`. `period` allows `current` or `previous`; omitted means `current`.
- `GET /api/statistics/traffic/monthly` supports `months` and `period`. `months` is at most 24. `period=current` starts at the current billing cycle; `period=previous` starts at the previous cycle. Omitted means `current`. `includes_current` is `true` for `period=current` and `false` for `period=previous`.
- Traffic summary, daily, and monthly responses keep raw `in_*` and `out_*` fields. The active accounting view is exposed through `selected_bytes`, `selected_p95_bytes_per_sec`, `selected_peak_bytes_per_sec`, and selected direction fields.
- Clients should use `coverage_ratio` for sample coverage and accuracy hints. `partial` is retained only for compatibility.

## History Metrics

`GET /api/metrics/history` supports temperature metrics:

| Metric | Source | Device parameter |
| --- | --- | --- |
| `cpu.temp_c` | Maximum CPU thermal sensor temperature | Not required |
| `disk.temp_c` | SMART physical disk temperature history | Required `device` |

For `disk.temp_c`, `device` can match physical disk `name`, `ref`, or `path`. Temperature history does not use a rollup prefix.

## Admin: Alerts

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/admin/alerts/rules/` | List rules |
| `POST` | `/api/admin/alerts/rules/` | Create rule |
| `PATCH` | `/api/admin/alerts/rules/{id}` | Update rule |
| `DELETE` | `/api/admin/alerts/rules/{id}` | Delete rule |
| `GET` | `/api/admin/alerts/mounts/` | List mounts |
| `PUT` | `/api/admin/alerts/mounts/` | Set mounts |
| `GET` | `/api/admin/alerts/settings/` | Read global settings |
| `PUT` | `/api/admin/alerts/settings/` | Replace global settings |
| `GET` | `/api/admin/alerts/channels/` | List channels |
| `POST` | `/api/admin/alerts/channels/` | Create channel |
| `GET` | `/api/admin/alerts/channels/{id}` | Read channel |
| `PUT` | `/api/admin/alerts/channels/{id}` | Replace channel |
| `PUT` | `/api/admin/alerts/channels/{id}/enabled` | Toggle enabled |
| `POST` | `/api/admin/alerts/channels/{id}/test` | Send test notification |
| `DELETE` | `/api/admin/alerts/channels/{id}` | Delete channel |

## Admin: System

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/admin/system/settings/` | Read system settings |
| `PUT` | `/api/admin/system/settings/` | Replace system settings |
| `PATCH` | `/api/admin/system/settings/` | Partial update |
| `GET` | `/api/admin/system/themes/` | List themes |
| `POST` | `/api/admin/system/themes/upload` | Upload theme zip |
| `POST` | `/api/admin/system/themes/{id}/apply` | Apply theme |
| `DELETE` | `/api/admin/system/themes/{id}` | Delete theme |

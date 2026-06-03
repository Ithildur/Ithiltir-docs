---
slug: /Dash/API
title: Dash HTTP API
---

# Dash HTTP API

This page summarizes stable HTTP contracts. Existing path, method, and field semantics are compatibility boundaries. New behavior is added through new endpoints or appended fields.

## Basics

- API base path: `/api`
- Dash supports root-path deployment only. Do not configure a path prefix in `app.public_url`.
- JSON error wrapper:

```json
{ "code": "<string>", "message": "<string>" }
```

## Authentication Model

| Method | Use |
| --- | --- |
| Admin password | `POST /api/auth/login` |
| refresh cookie + `X-CSRF-Token` | `POST /api/auth/refresh`, `POST /api/auth/logout` |
| `Authorization: Bearer <access_token>` | Admin APIs and optionally authenticated reads |
| `X-Node-Secret` | Node reporting and node identity reads |

Optional Bearer endpoints treat missing, malformed, expired, revoked, or otherwise invalid Bearer tokens as anonymous requests.

## Namespaces

| Prefix | Auth | Resources |
| --- | --- | --- |
| `/api/auth` | Admin password for login; refresh cookie + `X-CSRF-Token` for refresh and logout; `/sessions*` uses Bearer | `POST /login`, `POST /refresh`, `POST /logout`, session list and revoke |
| `/api/version` | None | `GET /` |
| `/api/front` | Optional Bearer | `GET /brand`, `GET /metrics`, `GET /groups` |
| `/api/metrics` | Optional Bearer; history metrics are authorized by default | `GET /online`, `GET /history` |
| `/api/statistics` | Optional Bearer | `GET /access` |
| `/api/statistics/traffic` | Optional Bearer; `PATCH /settings` requires Bearer | `GET /settings`, `PATCH /settings`, `GET /ifaces`, `GET /summary`, `GET /daily`, `GET /monthly` |
| `/api/node` | `X-Node-Secret` | `POST /identity`, `POST /metrics`, `POST /static` |
| `/api/admin/groups` | Bearer | `GET /`, `GET /map`, `POST /`, `PATCH /{id}`, `DELETE /{id}` |
| `/api/admin/nodes` | Bearer | `GET /`, `GET /deploy`, `POST /`, `PUT /display-order`, `PATCH /traffic-p95`, `PATCH /{id}`, `POST /{id}/upgrade`, `GET /traffic/rebuild`, `POST /{id}/traffic/rebuild`, `DELETE /{id}` |
| `/api/admin/alerts/rules` | Bearer | `GET /`, `POST /`, `PATCH /{id}`, `DELETE /{id}` |
| `/api/admin/alerts/mounts` | Bearer | `GET /`, `PUT /` |
| `/api/admin/alerts/settings` | Bearer | `GET /`, `PUT /` |
| `/api/admin/alerts/channels` | Bearer | `GET /`, `POST /`, `GET /{id}`, `PUT /{id}`, `PUT /{id}/enabled`, `POST /{id}/test`, `DELETE /{id}` |
| `/api/admin/alerts/channels/telegram/mtproto` | Bearer | `POST /code`, `POST /verify`, `POST /password`, `POST /ping` |
| `/api/admin/system/settings` | Bearer | `GET /`, `PUT /`, `PATCH /` |
| `/api/admin/system/themes` | Bearer | `GET /`, `POST /upload`, `POST /{id}/apply`, `DELETE /{id}` |

## Anonymous Reads

- `/api/front/brand` allows anonymous reads.
- `/api/front/metrics` and `/api/front/groups` allow anonymous reads, filtered to guest-visible nodes.
- Anonymous `/api/front/groups` omits groups with no guest-visible nodes.
- `GET /api/front/metrics` node metadata includes `node.tags` as a string array when tags are configured for the node.
- `/api/metrics/online` allows anonymous reads for guest-visible nodes.
- `/api/metrics/history` requires Bearer by default. Anonymous reads are allowed only when `history_guest_access_mode=by_node` and the node is guest-visible.
- `/api/statistics/access` allows anonymous reads.
- `/api/statistics/traffic/*` anonymous reads follow traffic settings and node guest visibility.

## Auth Sessions

- `POST /api/auth/login` accepts `password` and required `persistence`. `persistence` allows `session` or `persistent`; invalid values return `400 invalid_persistence`. A successful login returns `access_token`, `expires_at`, and `csrf_token`, and sets refresh/CSRF cookies.
- `GET /api/auth/sessions/` returns `{ "sessions": [...] }` for the bearer token user. Each item includes `id`, `expires_at`, `session_only`, and `current`.
- `DELETE /api/auth/sessions/current`, `DELETE /api/auth/sessions/`, and `DELETE /api/auth/sessions/{sid}` return `204` on success.

## Node Management

- `GET /api/admin/nodes/` includes `traffic_p95_enabled`, `traffic_cycle_mode`, `traffic_billing_start_day`, `traffic_billing_anchor_date`, `traffic_billing_timezone`, `traffic_direction_mode`, tags, and version status.
- `tags` is always a string array.
- `version.version` is the last reported node version. Missing, invalid, or older-than-bundled versions set `version.is_outdated=true`.
- `version.supports_auto_update` shows whether the current node version meets the Dash admin console automatic update delivery requirement. The minimum version is `0.2.1`.
- `PATCH /api/admin/nodes/{id}` accepts traffic settings, tags, secret, group IDs, and display fields. Omitted fields are unchanged.
- Node billing cycle override fields are atomic. If any of `traffic_cycle_mode`, `traffic_billing_start_day`, `traffic_billing_anchor_date`, or `traffic_billing_timezone` is submitted, the request must also include `traffic_cycle_mode` and every field used by that mode, otherwise it returns `400 invalid_traffic_cycle_settings`.
- `traffic_cycle_mode` allows `default`, `calendar_month`, `whmcs_compatible`, and `clamp_to_month_end`. `default` uses no billing fields; `calendar_month` uses `traffic_billing_timezone`; `clamp_to_month_end` uses `traffic_billing_start_day` and `traffic_billing_timezone`; `whmcs_compatible` uses `traffic_billing_anchor_date` and `traffic_billing_timezone`, with `traffic_billing_start_day` derived from the anchor date.
- `traffic_direction_mode` allows `default`, `out`, `both`, and `max`. `default` inherits the global direction mode; other values override that node.
- `PATCH /api/admin/nodes/traffic-p95` validates all node IDs before updating them in one transaction.
- `GET /api/admin/nodes/traffic/rebuild` returns the latest process-local rebuild task state. This state is not durable across process restarts. Failed states expose stable `code` and `error` values.
- `POST /api/admin/nodes/{id}/traffic/rebuild` rebuilds the node's retained 5-minute traffic facts. Success returns `202`; missing nodes return `404 not_found`; any running task returns `409 traffic_rebuild_running`; unavailable tasks return `503 traffic_rebuild_unavailable`.
- `POST /api/admin/nodes/{id}/upgrade` returns `204` on success. Current node versions below `0.2.1` return `409 node_upgrade_unsupported`. Unavailable bundled version, platform, or asset returns `409`.

## Agent Update

- Successful `POST /api/node/metrics` responses include `update`.
- When no upgrade task is pending, `update` is `null`.
- When an upgrade task is pending, `update` includes `id`, `version`, `url`, `sha256`, and `size`.
- Upgrade tasks are volatile and are cleared after the node reports the target version or a newer version.

## Front Metrics and History Metrics

`GET /api/front/metrics` node objects can include:

- `node.disk.smart`: latest SMART runtime state.
- `node.disk.temperature_devices[]`: physical disk names with disk temperature history.
- `node.thermal`: latest thermal sensor runtime state.

SMART and thermal runtime payloads are cached separately from the front node snapshot. They are reattached only when `received_at` matches the node snapshot.

`GET /api/metrics/history` supports temperature metrics:

| Metric | Source | Device parameter |
| --- | --- | --- |
| `cpu.temp_c` | Maximum CPU thermal sensor temperature | Not required |
| `disk.temp_c` | SMART physical disk temperature history | Required `device` |

For `disk.temp_c`, `device` can match physical disk `name`, `ref`, or `path`. Temperature history does not use a rollup prefix.

Disk temperature history is written only for backend-confirmed physical disks. Virtual disks and RAID devices are not persisted as `disk.temp_c`.

## Traffic Accounting

- `GET /api/statistics/traffic/settings` returns guest access, usage mode, cycle settings, timezone, and direction mode.
- `PATCH /api/statistics/traffic/settings` accepts partial updates. Unknown values return `400 invalid_fields`.
- Traffic queries use the node's effective traffic configuration. Nodes with `traffic_cycle_mode=default` inherit the global cycle fields; nodes with `traffic_direction_mode=default` inherit the global direction mode.
- Daily traffic requires `usage_mode=billing`.
- P95 fields are non-null only when `p95_status=available`.

## Non-API HTTP Paths

| Path | Purpose |
| --- | --- |
| `/theme/active.css` | Active theme CSS |
| `/theme/active.json` | Active theme manifest; default theme can return 404 |
| `/theme/preview/{id}.png` | Theme preview image |
| `/deploy/linux/install.sh` | Linux node installer |
| `/deploy/macos/install.sh` | macOS node installer |
| `/deploy/windows/install.ps1` | Windows node installer |
| `/deploy/*` | Bundled node release assets |
| `/` | SPA |

## Compatibility Rules

- Existing paths, methods, and field semantics stay stable.
- New behavior uses new endpoints or appended fields.
- Deprecations keep the old entrypoint before adding a replacement.

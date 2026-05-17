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
| `/api/auth` | Password, refresh cookie, or Bearer depending on path | login, refresh, logout, session revoke |
| `/api/version` | None | `GET /` |
| `/api/front` | Optional Bearer | brand, metrics, groups |
| `/api/metrics` | Optional Bearer | online, history |
| `/api/statistics` | Optional Bearer | access settings |
| `/api/statistics/traffic` | Optional Bearer; settings patch requires Bearer | traffic settings and queries |
| `/api/node` | `X-Node-Secret` | identity, metrics, static |
| `/api/admin/*` | Bearer | groups, nodes, alerts, system settings, themes |

## Anonymous Reads

- `/api/front/brand` allows anonymous reads.
- `/api/front/metrics` and `/api/front/groups` allow anonymous reads, filtered to guest-visible nodes.
- `/api/metrics/online` allows anonymous reads for guest-visible nodes.
- `/api/metrics/history` requires Bearer by default. Anonymous reads are allowed only when `history_guest_access_mode=by_node` and the node is guest-visible.
- `/api/statistics/access` allows anonymous reads.
- `/api/statistics/traffic/*` anonymous reads follow traffic settings and node guest visibility.

## Node Management

- `GET /api/admin/nodes/` includes traffic settings, tags, and version status.
- `tags` is always a string array.
- `version.version` is the last reported node version. Missing, invalid, or older-than-bundled versions set `version.is_outdated=true`.
- `PATCH /api/admin/nodes/{id}` accepts traffic settings, tags, secret, group IDs, and display fields. Omitted fields are unchanged.
- `PATCH /api/admin/nodes/traffic-p95` validates all node IDs before updating them in one transaction.
- `POST /api/admin/nodes/{id}/upgrade` returns `204` on success. Unavailable bundled version, platform, or asset returns `409`.

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

## Traffic Accounting

- `GET /api/statistics/traffic/settings` returns guest access, usage mode, cycle settings, timezone, and direction mode.
- `PATCH /api/statistics/traffic/settings` accepts partial updates. Unknown values return `400 invalid_fields`.
- Traffic queries use the node's effective billing cycle configuration.
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

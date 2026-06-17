---
slug: /Reference/Errors
title: Error Semantics
---

# Error Semantics

Dash API error format:

```json
{ "code": "<string>", "message": "<string>" }
```

## Common

| HTTP | code | Description |
| --- | --- | --- |
| `400` | `invalid_request` | Invalid request shape or fields |
| `400` | `invalid_id` | Invalid path ID |
| `400` | `no_fields` | PATCH request has no updatable fields |
| `401` | `unauthorized` | Authentication failed |
| `403` | `forbidden` | Request is recognized but not allowed |
| `404` | `not_found` | Resource does not exist |
| `413` | `body_too_large` | Request body is too large |
| `409` | conflict code | State conflict |
| `503` | `db_error` | Database read or write failed |
| `503` | `redis_cache_error` | Redis cache sync failed |

## Authentication

| HTTP | code | Description |
| --- | --- | --- |
| `400` | `invalid_persistence` | Login `persistence` is not `session` or `persistent` |

## Node Management

| code | Description |
| --- | --- |
| `invalid_name` | Empty node name |
| `invalid_display_order` | Display order is not positive |
| `invalid_traffic_cycle_mode` | Invalid node billing cycle mode |
| `invalid_traffic_cycle_settings` | Node billing cycle fields do not match the selected mode |
| `invalid_traffic_billing_start_day` | Billing day is outside `1..31` |
| `invalid_traffic_billing_anchor_date` | Invalid billing anchor date |
| `invalid_traffic_billing_timezone` | Invalid billing timezone |
| `invalid_traffic_direction_mode` | Invalid node traffic direction mode |
| `invalid_tags` | Tags is not a string array |
| `invalid_secret` | Invalid node secret |
| `duplicate_secret` | Node secret already belongs to another node |
| `invalid_group_ids` | Invalid group IDs |
| `secret_collision_exhausted` | Random secret collision retries exhausted |
| `secret_generation_failed` | Secret generation failed |

## Node Upgrade

| HTTP | code | Description |
| --- | --- | --- |
| `409` | `node_version_unavailable` | Bundled node version is unavailable |
| `409` | `invalid_node_version` | Bundled node version is invalid |
| `409` | `node_upgrade_unsupported` | Current node version is below `0.2.1` and does not support automatic update delivery |
| `409` | `node_platform_unknown` | Node platform is unknown |
| `409` | `node_platform_unsupported` | Node platform is unsupported |
| `409` | `node_asset_missing` | Matching node asset is missing |
| `503` | `node_asset_error` | Upgrade asset generation failed |
| `503` | `node_upgrade_grant_error` | Legacy temporary download grant generation failed |

## Traffic

| HTTP | code | Description |
| --- | --- | --- |
| `400` | `invalid_fields` | Invalid traffic settings field |
| `409` | `traffic_daily_requires_billing` | Daily traffic requires billing mode |
| `409` | `traffic_rebuild_running` | A traffic rebuild task is already running |
| `503` | `traffic_rebuild_unavailable` | Traffic rebuild is unavailable |

## Alerts and Notifications

| code | Description |
| --- | --- |
| `invalid_fields` | Invalid rule, mount, channel, or setting fields |
| `not_logged_in` | Telegram MTProto is not logged in |
| `notify_error` | Test notification send failed |

## Themes

| HTTP | code | Description |
| --- | --- | --- |
| `400` | `invalid_theme_package` | Invalid theme package format |
| `404` | `not_found` | Theme does not exist |
| `503` | `theme_storage_error` | Theme storage is unavailable |
| `500` | `theme_unavailable` | Built-in theme or theme state is unavailable |

Theme list responses can return this warning header:

```http
X-Theme-Warning: active_theme_unavailable
```

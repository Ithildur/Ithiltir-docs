---
slug: /Config/Access
title: Access Control
---

# Access Control

Dash has administrator access, optional anonymous reads, and node reporting access.

## Admin

Admin APIs require Bearer access tokens from `POST /api/auth/login`. Direct login API calls must send `password` and `persistence`, where `persistence` is `session` or `persistent`. Refresh and logout use the refresh cookie plus `X-CSRF-Token`.

`monitor_dash_pwd` requires at least 8 visible ASCII characters and no whitespace. Refresh cookies use `SameSite=Strict`.

## Anonymous Reads

Anonymous history uses system setting `history_guest_access_mode`. Anonymous traffic uses traffic setting `guest_access_mode`. Both accept `disabled` or `by_node`; `by_node` still requires `is_guest_visible=true` on each node.

`GET /api/statistics/access` exposes the traffic setting as response field `traffic_guest_access_mode`.

Guest uptime uses the independent boolean system setting `uptime_guest_visible`, which defaults to `true`. It still requires `is_guest_visible=true` on each node and does not inherit history or traffic access settings.

| Resource | Default | Optional access |
| --- | --- | --- |
| Brand | Allowed | Always public |
| Front metrics | Guest-visible nodes only | Controlled by node visibility |
| Groups | Guest-visible scope | Controlled by node visibility |
| Online rate | Guest-visible nodes only | Controlled by node visibility |
| Uptime and hourly details | Guest-visible nodes only | `uptime_guest_visible=true` + guest-visible node |
| History metrics | Disabled | `history_guest_access_mode=by_node` + guest-visible node |
| Traffic statistics | Disabled | Traffic `guest_access_mode=by_node` + guest-visible node |

### Uptime Settings

The admin console's system settings provide the guest uptime switch and the warning/error SLA thresholds. A daily rate below `uptime_warning_sla` is yellow; below `uptime_error_sla` it is red. Rates at or above the warning threshold are green, and unobserved periods are gray. Hourly details use the same thresholds.

Defaults are `99` and `95`, expressed as percentages. Decimal values are allowed and must satisfy `0 <= error < warning <= 100`. Settings persist in PostgreSQL and take effect after saving without a restart. Guest visibility and color thresholds do not affect background sampling.

## Site Brand

`logo_url` accepts a same-origin absolute path, a base64 SVG/PNG/JPEG/GIF/WebP/ICO data URL, or an external HTTPS URL without user information. New external HTTP URLs, invalid data URLs, and other media types are rejected.

Legacy external HTTP logos remain readable, but an HTTPS page may block them as mixed content and fall back to the built-in logo. `PATCH /api/admin/system/settings` validates only submitted fields, so changing another setting is not blocked by a stored HTTP logo.

## Node Access

Node APIs require `X-Node-Secret`. The secret is generated when a node is created and can be rotated from the admin console.

After trimming, a node secret must contain 8–128 Unicode characters. Use a distinct value for each node.

## Settings

Runtime access settings are stored in PostgreSQL and can be changed from the admin console or admin API. Startup config changes still require Dash restart.

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

| Resource | Default | Optional access |
| --- | --- | --- |
| Brand | Allowed | Always public |
| Front metrics | Guest-visible nodes only | Controlled by node visibility |
| Groups | Guest-visible scope | Controlled by node visibility |
| Online rate | Guest-visible nodes only | Controlled by node visibility |
| History metrics | Disabled | `history_guest_access_mode=by_node` + guest-visible node |
| Traffic statistics | Disabled | Traffic guest mode + guest-visible node |

## Site Brand

`logo_url` accepts a same-origin absolute path, a base64 SVG/PNG/JPEG/GIF/WebP/ICO data URL, or an external HTTPS URL without user information. New external HTTP URLs, invalid data URLs, and other media types are rejected.

Legacy external HTTP logos remain readable, but an HTTPS page may block them as mixed content and fall back to the built-in logo. `PATCH /api/admin/system/settings` validates only submitted fields, so changing another setting is not blocked by a stored HTTP logo.

## Node Access

Node APIs require `X-Node-Secret`. The secret is generated when a node is created and can be rotated from the admin console.

After trimming, a node secret must contain 8–128 Unicode characters. Use a distinct value for each node.

## Settings

Runtime access settings are stored in PostgreSQL and can be changed from the admin console or admin API. Startup config changes still require Dash restart.

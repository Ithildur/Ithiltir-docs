---
slug: /Config/Access
title: Access Control
---

# Access Control

Dash has administrator access, optional anonymous reads, and node reporting access.

## Admin

Admin APIs require Bearer access tokens from `POST /api/auth/login`. Refresh and logout use the refresh cookie plus `X-CSRF-Token`.

## Anonymous Reads

| Resource | Default | Optional access |
| --- | --- | --- |
| Brand | Allowed | Always public |
| Front metrics | Guest-visible nodes only | Controlled by node visibility |
| Groups | Guest-visible scope | Controlled by node visibility |
| Online rate | Guest-visible nodes only | Controlled by node visibility |
| History metrics | Disabled | `history_guest_access_mode=by_node` + guest-visible node |
| Traffic statistics | Disabled | Traffic guest mode + guest-visible node |

## Node Access

Node APIs require `X-Node-Secret`. The secret is generated when a node is created and can be rotated from the admin console.

## Settings

Runtime access settings are stored in PostgreSQL and can be changed from the admin console or admin API. Startup config changes still require Dash restart.

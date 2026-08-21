---
slug: /Config/Notifications
title: Notifications
---

# Notifications

Dash supports Telegram, Email, and Webhook channels. Channel state is stored in PostgreSQL; complete credentials are encrypted with an installation key.

## Encryption and Backup

`dash migrate` creates:

```text
$DASH_HOME/configs/notify-config.key
```

Dash uses this raw 32-byte key with AES-256-GCM to encrypt each complete channel JSON document. Channel ID and type are authenticated data. Current logical database rows keep ciphertext and `{}` in the legacy config column.

The key must be a regular owner-readable-only file. Back it up separately from PostgreSQL and restore the matching key with the database. If ciphertext already exists, Dash never regenerates a missing key. Missing, invalid, overly permissive, or mismatched keys make startup fail, including when only a soft-deleted channel cannot be decrypted.

Migration does not physically erase historical plaintext from MVCC dead tuples, WAL, replicas, old backups, or storage snapshots.

## Common Constraints

- Channel names are trimmed, contain 1–64 Unicode characters, and cannot contain control characters.
- Config must be a UTF-8 JSON object no larger than 2 MiB.
- Unknown fields are rejected.
- Integer fields accept JSON integers only, not strings or floating-point values.
- Passwords, tokens, hashes, sessions, and secrets are opaque. On same-type updates, omitted or exactly empty string values inherit stored credentials; non-empty values are not trimmed.
- Admin responses redact credentials.

If a stored channel cannot be decoded by the current schema, list and detail endpoints still return it with `config=null`. It can only be deleted and recreated; it cannot be edited, enabled, selected, or tested.

## Notification Language

Every channel type accepts `config.language`:

| Value | Behavior |
| --- | --- |
| `system` | Uses backend `app.language` when the notification is enqueued |
| `zh` | Uses Chinese |
| `en` | Uses English |

A new or stored channel without this field behaves as `system`. Omitting it during a same-type replacement preserves an existing explicit language for older clients; omitting it while changing the channel type resets it to `system`.

Alerts, channel test messages, and Dash update notifications use the channel language. Titles and bodies are rendered before entering the outbox, so changing the language affects only newly enqueued notifications. Existing jobs retain their original text and language.

## Telegram Bot

`mode` defaults to `bot`. `chat_id` may be a string or integer. `bot_token` and `chat_id` are each limited to 256 bytes.

For HTTP `429`, Dash uses the longer wait from HTTP `Retry-After` and Bot API `parameters.retry_after`, capped by worker retry policy.

## Telegram MTProto

Login endpoints are `/code`, `/verify`, `/password`, and `/ping` under `/api/admin/alerts/channels/telegram/mtproto`.

The handshake is process-local and disappears on restart. Login-state failures return `503 login_state_error`. If the channel revision changes during login, completion returns `409 channel_changed` and does not overwrite newer config. Test send without a stored session returns `400 not_logged_in`.

Limits include: `api_hash` 256 bytes, phone 64 bytes, session 1 MiB, and chat ID 256 bytes.

## Email

- `smtp_port` must be in `1..65535`.
- `from` and every recipient must parse as mail addresses.
- `to` accepts one address or an array, cannot be empty, and allows at most 100 recipients.
- Username and each mail address are limited to 1024 bytes; password is limited to 8192 bytes.
- TLS on port 465 uses direct TLS; other TLS ports use STARTTLS and fail if the server does not support it.

## Webhook

The URL must be an absolute HTTP(S) URL with a non-empty host, at most 4096 bytes, and no user info or fragment. Secret is limited to 8192 bytes.

Webhook sends POST JSON. When a secret exists, `X-Webhook-Signature` is HMAC-SHA256 over the raw body. Only 2xx is success.

The HTTP client follows at most five redirects. Every hop must keep the original host; same-scheme redirects must keep the effective port; HTTP may upgrade to HTTPS, but HTTPS downgrade is rejected. POST follows only body-preserving `307` and `308`.

## Delivery State

Channel APIs return `delivery_status` as `unknown`, `healthy`, `degraded`, or `disabled`, plus success/failure timestamps, consecutive failures, structured errors, next retry/probe times, and pending/blocked counts.

Outbox states:

| State | Meaning |
| --- | --- |
| `retry` | Transient error; exponential retry |
| `blocked` | Deterministic config or remote rejection; low-frequency recovery probes |
| `paused` | Channel disabled |
| `discarded` | Corrupt payload, deleted channel, or incompatible channel type |

Re-enabling a channel or saving compatible config wakes queued rows and resets retry budget. Changing type discards old-type backlog. Deleting a channel removes it from alert settings and discards unsent rows.

Delivery is at-least-once. A process crash after remote acceptance but before the local completion commit can cause a duplicate.

---
slug: /Config/Notifications
title: Notifications
---

# Notifications

Supported notification channel types:

- Telegram Bot
- Telegram MTProto
- Email SMTP
- Webhook

Channel config is stored in the database. Admin API responses redact token, password, secret, session, and other sensitive values.

## Telegram Bot

`mode` defaults to `bot` when omitted. `chat_id` can be a string or integer.

## Telegram MTProto

MTProto login uses:

```text
/api/admin/alerts/channels/telegram/mtproto/code
/api/admin/alerts/channels/telegram/mtproto/verify
/api/admin/alerts/channels/telegram/mtproto/password
/api/admin/alerts/channels/telegram/mtproto/ping
```

Before test send, an MTProto channel must have a session. Otherwise the API returns `400 not_logged_in`.

## Email

Rules:

- `smtp_port` must be `1..65535`.
- `to` can be a string or string array, but cannot be empty.
- `use_tls=true` with port `465` uses direct TLS.
- `use_tls=true` with other ports uses STARTTLS. Request fails when the server does not support STARTTLS.

Updating an Email channel with an empty `password` inherits the old password.

## Webhook

Webhook request body:

```json
{
  "title": "Alert opened",
  "message": "Status: opened\n..."
}
```

`X-Webhook-Signature` uses HMAC-SHA256 over the raw body when `secret` is configured. A 2xx response from the target is considered success.

Updating a Webhook channel with an empty `secret` inherits the old secret.

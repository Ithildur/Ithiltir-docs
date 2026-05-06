---
slug: /Config/Notifications
title: Notifications
---

# 通知渠道

当前支持三类通知渠道：

- Telegram
- Email
- Webhook

配置会保存到数据库。管理 API 返回时会脱敏，不返回 token、密码、secret、session 等敏感值。

## Telegram Bot

```json
{
  "name": "telegram-bot",
  "type": "telegram",
  "enabled": true,
  "config": {
    "mode": "bot",
    "bot_token": "123:abc",
    "chat_id": "-100123456"
  }
}
```

`mode` 省略时默认为 `bot`。`chat_id` 可以是字符串或整数。

## Telegram MTProto

```json
{
  "name": "telegram-mtproto",
  "type": "telegram",
  "enabled": true,
  "config": {
    "mode": "mtproto",
    "api_id": 123456,
    "api_hash": "hash",
    "phone": "+85200000000",
    "chat_id": "-100123456"
  }
}
```

MTProto 需要通过 `/api/admin/alerts/channels/telegram/mtproto/*` 完成登录：

- `POST /code`
- `POST /verify`
- `POST /password`
- `POST /ping`

测试发送前，MTProto 渠道必须已有 session，否则返回 `400 not_logged_in`。

## Email

```json
{
  "name": "mail",
  "type": "email",
  "enabled": true,
  "config": {
    "smtp_host": "smtp.example.com",
    "smtp_port": 465,
    "username": "user",
    "password": "password",
    "from": "Ithiltir <alert@example.com>",
    "to": ["ops@example.com"],
    "use_tls": true
  }
}
```

规则：

- `smtp_port` 必须是 `1..65535`。
- `to` 可以是字符串或字符串数组，但不能为空。
- `use_tls=true` 且端口是 `465` 时使用直连 TLS。
- `use_tls=true` 且端口不是 `465` 时使用 STARTTLS；服务器不支持 STARTTLS 时请求失败。

更新同类型 Email 渠道时，`password` 传空会继承旧密码。

## Webhook

```json
{
  "name": "webhook",
  "type": "webhook",
  "enabled": true,
  "config": {
    "url": "https://example.com/alert",
    "secret": "shared-secret"
  }
}
```

Webhook 请求：

```http
POST <url>
Content-Type: application/json
X-Alert-Dedupe-Key: <dedupe_key>
X-Alert-Event-ID: <event_id>
X-Alert-Transition: opened|closed
X-Webhook-Signature: sha256=<hex-hmac>
```

Body：

```json
{
  "title": "告警触发",
  "message": "状态: opened\n...",
  "sent_at": "2026-05-04T00:00:00Z",
  "meta": {}
}
```

`X-Webhook-Signature` 使用 `secret` 对原始 body 做 HMAC-SHA256。目标返回 2xx 才算成功。

更新同类型 Webhook 渠道时，`secret` 传空会继承旧 secret。

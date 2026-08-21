---
slug: /Config/Notifications
---

# 通知渠道

Dash 支持 Telegram、Email 和 Webhook。渠道配置和投递健康状态保存在 PostgreSQL；完整凭据使用安装级密钥加密。

## 加密和备份

`dash migrate` 会创建：

```text
$DASH_HOME/configs/notify-config.key
```

Dash 使用该 32 字节密钥和 AES-256-GCM 加密每个渠道的完整 JSON 配置。渠道 ID 和类型参与认证，数据库当前逻辑行只保留密文和空对象 `{}`，不会继续写入明文配置。

必须同时满足：

- 密钥文件是普通文件，只有所有者可读；
- PostgreSQL 备份和密钥分开保存；
- 恢复数据库时同时恢复匹配的密钥；
- 密钥不得提交到仓库或复制到公开发布资产。

数据库中已有密文时，Dash 不会重新生成缺失密钥。密钥缺失、权限错误、长度错误或无法解密任一渠道时，Dash 拒绝启动。

迁移不会物理擦除 MVCC 死元组、表空闲空间、WAL、副本、旧备份或存储快照中的历史明文。包含旧明文的介质应按对应保留策略退役。

## 通用约束

- 渠道名会 trim，不能为空，最多 64 个 Unicode 字符，且不得包含控制字符。
- 配置必须是 JSON object，编码为有效 UTF-8，最大 2 MiB。
- 未知字段会被拒绝。
- `api_id`、`smtp_port` 等整数字段只接受 JSON integer，不接受数字字符串或浮点数。
- password、token、hash、session 和 secret 是不透明凭据。更新同类型渠道时，字段省略或严格为空字符串才继承旧值；非空值不会 trim，首尾空白会保留。
- API 返回脱敏配置，不返回 token、密码、secret 或 session。

存量配置无法按当前 schema 解码时，列表和详情仍返回该渠道，但 `config` 为 `null`。管理台允许删除该渠道，不允许编辑、启用、选择或测试。恢复方式是删除后重新创建。

## 通知语言

所有渠道类型都接受 `config.language`：

| 值 | 行为 |
| --- | --- |
| `system` | 通知入队时使用后端 `app.language` |
| `zh` | 使用中文 |
| `en` | 使用英文 |

新建渠道或存量渠道缺少该字段时按 `system` 处理。同类型渠道全量替换时，省略该字段会保留已有显式语言，以兼容旧客户端；改变渠道类型且省略该字段时恢复为 `system`。

告警、渠道测试消息和 Dash 更新通知都使用渠道语言。标题和正文在写入 outbox 前完成渲染，因此修改语言只影响之后入队的通知；已有任务保留原文本和语言。

## Telegram Bot

```json
{
  "name": "telegram-bot",
  "type": "telegram",
  "enabled": true,
  "config": {
    "language": "system",
    "mode": "bot",
    "bot_token": "123:abc",
    "chat_id": "-100123456"
  }
}
```

`mode` 省略时默认为 `bot`。`chat_id` 可以是字符串或整数。`bot_token` 最大 256 字节，`chat_id` 最大 256 字节。

Telegram Bot 返回 `429` 时，Dash 会同时读取 HTTP `Retry-After` 和 Bot API JSON `parameters.retry_after`，采用较长等待时间，最大 24 小时。

## Telegram MTProto

```json
{
  "name": "telegram-mtproto",
  "type": "telegram",
  "enabled": true,
  "config": {
    "language": "system",
    "mode": "mtproto",
    "api_id": 123456,
    "api_hash": "hash",
    "phone": "+85200000000",
    "chat_id": "-100123456"
  }
}
```

登录接口：

- `POST /api/admin/alerts/channels/telegram/mtproto/code`
- `POST /api/admin/alerts/channels/telegram/mtproto/verify`
- `POST /api/admin/alerts/channels/telegram/mtproto/password`
- `POST /api/admin/alerts/channels/telegram/mtproto/ping`

MTProto 登录握手只保存在当前 Dash 进程中，重启后失效。登录状态故障返回 `503 login_state_error`。登录期间渠道配置被替换时，完成登录返回 `409 channel_changed`，不会覆盖较新的配置。

测试发送前必须已有 session，否则返回 `400 not_logged_in`。

## Email

```json
{
  "name": "mail",
  "type": "email",
  "enabled": true,
  "config": {
    "language": "system",
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
- `from` 和每个收件人必须是可解析的邮件地址。
- `to` 可以是字符串或字符串数组，不能为空，最多 100 个收件人。
- 用户名和邮件地址单项最大 1024 字节，密码最大 8192 字节。
- `use_tls=true` 且端口是 `465` 时使用直连 TLS。
- `use_tls=true` 且端口不是 `465` 时使用 STARTTLS；服务器不支持 STARTTLS 时发送失败。

## Webhook

```json
{
  "name": "webhook",
  "type": "webhook",
  "enabled": true,
  "config": {
    "language": "system",
    "url": "https://example.com/alert",
    "secret": "shared-secret"
  }
}
```

URL 必须是带非空主机的绝对 HTTP(S) URL，最大 4096 字节，不得包含用户信息或 fragment。Secret 最大 8192 字节。

请求：

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

通知 HTTP 客户端最多跟随五次重定向。每一跳必须保持初始主机；同协议跳转必须保持有效端口，只允许 HTTP 升级到 HTTPS，并拒绝用户信息和 HTTPS 降级。POST 只跟随保留方法和 body 的 `307`/`308`；`301`、`302`、`303` 会被标记为确定性失败。

## 投递状态

渠道 API 返回：

- `delivery_status`：`unknown`、`healthy`、`degraded` 或 `disabled`；
- `last_success_at`、`last_failure_at`；
- `consecutive_failures`、`last_error_code`、`last_error`；
- `next_retry_at`、`next_probe_at`；
- `pending_count`、`blocked_count`。

状态语义：

| 状态 | 说明 |
| --- | --- |
| `unknown` | 当前配置还没有成功投递记录 |
| `healthy` | 最近投递成功，且没有 blocked 积压 |
| `degraded` | 存在投递失败或 blocked 积压 |
| `disabled` | 渠道已停用 |

投递任务状态：

| 状态 | 说明 |
| --- | --- |
| `retry` | 瞬时错误，按 5–320 秒指数退避 |
| `blocked` | 配置错误或远端确定性拒绝；按 5、15、30、60 分钟低频探测 |
| `paused` | 渠道停用，任务等待重新启用 |
| `discarded` | payload 损坏、渠道已删除或渠道类型不兼容 |

重新启用渠道或保存兼容类型的配置会唤醒积压并重置重试预算。改变渠道类型会丢弃旧类型积压。删除渠道会把它从告警设置中移除，并丢弃尚未发送的任务。

远端成功后，存活 worker 只重试本地完成事务，不会主动再次发送同一行。进程恰好在远端接收后、本地提交前退出时仍可能重复投递；通知边界是至少一次投递（at-least-once）。

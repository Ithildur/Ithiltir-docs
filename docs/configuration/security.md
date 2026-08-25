---
slug: /Config/Security
---

# 安全配置

Ithiltir 的安全边界主要是管理员认证、节点 secret、同源部署和系统服务权限。

## 管理员密码

管理员密码来自环境变量：

```bash
monitor_dash_pwd
```

该值不写入 YAML。发布包安装脚本会把它写入 systemd unit 的环境变量。

要求：

- 至少 8 个可见 ASCII 字符。
- 不得包含空白字符。
- 不与节点 secret 或数据库密码复用。
- 不写入 Git、公开文档或前端代码。

轮换管理员密码后重启 Dash。

## JWT 签名密钥

配置：

```yaml
auth:
  jwt_signing_key: "<high-entropy-secret>"
```

这是 HS256 签名密钥。它至少为 32 字节，且不得包含首尾空白。泄露后应立即轮换；轮换会使所有现有 session 失效。

## 通知配置密钥

`dash migrate` 会创建：

```text
$DASH_HOME/configs/notify-config.key
```

该文件是 32 字节 AES-256 密钥，只允许所有者读取。它用于解密 PostgreSQL 中保存的 Telegram、SMTP 和 Webhook 完整配置。

- 必须与 PostgreSQL 备份分开保存。
- 不得提交到仓库或放入公开 release 包。
- 数据库中已有密文时，密钥缺失、权限错误、格式错误或不匹配都会阻止 Dash 启动。
- 密钥丢失后，现有通知凭据无法恢复。Dash 不会生成替代密钥或回退读取旧明文。

## 节点 secret

节点 secret 只用于：

```text
X-Node-Secret: <secret>
```

作用范围：

- `/api/node/identity`
- `/api/node/metrics`
- `/api/node/static`

节点 secret 不应出现在本地页面、浏览器代码、公开配置或日志中。

每个节点使用独立 secret。secret 在 trim 后必须包含 8～128 个 Unicode 字符。轮换时先在 Dash 更新节点 secret，再更新节点本机 `report.yaml` 并重启节点服务。

## HTTPS

生产环境应按 HTTPS 域名暴露：

- Dash 对外只暴露 HTTPS。
- Nginx/Caddy/负载均衡终止 TLS，并反向代理到 Dash 后端。
- 节点安装和上报使用 HTTPS。
- 节点加 `--require-https` 禁止 HTTP 回落。
- IP+HTTP 只用于本机或临时内网验证。

```bash
./node push 3 --require-https
```

## 反向代理信任

`http.trusted_proxies` 只写真实代理 CIDR：

```yaml
http:
  trusted_proxies:
    - 127.0.0.1/32
    - ::1/128
```

仅信任实际反向代理来源。

不使用 `0.0.0.0/0` 或 `::/0`；过宽的信任范围会影响客户端 IP、审计和限流结果。

## Webhook 签名

Webhook 设置 `secret` 后，Dash 会发送：

```text
X-Webhook-Signature: sha256=<hmac>
```

接收端应使用共享 secret 对原始 body 做 HMAC-SHA256 校验。

Webhook URL 只允许绝对 HTTP(S) URL，不得包含用户信息或 fragment。生产环境应使用 HTTPS。通知客户端只跟随最多五次保持初始主机的安全重定向；POST 只接受 `307` 和 `308`。

## HTTP 响应头

Dash 对页面和 API 统一发送：

- Content Security Policy；
- `Permissions-Policy`；
- `Referrer-Policy: no-referrer`；
- `X-Content-Type-Options: nosniff`；
- `X-Frame-Options: DENY`。

Refresh cookie 使用 `SameSite=Strict`。`POST /api/auth/refresh` 和 `/api/auth/logout` 仍要求匹配的 `X-CSRF-Token`。

## 不支持的部署方式

- Dash 子路径部署。
- 未同时配置 CORS、cookie 和 CSRF 策略的浏览器跨域直连 API。
- 多个 Dash 实例同时写同一套数据库和 Redis。

部署后的端口、文件权限、数据库和 Redis 核对见 [安全加固](../operations/security-hardening.md)。

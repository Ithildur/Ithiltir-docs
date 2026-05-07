---
slug: /Config/Security
title: Security
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

- 可见 ASCII 字符。
- 足够长。
- 不与节点 secret 或数据库密码复用。

## JWT 签名密钥

配置：

```yaml
auth:
  jwt_signing_key: "<high-entropy-secret>"
```

这是 HS256 签名密钥。泄露后应立即轮换，所有现有 session 都应视为不可信。

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

## HTTPS

Production deployments should expose Dash through an HTTPS domain:

- Expose Dash publicly only through HTTPS.
- Terminate TLS at Nginx, Caddy, or a load balancer, then reverse-proxy to the Dash backend.
- Use HTTPS for node install scripts and report targets.
- Add `--require-https` on nodes to disable HTTP fallback.
- Use IP+HTTP only for local or temporary internal validation.

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

## systemd 权限

Dash 发布包服务以 root 写入敏感配置和 unit，配置文件 `0600`。Linux 节点服务使用独立 `ithiltir` 用户，并限制可写路径到 `/var/lib/ithiltir-node`。

## Webhook 签名

Webhook 设置 `secret` 后，Dash 会发送：

```text
X-Webhook-Signature: sha256=<hmac>
```

接收端应使用共享 secret 对原始 body 做 HMAC-SHA256 校验。

## 不支持的部署方式

- Dash 子路径部署。
- 未同时配置 CORS、cookie 和 CSRF 策略的浏览器跨域直连 API。
- 多个 Dash 实例同时写同一套数据库和 Redis。

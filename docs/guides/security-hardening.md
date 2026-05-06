---
slug: /Guides/SecurityHardening
---

# 安全加固

Ithiltir 的安全边界由三部分组成：管理面使用管理员密码和 Bearer token，节点面使用 `X-Node-Secret`，浏览器访问保持与 Dash 同源。

## 管理员密码

管理员密码只放在环境变量：

```bash
export monitor_dash_pwd='<admin-password>'
```

要求：

- 可见 ASCII 字符。
- 不写入 Git。
- 不写入公开文档。
- 不放进前端代码。
- 轮换后重启 Dash。

## JWT 签名密钥

`auth.jwt_signing_key` 必须是高熵随机值：

```yaml
auth:
  jwt_signing_key: "<random-string>"
```

轮换会使现有 access token 失效。生产环境应替换示例配置中的占位值。

## 反向代理信任

只信任实际反向代理来源：

```yaml
http:
  trusted_proxies:
    - 127.0.0.1/32
    - ::1/128
```

仅配置实际反向代理地址。配置 `0.0.0.0/0` 会导致客户端 IP、审计和限流判断失真。

## TLS 和同源

生产环境使用 HTTPS：

```yaml
app:
  public_url: "https://dash.example.com"
```

规则：

- `/api`、`/theme`、`/deploy`、`/` 必须同源。
- 不使用跨域 API。
- 不部署到 URL 子路径。
- 节点安装脚本和节点二进制从 `/deploy` 同源下载。

## 节点 secret

每个节点使用独立 secret。多个节点不应复用同一个 secret。

节点请求只对 `/api/node/*` 使用：

```http
X-Node-Secret: <node-secret>
```

轮换方式：

1. 在 Dash 管理台更新节点 secret。
2. 在节点上执行 `report update`。
3. 重启节点服务。
4. 确认新上报成功。

## Redis

生产环境启用 Redis。Redis 不应暴露到公网。

配置建议：

- 绑定内网或本机地址。
- 配置认证。
- 限制防火墙。
- 不把 Redis 当作唯一恢复数据源。

`--no-redis` 是降级运行模式，不属于安全加固配置。启用后，会话和热点运行时状态会在进程重启后丢失。

## PostgreSQL

配置建议：

- 独立数据库用户。
- 最小权限满足迁移和运行。
- 远程数据库使用明确网络策略。
- 需要跨网络时使用 PostgreSQL SSL。
- 定期备份并做恢复演练。

TimescaleDB chunk 由 Dash 迁移和保留策略维护。

## 文件权限

Dash 配置包含数据库密码和签名密钥：

```bash
sudo chown root:root /opt/Ithiltir-dash/configs/config.local.yaml
sudo chmod 600 /opt/Ithiltir-dash/configs/config.local.yaml
```

节点 `report.yaml` 包含 secret：

```bash
sudo chmod 600 /var/lib/ithiltir-node/report.yaml
```

Windows 节点配置位于：

```text
%ProgramData%\Ithiltir-node\report.yaml
```

用 NTFS ACL 限制普通用户读取。

## 服务隔离

Linux 节点 systemd unit 使用独立 `ithiltir` 用户，并限制写路径到 `/var/lib/ithiltir-node`。修改 unit 时保留：

- `NoNewPrivileges`。
- `PrivateTmp`。
- `ProtectSystem=strict`。
- `ProtectHome=true`。
- `ReadWritePaths=/var/lib/ithiltir-node`。

Dash 服务运行用户由安装包决定。Dash 进程应仅拥有运行所需的系统权限。

## 主题包

主题包只能包含：

- `theme.json`
- `tokens.css`
- `recipes.css`
- `preview.png`
- `README.md`

CSS 只允许自定义属性，不允许 `@import`、`url(`、`javascript:`、`expression(` 或嵌套规则。主题包最大限制见 [主题包格式](../reference/theme-package.md)。

## Webhook 通知

Webhook 使用 POST JSON。配置 secret 后会带签名：

```http
X-Webhook-Signature: sha256=<hmac>
```

接收端应校验签名，并对事件做幂等处理。可使用：

- `X-Alert-Dedupe-Key`
- `X-Alert-Event-ID`
- `X-Alert-Transition`

## 公开服务核对

公网只应暴露：

- 反向代理的 443。
- 必要时 80 用于证书签发或跳转。

不应暴露：

- PostgreSQL。
- Redis。
- Dash 后端裸端口。
- 节点本地 `local` 页面。
- Push debug 端口。

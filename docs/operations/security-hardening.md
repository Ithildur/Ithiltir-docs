---
slug: /Operations/SecurityHardening
---

# 安全加固

管理员密码、JWT 签名密钥、节点 secret、通知密钥和 Webhook 签名的约束见 [安全配置](../configuration/security.md)。

## 公网入口

公网只开放反向代理的 `443`。`80` 仅用于证书签发或 HTTP 跳转。

以下服务不得暴露到公网：

- PostgreSQL。
- Redis。
- Dash 后端监听端口。
- Node 本地模式页面。
- Node Push debug 端口。

Dash 后端端口限制在本机或内网。PostgreSQL 和 Redis 绑定本机或明确的内网地址，并通过防火墙限制访问源。

## 反向代理

上线前确认：

- `app.public_url` 与对外 HTTPS 域名一致。
- `/api`、`/theme`、`/deploy` 和 `/` 保持同源转发。
- Dash 部署在域名根路径，不使用 URL 子路径。
- `http.trusted_proxies` 只包含实际反向代理的 CIDR。
- 节点安装和上报均使用 HTTPS。

Nginx 和 Caddy 配置见 [反向代理](../installation/reverse-proxy.md)。

## 敏感文件

Linux 发布包使用以下权限：

```bash
sudo chown root:root /opt/Ithiltir-dash/configs/config.local.yaml
sudo chmod 600 /opt/Ithiltir-dash/configs/config.local.yaml
sudo chown root:root /opt/Ithiltir-dash/configs/notify-config.key
sudo chmod 600 /opt/Ithiltir-dash/configs/notify-config.key
sudo chmod 600 /var/lib/ithiltir-node/report.yaml
```

`notify-config.key` 必须与 PostgreSQL 备份分开保存。数据库已有通知密文时，不得用新密钥覆盖丢失文件。

Windows 节点配置位于 `%ProgramData%\Ithiltir-node\report.yaml`。使用 NTFS ACL 限制普通用户读取。

## 数据库和 Redis

PostgreSQL：

- 使用独立数据库用户。
- 权限覆盖迁移和运行所需操作。
- 跨网络连接使用 PostgreSQL SSL 和明确的网络策略。
- 定期执行备份和恢复验证。

Redis：

- 启用认证并限制可访问网段。
- Dash 使用的账号必须允许 `PING` 和 `INFO server`。
- Redis 不作为持久数据的唯一备份。

`--no-redis` 会把管理员会话和前台缓存改为进程内存储，不用于生产安全加固。

## 服务权限

Linux 节点 systemd unit 使用独立 `ithiltir` 用户，并将可写路径限制为 `/var/lib/ithiltir-node`。修改 unit 时保留：

- `NoNewPrivileges`。
- `PrivateTmp`。
- `ProtectSystem=strict`。
- `ProtectHome=true`。
- `ReadWritePaths=/var/lib/ithiltir-node`。

Dash 进程只应拥有读取配置、访问运行目录和绑定后端端口所需的系统权限。

## 核对

```bash
ss -lntp
stat -c '%a %U:%G %n' \
  /opt/Ithiltir-dash/configs/config.local.yaml \
  /opt/Ithiltir-dash/configs/notify-config.key \
  /var/lib/ithiltir-node/report.yaml
```

核对结果：

- 公网扫描只显示预期的 HTTP(S) 入口。
- Dash 和 Node 日志不包含密码、secret、token 或通知凭据。
- 登录、节点上报、主题上传和 Webhook 测试均经过 HTTPS。
- PostgreSQL 备份与 `notify-config.key` 可分别恢复到受控环境。

---
slug: /Guides/AllInOne
---

# 单机 all-in-one 部署

单机部署把 Dash、PostgreSQL、TimescaleDB 和 Redis 放在一台机器上。适合小规模、自用和初始生产环境。

## 拓扑

```text
Browser/Node
    |
HTTPS
    |
Nginx/Caddy
    |
127.0.0.1:8080
    |
Ithiltir Dash
    |
+------------------+
| PostgreSQL       |
| TimescaleDB      |
| Redis            |
+------------------+
```

Dash 仍是单实例。不要在同一数据库前启动多个 Dash 写实例。

## 系统准备

确认系统：

```bash
uname -m
systemctl --version
```

不需要先手工安装数据库和 Redis。发布包安装脚本会在支持的发行版上准备 PostgreSQL 16+、TimescaleDB 和 Redis；Debian/Ubuntu 会走 `apt-get` 和对应仓库。

推荐把数据库、Redis 和 Dash 放在同一内网或同一机器。本机 all-in-one 使用：

```yaml
database:
  host: 127.0.0.1
redis:
  addr: 127.0.0.1:6379
```

## 安装 Dash

```bash
tar -xzf Ithiltir_dash_linux_amd64.tar.gz
cd Ithiltir-dash
sudo bash install_dash_linux.sh --lang zh
```

安装脚本会准备：

- `/opt/Ithiltir-dash`。
- `/opt/Ithiltir-dash/configs/config.local.yaml`。
- `dash.service`。
- PostgreSQL 16+、TimescaleDB 和 Redis。

不同发行版的包管理器和仓库处理见 [安装 Dash](../installation/dash-linux.md)。

## 配置公开地址

推荐域名 HTTPS 部署：

```yaml
app:
  public_url: "https://dash.example.com"
```

临时内网 IP 验证：

```yaml
app:
  public_url: "http://10.0.0.2:8080"
```

正式部署不要长期使用 IP+HTTP。`public_url` 只写根路径，不要加 `/ithiltir`、`/dash` 或其他路径前缀。

## 本机反向代理

Nginx 转发到本机 Dash：

```nginx
server {
    listen 443 ssl http2;
    server_name dash.example.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Dash 配置：

```yaml
http:
  trusted_proxies:
    - 127.0.0.1/32
    - ::1/128
```

只暴露 443 给外部。Dash 的 `:8080` 可以只监听本机或由防火墙限制。

## 初始化和启动

安装脚本会创建数据库用户和库、启用 TimescaleDB 扩展、执行迁移，并启动 `dash.service`。发布包标准安装后不需要再手工执行 `migrate` 或 `systemctl enable --now`。

检查：

```bash
systemctl status dash.service
journalctl -u dash.service -n 100 --no-pager
curl -fsS http://127.0.0.1:8080/api/version/
```

## 接入第一台节点

在管理台创建节点，拿到 secret。

节点也是同一台机器时：

```bash
curl -fsSL http://127.0.0.1:8080/deploy/linux/install.sh -o install_node.sh
sudo bash install_node.sh 127.0.0.1 8080 '<node-secret>' 3
```

节点是其他机器时，使用域名 HTTPS 公开地址：

```bash
curl -fsSL https://dash.example.com/deploy/linux/install.sh -o install_node.sh
sudo bash install_node.sh dash.example.com 443 '<node-secret>' 3 --net eth0
```

## 保留策略

小规模默认值可以直接用：

```yaml
database:
  retention_days: 45
  traffic_retention_days: 45
```

需要 95 计费或跨月复核时：

```yaml
database:
  retention_days: 45
  traffic_retention_days: 90
```

流量 `billing` 模式会写更多 5 分钟事实和汇总数据。磁盘空间不足时，先调保留天数，不要手工删除 TimescaleDB chunk。

## 最小备份

```bash
pg_dump -Fc -f /root/ithiltir.dump ithiltir
tar -czf /root/ithiltir-dash-config.tgz \
  /opt/Ithiltir-dash/configs/config.local.yaml \
  /opt/Ithiltir-dash/themes \
  /opt/Ithiltir-dash/install_id
```

恢复流程见 [备份和恢复](../operations/backup-restore.md)。

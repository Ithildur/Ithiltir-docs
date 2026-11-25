---
slug: /Install/AllInOne
---

# 单机生产部署

标准生产部署在一台 Linux 服务器上运行 Dash、PostgreSQL（含 TimescaleDB 扩展）和 Redis。浏览器与节点通过同机的 Nginx 或 Caddy 访问 Dash。

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

Dash 通过回环地址连接本机 PostgreSQL 和 Redis。

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
sudo bash install_dash_linux.sh --lang zh --service-manager=systemd
```

安装脚本会准备：

- `/opt/Ithiltir-dash`。
- `/opt/Ithiltir-dash/configs/config.local.yaml`。
- `dash.service`。
- PostgreSQL 16+、TimescaleDB 和 Redis。

不同发行版的包管理器和仓库处理见 [安装 Dash](./dash-linux.md)。

## 配置公开地址

Dash 监听回环地址，`app.public_url` 填写反向代理对外提供的 HTTPS 域名根地址。

```yaml
app:
  listen: "127.0.0.1:8080"
  public_url: "https://dash.example.com"
```

## 本机反向代理

按[反向代理配置示例](./reverse-proxy.md)设置 Nginx 或 Caddy，将 HTTPS 请求转发到 `127.0.0.1:8080`。使用 Node gRPC 或 PVE 历史查询时，同时配置示例中的 gRPC 转发规则。

Dash 配置：

```yaml
http:
  trusted_proxies:
    - 127.0.0.1/32
    - ::1/128
```

配置完成后，按[上线检查清单](./production-deployment.md)验证公网入口和节点上报。

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

流量 `billing` 模式会写入更多五分钟流量明细和汇总数据。磁盘空间不足时，应先调整保留天数。TimescaleDB 时间分块由保留策略维护。

## 最小备份

```bash
pg_dump -Fc -f /root/ithiltir.dump ithiltir
tar -czf /root/ithiltir-dash-config.tgz \
  /opt/Ithiltir-dash/configs/config.local.yaml \
  /opt/Ithiltir-dash/themes \
  /opt/Ithiltir-dash/install_id
```

另行备份 `/opt/Ithiltir-dash/configs/notify-config.key`，并与 PostgreSQL dump 分开保存。没有匹配密钥时，通知渠道凭据无法恢复。

恢复流程见 [备份和恢复](../operations/backup-restore.md)。

---
slug: /Install/ProductionDeployment
---

# 生产部署检查清单

完成[单机生产部署](./all-in-one.md)后，按以下各项检查本机服务、HTTPS 入口、节点上报和备份。

## 版本和平台

确认部署对象：

- Dash：Linux amd64 或 Linux arm64 发布包。
- Linux 节点：amd64 或 arm64。
- macOS 节点：arm64。
- Windows 节点：amd64 或 arm64，使用 runner 托管。

确认运行依赖：

- PostgreSQL 16+。
- TimescaleDB。
- Redis。
- systemd Linux 发行版或对应 macOS/Windows 服务管理器。

发布包安装器会在受支持的 Debian/Ubuntu 主机上准备本机 PostgreSQL、TimescaleDB 和 Redis。离线或受限环境需预先准备依赖。

源码运行或自定义打包才需要：

- Go 1.27.3+。
- Bun 1.3.11。

## Dash 安装

使用发布包安装：

```bash
tar -xzf Ithiltir_dash_linux_amd64.tar.gz
cd Ithiltir-dash
sudo bash install_dash_linux.sh --lang zh --service-manager=systemd
```

安装后固定路径：

| 项 | 路径 |
| --- | --- |
| 安装目录 | `/opt/Ithiltir-dash` |
| 配置文件 | `/opt/Ithiltir-dash/configs/config.local.yaml` |
| systemd unit | `/etc/systemd/system/dash.service` |
| 主题目录 | `/opt/Ithiltir-dash/themes` |

服务检查：

```bash
systemctl status dash.service
journalctl -u dash.service -n 100 --no-pager
```

## 必填配置

`/opt/Ithiltir-dash/configs/config.local.yaml` 至少确认：

```yaml
app:
  listen: "127.0.0.1:8080"
  public_url: "https://dash.example.com"
  timezone: "Asia/Hong_Kong"
  language: "zh"
  log_level: "info"
  log_format: "json"

http:
  trusted_proxies:
    - 127.0.0.1/32
    - ::1/128

database:
  driver: postgres
  host: 127.0.0.1
  port: 5432
  user: ithiltir
  password: "<db-password>"
  name: ithiltir
  sslmode: disable
  retention_days: 45
  traffic_retention_days: 90

redis:
  addr: 127.0.0.1:6379

auth:
  jwt_signing_key: "<high-entropy-random-string>"
```

管理员密码只从环境变量读取：

```bash
export monitor_dash_pwd='<admin-password>'
```

systemd 环境变量应由安装脚本写入服务环境或独立环境文件。密码必须是可见 ASCII 字符。

## 数据库迁移

每次首次部署或升级后执行迁移：

```bash
/opt/Ithiltir-dash/bin/dash migrate -config /opt/Ithiltir-dash/configs/config.local.yaml
```

发布包安装和更新脚本会自动执行迁移。手工替换二进制、恢复备份或修改数据库连接后，需要手动执行上面的命令。迁移失败时，先修复数据库连接、权限或扩展问题，再启动新版本服务。

## 反向代理

Dash 生产环境应部署在域名 HTTPS 根路径：

```text
https://dash.example.com/
```

必须同源转发：

- `/api`
- `/theme`
- `/deploy`
- `/`

确认 `app.public_url` 使用 HTTPS 域名根路径，Dash 只监听回环地址，`http.trusted_proxies` 仅包含本机代理使用的地址。代理规则见[反向代理](./reverse-proxy.md)。

## Redis 策略

生产环境使用 Redis。`--no-redis` 用于测试或极小规模降级运行。

`--no-redis` 的实际影响：

- 会话保存在 Dash 进程内存。
- 热点快照保存在 Dash 进程内存。
- Dash 重启后会话和前台缓存丢失。
- 告警 pending/cooldown 和 MTProto 登录态无论是否使用 Redis 都在进程内存。
- PostgreSQL 中的指标历史、节点、开放告警事件、通知 outbox、流量进度和系统设置不受影响。

## 节点接入

在管理台创建节点并取得 secret。Linux 节点示例：

```bash
curl -fsSL https://dash.example.com/deploy/linux/install.sh -o install_node.sh
sudo bash install_node.sh dash.example.com 443 '<node-secret>' 3 --net eth0
```

节点安装后检查：

```bash
systemctl status ithiltir-node.service
journalctl -u ithiltir-node.service -n 100 --no-pager
```

检查配置：

```bash
/var/lib/ithiltir-node/current/ithiltir-node report list
```

Linux Node 脚本支持 systemd 和 Alpine/OpenRC。systemd 使用 timer 调度 SMART、连接数和 LVM thinpool 采集；OpenRC 使用 `supervise-daemon` 与 BusyBox cron，连接数由 Node 自带逻辑统计。

## 备份

必须备份：

- PostgreSQL 数据库。
- `/opt/Ithiltir-dash/configs/config.local.yaml`。
- `/opt/Ithiltir-dash/configs/notify-config.key`，与 PostgreSQL 分开保存。
- `/opt/Ithiltir-dash/themes`。

建议备份：

- `/opt/Ithiltir-dash/install_id`。
- 节点本机 `report.yaml`。

Redis 通常不作为恢复主数据。恢复后用户重新登录，前台缓存重建；开放告警事件和通知 outbox 从 PostgreSQL 恢复，pending/cooldown 和 MTProto 登录态重置。

## 上线验证

Dash：

```bash
curl -I https://dash.example.com/
curl -fsS https://dash.example.com/api/version/
curl -I https://dash.example.com/deploy/linux/install.sh
```

节点：

```bash
systemctl status ithiltir-node.service
journalctl -u ithiltir-node.service -f
```

浏览器：

- 打开 `/login`。
- 登录管理台。
- 创建或检查节点。
- 确认节点在线。
- 查看历史指标。
- 查看流量统计。
- 创建测试告警规则并检查通知通道。

## 升级前检查

升级前做三件事：

1. 备份 PostgreSQL 和 Dash 配置。
2. 阅读版本说明，确认 Dash 打包携带的 Ithiltir-node 版本。
3. 先执行迁移，再启动新 Dash。

升级命令见 [升级](./upgrade.md)。

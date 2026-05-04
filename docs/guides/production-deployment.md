---
slug: /Guides/ProductionDeployment
---

# 生产部署检查清单

生产部署的目标是固定边界：Dash 单实例、PostgreSQL 可恢复、Redis 可用、域名 HTTPS 入口、反向代理同源、节点只向可信 Dash 上报。

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

发布包安装脚本会检测并准备 Dash 侧运行依赖。Debian/Ubuntu 这类 `apt-get` 系统不需要先手工安装 PostgreSQL、TimescaleDB 或 Redis；已有外部数据库/Redis、离线环境和受限服务器除外。

源码运行或自定义打包才需要：

- Go 1.26+。
- Bun 1.3.11。

## Dash 安装

推荐用发布包安装：

```bash
tar -xzf Ithiltir_dash_linux_amd64.tar.gz
cd Ithiltir-dash
sudo bash install_dash_linux.sh --lang zh
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
  listen: ":8080"
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

发布包安装和更新脚本会自动执行迁移。手工替换二进制、恢复备份或改数据库连接后，才需要手动执行上面的命令。迁移失败时不要启动新版本服务，先修复数据库连接、权限或扩展问题。

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

不能部署为：

```text
https://example.com/dash/
```

`app.public_url` 不能带路径前缀。反向代理在本机时，`trusted_proxies` 只写本机地址。反向代理在内网其他机器时，只写明确 CIDR。

不建议正式暴露为：

```text
http://10.0.0.2:8080/
```

Dash 的 `:8080` 这类后端端口应只对本机或内网开放，公网入口交给 Nginx/Caddy/负载均衡。

## Redis 策略

生产环境使用 Redis。`--no-redis` 只适合测试或极小规模降级运行。

`--no-redis` 的实际影响：

- 会话保存在 Dash 进程内存。
- 热点快照保存在 Dash 进程内存。
- 告警运行时状态保存在 Dash 进程内存。
- Dash 重启后这些运行时状态丢失。
- PostgreSQL 中的指标历史、节点、告警规则和系统设置不受影响。

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

Linux 节点脚本会下载 Dash 打包携带的节点二进制并注册 systemd 服务；检测到 LVM/LVM-thin 时会安装/启用 cron 采集 thinpool 缓存。`apt-get` 系统不需要提前手工安装 cron。

## 备份

必须备份：

- PostgreSQL 数据库。
- `/opt/Ithiltir-dash/configs/config.local.yaml`。
- `/opt/Ithiltir-dash/themes`。

建议备份：

- `/opt/Ithiltir-dash/install_id`。
- 节点本机 `report.yaml`。

Redis 通常不作为恢复主数据。恢复后用户重新登录、热点快照重建、告警运行时重新开始。

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

升级命令见 [升级](../installation/upgrade.md)。

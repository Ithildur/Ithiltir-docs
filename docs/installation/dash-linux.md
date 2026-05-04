---
slug: /Install/DashLinux
---

# 安装 Dash

生产部署优先使用发布包。源码运行只适合开发和验证。

## 发布包内容

Dash 发布包解压后目录名为 `Ithiltir-dash`，包含：

```text
Ithiltir-dash/
  bin/dash
  configs/config.example.yaml
  dist/
  deploy/
  install_dash_linux.sh
  update_dash_linux.sh
  logs/
```

`dist/` 是前端资源，`deploy/` 是节点安装脚本和节点二进制。

## 安装

```bash
tar -xzf Ithiltir_dash_linux_amd64.tar.gz
cd Ithiltir-dash
sudo bash install_dash_linux.sh --lang zh
```

支持的 systemd Linux 上，不需要先手工 `apt install postgresql redis`。脚本会检测当前系统和现有服务，再决定复用、包管理器安装或提示源码安装 Redis。

安装脚本会：

1. 检查系统和包管理器。
2. 检测并准备 PostgreSQL 16+、TimescaleDB 和 Redis。
3. 复制发布包到 `/opt/Ithiltir-dash`。
4. 交互生成 `/opt/Ithiltir-dash/configs/config.local.yaml`。
5. 设置管理员密码环境变量到 systemd unit。
6. 执行 `dash migrate`。
7. 写入并启动 `/etc/systemd/system/dash.service`。

依赖处理边界：

| 场景 | 行为 |
| --- | --- |
| Debian / Ubuntu | 使用 `apt-get` 安装基础工具、PostgreSQL 16、TimescaleDB 和 Redis |
| 已有满足版本的 PostgreSQL / Redis | 复用现有服务 |
| Redis 包版本不足 | 提示源码安装或升级到 Redis 8.2+ |
| 无 systemd 或无支持的包管理器 | 停止自动安装，改走手工部署 |

## 安装目录

| 路径 | 内容 |
| --- | --- |
| `/opt/Ithiltir-dash/bin/dash` | Dash 可执行文件 |
| `/opt/Ithiltir-dash/configs/config.local.yaml` | 本机配置 |
| `/opt/Ithiltir-dash/dist` | SPA 静态资源 |
| `/opt/Ithiltir-dash/deploy` | 节点部署资产 |
| `/opt/Ithiltir-dash/themes` | 自定义主题目录 |
| `/opt/Ithiltir-dash/install_id` | Dash 安装身份 |
| `/etc/systemd/system/dash.service` | systemd 服务 |

配置文件和服务文件会收紧为 root 所有、`0600`。

## 安装时需要填写的关键项

| 项 | 说明 |
| --- | --- |
| `app.listen` | Dash 监听端口，例如 `:8080` |
| `app.public_url` | 对浏览器和节点公开的根 URL |
| `app.language` | `zh` 或 `en` |
| `app.node_offline_threshold` | 离线判断阈值，默认 `14s` |
| `database.user` | Dash 数据库用户 |
| `database.password` | 数据库密码 |
| `database.name` | 数据库名 |
| `database.retention_days` | 普通指标保留天数 |
| `redis.addr` | Redis 地址 |
| `http.trusted_proxies` | 可信反向代理 CIDR |

`app.public_url` 推荐填写 HTTPS 域名，例如 `https://dash.example.com`。生产环境应配置 Nginx 或 Caddy 反向代理到 Dash 的本机监听端口；直接 IP+HTTP 只适合临时测试。

## 服务管理

```bash
systemctl status dash.service
journalctl -u dash.service -f
systemctl restart dash.service
```

## 重跑安装脚本

如果 `/opt/Ithiltir-dash/configs/config.local.yaml` 和 `dash.service` 已存在，安装脚本会提示当前系统已安装。选择“仅更新文件”时，会复制当前目录到安装目录、执行迁移并重启服务，不重做交互配置。

## 手工迁移

```bash
sudo env DASH_HOME=/opt/Ithiltir-dash \
  /opt/Ithiltir-dash/bin/dash migrate \
  -config /opt/Ithiltir-dash/configs/config.local.yaml
```

---
slug: /Install/DashLinux
---

# 安装 Dash

生产部署使用 Linux 发布包。`install_dash_linux.sh` 只用于全新主机的首次安装；重装、修复、回滚和版本更新使用 `dash update`。

## 发布包内容

格式 v1 的发布包包含：

```text
Ithiltir-dash/
  release.env
  bin/dash
  configs/config.example.yaml
  dist/index.html
  deploy/
  install_dash_linux.sh
  update_dash_linux.sh
```

`release.env` 记录 Dash 版本、内置 Node 版本、目标平台和内置 Node/runner 资产的 SHA-256。发布包不包含本机 `config.local.yaml`。

## 安装

systemd 主机：

```bash
tar -xzf Ithiltir_dash_linux_amd64.tar.gz
cd Ithiltir-dash
sudo bash install_dash_linux.sh --lang zh --service-manager=systemd
```

没有 systemd 的主机必须显式选择手工模式：

```bash
sudo bash install_dash_linux.sh --lang zh --service-manager=none
```

`auto` 只在 systemd 正在运行时选择 systemd。`none` 只安装文件和 `run_dash.sh`，不会注册服务、启动 Dash 或设置开机自启。

安装器要求 `pgrep`。受支持的 Debian/Ubuntu 环境可以由安装器准备 PostgreSQL 16+、与 PostgreSQL 主版本匹配的 TimescaleDB 和 Redis。Alpine 必须预先准备这些服务。

Redis 运行时最低支持版本为 `6.2.0`，推荐版本为 `8.2.3` 及以上。安装器的本地部署目标是推荐版本；默认源码版本为 `8.2.5`。使用远端 Redis 时，安装器按实际 `redis.addr` 执行 `PING` 和 `INFO server`，不会根据本机 `redis-server` 判断远端版本。

## 安装结果

安装器先校验包内 Dash 二进制，再创建不可变 release 并原子切换 `current`：

```text
/opt/Ithiltir-dash/
  releases/<version>/
  current -> releases/<version>
  bin/dash -> ../current/bin/dash
  dist -> current/dist
  deploy -> current/deploy
  configs/
    config.example.yaml
    config.local.yaml
    notify-config.key
  runtime/
  logs/
  themes/
  install_id
  run_dash.sh
```

`configs`、`runtime`、`logs`、`themes` 和 `install_id` 位于 release 之外。旧平铺路径是兼容别名，不是独立副本。

systemd 模式还会写入 `/etc/systemd/system/dash.service`。配置和敏感文件仅允许运行用户或 root 读取。

## 安装配置

| 项 | 约束 |
| --- | --- |
| `app.listen` | Dash 监听地址，例如 `:8080` |
| `app.public_url` | 根路径 HTTP(S) URL；生产环境应使用 HTTPS 域名 |
| `app.node_offline_threshold` | 必须大于 0 |
| `database.*` | PostgreSQL 16+ 和匹配主版本的 TimescaleDB |
| `redis.*` | Redis 6.2.0+；账号必须允许 `PING` 和 `INFO server` |
| `monitor_dash_pwd` | 至少 8 个可见 ASCII 字符，不得包含空白 |
| `auth.jwt_signing_key` | 至少 32 字节，不得有首尾空白 |

安装器在执行 `dash migrate` 后启动服务。迁移会生成 `$DASH_HOME/configs/notify-config.key`；该文件必须与 PostgreSQL 备份分开保存。

## 服务管理

```bash
systemctl status dash.service
journalctl -u dash.service -f
systemctl restart dash.service
```

手工模式：

```bash
sudo /opt/Ithiltir-dash/run_dash.sh
```

## 生命周期边界

首次安装成功后不得重复运行安装器。所有版本变化使用：

```bash
sudo /opt/Ithiltir-dash/bin/dash update
```

安装器和更新器不得并发运行。升级、重新安装和恢复见 [升级与迁移](./upgrade.md)。

## 手工迁移

```bash
sudo env DASH_HOME=/opt/Ithiltir-dash \
  /opt/Ithiltir-dash/bin/dash migrate \
  -config /opt/Ithiltir-dash/configs/config.local.yaml
```

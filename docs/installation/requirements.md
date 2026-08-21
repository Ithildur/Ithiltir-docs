---
slug: /Install/Requirements
---

# 运行要求

## Dash

| 项目 | 要求 |
| --- | --- |
| 操作系统 | 发布包当前面向 Linux amd64 和 Linux arm64 |
| 数据库 | PostgreSQL 16+ |
| 时序扩展 | 为相同 PostgreSQL 主版本构建的 TimescaleDB |
| 缓存 | Redis 6.2.0+；推荐 8.2.3+ |
| 内存 | 推荐最小 2 GB RAM；4 GB 以下建议启用 SWAP |
| 磁盘 | 推荐 SSD/NVMe，最小 40 GB 起步 |
| 时间同步 | 必须启用 NTP/chrony/systemd-timesyncd |

这些是运行时依赖，不等于安装前都要手工准备。发布包安装脚本会先检测，再按需安装或复用。

## Linux 安装脚本支持范围

Dash 发布包里的 `install_dash_linux.sh` 支持：

- Debian 11+
- Ubuntu 22+
- RHEL / Rocky / Alma / Oracle / CentOS 8+
- Fedora 33+
- Arch / Manjaro

安装脚本的服务管理器支持 `systemd` 和显式 `none`。自动检测只在 systemd 确实运行时选择 systemd；非 systemd 主机必须传 `--service-manager=none`，该模式只安装文件和手工启动脚本。

| 系统族 | 包管理器 | 脚本行为 |
| --- | --- | --- |
| Debian / Ubuntu | `apt-get` | 安装基础工具，配置 PostgreSQL PGDG 源和 TimescaleDB 源，安装 PostgreSQL 16、TimescaleDB、Redis |
| RHEL / Rocky / Alma / Oracle / CentOS / Fedora | `dnf` / `yum` | 配置 PostgreSQL 源，安装 PostgreSQL 16、TimescaleDB、Redis |
| Arch / Manjaro | `pacman` | 使用系统仓库安装 PostgreSQL、TimescaleDB、Redis |
| Alpine | `apk` | 要求预先安装并启动 PostgreSQL 16+、匹配的 TimescaleDB 和 Redis 6.2.0+ |

已有 PostgreSQL 16+、TimescaleDB 或 Redis 满足要求时，脚本会复用。受限服务器、离线服务器、外部数据库/Redis 或不支持的发行版才需要手工准备。

## Redis

Dash 运行时支持 Redis `6.2.0+`，推荐 `8.2.3+`。启动会对实际配置端点执行 `PING` 和 `INFO server`，因此 Redis ACL 用户必须允许这两个命令。低于最低版本、服务不可达或无法读取版本时 Dash 停止启动；低于推荐版本时只记录 warning。

安装器自行部署 Redis 时以推荐版本为目标。系统仓库无法提供 `8.2.3+` 时，可以选择源码安装/升级，默认源码版本为 `8.2.5`。只使用远程 Redis 时，不要求本机存在 `redis-server` 二进制。

Redis 默认保存：

- 管理会话。
- 前台热点快照。

`dash --no-redis` 可以启动，但会话和前台缓存改为进程内存，重启后丢失。告警 pending/cooldown 和 MTProto 登录握手在两种模式下都属于进程内状态。

## 数据库保留策略

默认保留：

- 普通指标：`45 days`。
- 流量 5 分钟事实表：`max(database.retention_days, 45)`。

需要 95 计费历史时，`database.traffic_retention_days` 建议设置为 `90` 或更高。

## Ithiltir-node

| 平台 | 架构 | 服务管理 |
| --- | --- | --- |
| Linux | amd64、arm64 | systemd、Alpine/OpenRC、显式 `none` |
| macOS | arm64 | LaunchDaemon |
| Windows | amd64、arm64 | Windows Service + runner |

节点需要能访问 Dash 的 `app.public_url`。Push 模式使用 HTTP(S) 向 Dash 上报，不需要 Dash 主动连接节点。

Linux Node 脚本需要 root/sudo、`pgrep`、`curl` 或 `wget`。Alpine/OpenRC 还需要预先安装 `bash`、`ca-certificates`、`coreutils`，并由 `supervise-daemon` 管理进程。其他 OpenRC 发行版仅尽力兼容。检测到 LVM/LVM-thin 时会启用 thinpool 缓存采集。

## 构建环境

只有 Dash 源码构建或自定义打包需要：

- Go 1.26.6+
- Bun 1.3.11
- Git
- tar 或 zip
- GoReleaser；节点构建脚本会在缺失时安装 `v2.15.2`

文档站构建需要 Node.js 24（`>=24 <25`）。

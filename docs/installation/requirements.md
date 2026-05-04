---
slug: /Install/Requirements
---

# 运行要求

## Dash

| 项目 | 要求 |
| --- | --- |
| 操作系统 | 发布包当前面向 Linux amd64 和 Linux arm64 |
| 数据库 | PostgreSQL 16+ |
| 时序扩展 | TimescaleDB |
| 缓存 | Redis |
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

安装脚本依赖 systemd。没有 `systemctl` 的系统不走自动安装脚本。

| 系统族 | 包管理器 | 脚本行为 |
| --- | --- | --- |
| Debian / Ubuntu | `apt-get` | 安装基础工具，配置 PostgreSQL PGDG 源和 TimescaleDB 源，安装 PostgreSQL 16、TimescaleDB、Redis |
| RHEL / Rocky / Alma / Oracle / CentOS / Fedora | `dnf` / `yum` | 配置 PostgreSQL 源，安装 PostgreSQL 16、TimescaleDB、Redis |
| Arch / Manjaro | `pacman` | 使用系统仓库安装 PostgreSQL、TimescaleDB、Redis |

已有 PostgreSQL 16+、TimescaleDB 或 Redis 满足要求时，脚本会复用。受限服务器、离线服务器、外部数据库/Redis 或不支持的发行版才需要手工准备。

## Redis

安装脚本按 Redis 8.2+ 处理。已有 Redis 被检测到且版本满足要求时会复用；缺失或版本不足时，先尝试包管理器，再提示源码安装/升级。

Redis 默认保存：

- 管理会话。
- 前台热点快照。
- 告警运行时状态。

`dash --no-redis` 可以启动，但这些状态改为进程内存，重启后丢失。

## 数据库保留策略

默认保留：

- 普通指标：`45 days`。
- 流量 5 分钟事实表：`max(database.retention_days, 45)`。

需要 95 计费历史时，`database.traffic_retention_days` 建议设置为 `90` 或更高。

## Ithiltir-node

| 平台 | 架构 | 服务管理 |
| --- | --- | --- |
| Linux | amd64、arm64 | systemd |
| macOS | arm64 | LaunchDaemon |
| Windows | amd64、arm64 | Windows Service + runner |

节点需要能访问 Dash 的 `app.public_url`。Push 模式使用 HTTP(S) 向 Dash 上报，不需要 Dash 主动连接节点。

Linux 节点脚本需要 root/sudo、systemd、`curl` 或 `wget`。检测到 LVM/LVM-thin 时会启用 thinpool 缓存采集；在 `apt-get` 系统上会自动安装 `cron`，不需要提前手工安装。

## 构建环境

只有源码构建或自定义打包需要：

- Go 1.26+
- Bun 1.3.11
- Git
- tar 或 zip
- GoReleaser；节点构建脚本会在缺失时安装 `v2.15.2`

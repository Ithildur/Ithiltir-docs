---
slug: /QuickStart
---

# 快速开始

从 GitHub Release 下载 Dash 发布包，安装 Dash，再接入一台节点。

## 1. 下载 Dash 发布包

选择目标架构：

| 架构 | 适用机器 |
| --- | --- |
| `amd64` | x86_64 / AMD64 |
| `arm64` | ARM64 / AArch64 |

下载最新稳定发布：

```bash
ARCH=amd64
curl -fL -o "Ithiltir_dash_linux_${ARCH}.tar.gz" \
  "https://github.com/Ithildur/Ithiltir/releases/latest/download/Ithiltir_dash_linux_${ARCH}.tar.gz"
```

如需固定版本：

```bash
VERSION=1.2.3
ARCH=amd64
curl -fL -o "Ithiltir_dash_linux_${ARCH}.tar.gz" \
  "https://github.com/Ithildur/Ithiltir/releases/download/${VERSION}/Ithiltir_dash_linux_${ARCH}.tar.gz"
```

## 2. 解压并安装 Dash

```bash
tar -xzf "Ithiltir_dash_linux_${ARCH}.tar.gz"
cd Ithiltir-dash
sudo bash install_dash_linux.sh --lang zh
```

安装时 `app.public_url` 填写 HTTPS 域名根地址，例如 `https://dash.example.com`，并用 Nginx 或 Caddy 反向代理到本机 Dash。`http://IP:端口` 适用于本机验证或临时内网测试。

在支持的 systemd Linux 发行版上，安装脚本会检测并准备运行依赖：

- PostgreSQL 16+。
- TimescaleDB。
- Redis 8.2+。
- 迁移、服务文件、管理员密码环境变量。

Debian/Ubuntu 这类 `apt-get` 系统不需要先手工安装 PostgreSQL、TimescaleDB 或 Redis；脚本会按提示使用包管理器和对应仓库处理。只有源码运行、受限服务器、外部数据库/Redis 或不支持的发行版才需要自己准备依赖。

安装完成后访问安装时填写的 `app.public_url`，再打开 `/login` 进入管理台。

## 3. 创建节点

在管理台创建节点，取得节点的上报密钥。节点上报接口是：

```text
<app.public_url>/api/node/metrics
```

## 4. 安装 Linux 节点

Linux 节点可以使用 Dash 提供的安装脚本：

```bash
curl -fsSL https://dash.example.com/deploy/linux/install.sh -o install_node.sh
sudo bash install_node.sh dash.example.com 443 '<node-secret>'
```

临时内网 HTTP 或自定义端口按真实地址填写：

```bash
sudo bash install_node.sh 10.0.0.2 8080 '<node-secret>' 3 --net eth0,eth1
```

正式节点接入应使用域名 HTTPS，并在需要时加 `--require-https`。

节点安装后默认以 Push 模式运行，向 Dash 的 `/api/node/metrics` 上报指标。

Linux 节点脚本会下载 Dash 打包携带的节点二进制并注册 systemd 服务。检测到 LVM/LVM-thin 时，会尝试安装并启用 cron 采集 thinpool 缓存；`apt-get` 系统不需要提前手工安装 cron。

## 5. 验证

在 Dash 看板检查节点是否在线。节点侧可以检查服务：

```bash
systemctl status ithiltir-node
journalctl -u ithiltir-node -f
```

## 源码快速验证

源码路径适合开发和配置验证，需要准备：

- Go 1.26+。
- Bun 1.3.11。
- PostgreSQL 16+、TimescaleDB。
- Redis，或本地试用时使用 `--no-redis`。

复制配置模板：

```bash
cp configs/config.example.yaml config.local.yaml
```

至少填写这些字段：

- `app.listen`
- `app.public_url`
- `database.user`
- `database.name`
- `redis.addr`
- `auth.jwt_signing_key`

管理员登录密码只从环境变量读取：

```bash
export monitor_dash_pwd='<password>'
```

`app.public_url` 必须是根路径 URL。正式部署使用 `https://dash.example.com`；`http://10.0.0.2:8080` 这类 IP+HTTP 用于临时验证。不能带 `/dash` 这类路径前缀。

执行迁移：

```bash
go run ./cmd/dash migrate -config config.local.yaml
```

启动 Dash：

```bash
go run ./cmd/dash -debug
```

单机本地页面可以通过 Local 模式运行：

```bash
./node local
```

默认访问 `http://127.0.0.1:9100/`。

## 下一步

- Dash 配置见 [Dash 配置](../configuration/dash.md)。
- 节点模式见 [节点概览](../components/node/index.md)。
- 反向代理见 [反向代理](../installation/reverse-proxy.md)。
- 生产上线前按 [生产部署检查清单](../guides/production-deployment.md) 核对。

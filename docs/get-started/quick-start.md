---
slug: /QuickStart
---

# 快速开始

安装 Dash，接入第一台 Linux 节点，在看板查看实时 CPU 和内存指标。只需查看本机状态时，也可以使用 [Node 本地模式](../components/node/local.md)。

:::note[开始前]

准备一台[受支持的 Linux 主机](../installation/requirements.md)、管理员权限，以及节点能够访问的 Dash 地址。

:::

## 1. 安装 Dash

### 下载发布包 {/* #1-下载-dash-发布包 */}

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

<details>
<summary>安装指定版本</summary>

```bash
VERSION=1.2.3
ARCH=amd64
curl -fL -o "Ithiltir_dash_linux_${ARCH}.tar.gz" \
  "https://github.com/Ithildur/Ithiltir/releases/download/${VERSION}/Ithiltir_dash_linux_${ARCH}.tar.gz"
```

</details>

### 运行安装脚本 {/* #2-解压并安装-dash */}

```bash
tar -xzf "Ithiltir_dash_linux_${ARCH}.tar.gz"
cd Ithiltir-dash
sudo bash install_dash_linux.sh --lang zh --service-manager=systemd
```

安装时 `app.public_url` 填写 HTTPS 域名根地址，例如 `https://dash.example.com`，并用 Nginx 或 Caddy 反向代理到本机 Dash。`http://IP:端口` 适用于本机验证或临时内网测试。

在支持的 systemd Linux 发行版上，安装脚本会检测并准备运行依赖：

- PostgreSQL 16+。
- TimescaleDB。
- Redis 6.2.0+；推荐 8.2.3+。
- 迁移、服务文件、管理员密码环境变量。

在受支持的 Debian/Ubuntu 系统上，安装器通过 `apt-get` 准备本机依赖。其他发行版和手动安装要求见[运行要求](../installation/requirements.md)。

安装完成后访问安装时填写的 `app.public_url`，再打开 `/login` 进入管理台。

## 2. 接入第一台节点

### 在 Dash 中创建节点 {/* #3-创建节点 */}

在管理台的「节点概览」中新增节点，复制与目标操作系统对应的部署命令。命令中包含该节点的上报密钥。节点向以下地址上报：

```text
<app.public_url>/api/node/metrics
```

### 在节点上运行安装脚本 {/* #4-安装-linux-节点 */}

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

Linux Node 脚本支持 systemd、Alpine/OpenRC 和显式 `none`。systemd 使用 timer 采集 SMART、连接数和 LVM thinpool；OpenRC 使用 BusyBox cron 采集 SMART 和 LVM，并由 Node 自行统计连接数。

## 3. 验证上报 {/* #5-验证 */}

打开 Dash 看板，按名称找到刚接入的节点。

:::tip[预期结果]

节点显示在线，并且已有 CPU 和内存读数。

:::

如果节点持续离线且使用 systemd，检查服务状态和日志。

```bash
systemctl status ithiltir-node
journalctl -u ithiltir-node -f
```

其他节点平台见 [macOS 安装](../installation/node-macos.md)和 [Windows 安装](../installation/node-windows.md)。上报异常时，按[排错指南](../operations/troubleshooting.md)检查。

## 源码快速验证

源码路径适合开发和配置验证，需要准备：

- Go 1.27.3+。
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

密码至少 8 个可见 ASCII 字符且不得包含空白。`auth.jwt_signing_key` 至少 32 字节且不得有首尾空白。

`app.public_url` 必须是根路径 URL。正式部署使用 `https://dash.example.com`；`http://10.0.0.2:8080` 这类 IP+HTTP 用于临时验证。不能带 `/dash` 这类路径前缀。

执行迁移：

```bash
go run ./cmd/dash migrate -config config.local.yaml
```

启动 Dash：

```bash
go run ./cmd/dash -debug
```

单机本地页面可以通过本地模式运行：

```bash
./node local
```

默认访问 `http://127.0.0.1:9100/`。

## 下一步

- Dash 配置见 [Dash 配置](../configuration/dash.md)。
- 节点模式见 [节点概览](../components/node/index.md)。
- 反向代理见 [反向代理](../installation/reverse-proxy.md)。
- 生产上线前按 [生产部署检查清单](../installation/production-deployment.md) 核对。

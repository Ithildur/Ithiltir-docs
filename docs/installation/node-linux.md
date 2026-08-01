---
slug: /Install/NodeLinux
---

# 安装 Linux Node

Linux Node 安装脚本由 Dash 提供：

```text
https://dash.example.com/deploy/linux/install.sh
```

脚本支持 `amd64` 和 `arm64`，并从当前 Dash 发布包下载受保护的 Node 资产。下载请求携带 `X-Node-Secret`。

## 运行方式

| 模式 | 支持范围 | 结果 |
| --- | --- | --- |
| `systemd` | 运行中的 systemd | 注册 Node 服务和采集 timer |
| `openrc` | Alpine/OpenRC | 使用 `supervise-daemon`；其他 OpenRC 发行版为尽力兼容 |
| `none` | 手工运行 | 只安装文件和启动命令，不注册服务 |
| `auto` | 自动检测 | 没有可用服务管理器时失败 |

Alpine 需要预先安装 `bash`、`ca-certificates`、`curl` 和 `coreutils`。所有模式都要求 `pgrep`，用于停止受管安装路径中的旧进程。

## 安装命令

```bash
curl -fsSL https://dash.example.com/deploy/linux/install.sh -o install_node.sh
sudo bash install_node.sh dash.example.com 443 '<node-secret>' \
  --require-https --service-manager=systemd
```

完整参数：

```text
sudo bash install_node.sh <dash_ip> [dash_port] <secret> [interval_seconds] \
  [--net iface1,iface2] [--require-https] \
  [--service-manager=auto|systemd|openrc|none]
```

只传 `<dash_ip> <secret>` 时，HTTPS 使用端口 `443`，HTTP 使用端口 `80`。`--require-https` 同时约束写入的上报地址。

安装器最多跟随 5 次下载重定向。目标必须保持初始主机；同协议重定向必须保持有效端口；只允许从 HTTP 升级到 HTTPS，不允许降级。该规则避免把 Node secret 发送到其他主机。

## 强制安装语义

脚本每次执行都会强制替换受管安装：

1. 把候选二进制暂存到 `releases` 下。
2. 执行候选二进制的 `--version`。
3. 停止已有 systemd、OpenRC 或匹配的手工进程。
4. 替换目标 release、上报配置、服务定义和采集器。
5. 原子切换 `current` 并启动选定运行方式。

相同版本也会被替换。该路径用于安装或强制重装；Node 版本升级和回滚由 Node 自更新负责。

## 文件布局

```text
/var/lib/ithiltir-node/
  report.yaml
  releases/<version>/ithiltir-node
  current -> releases/<version>
```

运行用户拥有数据目录和 release 树，以便非特权自更新器创建 release 并切换 `current`。root 所有的服务与采集器资产位于该目录之外。

| 路径 | 内容 |
| --- | --- |
| `/etc/systemd/system/ithiltir-node.service` | systemd 服务 |
| `/etc/init.d/ithiltir-node` | OpenRC 服务 |
| `/opt/node/run_node_openrc.sh` | OpenRC 启动脚本 |
| `/run/ithiltir-node/smart.json` | SMART 缓存 |
| `/run/ithiltir-node/connections.json` | TCP/UDP 连接数缓存 |
| `/run/ithiltir-node/thinpool.json` | LVM thinpool 缓存 |

## 采集器

systemd 使用 timer 调度：

- SMART：每 5 分钟。
- TCP/UDP 连接数 helper：每 1 秒。
- 检测到 LVM 时启用 thinpool timer。

连接数 helper 需要 `cc`、`gcc` 或 `clang`。无法编译时，Node 使用内置统计，可能缺少容器网络命名空间中的连接。

Alpine/OpenRC 使用 BusyBox `crond` 每 5 分钟刷新 SMART，检测到 LVM 时每分钟刷新 thinpool。OpenRC 不运行 1 秒连接数 helper，使用 Node 内置统计。

SMART、连接数或 LVM 缓存不可用时，不影响 CPU、内存、容量和网络等基础指标上报。

## 服务管理

systemd：

```bash
systemctl status ithiltir-node.service
journalctl -u ithiltir-node.service -f
systemctl restart ithiltir-node.service
```

OpenRC：

```bash
rc-service ithiltir-node status
rc-service ithiltir-node restart
```

查看上报配置：

```bash
/var/lib/ithiltir-node/current/ithiltir-node report list
```

---
slug: /Install/NodeLinux
---

# 安装 Linux 节点

Linux 节点安装脚本由 Dash 提供：

```text
https://dash.example.com/deploy/linux/install.sh
```

脚本会下载 Dash 当前打包的 `node_linux_<arch>`，配置 Push 上报，并注册 systemd 服务。节点侧不需要单独下载 GitHub Release 二进制。

脚本要求 root/sudo、systemd、`curl` 或 `wget`。检测到 LVM/LVM-thin 时会安装并启用 thinpool 采集所需的 cron；Debian/Ubuntu 等 `apt-get` 系统不需要提前手工安装 cron。

## 安装命令

```bash
curl -fsSL https://dash.example.com/deploy/linux/install.sh -o install_node.sh
sudo bash install_node.sh dash.example.com 443 '<node-secret>'
```

完整参数：

```text
sudo bash install_node.sh <dash_ip> [dash_port] <secret> [interval_seconds] [--net iface1,iface2] [--require-https]
```

如果只传 `<dash_ip> <secret>`，端口按脚本渲染出的 `DOWNLOAD_SCHEME` 推断：HTTPS 用 `443`，HTTP 用 `80`。

## 安装结果

| 路径 | 内容 |
| --- | --- |
| `/var/lib/ithiltir-node/releases/<version>/ithiltir-node` | 当前版本节点二进制 |
| `/var/lib/ithiltir-node/current` | 指向当前 release 的软链接 |
| `/var/lib/ithiltir-node/report.yaml` | 上报目标配置 |
| `/etc/systemd/system/ithiltir-node.service` | systemd 服务 |
| `/run/ithiltir-node/thinpool.json` | LVM thinpool 缓存 |
| `/opt/node/collect_thinpool.sh` | LVM thinpool 采集脚本 |
| `/etc/cron.d/ithiltir-node-thinpool` | thinpool 采集 cron |

服务默认使用 `ithiltir` 系统用户运行，工作目录为 `/var/lib/ithiltir-node`。

## systemd 安全边界

Linux 服务开启：

- `NoNewPrivileges=true`
- `PrivateTmp=true`
- `ProtectSystem=strict`
- `ProtectHome=true`
- `ReadWritePaths=/var/lib/ithiltir-node`

因此节点进程只应写入数据目录。

## LVM thinpool

安装脚本检测到 LVM / LVM-thin 后，会启用 thinpool 缓存采集：

```bash
cat /run/ithiltir-node/thinpool.json
```

如果系统没有 LVM，脚本会删除旧的 cron 和采集脚本。

## 常用命令

```bash
systemctl status ithiltir-node.service
journalctl -u ithiltir-node.service -f
systemctl restart ithiltir-node.service
```

查看上报配置：

```bash
/var/lib/ithiltir-node/current/ithiltir-node report list
```

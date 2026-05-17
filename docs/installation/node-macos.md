---
slug: /Install/NodeMacOS
---

# 安装 macOS 节点

macOS 节点安装脚本由 Dash 提供：

```text
https://dash.example.com/deploy/macos/install.sh
```

当前 macOS 节点只支持 arm64。

## 安装命令

```bash
curl -fsSL https://dash.example.com/deploy/macos/install.sh -o install_node.sh
sudo bash install_node.sh dash.example.com 443 '<node-secret>'
```

完整参数：

```text
sudo bash install_node.sh <dash_ip> [dash_port] <secret> [interval_seconds] [--net iface1,iface2] [--require-https]
```

## 安装结果

| 路径 | 内容 |
| --- | --- |
| `/var/lib/ithiltir-node/releases/<version>/ithiltir-node` | 当前版本节点二进制 |
| `/var/lib/ithiltir-node/current` | 指向当前 release 的软链接 |
| `/var/lib/ithiltir-node/report.yaml` | 上报目标配置 |
| `/Library/LaunchDaemons/com.ithiltir.node.plist` | LaunchDaemon |
| `/var/log/ithiltir-node.log` | 标准输出 |
| `/var/log/ithiltir-node.err` | 标准错误 |

`current` 软链接和 `releases/<version>` 目录也是 macOS 托管自更新的边界。安装布局外直接运行的二进制不会处理 Dash 返回的 update manifest。

## 服务管理

```bash
sudo launchctl print system/com.ithiltir.node
sudo launchctl kickstart -k system/com.ithiltir.node
tail -f /var/log/ithiltir-node.log /var/log/ithiltir-node.err
```

## 权限

如果用 `sudo` 执行，脚本会尽量把 `/var/lib/ithiltir-node` 归属给原始 `SUDO_USER`。如果 `RUN_USER=root` 或未能识别用户，则以 root 运行。

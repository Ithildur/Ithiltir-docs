---
slug: /Dash/Deploy
title: Deployment Assets
---

# 部署资产

Dash 发布包会携带 Ithiltir-node 二进制和安装脚本，并通过 `/deploy` 分发给节点。

## HTTP 路径

| 路径 | 内容 |
| --- | --- |
| `/deploy/linux/install.sh` | Linux 节点安装脚本 |
| `/deploy/macos/install.sh` | macOS 节点安装脚本 |
| `/deploy/windows/install.ps1` | Windows 节点安装脚本 |
| `/deploy/linux/node_linux_amd64` | Linux amd64 节点二进制 |
| `/deploy/linux/node_linux_arm64` | Linux arm64 节点二进制 |
| `/deploy/macos/node_macos_arm64` | macOS arm64 节点二进制 |
| `/deploy/windows/node_windows_amd64.exe` | Windows amd64 节点二进制 |
| `/deploy/windows/node_windows_arm64.exe` | Windows arm64 节点二进制 |
| `/deploy/windows/runner_windows_amd64.exe` | Windows amd64 runner |
| `/deploy/windows/runner_windows_arm64.exe` | Windows arm64 runner |

Install script download schemes, hosts, and paths come from `app.public_url`. Therefore `app.public_url` must be the real address reachable by nodes.

Production deployments should use an HTTPS domain as `app.public_url`, with Nginx/Caddy reverse-proxying to Dash. Direct `http://IP:port` pins node installation, binary downloads, and report targets to a raw HTTP address; use it only for temporary validation.

## 本地节点资产布局

打包 Dash 时可以用 `--node-local` 或 `--node-local-dir` 从本地读取节点资产。接受两种布局。

目录布局：

```text
linux/node_linux_amd64
linux/node_linux_arm64
macos/node_macos_arm64
windows/node_windows_amd64.exe
windows/node_windows_arm64.exe
windows/runner_windows_amd64.exe
windows/runner_windows_arm64.exe
```

扁平 release asset 命名：

```text
Ithiltir-node-linux-amd64
Ithiltir-node-linux-arm64
Ithiltir-node-macos-arm64
Ithiltir-node-windows-amd64.exe
Ithiltir-node-windows-arm64.exe
Ithiltir-runner-windows-amd64.exe
Ithiltir-runner-windows-arm64.exe
```

## 打包示例

```bash
bash scripts/package.sh \
  --version 1.2.3-alpha.1 \
  --node-version 1.2.3-alpha.1 \
  --node-local \
  -o release \
  -t linux/amd64 \
  --tar-gz
```

省略 `--node-version` 时，脚本会从 `https://github.com/Ithildur/Ithiltir-node.git` 解析最新兼容 tag。

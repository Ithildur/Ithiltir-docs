---
slug: /Dash/Deploy
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

安装脚本里的下载 scheme、host 和路径来自 `app.public_url`。因此 `app.public_url` 必须是节点可访问的真实地址。

生产环境应使用 HTTPS 域名作为 `app.public_url`，并通过 Nginx/Caddy 反向代理到 Dash。直接 `http://IP:端口` 会把节点安装、二进制下载和上报入口都固定到裸 HTTP 地址，只应作为临时验证使用。

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

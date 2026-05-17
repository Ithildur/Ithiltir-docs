---
slug: /Node/Install
---

# 安装节点

节点推荐通过 Dash 的 `/deploy` 安装脚本安装。脚本会下载 Dash 打包携带的节点二进制，并配置 Push 上报。

## Linux

下载安装脚本：

```bash
curl -fsSL https://dash.example.com/deploy/linux/install.sh -o install_node.sh
```

安装：

```bash
sudo bash install_node.sh dash.example.com 443 '<node-secret>'
```

参数：

```text
sudo bash install_node.sh <dash_ip> [dash_port] <secret> [interval_seconds] [--net iface1,iface2]
```

示例：

```bash
sudo bash install_node.sh 10.0.0.2 8080 'my secret' 3 --net eth0,eth1
```

Linux 支持 `amd64` 和 `arm64`。安装后服务名为 `ithiltir-node`。

Linux 安装脚本会尝试安装 `smartmontools`，并启用 `ithiltir-node-smart-cache.timer` 刷新 `/run/ithiltir-node/smart.json`。SMART 安装失败不影响基础监控。

常用检查：

```bash
systemctl status ithiltir-node
journalctl -u ithiltir-node -f
```

## macOS

下载安装脚本：

```bash
curl -fsSL https://dash.example.com/deploy/macos/install.sh -o install_node.sh
```

安装：

```bash
sudo bash install_node.sh dash.example.com 443 '<node-secret>'
```

macOS 当前只支持 `arm64`。服务使用 LaunchDaemon：

```bash
sudo launchctl print system/com.ithiltir.node
tail -f /var/log/ithiltir-node.log /var/log/ithiltir-node.err
```

## Windows

下载安装脚本：

```powershell
Invoke-WebRequest -Uri "https://dash.example.com/deploy/windows/install.ps1" -OutFile ".\install_node.ps1"
```

用管理员 PowerShell 执行：

```powershell
powershell -ExecutionPolicy Bypass -File .\install_node.ps1 dash.example.com 443 "<node-secret>"
```

参数：

```text
install_node.ps1 <dash_ip> [dash_port] <secret> [interval_seconds] [extra args...]
```

Windows 支持 `amd64` 和 `arm64`。脚本会安装 `ithiltir-runner.exe`，由 runner 托管 `ithiltir-node.exe`。

检查服务：

```powershell
Get-Service ithiltir-node
```

## HTTPS 严格模式

默认 HTTPS target 允许按客户端规则回落 HTTP。需要禁止回落时添加：

```bash
--require-https
```

Linux 示例：

```bash
sudo bash install_node.sh dash.example.com 443 '<node-secret>' 3 --require-https
```

## 手动运行

本地页面：

```bash
./node local
```

Push：

```bash
./node report install https://dash.example.com/api/node/metrics '<node-secret>'
./node push 3
```

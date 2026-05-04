---
slug: /Install/NodeWindows
---

# 安装 Windows 节点

Windows 节点由 PowerShell 安装脚本安装，并通过 `ithiltir-runner.exe` 托管 node。

## 安装命令

用管理员 PowerShell 执行：

```powershell
Invoke-WebRequest -Uri "https://dash.example.com/deploy/windows/install.ps1" -OutFile ".\install_node.ps1"
powershell -ExecutionPolicy Bypass -File .\install_node.ps1 dash.example.com 443 "<node-secret>"
```

完整参数：

```text
install_node.ps1 <dash_ip> [dash_port] <secret> [interval_seconds] [extra args...]
```

如果省略端口，脚本按 Dash 渲染出的 scheme 推断：HTTPS 用 `443`，HTTP 用 `80`。

## 安装结果

| 路径 | 内容 |
| --- | --- |
| `%ProgramData%\Ithiltir-node\bin\ithiltir-node.exe` | node 二进制 |
| `%ProgramData%\Ithiltir-node\report.yaml` | 上报目标配置 |
| `%ProgramData%\Ithiltir-node\staging` | 暂存更新目录 |
| `%ProgramFiles%\Ithiltir-node\ithiltir-runner.exe` | runner |
| Windows 服务 `ithiltir-node` | 自动启动服务 |

## Runner

服务实际启动的是 runner：

```powershell
ithiltir-runner.exe push [interval_seconds] [extra args...]
```

runner 做三件事：

1. 设置 `ITHILTIR_NODE_RUNNER=1`。
2. 启动 `%ProgramData%\Ithiltir-node\bin\ithiltir-node.exe`。
3. 检查暂存更新，替换 node 后重启。

直接运行 `ithiltir-node.exe push` 会忽略 Dash 返回的更新 manifest。

## 服务检查

```powershell
Get-Service ithiltir-node
```

日志在 Windows 事件查看器：

```text
Event Viewer -> Windows Logs -> Application/System
```

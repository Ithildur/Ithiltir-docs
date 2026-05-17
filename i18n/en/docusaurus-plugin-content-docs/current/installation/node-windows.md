---
slug: /Install/NodeWindows
title: Install Windows Node
---

# Install Windows Node

Windows nodes are installed with the PowerShell script served by Dash and managed by `ithiltir-runner.exe`.

## Install Command

Run in Administrator PowerShell:

```powershell
Invoke-WebRequest -Uri "https://dash.example.com/deploy/windows/install.ps1" -OutFile ".\install_node.ps1"
powershell -ExecutionPolicy Bypass -File .\install_node.ps1 dash.example.com 443 "<node-secret>"
```

Full arguments:

```text
install_node.ps1 <dash_ip> [dash_port] <secret> [interval_seconds] [extra args...]
```

If the port is omitted, the script infers it from the rendered scheme: HTTPS uses `443`, HTTP uses `80`.

## Installed Files

| Path | Content |
| --- | --- |
| `%ProgramData%\Ithiltir-node\bin\ithiltir-node.exe` | node binary |
| `%ProgramData%\Ithiltir-node\report.yaml` | report target config |
| `%ProgramData%\Ithiltir-node\staging` | staged update directory |
| `%ProgramFiles%\Ithiltir-node\ithiltir-runner.exe` | runner |
| Windows service `ithiltir-node` | auto-start service |

## Runner

The service starts runner:

```powershell
ithiltir-runner.exe push [interval_seconds] [extra args...]
```

Runner:

1. Sets `ITHILTIR_NODE_RUNNER=1`.
2. Starts `%ProgramData%\Ithiltir-node\bin\ithiltir-node.exe`.
3. Checks staged updates, replaces node, and restarts it.

Direct `ithiltir-node.exe push` ignores update manifests returned by Dash.

## Service Check

```powershell
Get-Service ithiltir-node
```

Logs are in Windows Event Viewer:

```text
Event Viewer -> Windows Logs -> Application/System
```

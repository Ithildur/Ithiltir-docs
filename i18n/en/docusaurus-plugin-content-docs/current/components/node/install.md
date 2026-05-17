---
slug: /Node/Install
title: Node Install
---

# Node Install

Node installers are served by Dash under `/deploy`. The node host does not need to download GitHub Release binaries directly.

## Linux

```bash
curl -fsSL https://dash.example.com/deploy/linux/install.sh -o install_node.sh
sudo bash install_node.sh dash.example.com 443 '<node-secret>' 3 --net eth0,eth1
```

Linux supports `amd64` and `arm64`. The service name is `ithiltir-node`.

The Linux installer attempts to install `smartmontools` and enables `ithiltir-node-smart-cache.timer` to refresh `/run/ithiltir-node/smart.json`. SMART setup failure does not stop base monitoring.

Common checks:

```bash
systemctl status ithiltir-node.service
journalctl -u ithiltir-node.service -n 100 --no-pager
```

## macOS

```bash
curl -fsSL https://dash.example.com/deploy/macos/install.sh -o install_node.sh
sudo bash install_node.sh dash.example.com 443 '<node-secret>' 3
```

macOS currently supports arm64.

## Windows

Run in Administrator PowerShell:

```powershell
Invoke-WebRequest -Uri "https://dash.example.com/deploy/windows/install.ps1" -OutFile ".\install_node.ps1"
powershell -ExecutionPolicy Bypass -File .\install_node.ps1 dash.example.com 443 "<node-secret>" 3
```

Windows installs runner and the `ithiltir-node` service.

## Extra Arguments

Install scripts pass extra arguments to `push`:

- `--net iface1,iface2`
- `--require-https`

`--require-https` rejects non-HTTPS targets and disables HTTP fallback.

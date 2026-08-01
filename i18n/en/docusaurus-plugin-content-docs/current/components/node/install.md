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

Full Linux options include `--require-https` and `--service-manager=auto|systemd|openrc|none`. Linux supports amd64 and arm64. Alpine/OpenRC uses `supervise-daemon`; other OpenRC distributions are best-effort.

The Linux installer attempts to install `smartmontools` and enables `ithiltir-node-smart-cache.timer` to refresh `/run/ithiltir-node/smart.json`. SMART setup failure does not stop base monitoring.

On systemd, `cc`, `gcc`, or `clang` enables a root connections helper refreshed every second. OpenRC and hosts without a compiler use built-in counting, which may miss container namespaces.

Every installer run is a force install: it stages and executes the candidate, then replaces the managed release, report config, service definitions, and collectors before switching `current`. Reinstalling the same version replaces it; Node self-update owns upgrade rollback.

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

All three platform installers follow at most five asset redirects. They keep the original host and same-scheme effective port, allow only HTTP-to-HTTPS upgrades, and send `X-Node-Secret` after hop validation.

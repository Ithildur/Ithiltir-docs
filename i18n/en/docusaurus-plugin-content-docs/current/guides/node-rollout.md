---
slug: /Guides/NodeRollout
title: Node Rollout
---

# Node Rollout

Each node should use an individual secret and write `report.yaml` to its local service directory.

## Reporting Model

Each node stores:

```yaml
version: 1
targets:
  - id: 1
    url: https://dash.example.com/api/node/metrics
    key: node-secret
    server_install_id: dash-install-id
```

`report install` calls sibling `/api/node/identity`, reads `server_install_id`, and writes config with atomic rename and `0600` permissions.

Node secrets are trimmed before validation. They must contain 8–128 Unicode characters and must be distinct across nodes.

## Create Nodes

Before creating nodes in Dash, prepare:

- Node name.
- Group.
- Guest visibility.
- Reporting secret.
- Traffic billing participation.
- P95 setting.
- Node-level billing cycle override, if required.

Batch rollout can use a table:

| Host | OS | Arch | Group | NIC | secret |
| --- | --- | --- | --- | --- | --- |
| `web-01` | Linux | amd64 | web | `eth0` | unique |
| `db-01` | Linux | arm64 | db | `ens3` | unique |

## Linux Nodes

```bash
curl -fsSL https://dash.example.com/deploy/linux/install.sh -o install_node.sh
sudo bash install_node.sh dash.example.com 443 '<node-secret>' 3 --net eth0 --require-https --service-manager=systemd
```

Installed paths:

| Item | Path |
| --- | --- |
| Service user | `ithiltir` |
| Data directory | `/var/lib/ithiltir-node` |
| Current version | `/var/lib/ithiltir-node/current` |
| Config file | `/var/lib/ithiltir-node/report.yaml` |
| systemd unit | `/etc/systemd/system/ithiltir-node.service` |

Checks:

```bash
systemctl status ithiltir-node.service
journalctl -u ithiltir-node.service -n 100 --no-pager
/var/lib/ithiltir-node/current/ithiltir-node report list
```

LVM thinpool collection is handled by a systemd timer:

| Item | Path |
| --- | --- |
| Collector | `/opt/node/collect_thinpool.sh` |
| Timer | `/etc/systemd/system/ithiltir-node-thinpool-cache.timer` |
| Cache | `/run/ithiltir-node/thinpool.json` |

The script enables this only when LVM/LVM-thin is detected. Hosts without LVM skip this path and remove old collector entries.

SMART cache is refreshed by a root-side systemd timer:

| Item | Path |
| --- | --- |
| Cache | `/run/ithiltir-node/smart.json` |
| Helper | `/usr/local/libexec/ithiltir-node/smart-cache` |
| Service | `/etc/systemd/system/ithiltir-node-smart-cache.service` |
| Timer | `/etc/systemd/system/ithiltir-node-smart-cache.timer` |

The script attempts to install `smartmontools`. If installation fails, `smartctl` is missing, or the cache is stale, the node keeps reporting base metrics and exposes SMART state through `disk.smart.status`.

With `--service-manager=openrc`, OpenRC runs Node through `supervise-daemon`. BusyBox `crond` refreshes SMART cache every 5 minutes and LVM thinpool cache every minute. OpenRC does not install the 1-second connection-count helper used by systemd.

## macOS Nodes

```bash
curl -fsSL https://dash.example.com/deploy/macos/install.sh -o install_node.sh
sudo bash install_node.sh dash.example.com 443 '<node-secret>' 3
```

macOS currently supports arm64 only.

Checks:

```bash
sudo launchctl print system/com.ithiltir.node
tail -n 100 /var/log/ithiltir-node.log /var/log/ithiltir-node.err
```

## Windows Nodes

Administrator PowerShell:

```powershell
Invoke-WebRequest -Uri "https://dash.example.com/deploy/windows/install.ps1" -OutFile ".\install_node.ps1"
powershell -ExecutionPolicy Bypass -File .\install_node.ps1 dash.example.com 443 "<node-secret>" 3
```

Paths:

| Item | Path |
| --- | --- |
| runner | `%ProgramFiles%\Ithiltir-node\ithiltir-runner.exe` |
| node | `%ProgramData%\Ithiltir-node\bin\ithiltir-node.exe` |
| Config | `%ProgramData%\Ithiltir-node\report.yaml` |
| Service | `ithiltir-node` |

Check:

```powershell
Get-Service ithiltir-node
```

Windows self-update works only when the node is managed by runner. Direct `node push` does not process update manifests.

Linux and macOS also process update manifests when using the `/var/lib/ithiltir-node/releases/<version>` and `/var/lib/ithiltir-node/current` install layout. Direct binaries outside that layout do not self-update.

Automatic update delivery from the Dash admin console requires the current node version to be `0.2.3` or later. For older versions, rerun the current installer; every installer run is a force install.

The Linux, macOS, and Windows installers follow at most five download redirects. Every hop must keep the original host; same-scheme redirects keep the effective port, and HTTP may upgrade to HTTPS. Cross-host redirects and HTTPS downgrade are rejected.

## Network Interface Selection

By default, the node collects all visible network interfaces. To collect business interfaces only:

```bash
--net eth0,eth1
```

Rules:

- Comma-separated.
- Empty values are ignored.
- Nonexistent interfaces are logged as warnings.
- Push and Local modes both support `--net`.

## Strict HTTPS

To require HTTPS:

```bash
sudo bash install_node.sh dash.example.com 443 '<node-secret>' 3 --require-https
```

`--require-https` rejects non-HTTPS targets and disables HTTP fallback. Do not use it for internal HTTP deployments.

## Rotate Secret

Update local key:

```bash
/var/lib/ithiltir-node/current/ithiltir-node report update <id> '<new-secret>'
sudo systemctl restart ithiltir-node.service
```

`report update` changes only the existing target key. When the URL changes, run:

```bash
/var/lib/ithiltir-node/current/ithiltir-node report install https://dash.example.com/api/node/metrics '<new-secret>'
```

## Validation

A successful node rollout should satisfy:

- Node service is running.
- `report list` shows the target URL.
- Dash admin console shows the node online.
- `/metrics` history has new points.
- Static hardware info includes CPU, memory, disk, and system fields.
- Selected NIC traffic counters keep increasing.

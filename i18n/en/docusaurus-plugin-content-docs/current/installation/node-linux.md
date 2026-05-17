---
slug: /Install/NodeLinux
title: Install Linux Node
---

# Install Linux Node

The Linux node install script is served by Dash:

```text
https://dash.example.com/deploy/linux/install.sh
```

The script downloads Dash's bundled `node_linux_<arch>`, configures push reporting, and registers a systemd service. The node host does not need to download GitHub Release binaries separately.

The script requires root/sudo, systemd, and `curl` or `wget`. When LVM/LVM-thin is detected, it installs and enables cron for thinpool collection; Debian/Ubuntu systems that use `apt-get` do not need cron installed manually first.

The script attempts to install `smartmontools` and writes `ithiltir-node-smart-cache.service` and `ithiltir-node-smart-cache.timer`. If SMART setup fails or `smartctl` is unavailable, base node monitoring continues to run.

## Install Command

```bash
curl -fsSL https://dash.example.com/deploy/linux/install.sh -o install_node.sh
sudo bash install_node.sh dash.example.com 443 '<node-secret>'
```

Full form:

```text
sudo bash install_node.sh <dash_ip> [dash_port] <secret> [interval_seconds] [--net iface1,iface2] [--require-https]
```

If only `<dash_ip> <secret>` are provided, the port is inferred from the rendered `DOWNLOAD_SCHEME`: HTTPS uses `443`, HTTP uses `80`.

## Installed Files

| Path | Content |
| --- | --- |
| `/var/lib/ithiltir-node/releases/<version>/ithiltir-node` | Current node binary |
| `/var/lib/ithiltir-node/current` | Symlink to the current release |
| `/var/lib/ithiltir-node/report.yaml` | Report target config |
| `/etc/systemd/system/ithiltir-node.service` | systemd service |
| `/run/ithiltir-node/thinpool.json` | LVM thinpool cache |
| `/run/ithiltir-node/smart.json` | SMART cache |
| `/opt/node/collect_thinpool.sh` | LVM thinpool collector |
| `/etc/cron.d/ithiltir-node-thinpool` | thinpool collection cron |
| `/usr/local/libexec/ithiltir-node/smart-cache` | SMART cache helper |
| `/etc/systemd/system/ithiltir-node-smart-cache.service` | SMART cache refresh service |
| `/etc/systemd/system/ithiltir-node-smart-cache.timer` | SMART cache refresh timer |

The service runs as the `ithiltir` system user and uses `/var/lib/ithiltir-node` as its working directory.

The `current` symlink and `releases/<version>` directories are also the Linux managed self-update boundary. Direct binaries outside that install layout do not process update manifests returned by Dash.

## systemd Boundary

The Linux service enables:

- `NoNewPrivileges=true`
- `PrivateTmp=true`
- `ProtectSystem=strict`
- `ProtectHome=true`
- `ReadWritePaths=/var/lib/ithiltir-node`

The node process should only write to its data directory.

The SMART cache is refreshed by a root-side oneshot service. The node process only reads `/run/ithiltir-node/smart.json`; it does not execute `smartctl` as root.

## LVM Thinpool

When LVM / LVM-thin is detected, the install script enables thinpool cache collection:

```bash
cat /run/ithiltir-node/thinpool.json
```

If the system has no LVM, old cron entries and collector scripts are removed.

## SMART Cache

The SMART cache refreshes every 5 minutes by default:

```bash
systemctl status ithiltir-node-smart-cache.timer
cat /run/ithiltir-node/smart.json
```

The cache directory uses `0750 root:<node-group>`. The cache file uses `0640 root:<node-group>`. The default node group is `ithiltir`.

When `smartctl` is missing, permission is unavailable, or the cache is stale, the node reports structured `disk.smart.status`. CPU, memory, disk capacity, and network metrics continue to report.

## Common Commands

```bash
systemctl status ithiltir-node.service
journalctl -u ithiltir-node.service -f
systemctl restart ithiltir-node.service
```

Show report targets:

```bash
/var/lib/ithiltir-node/current/ithiltir-node report list
```

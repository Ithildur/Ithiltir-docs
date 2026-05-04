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
| `/opt/node/collect_thinpool.sh` | LVM thinpool collector |
| `/etc/cron.d/ithiltir-node-thinpool` | thinpool collection cron |

The service runs as the `ithiltir` system user and uses `/var/lib/ithiltir-node` as its working directory.

## systemd Boundary

The Linux service enables:

- `NoNewPrivileges=true`
- `PrivateTmp=true`
- `ProtectSystem=strict`
- `ProtectHome=true`
- `ReadWritePaths=/var/lib/ithiltir-node`

The node process should only write to its data directory.

## LVM Thinpool

When LVM / LVM-thin is detected, the install script enables thinpool cache collection:

```bash
cat /run/ithiltir-node/thinpool.json
```

If the system has no LVM, old cron entries and collector scripts are removed.

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

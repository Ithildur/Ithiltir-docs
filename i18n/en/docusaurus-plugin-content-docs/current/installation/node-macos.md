---
slug: /Install/NodeMacOS
title: Install macOS Node
---

# Install macOS Node

The macOS node install script is served by Dash:

```text
https://dash.example.com/deploy/macos/install.sh
```

macOS nodes currently support arm64 only.

## Install Command

```bash
curl -fsSL https://dash.example.com/deploy/macos/install.sh -o install_node.sh
sudo bash install_node.sh dash.example.com 443 '<node-secret>'
```

Full arguments:

```text
sudo bash install_node.sh <dash_ip> [dash_port] <secret> [interval_seconds] [--net iface1,iface2] [--require-https]
```

## Installed Files

| Path | Content |
| --- | --- |
| `/var/lib/ithiltir-node/releases/<version>/ithiltir-node` | Current node binary |
| `/var/lib/ithiltir-node/current` | Symlink to current release |
| `/var/lib/ithiltir-node/report.yaml` | Report target config |
| `/Library/LaunchDaemons/com.ithiltir.node.plist` | LaunchDaemon |
| `/var/log/ithiltir-node.log` | stdout |
| `/var/log/ithiltir-node.err` | stderr |

The `current` symlink and `releases/<version>` directories are also the macOS managed self-update boundary. Direct binaries outside that install layout do not process update manifests returned by Dash.

## Service Management

```bash
sudo launchctl print system/com.ithiltir.node
sudo launchctl kickstart -k system/com.ithiltir.node
tail -f /var/log/ithiltir-node.log /var/log/ithiltir-node.err
```

## Permissions

When run with `sudo`, the script attempts to set `/var/lib/ithiltir-node` ownership to the original `SUDO_USER`. If `RUN_USER=root` or the user cannot be detected, the node runs as root.

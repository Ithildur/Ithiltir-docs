---
slug: /Operations
title: Operations Overview
---

# Operations Overview

Operations have a simple target: stable Dash process, recoverable database, continuous node reporting, and predictable data retention.

## Daily Checks

Dash:

```bash
systemctl status dash.service
journalctl -u dash.service -n 100 --no-pager
```

Linux node:

```bash
systemctl status ithiltir-node.service
journalctl -u ithiltir-node.service -n 100 --no-pager
```

macOS node:

```bash
sudo launchctl print system/com.ithiltir.node
tail -n 100 /var/log/ithiltir-node.log /var/log/ithiltir-node.err
```

Windows node:

```powershell
Get-Service ithiltir-node
```

## Critical Data

| Data | Location | Must back up |
| --- | --- | --- |
| Metrics history, nodes, alerts, settings | PostgreSQL | Yes |
| Dash config | `/opt/Ithiltir-dash/configs/config.local.yaml` | Yes |
| Dash install identity | `/opt/Ithiltir-dash/install_id` | Recommended |
| Custom themes | `/opt/Ithiltir-dash/themes` | Yes |
| Redis runtime state | Redis | Optional; usually not primary recovery data |
| Node report config | Node-local `report.yaml` | Node-level backup |

## Operation Docs

- [Node Lifecycle](./node-lifecycle.md)
- [Data Retention](./data-retention.md)
- [Backup and Restore](./backup-restore.md)
- [Logging](./logging.md)
- [Performance and Capacity](./performance.md)
- [Troubleshooting](./troubleshooting.md)

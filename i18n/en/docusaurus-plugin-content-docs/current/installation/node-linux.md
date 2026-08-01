---
slug: /Install/NodeLinux
title: Install Linux Node
---

# Install Linux Node

Dash serves the installer at:

```text
https://dash.example.com/deploy/linux/install.sh
```

It supports amd64 and arm64 and downloads the bundled protected Node asset using `X-Node-Secret`.

## Runtime Modes

| Mode | Scope | Result |
| --- | --- | --- |
| `systemd` | Running systemd | Node service and collector timers |
| `openrc` | Alpine/OpenRC | `supervise-daemon`; other OpenRC distributions are best-effort |
| `none` | Manual | Files and a launch command only |
| `auto` | Detection | Fails if no supported manager exists |

Alpine requires `bash`, `ca-certificates`, `curl`, and `coreutils`. All modes require `pgrep`.

## Command

```bash
curl -fsSL https://dash.example.com/deploy/linux/install.sh -o install_node.sh
sudo bash install_node.sh dash.example.com 443 '<node-secret>' \
  --require-https --service-manager=systemd
```

```text
sudo bash install_node.sh <dash_ip> [dash_port] <secret> [interval_seconds] \
  [--net iface1,iface2] [--require-https] \
  [--service-manager=auto|systemd|openrc|none]
```

The installer follows at most five asset redirects. They must keep the original host; same-scheme redirects keep the effective port; HTTP may upgrade to HTTPS, never downgrade. `X-Node-Secret` is sent only after the next hop passes validation.

## Force-Install Semantics

Every run stages the candidate under `releases`, executes `--version`, stops existing managed services or matching manual processes, replaces the release/config/service/collectors, and atomically switches `current`. Reinstalling the same version replaces it. Node self-update owns version-upgrade rollback.

```text
/var/lib/ithiltir-node/
  report.yaml
  releases/<version>/ithiltir-node
  current -> releases/<version>
```

The runtime user owns the data and release tree so the unprivileged updater can create and switch releases. Root-owned service and collector assets stay outside it.

## Collectors

systemd schedules SMART every 5 minutes and, when available, a root network-namespace connections helper every 1 second. LVM detection enables a thinpool timer. Building the connections helper requires `cc`, `gcc`, or `clang`.

Alpine/OpenRC uses BusyBox cron for SMART every 5 minutes and LVM every minute. It does not run the 1-second connections helper and uses Node's built-in count, which may omit container namespaces.

Collector failures do not stop core CPU, memory, capacity, and network reporting.

## Service

```bash
systemctl status ithiltir-node.service
journalctl -u ithiltir-node.service -f
```

OpenRC uses `rc-service ithiltir-node status`. Inspect report config with:

```bash
/var/lib/ithiltir-node/current/ithiltir-node report list
```

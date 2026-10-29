---
slug: /Install/PVE
title: PVE VM Monitoring
---

# PVE VM Monitoring

Dash `0.4.0` pairs with Node `0.3.0` for local Proxmox VE QEMU VM snapshots, Guest Agent IPs, and PVE RRD history. Stopped VMs remain in the inventory; templates are excluded. LXC, HA configuration, and VM controls are not included.

## Install and Enable

Installing the PVE collection service requires a host with systemd, `/etc/pve`, and `/usr/bin/pvesh`. A root helper collects local data while Node runs as an unprivileged user. No PVE API account, token, or on-host compiler is needed.

1. Use a Dash package containing Node `0.3.0` and matching PVE helpers.
2. Create a node in the admin console, copy its Linux installation command, manually append `--pve`, and run it on the PVE host.
3. Inspect both services:

```bash
systemctl status ithiltir-node-pve-cache.service ithiltir-node.service
journalctl -u ithiltir-node-pve-cache.service -n 100 --no-pager
```

The installer verifies the helper SHA-256 and version before stopping an existing Node, then installs:

| Path or service | Purpose |
| --- | --- |
| `/usr/local/libexec/ithiltir-node/pve-cache` | Root-owned helper binary |
| `ithiltir-node-pve-cache.service` | Runs `pve-cache --group <runtime-group>` |
| `/run/ithiltir-node/pve.sock` | Root-owned Unix socket accessible to the runtime group, mode `0660` |
| Node systemd drop-in | Sets `ITHILTIR_NODE_PVE_SOCKET=/run/ithiltir-node/pve.sock` |
| `/run/ithiltir-node/pve-guest` | Root-only Guest Agent cache and backoff state |

Node reads in-memory observations through the socket. Basic observations are rebuilt after helper restart; IP cache state survives helper restarts and is cleared on host reboot.

## Enable History Queries

Current VM snapshots can use HTTP reporting. History requires a Node-to-Dash gRPC query connection. Run:

```bash
sudo systemctl edit ithiltir-node.service
```

Add:

```ini
[Service]
Environment=ITHILTIR_NODE_TRANSPORT=grpc
```

Then restart Node:

```bash
sudo systemctl daemon-reload
sudo systemctl restart ithiltir-node.service
```

Alternatively, use `auto` to negotiate transport. The default `http` mode does not open a query connection. gRPC shares Dash's HTTP listener; `app.grpc_port` has no effect. An HTTPS proxy must support HTTP/2 and forward `/ithiltir.node.v1.Node/`. See [Reverse Proxy](./reverse-proxy.md).

As an administrator, call `GET /api/admin/nodes/{id}/virt/capabilities` and confirm that both `connected` and `pve_history` are `true`.

## Dashboard and Access

Click the host card's PVE icon to open `/pve/{id}`. The page shows VM inventory, details, and history; `?vm=<vmid>` selects a VM. Snapshots refresh every 15 seconds. History loads when selecting a VM or range and on manual refresh.

Guest access is disabled by default. Enabling system setting `pve_guest_visible` exposes VM names, IPs, snapshots, and history only for guest-visible hosts. This switch is independent of host history, traffic, and uptime permissions.

Per-node VM CPU/memory thresholds annotate historical charts only; they do not send alerts. CPU defaults to 80%. Memory defaults to 90% and requires explicit enablement; evaluation uses each historical point's memory limit and leaves missing values unknown.

## Sampling and Freshness

| Data | Collection and lifetime |
| --- | --- |
| VM inventory | Local configuration refresh every 3 seconds |
| Live VM metrics | At least 3 seconds per VM; 8 workers, a 2-second timeout, and results available on completion |
| VM observations | Independent `collected_at` and 90-second TTL per VM; expired dynamic fields are omitted and state becomes `unknown` |
| Disk capacity | Separate query every 60 seconds; omitted after 2 minutes |
| Guest Agent IPs | At least 60 seconds after success; 1/2/5-minute failure backoff; 900-second sample TTL |
| Node VM reporting | Reads the helper every 3 seconds independently of host metrics; retries with backoff after failures |
| Dash snapshot cache | 10 minutes in Redis or `--no-redis` memory; duplicate or older samples do not extend retention |

Dynamic metrics and IPs require QMP state `running`. IPs also require Guest Agent enablement in PVE and a working agent inside the VM. IP queries do not block basic metrics; VM metrics and IPs expire independently. See [Dash API](../reference/dash-api.md) for fields and address filtering.

History reads PVE RRD on demand with `hour/day/week/month/year` and `AVERAGE/MAX`. Dash does not persist VM snapshots or history in PostgreSQL, or include them in host traffic, uptime, or billing.

## Updates, Disablement, and Troubleshooting

- Node self-update replaces only the ordinary Node, not the root helper or service units. Reinstall with `--pve` to update the helper.
- Reinstalling without a PVE flag preserves the existing choice. `--no-pve` disables/removes the service, helper, and drop-in.
- No snapshot: check the helper service, socket permissions, and Node's `ITHILTIR_NODE_PVE_SOCKET`.
- Snapshots work but history fails: check the gRPC proxy, Node transport, and capabilities.
- Metrics work but IPs are absent: check PVE Guest Agent configuration, the in-VM agent, and helper logs. Failed queries retry at the intervals above.
- `node_offline` means no connected query session; `unsupported` means history queries are unsupported; `busy` means query concurrency is full; `deadline_exceeded` means the query timed out.

See [Dash API](../reference/dash-api.md) and [Node Protocol](../reference/node-protocol.md) for wire contracts.

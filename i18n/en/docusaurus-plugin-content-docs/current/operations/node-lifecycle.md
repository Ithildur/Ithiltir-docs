---
slug: /Operations/NodeLifecycle
title: Node Lifecycle
---

# Node Lifecycle

The node lifecycle includes creation, installation, reporting, update, secret rotation, disablement, and deletion.

## Create Node

When a node is created in the admin console, Dash generates a unique `secret`. The create API does not require a request body:

```text
POST /api/admin/nodes/
```

After creation, read the secret and install command from the node list.

## Install Node

Use install scripts served by Dash:

- [Linux Node](../installation/node-linux.md)
- [macOS Node](../installation/node-macos.md)
- [Windows Node](../installation/node-windows.md)

Install scripts call:

```bash
node report install <dash-url>/api/node/metrics <secret>
```

`report install` requests `/api/node/identity`, reads Dash `install_id`, and writes local `report.yaml`.

## Reporting State

When a node reports normally, Dash updates:

- Current metrics.
- History metrics.
- Front hot snapshot.
- Node static info.
- Agent version.
- Alert dirty mark.
- Traffic accounting input data.

If static info is incomplete, the node keeps retrying until a complete report is sent.

## Node Update

After a node upgrade is triggered in Dash, Dash returns an update manifest in the next metrics response. Windows runner, the Linux systemd install layout, and the macOS LaunchDaemon install layout can process the manifest.

Direct binaries outside the install layout do not self-update. See [Node Update](../components/node/update.md) for update rules.

## Secret Rotation

1. Update the node secret in Dash admin console.
2. On the node, run:

```bash
./node report update <id> <new-secret>
```

`report update` changes only the key, not the URL. If the URL also changed, use:

```bash
./node report install <new-url> <new-secret>
```

## Move Node to a New Dash

If the new Dash has a different `install_id`, `report install` writes a new target. If `server_install_id` is the same but the target differs, the command requires an interactive keep-or-replace choice.

In non-interactive environments, duplicate `server_install_id` with a different target fails. Run the command in a terminal and choose the action.

## Disable Node

Short-term disablement:

```bash
systemctl stop ithiltir-node.service
```

Dash uses `app.node_offline_threshold` to mark the node offline and trigger the built-in offline alert.

Long-term disablement:

1. Stop the node service.
2. Delete the node in Dash admin console.
3. Delete local node data under `/var/lib/ithiltir-node` or `%ProgramData%\Ithiltir-node` when needed.

## Delete Node

Management API:

```text
DELETE /api/admin/nodes/{id}
```

Deletion is logical deletion. Do not rely on it as a history cleanup policy. History retention is still controlled by TimescaleDB policies.

---
slug: /Node/Update
title: Node Update
---

# Node Update

Dash delivers node updates through the update manifest in the `/api/node/metrics` response. Only managed install layouts process the manifest.

## Supported Scope

| Platform | Requirement | Behavior |
| --- | --- | --- |
| Windows | Started by `ithiltir-runner.exe` with `ITHILTIR_NODE_RUNNER=1` | Stages the new binary, exits node, then runner replaces and restarts it |
| Linux | Current process is `/var/lib/ithiltir-node/current/ithiltir-node` or `/var/lib/ithiltir-node/releases/<version>/ithiltir-node` | Downloads into a new release directory, switches the `current` symlink, exits, and lets systemd restart node |
| macOS | Current process is `/var/lib/ithiltir-node/current/ithiltir-node` or `/var/lib/ithiltir-node/releases/<version>/ithiltir-node` | Downloads into a new release directory, switches the `current` symlink, exits, and lets launchd restart node |

Direct binaries outside the managed install layout ignore update manifests.

## Windows Runner

```powershell
.\ithiltir-runner.exe [node args...]
```

Behavior:

- Windows only.
- Defaults to `push` when no arguments are provided.
- Manages `%ProgramData%\Ithiltir-node\bin\ithiltir-node.exe`.
- Uses `%ProgramData%\Ithiltir-node` as the working directory.
- Enables staged node updates from Dash metric responses.

## Update Manifest

A successful Dash `POST /api/node/metrics` response can include:

```json
{
  "update": {
    "id": "release-id",
    "version": "1.2.3",
    "url": "https://dashboard.example/releases/Ithiltir-node-windows-amd64.exe",
    "sha256": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "size": 12345678
  }
}
```

Rules:

- `update.version`, `update.url`, `update.sha256`, and positive byte count `update.size` are required.
- `update.id` is optional metadata.
- `update.url` must be an absolute `http` or `https` URL with a host.
- `update.version` must be a single release directory name. It cannot be `.` or `..`, and cannot contain path separators.
- `update.sha256` is the expected SHA-256 hex digest.
- `update.size` must equal the downloaded byte count.

## Conflict Handling

If multiple targets return update manifests in the same cycle, every manifest must have identical `id`, `version`, `url`, `sha256`, and `size`. If they conflict, the update is skipped.

Malformed JSON, invalid manifests, download failures, size mismatches, or checksum mismatches skip the update and reporting continues.

## Lifecycle

1. node parses the update manifest returned by Dash.
2. node downloads the file and verifies size and SHA-256.
3. After staging succeeds, `node push` exits cleanly.
4. Windows runner replaces `%ProgramData%\Ithiltir-node\bin\ithiltir-node.exe` and restarts node.
5. Linux/macOS switches `/var/lib/ithiltir-node/current` to the new release and systemd/launchd restarts node.

If the active managed release already matches the manifest version, node does not reinstall it.

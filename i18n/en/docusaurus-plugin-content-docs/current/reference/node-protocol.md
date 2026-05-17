---
slug: /Reference/NodeProtocol
title: Node Report Protocol
---

# Node Report Protocol

Ithiltir-node calls Dash `/api/node/*` endpoints in push mode. The node process itself does not serve these paths.

## Target URL

The target URL in config must point to:

```text
https://dash.example.com/api/node/metrics
```

Derived URLs:

| Purpose | URL |
| --- | --- |
| Runtime metrics | `<target>` |
| Static info | Replace `/metrics` with `/static` |
| Dash identity | Replace `/metrics` with `/identity` |

`report install` requires the target path to end with `/metrics`.

## Headers

```http
X-Node-Secret: <node-secret>
Content-Type: application/json
```

## `/api/node/identity`

Request:

```http
POST /api/node/identity
X-Node-Secret: <secret>
```

Body:

```json
{}
```

Response:

```json
{
  "install_id": "dashboard-install-id",
  "created": false
}
```

If Dash has no `install_id`, it creates one and returns `created=true`.

## `/api/node/metrics`

The request body is `NodeReport`. See [runtime metrics schema](./metrics-schema.md).

Response:

```json
{
  "ok": true,
  "update": null
}
```

`update` can be an update manifest:

```json
{
  "id": "release-id",
  "version": "1.2.3",
  "url": "https://dash.example.com/deploy/windows/node_windows_amd64.exe",
  "sha256": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "size": 12345678
}
```

## `/api/node/static`

The request body is `Static`. See [runtime metrics schema](./metrics-schema.md).

Static info is reported once after node startup. If static collection is incomplete, the node keeps retrying. It also resends static info after suppressed push failures recover.

## Success Rules

The node treats only `200 OK` as success. Non-200 responses affect only the current target and do not block other targets.

The `/api/node/metrics` response body only affects updates:

- Non-JSON or empty body: ignored.
- `Content-Type` other than `application/json`: ignored.
- Other top-level JSON fields: ignored.
- `ok` is not required.

## HTTPS Fallback

By default, HTTPS targets can fall back to HTTP according to client rules. This covers misconfiguration, IP access, certificate errors, and similar cases.

With `--require-https`:

- Non-HTTPS targets are rejected.
- HTTP fallback is disabled.

## Node Update

Only managed install layouts process update manifests:

- Windows: started by runner with `ITHILTIR_NODE_RUNNER=1`.
- Linux/macOS: current process is `/var/lib/ithiltir-node/current/ithiltir-node` or `/var/lib/ithiltir-node/releases/<version>/ithiltir-node`.

Direct binaries outside the managed install layout ignore update manifests.

Manifest requirements:

- `version` is non-empty, not `.` or `..`, and contains no path separators.
- `url` is an absolute HTTP or HTTPS URL with a host.
- `sha256` is a 64-character SHA-256 hex digest.
- `size` is positive and must equal the downloaded byte count.

If multiple targets return update manifests in one cycle, `id`, `version`, `url`, `sha256`, and `size` must match exactly. Otherwise the update is skipped.

After a successful update, Windows runner replaces `%ProgramData%\Ithiltir-node\bin\ithiltir-node.exe` and restarts node. Linux/macOS switches `/var/lib/ithiltir-node/current` to the new release directory and lets systemd/launchd restart node.

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
  "url": "https://dash.example.com/deploy/windows/node_windows_amd64.exe?upgrade_token=...",
  "sha256": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "size": 12345678
}
```

`url` may include a short-lived `upgrade_token` for protected `/deploy/*` asset access. Nodes must use the returned URL unchanged.

## `/api/node/static`

The request body is `Static`. See [runtime metrics schema](./metrics-schema.md).

Static info is reported once after node startup. If static collection is incomplete, the node keeps retrying. It also resends static info after suppressed push failures recover.

## Success Rules

Host metrics, static data, and identity HTTP requests require `200 OK`; VM reports to `/api/node/virt` succeed with `204`. Failures affect only the current target and do not block other targets.

The `/api/node/metrics` response body only affects updates:

- Non-JSON or empty body: ignored.
- `Content-Type` other than `application/json`: ignored.
- Other top-level JSON fields: ignored.
- `ok` is not required.

## Receive Constraints

- Bytes, capacities, counters, and uptime are non-negative signed 64-bit JSON integers.
- Process and connection counts use signed 32-bit ranges.
- Static report interval uses signed 32-bit range; CPU topology counts use signed 16-bit range.
- Out-of-range JSON integers return `400 invalid_request`; negative values or invalid ratios/rates return `422 invalid_metrics` or `422 invalid_static_payload`.
- Node version is limited to 64 characters; hostname and disk names to 255; disk ref to 320; disk kind/role and RAID health to 16; interface names to 64; filesystem type and logical health/level to 32.
- Static OS/platform/arch is limited to 32 characters; platform/kernel version to 255. Paths, mount points, and hardware descriptions are text columns.

Concurrent reports use server receive order for the current projection. An older receive that finishes later still enters history but cannot overwrite current metrics, frontend cache, or newer alert evaluation. Node `timestamp` does not select the current projection.

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

Automatic update delivery from the Dash admin console applies only to nodes currently reporting `0.2.3` or later. Older versions must be updated manually.

Manifest requirements:

- `version` is non-empty, not `.` or `..`, and contains no path separators.
- `url` is an absolute HTTP or HTTPS URL with a host.
- `sha256` is a 64-character SHA-256 hex digest.
- `size` is positive and must equal the downloaded byte count.

Manifests matching the currently reported version are ignored first. If multiple remaining targets return update manifests in one cycle, `id`, `version`, `url`, `sha256`, and `size` must match exactly. Otherwise the update is skipped.

Dash clears the pending upgrade task after the node reports the exact target version or a higher SemVer precedence. Different build metadata at the same SemVer precedence is treated as a distinct node binary and can still be delivered.

After a successful update, Windows runner replaces `%ProgramData%\Ithiltir-node\bin\ithiltir-node.exe`. Linux/macOS atomically switches `/var/lib/ithiltir-node/current`, then the existing runtime manager restarts Node.

## Node gRPC transport

The `ithiltir.node.v1.Node` service uses HTTP/2 on Dash's existing HTTP listener; `app.grpc_port` has no effect. See [Reverse Proxy](../installation/reverse-proxy.md) for TLS proxy configuration. The protocol is defined in Dash's `protocol/node.proto`; `bash scripts/generate-node-protocol.sh [node-repository]` synchronizes both repositories with pinned generator versions.

### RPC Requests and Responses

Requests authenticate with `x-node-secret` metadata.

| RPC | Successful response |
| --- | --- |
| `Identify(Empty)` | `install_id`, `created`, `protocol_version: 1` |
| `Metrics(Report)` | `Reply.json` contains the existing JSON response and update manifest |
| `Static(Report)`, `Virt(Report)` | `Empty` |

`Report.json` carries the existing UTF-8 JSON, preserving missing fields and 64-bit integers. Metrics and static payloads are limited to 1 MiB; VM snapshots to 4 MiB. Validation, receipt deadlines, and write rules match HTTP.

Authentication failures return `UNAUTHENTICATED` and are rate limited by IP. Rate limits or oversized messages return `RESOURCE_EXHAUSTED`; invalid JSON or report fields return `INVALID_ARGUMENT`. Other processing failures return `UNAVAILABLE` or `INTERNAL`; VM snapshot storage failures return `UNAVAILABLE` with `virt_unavailable`.

### Query Sessions

`Connect` is a node-initiated bidirectional query stream. Capabilities must arrive within 5 seconds; reconnection replaces the previous session for that node. Dash checks credentials before dispatching queries and every second while connected. Both sides send heartbeats every 20 seconds and close the connection after 60 seconds without a message. Heartbeats do not refresh metrics or uptime.

Queries have a 10-second total deadline, at most 32 pending per node, and a 2 MiB result limit. Disconnection fails pending queries without replay.

### Transport Selection

Set `ITHILTIR_NODE_TRANSPORT` on Node:

| Value | Behavior |
| --- | --- |
| `http` (default) | Report over HTTP |
| `grpc` | Use RPC only |
| `auto` | Probe `Identify` before reporting; success fixes gRPC for that target's process lifetime. An unavailable or incompatible probe can select HTTP on the same URL and scheme |

`auto` does not switch to HTTP after authentication or authorization failure. Neither `auto` nor `grpc` downgrades to plaintext. See “HTTPS Fallback” above for `http` fallback rules.

Node disables gRPC policy retries, but gRPC may transparently retry calls known not to have been processed. An uncertain metrics response is not replayed over another transport; subsequent rounds read the latest metrics. VM snapshots are deduplicated by sample time.

## VM Reporting

With `ITHILTIR_NODE_PVE_SOCKET`, Node reads VM observations from the local helper. HTTP reports independently to the target's sibling `/virt` endpoint, using `X-Node-Secret` and returning `204` on success; gRPC uses `Virt(Report)`. VM reports do not carry updates or refresh host uptime; failures retry with independent backoff.

Host metrics requests time out after 7 seconds; after a timeout, the next round starts as soon as the current one finishes. See [Dash API](./dash-api.md) for VM fields, lifetimes, and errors, and [PVE Monitoring](../installation/pve.md) for installation.

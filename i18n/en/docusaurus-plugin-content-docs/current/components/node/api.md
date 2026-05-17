---
slug: /Node/API
title: Node API
---

# Node HTTP API

This page defines the wire protocol between Ithiltir-node and Dash, and the local endpoints provided by Local mode.

## HTTP Endpoints

`/api/node/*` endpoints are served by Dash. Ithiltir-node calls them in Push mode; the node itself does not serve these paths.

| Scope | Path | Method | Data | Success | Description |
| --- | --- | --- | --- | --- | --- |
| Local page | `/` | `GET` | HTML | `200` | Built-in single-node page |
| Local page | `/local` | `GET` | HTML | `200` | Alias of `/` |
| Local page | `/metrics` | `GET` | `NodeReport` | `200` | Returns `503` before first sample |
| Local page | `/static` | `GET` | `Static` | `200` | Returns `503` before static data is ready |
| Push target | `/api/node/metrics` | `POST` | `NodeReport` | `200` | Requires `X-Node-Secret` |
| Push target | `/api/node/static` | `POST` | `Static` | `200` | Requires `X-Node-Secret`; derived from target URL |
| Push target | `/api/node/identity` | `POST` | `{}` | `200` | Requires `X-Node-Secret`; returns `install_id` |
| Push debug local | `/` | `GET` | `NodeReport` | `200` | Enabled only by `push --debug`, bound to `127.0.0.1:<NODE_PORT or 9101>` |

Local `GET` routes also accept `HEAD`. Other methods return `405` with `Allow: GET, HEAD`.

## Wire Rules

- JSON uses UTF-8.
- Timestamps are UTC RFC3339.
- Byte and packet counters are raw numeric counters.
- `*Ratio` fields are `0..1`, not percentages.
- Arrays return `[]`, not `null`.
- Optional fields without values are omitted.
- Runtime disk structure and static disk structure have different meanings. See [Disk Metrics](./disk.md).

## `NodeReport`

Top-level object:

```json
{
  "version": "...",
  "hostname": "...",
  "timestamp": "...",
  "metrics": {}
}
```

Fields:

- `version`: node version.
- `hostname`: node hostname.
- `timestamp`: UTC RFC3339.
- `metrics`: `Snapshot`.

## `Snapshot`

`metrics` fields:

- `cpu`: usage ratio, load, and CPU times.
- `memory`: memory and swap counters.
- `disk`: see [Disk Metrics](./disk.md).
- `network[]`: interface counters and rates.
- `system`: liveness and uptime.
- `processes`: process count.
- `connections`: TCP and UDP counts.
- `raid`: RAID runtime state.
- `thermal`: thermal sensor runtime state.

## `Static`

Top-level object:

```json
{
  "version": "...",
  "timestamp": "...",
  "report_interval_seconds": 3,
  "cpu": {},
  "memory": {},
  "disk": {},
  "system": {},
  "raid": {}
}
```

Static reporting behavior:

- Static metadata has no outer wrapper object.
- `report_interval_seconds` is required.
- Static metadata is sent once at startup.
- Incomplete static collection keeps retrying until complete.
- After suppressed push failures recover, static metadata is sent again.

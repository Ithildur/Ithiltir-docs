---
slug: /Node
title: Node Overview
---

# Node Overview

Ithiltir-node is the node metrics collector. It has two modes:

- `local`: serves a local node page and local API.
- `push`: reports to Dash and keeps local cached results.

## Local Mode

```bash
./node
./node local [listen_ip] [listen_port] [--net iface1,iface2] [--debug]
```

- Default listen address: `0.0.0.0:9100`
- Environment overrides: `NODE_HOST`, `NODE_PORT`
- Page: `GET /` or `GET /local`
- Metrics API: `GET /metrics`
- Static hardware API: `GET /static`

## Push Mode

```bash
./node push [interval_seconds] [--net iface1,iface2] [--debug] [--require-https]
```

- Linux/macOS default config: `/var/lib/ithiltir-node/report.yaml`.
- Windows default config: `%ProgramData%\Ithiltir-node\report.yaml`.
- `ITHILTIR_NODE_REPORT_CONFIG` overrides the config path.
- Each target URL points to the Dash metrics endpoint and sends `X-Node-Secret: <key>`.
- Debug local API: `GET http://127.0.0.1:${NODE_PORT:-9101}/`.

## Code Layout

| Path | Content |
| --- | --- |
| `cmd/node` | node entrypoint |
| `cmd/runner` | Windows runner entrypoint |
| `internal/app` | mode dispatch and lifecycle |
| `internal/cli` | argument parsing |
| `internal/collect` | samplers and platform collectors |
| `internal/metrics` | runtime and static JSON structures |
| `internal/push` | push client |
| `internal/reportcfg` | report target config |
| `internal/runner` | Windows runner supervisor |
| `internal/selfupdate` | staged update support |
| `internal/server` | HTTP handlers |

## Related

- [Node Rollout](../../guides/node-rollout.md)
- [Install Linux Node](../../installation/node-linux.md)
- [Install macOS Node](../../installation/node-macos.md)
- [Install Windows Node](../../installation/node-windows.md)
- [Local Mode](./local.md)
- [Push Mode](./push.md)
- [Node Report Protocol](../../reference/node-protocol.md)
- [Runtime Metrics Schema](../../reference/metrics-schema.md)
- [Disk Schema](../../reference/disk-schema.md)

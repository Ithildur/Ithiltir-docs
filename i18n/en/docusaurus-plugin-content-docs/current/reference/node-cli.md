---
slug: /Reference/NodeCLI
title: Node CLI
---

# Node CLI

## Argument Parsing

Global arguments:

| Argument | Description |
| --- | --- |
| `--net iface1,iface2` | Preferred network interfaces to collect |
| `--debug` | Print detailed JSON or enable the local push debug endpoint |
| `--require-https` | Reject non-HTTPS targets and disable HTTP fallback |
| `--version`, `-v` | Print version |

When `--net` has no value, the node logs a warning and ignores it.

## Local Mode

```bash
ithiltir-node [--net eth0,eth1]
```

Defaults:

- listen host: `0.0.0.0`
- listen port: `9100`

Environment variables:

| Variable | Description |
| --- | --- |
| `NODE_HOST` | Listen host |
| `NODE_PORT` | Listen port |

## Push Mode

```bash
ithiltir-node push [interval_seconds] [target_url secret] [--net eth0,eth1] [--require-https]
```

Default interval: `3` seconds.

`--debug` also listens on:

```text
127.0.0.1:${NODE_PORT:-9101}
```

## Report Config

Install a target:

```bash
ithiltir-node report install https://dash.example.com/api/node/metrics <secret>
```

Rules:

- URL must point to Dash `/api/node/metrics`.
- The command requests sibling `/identity`.
- The command writes `server_install_id` to config.
- Repeating the same URL, key, and `server_install_id` leaves config unchanged.
- Same `server_install_id` with a different target requires an interactive keep-or-replace choice.

Update a key:

```bash
ithiltir-node report update <id> <secret>
```

Rules:

- Only the key is rotated.
- URL is unchanged.

`report list` output:

```text
ID  URL  KEY  SERVER_INSTALL_ID
```

## Report Config Path

Defaults:

- Linux/macOS: `/var/lib/ithiltir-node/report.yaml`
- Windows: `%ProgramData%\Ithiltir-node\report.yaml`

Override:

```text
ITHILTIR_NODE_REPORT_CONFIG=/path/report.yaml
```

Format:

```yaml
version: 1
targets:
  - id: 1
    url: https://dash.example.com/api/node/metrics
    key: secret
    server_install_id: dash-install-id
```

Writes use atomic rename and preserve file mode `0600`.

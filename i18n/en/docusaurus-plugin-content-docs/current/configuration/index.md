---
slug: /Config
title: Config Overview
---

# Config Overview

Ithiltir configuration has three responsibility layers. Identify the layer first, then use the matching edit path.

| Layer | Stored in | Changed through | Covers |
| --- | --- | --- | --- |
| Dash startup config | YAML and environment variables | Edit config and restart Dash | Listen address, public URL, database, Redis, JWT, logging, trusted proxies |
| Dash runtime settings | PostgreSQL | Admin console or admin API | Access control, traffic mode, alerts, notifications, themes, node groups |
| Node local config | `report.yaml` and command-line flags | Node install script or Node CLI | Push targets, secrets, local collection options |

## Dash Startup Config

Startup config defines process boundaries:

- Listen address.
- Public URL.
- Database.
- Redis.
- JWT signing key.
- Logging.
- Time zone and language.
- Trusted reverse proxies.

See [Dash Config](./dash.md) and [Environment Variables](./environment.md).

Changing startup config requires a Dash restart. After changing `app.public_url`, newly generated node install commands use the new address; existing node `report.yaml` files are not rewritten automatically.

## Runtime Settings

Runtime settings are changed through the admin console or API:

- System brand and guest access scope.
- Traffic accounting mode, billing cycle, and direction.
- Node-level billing overrides, P95 switch, labels, and groups.
- Alert rules, mounts, and notification channels.
- Theme upload and activation.

See:

- [Access Control](./access.md)
- [Traffic Accounting](./traffic.md)
- [Alert Rules](./alerts.md)
- [Notifications](./notifications.md)
- [Themes](./themes.md)
- [Advanced Configuration Path](../guides/advanced-configuration.md)

## Node Config

Node push targets are stored in `report.yaml`:

```yaml
version: 1
targets:
  - id: 1
    url: https://dash.example.com/api/node/metrics
    key: node-secret
    server_install_id: dashboard-install-id
```

See [Node CLI](../reference/node-cli.md) and [Node Report Protocol](../reference/node-protocol.md).

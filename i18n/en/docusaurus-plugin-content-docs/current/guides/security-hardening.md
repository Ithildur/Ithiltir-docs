---
slug: /Guides/SecurityHardening
title: Security Hardening
---

# Security Hardening

Ithiltir security boundaries are the admin plane, node plane, and same-origin browser access.

## Admin Password

Set the admin password through `monitor_dash_pwd`. Do not store it in `config.local.yaml`.

Rotate by changing the environment variable and restarting Dash.

## JWT and Cookies

Configure stable secrets before production use:

```yaml
security:
  jwt_secret: "<random>"
  cookie_hash_key: "<random>"
  cookie_block_key: "<random>"
```

Changing these values invalidates existing sessions.

## Node Secrets

Each node should use a distinct secret. Rotate from Dash admin console, then update the local node config:

```bash
/var/lib/ithiltir-node/current/ithiltir-node report update <id> '<new-secret>'
sudo systemctl restart ithiltir-node.service
```

## Public URL and Reverse Proxy

Production deployments should expose Dash through an HTTPS domain at the root path. Dash does not support URL subpaths such as `/dash`.

The reverse proxy should forward:

- `/api`
- `/theme`
- `/deploy`
- `/`

Preserve Host, X-Forwarded-For, and X-Forwarded-Proto. Configure trusted proxy CIDRs in Dash config.

## Database

PostgreSQL contains metrics history, node metadata, settings, alert rules, and notification outbox. Back up PostgreSQL before upgrades and migrations.

TimescaleDB chunks are maintained by Dash migrations and retention policies.

## Config File Permissions

Dash config contains database passwords and signing keys. Release install keeps sensitive files restricted.

Linux node service runs under the `ithiltir` user and restricts writable paths to `/var/lib/ithiltir-node`.

## Webhook Signing

When a webhook channel has `secret`, Dash sends:

```http
X-Webhook-Signature: sha256=<hex>
```

The signature is HMAC-SHA256 over the raw request body.

## Unsupported Production Patterns

- Dash under a URL subpath.
- Multiple Dash instances writing to the same database and Redis.
- Public exposure of the backend port without HTTPS reverse proxy.
- Shared node secret across multiple hosts.

---
slug: /Config/Security
title: Security Config
---

# Security Config

Security settings cover admin authentication, browser sessions, node secrets, trusted proxy headers, and webhook signing.

## Admin Password

Set the password with:

```bash
export monitor_dash_pwd='<password>'
```

The password is not stored in YAML config.

## Session Secrets

Configure stable random values:

```yaml
security:
  jwt_secret: "<random>"
  cookie_hash_key: "<random>"
  cookie_block_key: "<random>"
```

Changing these values invalidates browser sessions.

## HTTPS Boundary

Production deployments should expose Dash only through HTTPS and terminate TLS at Nginx, Caddy, or a load balancer before reverse-proxying to Dash.

## Node Secrets

Nodes authenticate with `X-Node-Secret`. Use a distinct secret for each node and rotate it from the admin console when needed.

## File Permissions

Dash release services write sensitive config and unit files as root. Config files use restricted permissions. Linux node service uses the `ithiltir` user and writes only to `/var/lib/ithiltir-node`.

## Unsupported

- Dash URL subpath deployment.
- Multiple Dash instances writing to the same database and Redis.

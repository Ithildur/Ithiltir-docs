---
slug: /Guides/SecurityHardening
title: Security Hardening
---

# Security Hardening

## Admin Credentials

`monitor_dash_pwd` requires at least 8 visible ASCII characters with no whitespace and must not be stored in YAML. `auth.jwt_signing_key` requires at least 32 random bytes with no surrounding whitespace.

## Node Secrets

Use a distinct secret per node. After trimming, it must contain 8–128 Unicode characters. Rotate it in Dash, update `report.yaml`, and restart the Node service.

## HTTPS and Proxy

Expose Dash through an HTTPS domain at root. Forward `/api`, `/theme`, `/deploy`, and `/`, preserve forwarding headers, and trust only the actual proxy CIDRs. Dash does not support URL subpaths.

## Redis and PostgreSQL

Do not expose Redis publicly. Restrict its network and credentials; the ACL user must allow `PING` and `INFO server`. `--no-redis` is not a hardening feature: sessions and frontend cache move to process memory.

PostgreSQL contains durable metrics, node metadata, open alert events, notification outbox, traffic progress, and settings. Back it up before upgrades and migrations.

## Notification Key

Restrict both config and key:

```bash
sudo chmod 600 /opt/Ithiltir-dash/configs/config.local.yaml
sudo chmod 600 /opt/Ithiltir-dash/configs/notify-config.key
```

Back up `notify-config.key` separately from PostgreSQL. If ciphertext exists, never replace a lost key with a new one.

## Webhooks

Validate `X-Webhook-Signature` and deduplicate by the event headers. Dash follows at most five same-host redirects, preserves same-scheme ports, permits only HTTP-to-HTTPS upgrade, and follows POST only through `307` or `308`.

## Unsupported Patterns

- Dash under a URL subpath.
- Multiple active Dash writers for one state set.
- Public PostgreSQL, Redis, backend ports, Node local pages, or Push debug ports.
- Shared Node secrets.

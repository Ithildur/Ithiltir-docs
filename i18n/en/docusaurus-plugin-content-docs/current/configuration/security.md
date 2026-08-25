---
slug: /Config/Security
title: Security Config
---

# Security Config

## Admin Credentials

Set the admin password only through:

```bash
export monitor_dash_pwd='<password>'
```

It requires at least 8 visible ASCII characters and no whitespace.

Do not reuse it as a node secret or database password, and do not store it in Git, public documentation, or frontend code. Restart Dash after rotating the password.

Configure `auth.jwt_signing_key` with at least 32 random bytes and no surrounding whitespace. Rotating it invalidates active access tokens.

## Notification Encryption Key

`dash migrate` creates `$DASH_HOME/configs/notify-config.key`, a raw 32-byte key used for AES-256-GCM channel-config encryption. It must be a regular owner-readable-only file.

Back it up separately from PostgreSQL. If ciphertext exists, never replace a missing key with a newly generated one; the stored channel credentials would be unrecoverable and Dash would refuse startup.

## Browser Boundary

Production deployments should expose Dash through HTTPS at one root URL. Refresh cookies use `SameSite=Strict`. Responses include CSP, Permissions Policy, `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, and framing protection.

## Node Secrets

Nodes authenticate with `X-Node-Secret`. Use a distinct secret per node. After trimming, secrets must contain 8–128 Unicode characters.

To rotate a secret, update the node in Dash, update the node's local `report.yaml`, and restart the node service.

## Webhook Redirects

Notification HTTP requests follow at most five redirects. Every hop keeps the original host; same-scheme redirects keep the effective port; HTTP may upgrade to HTTPS but never downgrade. POST follows only `307` and `308`.

## Unsupported

- Dash URL subpath deployment.
- Multiple Dash instances writing the same state.

See [Security Hardening](../operations/security-hardening.md) for post-deployment checks covering public ports, file permissions, PostgreSQL, and Redis.

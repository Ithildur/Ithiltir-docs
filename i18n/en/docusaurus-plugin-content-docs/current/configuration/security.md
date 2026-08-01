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

Configure `auth.jwt_signing_key` with at least 32 random bytes and no surrounding whitespace. Rotating it invalidates active access tokens.

## Notification Encryption Key

`dash migrate` creates `$DASH_HOME/configs/notify-config.key`, a raw 32-byte key used for AES-256-GCM channel-config encryption. It must be a regular owner-readable-only file.

Back it up separately from PostgreSQL. If ciphertext exists, never replace a missing key with a newly generated one; the stored channel credentials would be unrecoverable and Dash would refuse startup.

## Browser Boundary

Production deployments should expose Dash through HTTPS at one root URL. Refresh cookies use `SameSite=Strict`. Responses include CSP, Permissions Policy, `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, and framing protection.

## Node Secrets

Nodes authenticate with `X-Node-Secret`. Use a distinct secret per node. After trimming, secrets must contain 8–128 Unicode characters.

## Webhook Redirects

Notification HTTP requests follow at most five redirects. Every hop keeps the original host; same-scheme redirects keep the effective port; HTTP may upgrade to HTTPS but never downgrade. POST follows only `307` and `308`.

## File and Service Permissions

Restrict `config.local.yaml` and `notify-config.key` to the Dash runtime owner. Linux systemd Node installs use the `ithiltir` user and limit writes to `/var/lib/ithiltir-node`; root-owned collector assets stay outside that tree.

## Unsupported

- Dash URL subpath deployment.
- Multiple Dash instances writing the same state.

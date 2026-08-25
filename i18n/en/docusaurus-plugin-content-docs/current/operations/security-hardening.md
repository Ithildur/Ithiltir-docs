---
slug: /Operations/SecurityHardening
title: Security Hardening
---

# Security Hardening

See [Security Config](../configuration/security.md) for admin-password, JWT signing-key, node-secret, notification-key, and webhook-signature constraints.

## Public Entry Points

Expose only reverse-proxy port `443` publicly. Port `80` is limited to certificate issuance or HTTP redirects.

Do not expose these services publicly:

- PostgreSQL.
- Redis.
- The Dash backend listener.
- The Node local-mode page.
- The Node Push debug port.

Restrict the Dash backend listener to the local host or private network. Bind PostgreSQL and Redis to local or explicit private addresses and restrict their source networks with a firewall.

## Reverse Proxy

Before release, verify:

- `app.public_url` matches the public HTTPS domain.
- `/api`, `/theme`, `/deploy`, and `/` remain on the same origin.
- Dash is served at the domain root, not a URL subpath.
- `http.trusted_proxies` contains only the actual proxy CIDRs.
- Node installation and reporting use HTTPS.

See [Reverse Proxy](../installation/reverse-proxy.md) for Nginx and Caddy configurations.

## Sensitive Files

Linux release packages use these permissions:

```bash
sudo chown root:root /opt/Ithiltir-dash/configs/config.local.yaml
sudo chmod 600 /opt/Ithiltir-dash/configs/config.local.yaml
sudo chown root:root /opt/Ithiltir-dash/configs/notify-config.key
sudo chmod 600 /opt/Ithiltir-dash/configs/notify-config.key
sudo chmod 600 /var/lib/ithiltir-node/report.yaml
```

Store `notify-config.key` separately from PostgreSQL backups. If notification ciphertext already exists, do not replace a lost key file with a newly generated key.

Windows node configuration is stored at `%ProgramData%\Ithiltir-node\report.yaml`. Use NTFS ACLs to prevent ordinary users from reading it.

## Database and Redis

PostgreSQL:

- Use a dedicated database account.
- Grant the operations required for migration and runtime use.
- Use PostgreSQL SSL and an explicit network policy for cross-network connections.
- Run regular backup and restore verification.

Redis:

- Enable authentication and restrict source networks.
- Allow the Dash account to run `PING` and `INFO server`.
- Do not use Redis as the only backup of persistent data.

`--no-redis` moves admin sessions and frontend caches into process memory. It is not a production hardening option.

## Service Permissions

The Linux node systemd unit runs as the dedicated `ithiltir` user and limits writable paths to `/var/lib/ithiltir-node`. Preserve these restrictions when changing the unit:

- `NoNewPrivileges`.
- `PrivateTmp`.
- `ProtectSystem=strict`.
- `ProtectHome=true`.
- `ReadWritePaths=/var/lib/ithiltir-node`.

The Dash process should have only the system permissions required to read its configuration, access runtime directories, and bind its backend listener.

## Verification

```bash
ss -lntp
stat -c '%a %U:%G %n' \
  /opt/Ithiltir-dash/configs/config.local.yaml \
  /opt/Ithiltir-dash/configs/notify-config.key \
  /var/lib/ithiltir-node/report.yaml
```

Verify that:

- A public scan shows only the expected HTTP(S) entry points.
- Dash and Node logs contain no passwords, secrets, tokens, or notification credentials.
- Login, node reporting, theme upload, and webhook tests use HTTPS.
- PostgreSQL backups and `notify-config.key` can be restored separately into a controlled environment.

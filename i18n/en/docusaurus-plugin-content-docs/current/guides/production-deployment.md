---
slug: /Guides/ProductionDeployment
title: Production Deployment Checklist
---

# Production Deployment Checklist

Production deployment fixes the boundaries: one Dash instance, recoverable PostgreSQL, available Redis, domain HTTPS entrypoint, same-origin reverse proxy, and nodes reporting only to a trusted Dash.

## Version and Platform

Confirm deployment targets:

- Dash: Linux amd64 or Linux arm64 release package.
- Linux node: amd64 or arm64.
- macOS node: arm64.
- Windows node: amd64 or arm64, managed by the runner.

Confirm runtime dependencies:

- PostgreSQL 16+.
- TimescaleDB.
- Redis.
- systemd Linux distribution, or the matching macOS/Windows service manager.

The release installer detects and prepares Dash-side runtime dependencies. Debian/Ubuntu systems that use `apt-get` do not need PostgreSQL, TimescaleDB, or Redis installed manually first, unless you use external services, offline hosts, or restricted servers.

Source runs or custom packaging additionally need:

- Go 1.26+.
- Bun 1.3.11.

## Dash Install

Use a release package:

```bash
tar -xzf Ithiltir_dash_linux_amd64.tar.gz
cd Ithiltir-dash
sudo bash install_dash_linux.sh --lang en
```

Fixed paths after install:

| Item | Path |
| --- | --- |
| Install directory | `/opt/Ithiltir-dash` |
| Config file | `/opt/Ithiltir-dash/configs/config.local.yaml` |
| systemd unit | `/etc/systemd/system/dash.service` |
| Theme directory | `/opt/Ithiltir-dash/themes` |

Service check:

```bash
systemctl status dash.service
journalctl -u dash.service -n 100 --no-pager
```

## Required Config

Confirm at least these fields in `/opt/Ithiltir-dash/configs/config.local.yaml`:

```yaml
app:
  listen: ":8080"
  public_url: "https://dash.example.com"
  timezone: "Asia/Hong_Kong"
  language: "en"
  log_level: "info"
  log_format: "json"

http:
  trusted_proxies:
    - 127.0.0.1/32
    - ::1/128

database:
  driver: postgres
  host: 127.0.0.1
  port: 5432
  user: ithiltir
  password: "<db-password>"
  name: ithiltir
  sslmode: disable
  retention_days: 45
  traffic_retention_days: 90

redis:
  addr: 127.0.0.1:6379

auth:
  jwt_signing_key: "<high-entropy-random-string>"
```

The admin password is read only from the environment:

```bash
export monitor_dash_pwd='<admin-password>'
```

The systemd environment should be written by the installer into the unit or a dedicated environment file. The password must be visible ASCII.

## Database Migration

Run migrations after first deployment and every upgrade:

```bash
/opt/Ithiltir-dash/bin/dash migrate -config /opt/Ithiltir-dash/configs/config.local.yaml
```

The release installer and updater run migrations automatically. Run this command manually only after manual binary replacement, backup restore, or database connection changes. If migration fails, do not start the new service. Fix database connectivity, permissions, or extension state first.

## Reverse Proxy

Dash should be deployed at the HTTPS domain root:

```text
https://dash.example.com/
```

Proxy same-origin paths:

- `/api`
- `/theme`
- `/deploy`
- `/`

Do not deploy as:

```text
https://example.com/dash/
```

`app.public_url` must not contain a path prefix. If the reverse proxy is local, `trusted_proxies` should only contain local addresses. If it is on another internal host, use explicit CIDRs only.

Do not expose this as the formal deployment URL:

```text
http://10.0.0.2:8080/
```

Backend ports such as `:8080` should be reachable only from localhost or a private network. Public ingress belongs to Nginx, Caddy, or a load balancer.

## Redis Policy

Use Redis in production. `--no-redis` is only for tests or tiny fallback deployments.

Actual impact of `--no-redis`:

- Sessions live in Dash process memory.
- Hot snapshots live in Dash process memory.
- Alert runtime state lives in Dash process memory.
- Those runtime states are lost after Dash restart.
- PostgreSQL metrics history, nodes, alert rules, and system settings are unaffected.

## Node Enrollment

Create a node in the admin console and copy its secret. Linux example:

```bash
curl -fsSL https://dash.example.com/deploy/linux/install.sh -o install_node.sh
sudo bash install_node.sh dash.example.com 443 '<node-secret>' 3 --net eth0
```

Check after install:

```bash
systemctl status ithiltir-node.service
journalctl -u ithiltir-node.service -n 100 --no-pager
```

Check report config:

```bash
/var/lib/ithiltir-node/current/ithiltir-node report list
```

The Linux node installer downloads the node binary bundled with Dash and registers a systemd service. When LVM/LVM-thin is detected, it installs/enables cron for thinpool cache collection; `apt-get` systems do not need cron installed ahead of time.

## Backup

Must back up:

- PostgreSQL database.
- `/opt/Ithiltir-dash/configs/config.local.yaml`.
- `/opt/Ithiltir-dash/themes`.

Recommended:

- `/opt/Ithiltir-dash/install_id`.
- Node-local `report.yaml`.

Redis is normally not the primary recovery data. After recovery, users log in again, hot snapshots rebuild, and alert runtime state starts fresh.

## Go-Live Checks

Dash:

```bash
curl -I https://dash.example.com/
curl -fsS https://dash.example.com/api/version/
curl -I https://dash.example.com/deploy/linux/install.sh
```

Node:

```bash
systemctl status ithiltir-node.service
journalctl -u ithiltir-node.service -f
```

Browser:

- Open `/login`.
- Log in to the admin console.
- Create or check a node.
- Confirm the node is online.
- Check historical metrics.
- Check traffic statistics.
- Create a test alert rule and verify the notification channel.

## Before Upgrade

Before upgrading:

1. Back up PostgreSQL and Dash config.
2. Read release notes and confirm the Ithiltir-node version bundled with Dash.
3. Run migrations before starting the new Dash.

See [Upgrade](../installation/upgrade.md).

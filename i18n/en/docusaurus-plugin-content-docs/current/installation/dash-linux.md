---
slug: /Install/DashLinux
title: Install Dash
---

# Install Dash

Use release packages for production. Source runs are for development and validation.

## Release Package

After extraction, the Dash package directory is `Ithiltir-dash`:

```text
Ithiltir-dash/
  bin/dash
  configs/config.example.yaml
  dist/
  deploy/
  install_dash_linux.sh
  update_dash_linux.sh
  logs/
```

`dist/` contains frontend assets. `deploy/` contains node install scripts and node binaries.

## Install

```bash
tar -xzf Ithiltir_dash_linux_amd64.tar.gz
cd Ithiltir-dash
sudo bash install_dash_linux.sh --lang en
```

On supported systemd Linux hosts, do not preinstall PostgreSQL or Redis with `apt` first. The script checks the OS and existing services, then decides whether to reuse them, install packages, or prompt for a Redis source install.

The install script:

1. Checks the OS and package manager.
2. Detects and prepares PostgreSQL 16+, TimescaleDB, and Redis.
3. Copies the release package to `/opt/Ithiltir-dash`.
4. Interactively writes `/opt/Ithiltir-dash/configs/config.local.yaml`.
5. Writes the admin password environment variable to the systemd unit.
6. Runs `dash migrate`.
7. Writes and starts `/etc/systemd/system/dash.service`.

Dependency handling:

| Scenario | Behavior |
| --- | --- |
| Debian / Ubuntu | Uses `apt-get` for base tools, PostgreSQL 16, TimescaleDB, and Redis |
| Existing PostgreSQL / Redis satisfies the version requirement | Reuses the existing service |
| Redis package is too old | Prompts for source install or upgrade to Redis 8.2+ |
| No systemd or no supported package manager | Stops automatic install; use manual deployment |

## Install Paths

| Path | Content |
| --- | --- |
| `/opt/Ithiltir-dash/bin/dash` | Dash executable |
| `/opt/Ithiltir-dash/configs/config.local.yaml` | Local config |
| `/opt/Ithiltir-dash/dist` | SPA assets |
| `/opt/Ithiltir-dash/deploy` | Node deployment assets |
| `/opt/Ithiltir-dash/themes` | Custom themes |
| `/opt/Ithiltir-dash/install_id` | Dash install identity |
| `/etc/systemd/system/dash.service` | systemd unit |

Config and service files are tightened to root ownership and `0600`.

## Required Install Inputs

| Item | Meaning |
| --- | --- |
| `app.listen` | Dash listen address, for example `:8080` |
| `app.public_url` | Root URL exposed to browsers and nodes |
| `app.language` | `zh` or `en` |
| `app.node_offline_threshold` | Offline threshold, default `14s` |
| `database.user` | Dash database user |
| `database.password` | Database password |
| `database.name` | Database name |
| `database.retention_days` | Normal metrics retention days |
| `redis.addr` | Redis address |
| `http.trusted_proxies` | Trusted reverse proxy CIDRs |

Use an HTTPS domain for `app.public_url`, for example `https://dash.example.com`. Production deployments should put Nginx or Caddy in front of Dash and proxy to the local backend port. Direct IP+HTTP is only for temporary testing.

## Service Management

```bash
systemctl status dash.service
journalctl -u dash.service -f
systemctl restart dash.service
```

## Re-run the Installer

If `/opt/Ithiltir-dash/configs/config.local.yaml` and `dash.service` already exist, the installer reports an existing installation. Choosing file-only update copies the current package into the install directory, runs migrations, and restarts the service without redoing interactive configuration.

## Manual Migration

```bash
sudo env DASH_HOME=/opt/Ithiltir-dash \
  /opt/Ithiltir-dash/bin/dash migrate \
  -config /opt/Ithiltir-dash/configs/config.local.yaml
```

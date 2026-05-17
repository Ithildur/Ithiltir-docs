---
slug: /Dash/Install
title: Dash Install
---

# Install Dash

Dash supports source runs and Linux release package installation. Use release packages for production.

## Requirements

- Linux amd64 or Linux arm64 release package.
- systemd Linux distribution.

The release installer detects and prepares PostgreSQL 16+, TimescaleDB, and Redis. Debian/Ubuntu systems that use `apt-get` do not need these dependencies installed manually first.

Source runs require you to prepare:

- Go 1.26+.
- Bun 1.3.11.
- PostgreSQL 16+ and TimescaleDB.
- Redis, or `--no-redis` for local trials.

## Release Package Install

Extract the package:

```bash
tar -xzf Ithiltir_dash_linux_amd64.tar.gz
cd Ithiltir-dash
```

Run the installer:

```bash
sudo bash install_dash_linux.sh --lang en
```

The installer writes:

- Install directory: `/opt/Ithiltir-dash`
- Config file: `/opt/Ithiltir-dash/configs/config.local.yaml`
- systemd unit: `dash.service`

The script prompts for database, Redis, admin password, public URL, language, retention, and trusted reverse proxies.

When dependencies are missing, the script uses the system package manager where supported. If the Redis package is too old, it prompts for source install/upgrade.

## Source Run

```bash
cp configs/config.example.yaml config.local.yaml
export monitor_dash_pwd='<password>'
go run ./cmd/dash migrate -config config.local.yaml
go run ./cmd/dash -debug
```

Frontend development server:

```bash
cd web
FRONT_TEST_API=http://127.0.0.1:8080 bun run dev
```

The Vite development server only proxies `/api` and `/theme`; frontend code still uses same-origin relative paths.

## Update

Installed Linux services can be checked and updated with:

```bash
sudo bash /opt/Ithiltir-dash/update_dash_linux.sh --check
sudo bash /opt/Ithiltir-dash/update_dash_linux.sh -y --lang en
```

The default target is the latest stable release. Use `--test` for prereleases:

```bash
sudo bash /opt/Ithiltir-dash/update_dash_linux.sh --check --test
sudo bash /opt/Ithiltir-dash/update_dash_linux.sh -y --test --lang en
```

The updater follows the target release channel, downloads the matching GitHub Release asset, and keeps existing configuration.

## Reverse Proxy

The reverse proxy must keep same-origin paths:

- `/api`
- `/theme`
- `/deploy`
- `/`

Do not deploy Dash under a URL subpath. `app.public_url` must not be `https://example.com/dash`.

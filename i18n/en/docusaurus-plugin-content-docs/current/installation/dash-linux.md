---
slug: /Install/DashLinux
title: Install Dash
---

# Install Dash

Use a Linux release package for production. `install_dash_linux.sh` is first-install-only; reinstall, repair, rollback, and version changes use `dash update`.

## Package

A format-v1 package contains `release.env`, `bin/dash`, `configs/config.example.yaml`, frontend output, deploy assets, and the Linux install/update scripts. `release.env` binds Dash/Node versions, target platform, and all bundled Node/runner assets by SHA-256. Local config is never packaged.

## Install

On systemd:

```bash
tar -xzf Ithiltir_dash_linux_amd64.tar.gz
cd Ithiltir-dash
sudo bash install_dash_linux.sh --lang en --service-manager=systemd
```

Without systemd, explicitly select manual mode:

```bash
sudo bash install_dash_linux.sh --lang en --service-manager=none
```

`auto` selects systemd only when it is running. `none` installs files and `run_dash.sh` but does not register, start, or enable a service.

The installer requires `pgrep`. Supported Debian/Ubuntu hosts can have PostgreSQL 16+, matching TimescaleDB, and Redis prepared by the installer. Alpine must have those services preinstalled.

Redis runtime support starts at `6.2.0`; `8.2.3+` is recommended and is the managed install target. The default source version is `8.2.5`. Remote Redis is checked at its configured endpoint with `PING` and `INFO server`.

## Layout

```text
/opt/Ithiltir-dash/
  releases/<version>/
  current -> releases/<version>
  bin/dash -> ../current/bin/dash
  dist -> current/dist
  deploy -> current/deploy
  configs/
    config.example.yaml
    config.local.yaml
    notify-config.key
  runtime/
  logs/
  themes/
  install_id
  run_dash.sh
```

Config, runtime, logs, themes, and `install_id` stay outside immutable releases. Flat paths are compatibility aliases.

## Required Boundaries

- `app.public_url` is an HTTP(S) root URL; production should use an HTTPS domain.
- `app.node_offline_threshold` defaults to `17s` on a fresh installation and must be positive. Version updates do not rewrite an explicitly configured value.
- `monitor_dash_pwd` has at least 8 visible ASCII characters and no whitespace.
- `auth.jwt_signing_key` has at least 32 bytes and no surrounding whitespace.
- PostgreSQL is 16+ and TimescaleDB matches its major version.
- Redis is 6.2.0+ and the ACL user permits `PING` and `INFO server`.

Fresh installations write `database.metrics_raw_retention_days: 8`. The installer retention choice sets only `database.retention_days`, which controls raw NIC metrics and service checks.

Migration creates `configs/notify-config.key`; back it up separately from PostgreSQL.

## Service

```bash
systemctl status dash.service
journalctl -u dash.service -f
systemctl restart dash.service
```

Manual mode runs `/opt/Ithiltir-dash/run_dash.sh`.

After a successful first install, do not rerun the installer. Use:

```bash
sudo /opt/Ithiltir-dash/bin/dash update
```

See [Upgrade](./upgrade.md).

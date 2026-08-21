---
slug: /Dash/Install
title: Install Dash
---

# Install Dash

Production uses a Linux release package. The installer is first-install-only; later version changes use native `dash update`.

## Requirements

- Linux amd64 or arm64.
- PostgreSQL 16+ and TimescaleDB built for that PostgreSQL major.
- Redis 6.2.0+; 8.2.3+ recommended, or `--no-redis` for local trials.
- Running systemd for service mode, or explicit `--service-manager=none`.

Source builds also require Go 1.26.6+ and Bun 1.3.11.

## Install

```bash
tar -xzf Ithiltir_dash_linux_amd64.tar.gz
cd Ithiltir-dash
sudo bash install_dash_linux.sh --lang en --service-manager=systemd
```

Manual runtime mode uses `--service-manager=none`.

The installer validates `release.env` and the candidate binary, writes `/opt/Ithiltir-dash/releases/<version>`, and atomically switches `current`. Config, logs, themes, update state, and `install_id` stay outside releases.

See [Install Dash](../../installation/dash-linux.md) for the complete boundary.

## Source Run

```bash
cp configs/config.example.yaml config.local.yaml
export monitor_dash_pwd='<at least 8 visible ASCII characters>'
go run ./cmd/dash migrate -config config.local.yaml
go run ./cmd/dash -debug
```

## Update

```bash
sudo /opt/Ithiltir-dash/bin/dash update --check
sudo /opt/Ithiltir-dash/bin/dash update
sudo /opt/Ithiltir-dash/bin/dash update reinstall
```

Use `--test` for prereleases. `update_dash_linux.sh` is only a legacy wrapper. Recovery uses `sudo /opt/Ithiltir-dash/bin/dash update recover`.

Dash supports only root-path deployment. Reverse proxies must preserve `/api`, `/theme`, `/deploy`, and `/`.

---
slug: /Install/Requirements
title: Requirements
---

# Requirements

## Dash

| Item | Requirement |
| --- | --- |
| Operating system | Release packages currently target Linux amd64 and Linux arm64 |
| Database | PostgreSQL 16+ |
| Time-series extension | TimescaleDB |
| Cache | Redis |
| Memory | Minimum 2 GB RAM recommended; enable swap below 4 GB |
| Disk | SSD/NVMe recommended, 40 GB minimum starting point |
| Time sync | NTP, chrony, or systemd-timesyncd must be enabled |

These are runtime dependencies, not a list of packages you must install before running the release installer. The release installer detects, installs, or reuses them as needed.

## Linux Installer Scope

`install_dash_linux.sh` from the Dash release package supports:

- Debian 11+
- Ubuntu 22+
- RHEL / Rocky / Alma / Oracle / CentOS 8+
- Fedora 33+
- Arch / Manjaro

The install script depends on systemd. Systems without `systemctl` should use manual installation.

| Family | Package manager | Installer behavior |
| --- | --- | --- |
| Debian / Ubuntu | `apt-get` | Installs base tools, configures PostgreSQL PGDG and TimescaleDB repositories, installs PostgreSQL 16, TimescaleDB, and Redis |
| RHEL / Rocky / Alma / Oracle / CentOS / Fedora | `dnf` / `yum` | Configures PostgreSQL repositories and installs PostgreSQL 16, TimescaleDB, and Redis |
| Arch / Manjaro | `pacman` | Uses system repositories for PostgreSQL, TimescaleDB, and Redis |

Existing PostgreSQL 16+, TimescaleDB, or Redis services are reused when they satisfy requirements. Manual setup is for restricted hosts, offline hosts, external database/Redis deployments, or unsupported distributions.

## Redis

The install script treats Redis 8.2+ as the target. If an existing Redis installation satisfies the requirement, it is reused. If Redis is missing or too old, the script first tries the package manager and then prompts for source install/upgrade.

Redis stores:

- Admin sessions.
- Hot frontend snapshots.
- Alert runtime state.

`dash --no-redis` starts without Redis, but those states move into process memory and disappear after restart.

## Retention

Defaults:

- Normal metrics: `45 days`.
- Traffic 5-minute fact table: `max(database.retention_days, 45)`.

For 95th percentile billing review, set `database.traffic_retention_days` to `90` or higher.

## Ithiltir-node

| Platform | Architecture | Service manager |
| --- | --- | --- |
| Linux | amd64, arm64 | systemd |
| macOS | arm64 | LaunchDaemon |
| Windows | amd64, arm64 | Windows Service + runner |

Nodes must be able to reach Dash `app.public_url`. Push mode reports over HTTP(S); Dash does not connect back to the node.

The Linux node installer needs root/sudo, systemd, and `curl` or `wget`. When LVM/LVM-thin is detected, it enables thinpool cache collection; on `apt-get` systems it installs `cron` automatically.

## Build Environment

Only source builds and custom packaging require:

- Go 1.26+
- Bun 1.3.11
- Git
- tar or zip
- GoReleaser; the node build script installs `v2.15.2` when missing

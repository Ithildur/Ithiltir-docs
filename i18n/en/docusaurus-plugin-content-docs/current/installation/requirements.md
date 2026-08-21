---
slug: /Install/Requirements
title: Requirements
---

# Requirements

## Dash

| Item | Requirement |
| --- | --- |
| Operating system | Release packages target Linux amd64 and arm64 |
| Database | PostgreSQL 16+ |
| Time-series extension | TimescaleDB built for the same PostgreSQL major version |
| Cache | Redis 6.2.0+; 8.2.3+ recommended |
| Memory | 2 GB RAM recommended minimum; enable swap below 4 GB |
| Disk | SSD/NVMe recommended; 40 GB starting point |
| Time sync | NTP, chrony, or systemd-timesyncd must be enabled |

These are runtime dependencies. The release installer detects and reuses or prepares them where supported.

## Linux Installer Scope

`install_dash_linux.sh` supports Debian 11+, Ubuntu 22+, RHEL-family 8+, Fedora 33+, Arch/Manjaro, and Alpine with preinstalled services.

Service-manager modes are `systemd` and explicit `none`. Auto-detection selects systemd only when it is actually running. `none` installs files and a manual start script without registering or starting a service.

Alpine must already have PostgreSQL 16+, matching TimescaleDB, and Redis 6.2.0+ running.

## Redis

Dash runs `PING` and `INFO server` against the configured endpoint. The Redis ACL user must allow both commands. An unavailable service, unknown version, or version below `6.2.0` stops startup; versions below `8.2.3` run with a warning.

When the installer manages local Redis, it targets `8.2.3+`; the default source version is `8.2.5`. Remote-only Redis does not require a local `redis-server` binary.

Redis stores admin sessions and disposable frontend caches. With `--no-redis`, those move to process memory and disappear on restart. Alert pending/cooldown state and MTProto login handshakes are process-local in both modes.

## Retention

- Normal metrics default to `45 days`.
- Traffic 5-minute facts default to `max(database.retention_days, 45)`.

For 95th-percentile billing review, set `database.traffic_retention_days` to `90` or higher.

## Ithiltir-node

| Platform | Architecture | Service manager |
| --- | --- | --- |
| Linux | amd64, arm64 | systemd, Alpine/OpenRC, explicit `none` |
| macOS | arm64 | LaunchDaemon |
| Windows | amd64, arm64 | Windows Service + runner |

The Linux installer needs root/sudo, `pgrep`, and `curl` or `wget`. Alpine/OpenRC also requires `bash`, `ca-certificates`, `curl`, and `coreutils`, and uses `supervise-daemon`. Other OpenRC distributions are best-effort.

## Build Environment

Source builds and custom packaging require Go 1.26.6+, Bun 1.3.11, Git, tar or zip, and GoReleaser for Node builds. The docs site requires Node.js 24 (`>=24 <25`).

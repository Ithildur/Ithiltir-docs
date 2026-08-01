---
slug: /Dash/Commands
title: Dash Commands
---

# Dash Commands

## Start

```bash
/opt/Ithiltir-dash/bin/dash -config /opt/Ithiltir-dash/configs/config.local.yaml
```

Common options:

| Option | Description |
| --- | --- |
| `-debug` | Enable debug logs and print redacted config |
| `--no-redis` | Skip Redis config/connection; use process memory for sessions and frontend cache |

`--no-redis` does not change the persistence boundary. Metrics history, nodes, alert rules, and system settings remain in PostgreSQL.

## Migrate

```bash
env DASH_HOME=/opt/Ithiltir-dash /opt/Ithiltir-dash/bin/dash migrate -config /opt/Ithiltir-dash/configs/config.local.yaml
```

Run migrations after manual binary replacement, backup restore, or database connection changes.

Migration is forward-only, skips Redis config, and creates `$DASH_HOME/configs/notify-config.key` when notification encryption is introduced.

## Redis Check

```bash
dash check-redis --addr <host:port> [--password-file path]
```

The password file must contain only the password, without a trailing newline.

## Linux Update

```text
dash update [--check] [--test] [-y|--yes] [--lang zh|en] [--service-manager auto|systemd|none]
dash update reinstall [same options]
dash update recover
```

## Pack Theme

```bash
/opt/Ithiltir-dash/bin/dash pack-theme -src ./theme -out theme.zip
```

## Version

```bash
/opt/Ithiltir-dash/bin/dash --version
/opt/Ithiltir-dash/bin/dash update --node-version
```

The first command prints the Dash version. The second prints the bundled Ithiltir-node version for package validation.

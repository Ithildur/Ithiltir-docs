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
| `--no-redis` | Use in-process runtime state instead of Redis |

`--no-redis` does not change the persistence boundary. Metrics history, nodes, alert rules, and system settings remain in PostgreSQL.

## Migrate

```bash
env DASH_HOME=/opt/Ithiltir-dash /opt/Ithiltir-dash/bin/dash migrate -config /opt/Ithiltir-dash/configs/config.local.yaml
```

Run migrations after manual binary replacement, backup restore, or database connection changes.

## Pack Theme

```bash
/opt/Ithiltir-dash/bin/dash pack-theme -src ./theme -out theme.zip
```

## Version

```bash
/opt/Ithiltir-dash/bin/dash --version
```

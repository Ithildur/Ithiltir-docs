---
slug: /Reference/DashCLI
title: Dash CLI
---

# Dash CLI

## Start

```bash
dash [-debug] [--no-redis]
```

| Argument | Description |
| --- | --- |
| `-debug` | Enable debug logs and print redacted config |
| `--no-redis` | Do not connect to Redis; use in-process runtime state |

Startup sequence:

1. Load config.
2. Initialize logging.
3. Validate the admin password.
4. Connect to PostgreSQL + TimescaleDB.
5. Sync retention policies.
6. Connect to Redis unless `--no-redis` is set.
7. Initialize store, theme directory, default group, and JWT.
8. Start HTTP, alert, and traffic background services.

## Database Migration

```bash
dash migrate [-config path] [-debug]
```

Output:

```text
migrate: total=<n> applied=<n> skipped=<n>
```

Migration also syncs TimescaleDB retention policies.

## Theme Packing

```bash
dash pack-theme -src <theme-dir> [-out <theme.zip>]
```

`-src` is required. If `-out` is omitted, output is `<theme-id>.zip`. A missing `.zip` extension is added automatically.

## Version

```bash
dash --version
dash -v
```

Prints the current Dash version.

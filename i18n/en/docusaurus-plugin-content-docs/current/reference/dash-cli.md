---
slug: /Reference/DashCLI
title: Dash CLI
---

# Dash CLI

## Start

```bash
dash [-debug] [--no-redis]
```

`--no-redis` skips Redis config and connection; admin sessions and frontend caches use process memory.

Normal startup requires an exact `goose_db_version` match and successful decryption of every notification config. Redis mode runs `PING`, `INFO server`, and a `6.2.0+` version check; versions below recommended `8.2.3` produce a warning.

## Migrate

```bash
dash migrate [-config path] [-debug]
```

Migration advances older schemas and rejects newer schemas. It does not load or connect Redis. Notification encryption migration creates `$DASH_HOME/configs/notify-config.key` and never replaces a missing key when ciphertext exists.

## Check Redis

```bash
dash check-redis --addr <host:port> [--password-file path]
```

Runs `PING`, `INFO server`, and the minimum-version check against the specified endpoint. The password file is limited to 4 KiB and must contain only the password, without a trailing newline.

## Linux Update

```text
dash update [--check] [--test] [-y|--yes] [--lang zh|en] [--service-manager auto|systemd|none]
dash update reinstall [--check] [--test] [-y|--yes] [--lang zh|en] [--service-manager auto|systemd|none]
dash update recover
```

`--check` does not install. `--test` selects the latest prerelease. `reinstall` reapplies the selected version. `recover` resolves a persistent transaction; after migration starts, recovery is forward-only.

## Pack Theme

```bash
dash pack-theme -src <theme-dir> [-out <theme.zip>]
```

Omitting `-out` writes `<theme-id>.zip`.

## Version

```bash
dash --version
dash -v
dash update --node-version
```

The first two commands print the Dash version. `dash update --node-version` prints the bundled Node version for package validation.

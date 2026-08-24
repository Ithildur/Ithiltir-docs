---
slug: /Install/Upgrade
title: Upgrade
---

# Upgrade

Dash database migrations are forward-only. Node updates use a separate lifecycle.

## Upgrading from 0.2.7

Before upgrading, verify:

- `monitor_dash_pwd` has at least 8 visible ASCII characters and no whitespace.
- `auth.jwt_signing_key` has at least 32 bytes and no surrounding whitespace.
- `app.public_url` uses an IP literal or ASCII DNS host; use IDNA/punycode for internationalized domains.
- YAML has no unknown fields or invalid explicit durations.
- Database and Redis pool values satisfy current constraints.
- The configured Redis server is `6.2.0+` and allows `PING` and `INFO server`.
- PostgreSQL and TimescaleDB use the same PostgreSQL major version.

Back up PostgreSQL, `configs/config.local.yaml`, `themes`, and `install_id`. After migration, also back up the generated `configs/notify-config.key` separately from PostgreSQL.

Migration temporarily decompresses retained disk-metric chunks and rebuilds disposable continuous aggregates. Leave additional temporary database space available; eligible chunks are recompressed after migration.

The updater performs the upgrade in this order:

1. Stop Dash.
2. Run database migrations serially.
3. Start the new version.

The time-series migration backfills the latest 16 days of 15-minute aggregates, followed by the latest 31 days of one-hour aggregates. The required time depends on the existing data volume.

Existing raw chunks are not repartitioned. The one-hour chunk interval applies only to data written after migration. The new raw retention policy is enabled only after backfill succeeds.

The migration pauses the relevant TimescaleDB background jobs and waits for active jobs to finish. Operators do not need to pause TimescaleDB. Do not run another database migration command concurrently.

For the first upgrade from the legacy flat layout, use the installed compatibility script:

```bash
sudo bash /opt/Ithiltir-dash/update_dash_linux.sh --check
sudo bash /opt/Ithiltir-dash/update_dash_linux.sh -y --lang en
```

This transition creates the `releases/<version>` and `current` layout. Use the native command for later upgrades.

## Dash Update Commands

```bash
/opt/Ithiltir-dash/bin/dash update --check
sudo /opt/Ithiltir-dash/bin/dash update --yes --lang en
```

Prerelease and reinstall:

```bash
/opt/Ithiltir-dash/bin/dash update --check --test
sudo /opt/Ithiltir-dash/bin/dash update --yes --test --lang en
sudo /opt/Ithiltir-dash/bin/dash update reinstall --yes --test --lang en
```

`--test` selects only the latest prerelease; the default selects only the latest stable release. If the installed prerelease is newer than the latest stable release, explicitly use `--test`.

`reinstall` reapplies the selected latest package when the version is unchanged. It does not install an older target over the current version.

`update_dash_linux.sh` still accepts legacy arguments, but only forwards them to `dash update`.

## Admin Console Updates

System / Dash Update supports `release` and `prerelease` channels:

- `manual`: check and update from the page.
- `notify`: check every 6 hours and notify through enabled channels.
- `auto`: check every 6 hours, update automatically, and notify when the job reaches a terminal state.

The admin controller requires Linux/systemd and `systemd-run`. It persists an immutable plan, then starts the packaged `dash update execute` through a transient unit. Manual `dash update` also supports explicit `--service-manager=none`.

## Transaction and Recovery

The updater:

1. Resolves the target release and pins target version, current version, and install revision.
2. Enforces one archive root containing only regular files and directories, at most 1 GiB compressed, 4 GiB expanded, and 20,000 entries, then validates the release manifest.
3. Verifies the candidate-reported Dash/Node versions and SHA-256 for all seven bundled Node/runner assets.
4. Takes a root-owned cross-process lock and rechecks the install revision.
5. Stages beside the install directory on the same filesystem and writes persistent transaction and startup-block files.
6. Atomically switches `current`, runs `dash migrate`, and starts Dash. A systemd service must remain `active/running` for five seconds without increasing `NRestarts`.

Failures before migration restore the previous release and runtime state. After migration starts, the updater keeps the candidate and permits only forward recovery.

If status reports `failure_code=recovery_required` or an unfinished transaction exists, run as root:

```bash
sudo /opt/Ithiltir-dash/bin/dash update recover
```

Recovery either rolls back a pre-migration transaction or completes a post-migration transaction forward. Do not manually remove `$DASH_HOME/runtime/dash-update/transaction.env`, `update.block`, or the reported `recovery_path`.

## Database Schema

`goose_db_version` is the only schema-version source:

- Normal startup requires an exact match with embedded migrations.
- `dash migrate` advances an older schema.
- `dash migrate` rejects a newer schema.
- After schema advance, starting an old Dash binary or downgrading the install is unsupported.

Overwriting `bin/dash` or copying a new archive into the live directory breaks release and recovery invariants. A non-systemd manual install uses:

```bash
sudo /opt/Ithiltir-dash/bin/dash update --service-manager=none
```

This updates files and the database but does not manage a long-running Dash process.

## 0.3 Migration Results

- Complete notification channel configs are AES-256-GCM encrypted; the legacy logical config column becomes `{}`.
- Nodes that inherited a global billing cycle store their pre-upgrade effective cycle. New nodes use a calendar month starting on day 1.
- Usage/Facts progress moves to PostgreSQL. Facts starts from the latest 30 minutes; older data is not replayed automatically.
- Existing monthly usage `covered_from` values use the old full-cycle assumption; migration does not re-prove coverage from raw samples.
- Notification `failed_permanent` rows become `blocked` and enter low-frequency probes.
- Open alerts are restored from PostgreSQL; pending and cooldown state is not.
- Frontend cache uses the `ithiltir:dash:front:v2:*` namespace. Legacy v1, unnamespaced v2, alert-runtime, and MTProto keys are ignored and not deleted automatically; admin sessions keep the compatible `auth:jwt:*` prefix.

Invalid stored notification channels remain visible and can only be deleted and recreated. Invalid stored alert rules are marked invalid and close open events with `rule_invalid`.

## Node Upgrade

Dash packages include Node assets. When an admin starts a Node upgrade:

1. Dash selects the asset from the last reported platform.
2. `POST /api/admin/nodes/{id}/upgrade` writes a volatile task.
3. The next `POST /api/node/metrics` response includes an update manifest.
4. A supported managed layout downloads, verifies, switches, and restarts Node.

The manifest URL may contain a short-lived `upgrade_token` for protected `/deploy/*` assets. Node must use it unchanged.

Supported layouts:

- Windows: runner-managed only.
- Linux/macOS: `/var/lib/ithiltir-node/releases/<version>` plus `/var/lib/ithiltir-node/current`.

Automatic delivery requires Node `0.2.3+`. Direct binaries outside a managed layout ignore update manifests.

## Linux/macOS Force Install

When managed self-update cannot be used, rerun the installer. It stages and executes the candidate before stopping existing services or managed manual processes, then replaces the release, report config, service assets, and atomically switches `current`.

Installing the same version replaces its release and has no installer rollback. Version-upgrade recovery belongs to Node self-update.

## Version Channels

Versions use strict SemVer without a `v` prefix:

```text
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]
```

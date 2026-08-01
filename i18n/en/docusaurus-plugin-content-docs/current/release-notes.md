---
slug: /ReleaseNotes
title: Release Notes
---

# Release Notes

Release Notes record version changes that affect deployment, upgrades, configuration, APIs, and runtime behavior.

## Dash

### 0.3.0

Release date: 2026-08-01

GitHub Release: [Ithiltir 0.3.0](https://github.com/Ithildur/Ithiltir/releases/tag/0.3.0)

#### Upgrade and Runtime State

- Linux update logic moved into the native `dash update` command. Jobs, phases, logs, and recovery state persist under `$DASH_HOME/runtime/dash-update`; `update_dash_linux.sh` remains only as a compatibility entry point.
- Managed installs now use immutable `releases/<version>` directories and one atomic `current` symlink. Before stopping the service, the updater validates the release manifest, Dash/Node versions, and SHA-256 values for all seven bundled Node/runner assets.
- Failures before database migration restore the previous release. Once migration starts, recovery is forward-only; an old binary cannot be restarted against an advanced schema.
- Normal startup requires the database `goose_db_version` to exactly match the binary. `dash migrate` advances older schemas and rejects newer schemas.
- PostgreSQL persists open alerts, notification outbox rows, traffic materialization progress, current node projections, and monthly traffic usage. Alert pending/cooldown state, MTProto login handshakes, node update requests, and traffic rebuild jobs remain process-local.

#### Configuration and Security

- YAML rejects unknown fields, multiple documents, and invalid explicit durations. A present environment variable overrides YAML even when empty; an empty integer variable means `0`, while a non-empty invalid integer stops startup.
- `monitor_dash_pwd` requires at least 8 visible ASCII characters and no whitespace. `auth.jwt_signing_key` requires at least 32 bytes and no surrounding whitespace.
- `app.public_url` accepts only IP literals or ASCII DNS hosts. Internationalized domains must use IDNA/punycode, and ports must be in `1..65535`.
- Runtime Redis support starts at `6.2.0`; `8.2.3+` is recommended. Dash runs `PING` and `INFO server` against the configured endpoint. `--no-redis` skips Redis config, connection, and version validation.
- API responses add CSP, Permissions Policy, Referrer Policy, `nosniff`, and framing protection. Refresh cookies use `SameSite=Strict`.
- JSON bodies above a route limit return `413 body_too_large` instead of `400 invalid_request`.

#### Notifications and Alerts

- `dash migrate` encrypts complete notification channel configurations with AES-256-GCM and creates `$DASH_HOME/configs/notify-config.key`. Back up this key separately from PostgreSQL; Dash refuses to start without the matching key.
- Notification channels use strict schemas. Invalid stored channels remain visible with `config=null` and can only be deleted and recreated.
- The notification outbox adds `paused`, `blocked`, and `discarded` states. Channel delivery health is `unknown`, `healthy`, `degraded`, or `disabled`.
- Webhook, Telegram, and SMTP fields now have explicit size, address, URL, and redirect limits. Notification HTTP requests follow at most five safe same-host redirects; POST follows only `307` and `308`.
- SMART alert messages include affected devices, failing ATA attributes, NVMe critical warnings, and `media_errors` when available. Node-provided labels are sanitized and bounded.
- Rule names, durations, cooldowns, finite thresholds, and offsets are validated at the write boundary. Invalid stored rules close open events with `rule_invalid`.

#### Traffic and Node Contracts

- Every node now owns an explicit billing cycle. Upgrade migration freezes inherited cycles to their pre-upgrade effective values; new nodes use a calendar month starting on day 1.
- Global traffic settings no longer accept billing-cycle fields. Legacy `traffic_cycle_mode=default` is only an input alias and is stored as an explicit calendar month.
- Usage and Facts have independent materialization progress. Switching Lite to Billing starts Facts from the latest 30 minutes; older retained raw data requires a per-node rebuild.
- Traffic rebuild is available only in Billing mode. Switching to Lite lets the current chunk finish, then stops the job.
- Traffic responses remove the deprecated `partial` field. `GET /api/statistics/traffic/monthly` accepts `months` only in `1..24`.
- Node names, secrets, tags, group names, and remarks have explicit length and control-character limits. Node payload integer ranges, ratios, rates, and fixed-column text are validated before database writes, returning stable `400` or `422` errors.

#### Installation, Packaging, and UI

- `install_dash_linux.sh` is first-install-only. Non-systemd hosts must explicitly use `--service-manager=none`; all later version changes use `dash update`.
- The Linux Node installer supports systemd, Alpine/OpenRC, and explicit `none`. It stages and executes the candidate before stopping existing processes and switching the release. Rerunning it is a force install, not the Node updater's rollback path.
- Linux, macOS, and Windows Node installers follow at most five safe same-host redirects while carrying `X-Node-Secret`, and reject cross-host redirects and HTTPS downgrade.
- Release packages include only `configs/config.example.yaml`, never local config. Format-v1 `release.env` records Dash/Node versions, the target platform, and every bundled Node/runner digest.
- While the document is visible, the browser checks local `/api/version` and reloads after the installed Dash version changes. A remote Release lookup failure does not block the locally installed frontend.
- The admin console adds skip-to-content, keyboard selection, focus trapping/restoration, dialog semantics, accessible loading and tooltip labels, and reduced-motion behavior.
- The dashboard summary label “Alerts” is now “Anomalies.” It counts offline, RAID, CPU, and disk conditions, not configured alert events.

Read [Upgrade](./installation/upgrade.md) before upgrading from `0.2.7`.

### 0.2.7

Released: 2026-07-01

GitHub Release: [Ithiltir 0.2.7](https://github.com/Ithildur/Ithiltir/releases/tag/0.2.7)

#### Changes

- Added a Dash self-update page in the admin console for release/prerelease checks, current Dash version, bundled Node version, latest version, update task status, and recent logs.
- Dash self-update now supports manual update, reinstall, notification-only mode, and automatic mode. Automatic updates run the packaged `update_dash_linux.sh` through a systemd transient unit and store status under `DASH_HOME/runtime/dash-update`.
- Added an alert records page with server, status, metric, time-range filters, and paginated loading.
- Added open-alert entry points on the node list. They show the current open alert summary and link to alert records filtered to that node.
- Alert notification channel management now has search and clearer status handling. Dash automatic update notifications reuse enabled global notification channels.
- Added runtime system settings for `dash_update_channel` and `dash_update_mode`.

#### Fixes

- After a Dash update completes, the admin console resynchronizes `/api/version` and the update check result so current/latest version badges do not stay stale.
- Dash self-update availability now reports clear reasons when systemd, git, tar, curl/wget, or `update_dash_linux.sh` is missing.
- System settings PATCH and PUT now clearly separate partial updates from full replacement so newly added fields are not lost.
- Alert record custom time range validation avoids querying invalid ranges.
- The minimum Node version for automatic update delivery is now `0.2.3`; older nodes must be updated by rerunning the install command or replacing the binary manually.

#### Compatibility

- Dash self-update supports Linux/systemd release-package installs only. Non-systemd environments report the updater as unavailable.
- `PUT /api/admin/system/settings` is a full replacement and must include `history_guest_access_mode`, `dash_update_channel`, `dash_update_mode`, `logo_url`, `page_title`, and `topbar_text`. Use `PATCH` for partial updates.
- The `prerelease` channel checks prerelease tags only and does not fall back to stable releases.
- The open-alert summary on the node list is loaded when entering the node page; it is not realtime polling.

### 0.2.6

Released: 2026-06-17

GitHub Release: [Ithiltir 0.2.6](https://github.com/Ithildur/Ithiltir/releases/tag/0.2.6)

#### Changes

- The Dash updater adds the `reinstall` command. It reinstalls the latest package from the selected channel even when the installed version already matches the target version.
- Bundled `/deploy/*` node binaries and runner assets are protected downloads. Normal requests require `X-Node-Secret`; legacy node upgrades use a short-lived `upgrade_token` generated by Dash.
- Node automatic update handling supports SemVer build metadata. Node binaries with the same SemVer precedence but different build metadata can still be delivered.
- Linux node install scripts support Chinese and English output.
- The Linux node install script compiles a root-side connections cache helper when `cc`, `gcc`, or `clang` is available. The helper counts TCP/UDP connections in host and container network namespaces.
- Runtime metrics and historical metrics have clearer storage boundaries. TCP/UDP connection counts remain historical numeric metrics. SMART, thermal, and full runtime details stay in current snapshots or frontend caches.

#### Fixes

- Legacy node upgrade downloads receive a temporary authorized URL when they cannot send `X-Node-Secret`.
- Updating a node secret to one already owned by another node returns `409 duplicate_secret`.
- Frontend cache rebuilds no longer depend on the cancellation state of the initiating request.
- Dash closes the underlying server after a failed graceful shutdown.

#### Compatibility

- The minimum node version for automatic update delivery from the Dash admin console remains `0.2.1`.
- Install script templates under `/deploy/*` remain public. Bundled node binaries and runner assets require authentication.
- Back up the database before production upgrades. The release-package updater runs migrations; manual binary replacement requires manual migration.

## Node

### 0.2.3

Released: 2026-06-17

GitHub Release: [Ithiltir-node 0.2.3](https://github.com/Ithildur/Ithiltir-node/releases/tag/0.2.3)

#### Changes

- Node sends the current target key as `X-Node-Secret` when downloading assets from an update manifest.
- Linux and macOS managed install layouts switch `/var/lib/ithiltir-node/current` after staging an update, then exec the updated node with the original arguments and environment.
- Windows managed installs use the runner to replace the binary and restart node after staging an update.
- Install layouts that do not support self-update report `self update disabled` and continue the reporting loop.
- On Linux, node keeps its built-in connection counting fallback when the connections cache is missing, stale, or unavailable.

#### Fixes

- Fixed staged updates that did not restart correctly or did not execute the updated binary.
- Fixed authentication handling for protected update asset downloads.
- Fixed connection counting fallback behavior when the connections cache is unavailable.

#### Compatibility

- Windows self-updates require runner-managed installs.
- Linux and macOS self-updates require the `/var/lib/ithiltir-node/releases/<version>` and `/var/lib/ithiltir-node/current` install layout.
- Direct binaries outside the managed install layout do not apply update manifests. Rerun the install command or replace the binary manually.

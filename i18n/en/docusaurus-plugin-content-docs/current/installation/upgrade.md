---
slug: /Install/Upgrade
title: Upgrade
---

# Upgrade

Upgrades are split into Dash upgrades and node upgrades.

## Dash Upgrade

Dash installed from the Linux release package uses:

```bash
sudo bash /opt/Ithiltir-dash/update_dash_linux.sh --check
sudo bash /opt/Ithiltir-dash/update_dash_linux.sh -y --lang en
```

The default target is the latest stable release. Use `--test` for prereleases:

```bash
sudo bash /opt/Ithiltir-dash/update_dash_linux.sh --check --test
sudo bash /opt/Ithiltir-dash/update_dash_linux.sh -y --test --lang en
```

The updater:

1. Checks the current version and release channel.
2. Downloads the new package from GitHub Releases.
3. Stops `dash.service`.
4. Backs up `/opt/Ithiltir-dash` to a temporary directory.
5. Replaces installed files.
6. Tightens sensitive file permissions.
7. Runs database migrations.
8. Starts `dash.service`.

`--check` checks the selected target channel. The default channel checks stable releases only; `--test` checks prereleases only. If the installed Dash is a prerelease newer than the latest stable release, the default update stops and tells you to use `--test`.

If migration fails, the script attempts to restore the install directory and restart the old service. Migration steps already committed to the database are not rolled back automatically, so back up the database before upgrading.

## Manual Dash Upgrade

```bash
systemctl stop dash.service
cp -a /opt/Ithiltir-dash /opt/Ithiltir-dash.bak.$(date +%Y%m%d%H%M%S)
tar -xzf Ithiltir_dash_linux_amd64.tar.gz
cp -a Ithiltir-dash/. /opt/Ithiltir-dash/
env DASH_HOME=/opt/Ithiltir-dash /opt/Ithiltir-dash/bin/dash migrate -config /opt/Ithiltir-dash/configs/config.local.yaml
systemctl start dash.service
```

Back up the database before manual upgrades:

```bash
pg_dump -Fc -d <db_name> -f ithiltir-$(date +%Y%m%d%H%M%S).dump
```

## Node Upgrade

Dash release packages include node assets. When the admin console triggers a node upgrade:

1. Dash selects the asset from the node's last reported platform.
2. `POST /api/admin/nodes/{id}/upgrade` writes a volatile upgrade task.
3. The node receives an update manifest in the next `POST /api/node/metrics` response.
4. Supported managed install layouts download, verify, switch, and restart node.

Supported scope:

- Windows: runner-managed only.
- Linux/macOS: requires the `/var/lib/ithiltir-node/releases/<version>` and `/var/lib/ithiltir-node/current` install layout.

Direct binaries outside the managed install layout ignore update manifests.

## Linux/macOS Node Reinstall

When managed self-update cannot be used, rerun the install command. The script downloads the new binary, writes a new release directory, and updates the `current` symlink.

## Version Channels

Versions must be strict SemVer:

```text
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]
```

Do not use a `v` prefix. Stable releases cannot include a prerelease segment; prerelease builds can include segments such as `-rc.1` or `-alpha.1`.

---
slug: /Operations/BackupRestore
title: Backup and Restore
---

# Backup and Restore

Back up PostgreSQL and Dash config before upgrades, migration work, and storage changes.

## Backup

Dash control plane:

```bash
pg_dump -Fc -d <db_name> -f ithiltir-$(date +%Y%m%d%H%M%S).dump
tar -C /opt -czf ithiltir-dash-config-$(date +%Y%m%d%H%M%S).tar.gz Ithiltir-dash/configs Ithiltir-dash/install_id
```

Back up `/opt/Ithiltir-dash/configs/notify-config.key` separately from the PostgreSQL dump. It is a raw 32-byte encryption key; a database backup cannot recover notification credentials without the matching key.

Node config:

Linux/macOS:

```bash
cp /var/lib/ithiltir-node/report.yaml ./report.yaml.bak
```

Windows:

```powershell
Copy-Item "$env:ProgramData\Ithiltir-node\report.yaml" .\report.yaml.bak
```

Redis is optional for backup. Redis loss affects sessions and frontend caches. Persistent config, open alert events, notification outbox rows, traffic materialization progress, and history are in PostgreSQL.

## Restore Dash

1. Install the same or a compatible release package.
2. Stop `dash.service`.
3. Restore PostgreSQL.
4. Restore `config.local.yaml`, the matching `notify-config.key`, and `install_id` when available. Set the key to owner-readable-only.
5. Run migration.
6. Start `dash.service`.

```bash
systemctl stop dash.service
pg_restore -d <db_name> ithiltir.dump
env DASH_HOME=/opt/Ithiltir-dash /opt/Ithiltir-dash/bin/dash migrate -config /opt/Ithiltir-dash/configs/config.local.yaml
systemctl start dash.service
```

If `install_id` changes, existing node configs can still report with their configured target and secret. Running `report install` against the new Dash writes the new `server_install_id`.

## Restore Node Config

Linux/macOS:

```bash
install -m 0600 report.yaml /var/lib/ithiltir-node/report.yaml
systemctl restart ithiltir-node.service
```

macOS uses launchd restart commands instead of systemd.

Windows:

```powershell
Copy-Item .\report.yaml "$env:ProgramData\Ithiltir-node\report.yaml" -Force
Restart-Service ithiltir-node
```

## Upgrade Backup

Before upgrading, back up at least:

- PostgreSQL database.
- `/opt/Ithiltir-dash/configs/config.local.yaml`.
- `/opt/Ithiltir-dash/configs/notify-config.key`, stored separately from PostgreSQL.
- `/opt/Ithiltir-dash/install_id`.

The updater does not create a database backup. Restore must use a binary whose embedded schema is compatible; normal startup requires an exact schema match.

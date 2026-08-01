---
slug: /Reference/Filesystem
title: Filesystem Layout
---

# Filesystem Layout

## Dash

```text
/opt/Ithiltir-dash/
  .release-layout-v1
  releases/<version>/
    release.env
    bin/dash
    configs/config.example.yaml
    dist/
    deploy/
    install_dash_linux.sh
    update_dash_linux.sh
  current -> releases/<version>
  bin/dash -> ../current/bin/dash
  dist -> current/dist
  deploy -> current/deploy
  configs/
    config.example.yaml
    config.local.yaml
    notify-config.key
  runtime/dash-update/
  logs/
  themes/
  install_id
  run_dash.sh
```

Config, runtime, logs, themes, and `install_id` are mutable and remain outside releases. `notify-config.key` is a raw 32-byte owner-readable-only key.

The systemd unit is `/etc/systemd/system/dash.service`. `WorkingDirectory` and `DASH_HOME` point at `/opt/Ithiltir-dash`; `ExecStart` uses the stable compatibility entry `/opt/Ithiltir-dash/bin/dash`.

Jobs, locks, transactions, and `update.block` under `runtime/dash-update` are updater-owned. Use `dash update recover`; do not delete them manually.

## Linux Node

```text
/var/lib/ithiltir-node/
  report.yaml
  releases/<version>/ithiltir-node
  current -> releases/<version>
```

systemd assets are under `/etc/systemd/system`; OpenRC uses `/etc/init.d/ithiltir-node`, `/opt/node/run_node_openrc.sh`, and root's BusyBox crontab. Runtime collector caches are:

```text
/run/ithiltir-node/smart.json
/run/ithiltir-node/connections.json
/run/ithiltir-node/thinpool.json
```

## macOS Node

```text
/var/lib/ithiltir-node/{report.yaml,releases,current}
/Library/LaunchDaemons/com.ithiltir.node.plist
/var/log/ithiltir-node.log
/var/log/ithiltir-node.err
```

## Windows Node

```text
%ProgramFiles%\Ithiltir-node\ithiltir-runner.exe
%ProgramData%\Ithiltir-node\report.yaml
%ProgramData%\Ithiltir-node\bin\ithiltir-node.exe
%ProgramData%\Ithiltir-node\staging\
```

The Windows service name is `ithiltir-node`.

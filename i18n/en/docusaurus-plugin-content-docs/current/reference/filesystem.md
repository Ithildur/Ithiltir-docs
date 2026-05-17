---
slug: /Reference/Filesystem
title: Filesystem Layout
---

# Filesystem Layout

## Dash Release Package

```text
/opt/Ithiltir-dash/
  bin/dash
  configs/
    config.example.yaml
    config.local.yaml
  dist/
  deploy/
  themes/
  install_id
  install_dash_linux.sh
  update_dash_linux.sh
```

## Dash systemd

```text
/etc/systemd/system/dash.service
```

Key settings:

```text
WorkingDirectory=/opt/Ithiltir-dash
Environment="DASH_HOME=/opt/Ithiltir-dash"
Environment="monitor_dash_pwd=..."
ExecStart=/opt/Ithiltir-dash/bin/dash
```

## Linux Node

```text
/var/lib/ithiltir-node/
  report.yaml
  releases/
    <version>/
      ithiltir-node
  current -> releases/<version>
```

Service:

```text
/etc/systemd/system/ithiltir-node.service
```

LVM thinpool:

```text
/run/ithiltir-node/thinpool.json
/opt/node/collect_thinpool.sh
/etc/cron.d/ithiltir-node-thinpool
```

SMART cache:

```text
/run/ithiltir-node/smart.json
/usr/local/libexec/ithiltir-node/smart-cache
/etc/systemd/system/ithiltir-node-smart-cache.service
/etc/systemd/system/ithiltir-node-smart-cache.timer
```

## macOS Node

```text
/var/lib/ithiltir-node/
  report.yaml
  releases/
    <version>/
      ithiltir-node
  current -> releases/<version>
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

Service name:

```text
ithiltir-node
```

## Node Local Page Override

```text
localpage/
  page.html
  assets/
    page.css
    page.js
```

Environment variable:

```text
ITHILTIR_NODE_LOCAL_PAGE_DIR=/path/to/localpage
```

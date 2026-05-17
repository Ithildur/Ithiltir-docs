---
slug: /Reference/Filesystem
---

# 文件系统布局

## Dash 发布包

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

关键设置：

```text
WorkingDirectory=/opt/Ithiltir-dash
Environment="DASH_HOME=/opt/Ithiltir-dash"
Environment="monitor_dash_pwd=..."
ExecStart=/opt/Ithiltir-dash/bin/dash
```

## Linux 节点

```text
/var/lib/ithiltir-node/
  report.yaml
  releases/
    <version>/
      ithiltir-node
  current -> releases/<version>
```

服务：

```text
/etc/systemd/system/ithiltir-node.service
```

LVM thinpool：

```text
/run/ithiltir-node/thinpool.json
/opt/node/collect_thinpool.sh
/etc/cron.d/ithiltir-node-thinpool
```

SMART 缓存：

```text
/run/ithiltir-node/smart.json
/usr/local/libexec/ithiltir-node/smart-cache
/etc/systemd/system/ithiltir-node-smart-cache.service
/etc/systemd/system/ithiltir-node-smart-cache.timer
```

## macOS 节点

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

## Windows 节点

```text
%ProgramFiles%\Ithiltir-node\ithiltir-runner.exe
%ProgramData%\Ithiltir-node\report.yaml
%ProgramData%\Ithiltir-node\bin\ithiltir-node.exe
%ProgramData%\Ithiltir-node\staging\
```

服务名：

```text
ithiltir-node
```

## Node local page override

```text
localpage/
  page.html
  assets/
    page.css
    page.js
```

环境变量：

```text
ITHILTIR_NODE_LOCAL_PAGE_DIR=/path/to/localpage
```

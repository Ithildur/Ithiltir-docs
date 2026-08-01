---
slug: /Reference/Filesystem
---

# 文件系统布局

## Dash

受管安装使用不可变 release 和单一 `current` 软链接：

```text
/opt/Ithiltir-dash/
  .release-layout-v1
  releases/
    <version>/
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
  runtime/
    dash-update/
  logs/
  themes/
  install_id
  run_dash.sh
```

`configs`、`runtime`、`logs`、`themes` 和 `install_id` 是可变数据，不得写入 release。`notify-config.key` 是 32 字节二进制密钥，权限必须限制为所有者读取。

systemd 服务：

```text
/etc/systemd/system/dash.service
```

`WorkingDirectory` 和 `DASH_HOME` 指向稳定安装根目录 `/opt/Ithiltir-dash`，`ExecStart` 使用兼容入口 `/opt/Ithiltir-dash/bin/dash`。

更新状态位于 `$DASH_HOME/runtime/dash-update`。其中的 job、锁、事务和 `update.block` 由更新器管理，不得手工删除；使用 `dash update recover` 处理未完成事务。

## Linux Node

```text
/var/lib/ithiltir-node/
  report.yaml
  releases/<version>/ithiltir-node
  current -> releases/<version>
```

systemd：

```text
/etc/systemd/system/ithiltir-node.service
/etc/systemd/system/ithiltir-node-smart-cache.service
/etc/systemd/system/ithiltir-node-smart-cache.timer
/etc/systemd/system/ithiltir-node-connections-cache.service
/etc/systemd/system/ithiltir-node-connections-cache.timer
/etc/systemd/system/ithiltir-node-thinpool-cache.service
/etc/systemd/system/ithiltir-node-thinpool-cache.timer
```

OpenRC：

```text
/etc/init.d/ithiltir-node
/opt/node/run_node_openrc.sh
/etc/crontabs/root
```

采集缓存：

```text
/run/ithiltir-node/smart.json
/run/ithiltir-node/connections.json
/run/ithiltir-node/thinpool.json
```

## macOS Node

```text
/var/lib/ithiltir-node/
  report.yaml
  releases/<version>/ithiltir-node
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

Windows 服务名为 `ithiltir-node`。

## Node 本地页面覆盖

```text
localpage/
  page.html
  assets/page.css
  assets/page.js
```

使用 `ITHILTIR_NODE_LOCAL_PAGE_DIR` 指定覆盖目录。

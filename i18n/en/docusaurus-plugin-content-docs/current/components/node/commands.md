---
slug: /Node/Commands
title: Node Commands
---

# 节点命令

## Local

```bash
./node [--net iface1,iface2] [--debug]
./node local [listen_ip] [listen_port] [--net iface1,iface2] [--debug]
```

默认监听 `0.0.0.0:9100`。可用环境变量覆盖：

- `NODE_HOST`
- `NODE_PORT`

## Push

```bash
./node push [interval_seconds] [--net iface1,iface2] [--debug] [--require-https]
```

`interval_seconds` 必须是正整数；非法值会回退到默认 `3` 秒。

`--debug` 会额外启动本地只读接口：

```text
http://127.0.0.1:${NODE_PORT:-9101}/
```

## Report targets

```bash
./node report install <url> <key> [--require-https]
./node report remove <id>
./node report update <id> <key>
./node report list
```

说明：

- `install` 的 URL 必须指向 Dash 的 `/api/node/metrics`。
- `install` 会先读取 Dash 服务端身份，再写入 `report.yaml`。
- 重复执行相同 install 不会改配置。
- 相同 `server_install_id` 但目标不同，会要求交互选择保留或替换。
- `update` 只用于轮换已有 target 的 key；URL 修改必须走 `install`。
- `list` 输出 `id`、`url` 和 `server_install_id`。

## Version

```bash
./node --version
./node -v
```

## 环境变量

| 变量 | 说明 |
| --- | --- |
| `NODE_HOST` | Local 模式监听地址 |
| `NODE_PORT` | Local 模式监听端口；Push debug 端口 |
| `ITHILTIR_NODE_REPORT_CONFIG` | 覆盖 report.yaml 路径 |
| `ITHILTIR_NODE_LOCAL_PAGE_DIR` | 覆盖本地页面目录 |
| `ITHILTIR_NODE_RUNNER` | Windows runner 启动 node 时设置，用于允许暂存更新 |

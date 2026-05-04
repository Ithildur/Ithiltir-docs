---
slug: /Node
---

# 节点概览

Ithiltir-node 是节点指标采集器，只有两种模式：

- `local`：提供本地节点页面和本地接口。
- `push`：向 Dash 上报，同时保留本地缓存结果。

## Local 模式

```bash
./node
./node local [listen_ip] [listen_port] [--net iface1,iface2] [--debug]
```

- 默认监听：`0.0.0.0:9100`
- 环境变量覆盖：`NODE_HOST`、`NODE_PORT`
- 页面：`GET /` 或 `GET /local`
- 指标接口：`GET /metrics`
- 静态硬件接口：`GET /static`

## Push 模式

```bash
./node push [interval_seconds] [--net iface1,iface2] [--debug] [--require-https]
```

- Linux/macOS 默认读取 `/var/lib/ithiltir-node/report.yaml`。
- Windows 默认读取 `%ProgramData%\Ithiltir-node\report.yaml`。
- 可用 `ITHILTIR_NODE_REPORT_CONFIG` 覆盖配置路径。
- 每个 target URL 指向 Dash 指标接口，并携带 `X-Node-Secret: <key>`。
- Debug 本地接口：`GET http://127.0.0.1:${NODE_PORT:-9101}/`。

## 目录

| 路径 | 内容 |
| --- | --- |
| `cmd/node` | 节点入口 |
| `cmd/runner` | Windows runner 入口 |
| `internal/app` | 模式分发和生命周期 |
| `internal/cli` | 参数解析 |
| `internal/collect` | 采样器和平台采集逻辑 |
| `internal/metrics` | 运行时与静态 JSON 结构 |
| `internal/push` | 推送客户端 |
| `internal/reportcfg` | 上报目标配置 |
| `internal/runner` | Windows runner 监管进程 |
| `internal/selfupdate` | 暂存更新支持 |
| `internal/server` | HTTP 处理器 |

## 相关文档

- [节点批量接入](../../guides/node-rollout.md)
- [安装 Linux 节点](../../installation/node-linux.md)
- [安装 macOS 节点](../../installation/node-macos.md)
- [安装 Windows 节点](../../installation/node-windows.md)
- [Local 模式](./local.md)
- [Push 模式](./push.md)
- [节点上报协议](../../reference/node-protocol.md)
- [运行时指标结构](../../reference/metrics-schema.md)
- [磁盘结构](../../reference/disk-schema.md)

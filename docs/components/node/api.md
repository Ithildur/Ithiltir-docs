---
slug: /Node/API
---

# 节点 HTTP API

本文档定义 Ithiltir-node 与 Dash 之间的线协议，以及 Local 模式提供的本地接口。

## HTTP 接口

`/api/node/*` 是 Dash 提供的接口。Ithiltir-node 在 Push 模式调用这些接口，本身不提供这些路径。

| 范围 | 路径 | 方法 | 数据 | 成功 | 说明 |
| --- | --- | --- | --- | --- | --- |
| 本地页面 | `/` | `GET` | HTML | `200` | 内置单节点页面 |
| 本地页面 | `/local` | `GET` | HTML | `200` | `/` 的别名 |
| 本地页面 | `/metrics` | `GET` | `NodeReport` | `200` | 首次采样前返回 `503` |
| 本地页面 | `/static` | `GET` | `Static` | `200` | 静态数据未就绪前返回 `503` |
| Push 目标 | `/api/node/metrics` | `POST` | `NodeReport` | `200` | 需要 `X-Node-Secret` |
| Push 目标 | `/api/node/static` | `POST` | `Static` | `200` | 需要 `X-Node-Secret`，由 `/metrics` target URL 推导 |
| Push 目标 | `/api/node/identity` | `POST` | `{}` | `200` | 需要 `X-Node-Secret`，返回 `{ "install_id": "...", "created": true/false }` |
| Push debug 本地 | `/` | `GET` | `NodeReport` | `200` | 仅 `push --debug` 启用，绑定到 `127.0.0.1:${NODE_PORT:-9101}` |

本地 `GET` 路由也接受 `HEAD`。其他方法返回 `405`，并带 `Allow: GET, HEAD`。

## 线协议约定

- JSON 使用 UTF-8。
- 时间戳为 UTC RFC3339。
- 字节和包计数是原始数字计数器。
- `*Ratio` 字段范围是 `0..1`，不是百分比。
- 数组返回 `[]`，不是 `null`。
- 没有值的可选字段会省略。
- 运行时磁盘结构和静态磁盘结构含义不同，见 [磁盘结构](./disk.md)。

## `NodeReport`

顶层对象：

```json
{
  "version": "...",
  "hostname": "...",
  "timestamp": "...",
  "metrics": {}
}
```

字段：

- `version`：节点版本。
- `hostname`：节点主机名。
- `timestamp`：UTC RFC3339。
- `metrics`：`Snapshot`。

## `Snapshot`

`metrics` 字段：

- `cpu`
  - `usage_ratio`
  - `load1`
  - `load5`
  - `load15`
  - `times.user`
  - `times.system`
  - `times.idle`
  - `times.iowait`
  - `times.steal`
- `memory`
  - `used`
  - `available`
  - `buffers`
  - `cached`
  - `used_ratio`
  - `swap_used`
  - `swap_free`
  - `swap_used_ratio`
- `disk`
  - 见 [磁盘结构](./disk.md)
- `network[]`
  - `name`
  - `bytes_recv`
  - `bytes_sent`
  - `recv_rate_bytes_per_sec`
  - `sent_rate_bytes_per_sec`
  - `packets_recv`
  - `packets_sent`
  - `recv_rate_packets_per_sec`
  - `sent_rate_packets_per_sec`
  - `err_in`
  - `err_out`
  - `drop_in`
  - `drop_out`
- `system`
  - `alive`
  - `uptime_seconds`
  - `uptime`
- `processes`
  - `process_count`
- `connections`
  - `tcp_count`
  - `udp_count`
- `raid`
  - `supported`
  - `available`
  - `arrays[]`

## `Static`

顶层对象：

```json
{
  "version": "...",
  "timestamp": "...",
  "report_interval_seconds": 3,
  "cpu": {},
  "memory": {},
  "disk": {},
  "system": {},
  "raid": {}
}
```

静态上报行为：

- 静态元数据没有外层包装对象。
- `report_interval_seconds` 是必填字段。
- 静态元数据会在启动时上报一次。
- 静态采集不完整时继续重试，直到完整。
- 被抑制的 push 失败恢复后，静态元数据会再补发一次。

字段：

- `cpu.info`
  - `model_name`
  - `vendor_id`
  - `sockets`
  - `cores_physical`
  - `cores_logical`
  - `frequency_mhz`
- `memory`
  - `total`
  - `swap_total`
- `disk`
  - 见 [磁盘结构](./disk.md)
- `system`
  - `hostname`
  - `os`
  - `platform`
  - `platform_version`
  - `kernel_version`
  - `arch`
- `raid`
  - `supported`
  - `available`
  - `arrays[]`

---
slug: /Reference/NodeProtocol
---

# 节点上报协议

Ithiltir-node 在 Push 模式调用 Dash 的 `/api/node/*`。节点本身不提供这些路径。

## Target URL

配置中的 target URL 必须指向：

```text
https://dash.example.com/api/node/metrics
```

推导：

| 用途 | URL |
| --- | --- |
| 运行时指标 | `<target>` |
| 静态信息 | 把 `/metrics` 改为 `/static` |
| Dash 身份 | 把 `/metrics` 改为 `/identity` |

`report install` 要求 target path 以 `/metrics` 结尾。

## 请求头

```http
X-Node-Secret: <node-secret>
Content-Type: application/json
```

## `/api/node/identity`

请求：

```http
POST /api/node/identity
X-Node-Secret: <secret>
```

Body：

```json
{}
```

响应：

```json
{
  "install_id": "dashboard-install-id",
  "created": false
}
```

如果 Dash 还没有 `install_id`，会创建并返回 `created=true`。

## `/api/node/metrics`

请求 body 是 `NodeReport`。见 [运行时指标结构](./metrics-schema.md)。

响应：

```json
{
  "ok": true,
  "update": null
}
```

`update` 可为更新 manifest：

```json
{
  "id": "release-id",
  "version": "1.2.3",
  "url": "https://dash.example.com/deploy/windows/node_windows_amd64.exe?upgrade_token=...",
  "sha256": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "size": 12345678
}
```

`url` 可能包含短期有效的 `upgrade_token`，用于访问受保护的 `/deploy/*` 资产。节点必须按原样使用返回的 URL。

## `/api/node/static`

请求 body 是 `Static`。见 [运行时指标结构](./metrics-schema.md)。

静态信息会在节点启动后上报一次；采集不完整时继续重试。Push 失败恢复后也会补发。

## 成功判定

宿主指标、静态信息和身份 HTTP 请求只把 `200 OK` 视为成功；VM 上报 `/api/node/virt` 成功返回 `204`。非成功响应只影响当前 target，不阻塞其他 target。

`/api/node/metrics` 响应 body 只影响更新：

- 非 JSON 或空 body：忽略。
- `Content-Type` 不是 `application/json`：忽略。
- JSON 中其他顶层字段：忽略。
- `ok` 不是必填字段。

## 接收约束

- 字节数、容量、计数器和 uptime 必须是有符号 64 位范围内的非负 JSON 整数。
- 进程数和连接数必须在有符号 32 位范围内。
- 静态上报间隔必须在有符号 32 位范围内，CPU 拓扑计数必须在有符号 16 位范围内。
- 整数超出接收类型时返回 `400 invalid_request`；负数、非法比例或速率返回 `422 invalid_metrics` 或 `422 invalid_static_payload`。
- Node 版本最多 64 字符；hostname 和磁盘名称最多 255；磁盘 ref 最多 320；磁盘 kind、role 和 RAID health 最多 16；网卡名最多 64；文件系统类型及逻辑盘 health、level 最多 32。
- 静态 OS、platform、arch 最多 32 字符；platform 和 kernel version 最多 255。路径、挂载点和硬件描述使用不定长文本。

并发上报按服务端接收顺序决定当前投影。较晚完成的旧接收样本仍写入历史，但不会覆盖当前指标、前台缓存或触发新的告警评估。请求中的 `timestamp` 不参与当前投影排序。

## HTTPS 回落

默认情况下，HTTPS target 可以按客户端规则回落 HTTP，用于处理误配、IP 访问、证书异常等场景。

加 `--require-https` 后：

- 非 HTTPS target 直接拒绝。
- 禁止 HTTP 回落。

## 节点更新

只有托管安装布局会处理 update manifest：

- Windows：由 runner 启动，且 `ITHILTIR_NODE_RUNNER=1`。
- Linux/macOS：当前进程位于 `/var/lib/ithiltir-node/current/ithiltir-node` 或 `/var/lib/ithiltir-node/releases/<version>/ithiltir-node`。

安装布局外直接运行的二进制会忽略 update manifest。

Dash 管理台自动下发更新只适用于当前上报版本为 `0.2.3` 或更高的节点。更低版本必须手动更新。

manifest 必须满足：

- `version` 非空，不能是 `.` 或 `..`，且不包含路径分隔符。
- `url` 是带 host 的绝对 HTTP 或 HTTPS URL。
- `sha256` 是 64 位十六进制 SHA-256。
- `size` 为正数，并必须等于下载字节数。

与当前上报版本相同的 manifest 会先被忽略。同一轮剩余多个 target 返回 manifest 时，`id`、`version`、`url`、`sha256`、`size` 必须完全一致，否则跳过更新。

Dash 侧待升级任务会在节点上报完全相同的目标版本或 SemVer 优先级更高的版本后清除。同一 SemVer 优先级但 build metadata 不同的版本视为不同节点二进制，仍可下发。

更新成功后，Windows runner 替换 `%ProgramData%\Ithiltir-node\bin\ithiltir-node.exe` 并重启 Node。Linux/macOS 原子切换 `/var/lib/ithiltir-node/current` 到新的 release 目录，再由既有运行方式重启 Node。

## Node gRPC 传输

`ithiltir.node.v1.Node` 服务通过 HTTP/2 与原 HTTP 接口共用 Dash 监听地址，`app.grpc_port` 不生效。TLS 代理配置见[反向代理](../installation/reverse-proxy.md)。协议定义位于 Dash 的 `protocol/node.proto`；`bash scripts/generate-node-protocol.sh [node仓库目录]` 使用固定版本生成器同步两个仓库。

### RPC 请求与响应

请求通过 metadata `x-node-secret` 鉴权。

| RPC | 成功响应 |
| --- | --- |
| `Identify(Empty)` | `install_id`、`created`、`protocol_version: 1` |
| `Metrics(Report)` | `Reply.json` 包含原 JSON 响应及更新 manifest |
| `Static(Report)`、`Virt(Report)` | `Empty` |

`Report.json` 携带原 UTF-8 JSON，保留缺失字段和 64 位整数。指标和静态载荷上限为 1 MiB，VM 快照为 4 MiB。校验、接收截止时间和写入规则与 HTTP 相同。

鉴权失败返回 `UNAUTHENTICATED`，按 IP 限流；限流或消息超限返回 `RESOURCE_EXHAUSTED`；非法 JSON 或报告字段返回 `INVALID_ARGUMENT`。其他处理失败返回 `UNAVAILABLE` 或 `INTERNAL`，其中 VM 快照存储失败为 `UNAVAILABLE`，错误标识为 `virt_unavailable`。

### 查询会话

`Connect` 是 Node 主动建立的双向查询流。首条能力声明须在 5 秒内到达；重连替换该节点的旧会话。Dash 在派发查询前及连接期间每秒复查凭据。双方每 20 秒发送心跳，60 秒无消息关闭连接；心跳不刷新指标和在线率。

查询总时限为 10 秒，每节点最多 32 个待完成查询，结果上限为 2 MiB。断线使待完成查询失败，不自动重放。

### 传输选择

Node 通过 `ITHILTIR_NODE_TRANSPORT` 选择传输：

| 值 | 行为 |
| --- | --- |
| `http`（默认） | 使用 HTTP 上报 |
| `grpc` | 只使用 RPC |
| `auto` | 上报前探测 `Identify`，成功后该目标在进程生命周期内固定使用 gRPC；探测不可达或不兼容时可使用同 URL、同协议的 HTTP |

`auto` 遇到鉴权或授权失败不切换到 HTTP。`auto` 和 `grpc` 不降级到明文；`http` 的回退规则见上方“HTTPS 回落”。

Node 禁用 gRPC 策略重试，但 gRPC 可透明重试确定尚未处理的调用。指标应答不确定时不跨传输重发，后续轮次读取最新指标。VM 快照按采样时间去重。

## VM 上报

设置 `ITHILTIR_NODE_PVE_SOCKET` 后，Node 从本地 helper 读取 VM 观测。HTTP 独立上报到 target 同级的 `/virt`，使用 `X-Node-Secret`，成功返回 `204`；gRPC 使用 `Virt(Report)`。VM 上报不下发更新、不刷新宿主在线率，失败后独立退避重试。

宿主指标请求超时为 7 秒，超时后当前轮次结束便开始下一轮。VM 字段、有效期和错误见 [Dash API](./dash-api.md)，安装见 [PVE 监控](../installation/pve.md)。

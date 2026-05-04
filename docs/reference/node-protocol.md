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
  "url": "https://dash.example.com/deploy/windows/node_windows_amd64.exe",
  "sha256": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "size": 12345678
}
```

## `/api/node/static`

请求 body 是 `Static`。见 [运行时指标结构](./metrics-schema.md)。

静态信息会在节点启动后上报一次；采集不完整时继续重试。Push 失败恢复后也会补发。

## 成功判定

节点只把 `200 OK` 视为成功。非 200 响应只影响当前 target，不阻塞其他 target。

`/api/node/metrics` 响应 body 只影响更新：

- 非 JSON 或空 body：忽略。
- `Content-Type` 不是 `application/json`：忽略。
- JSON 中其他顶层字段：忽略。
- `ok` 不是必填字段。

## HTTPS 回落

默认情况下，HTTPS target 可以按客户端规则回落 HTTP，用于处理误配、IP 访问、证书异常等场景。

加 `--require-https` 后：

- 非 HTTPS target 直接拒绝。
- 禁止 HTTP 回落。

## Windows 更新

只有 runner 启动的 Windows node 会处理 update manifest。直接运行 `node push` 会忽略更新。

manifest 必须满足：

- `version` 非空，且不包含路径分隔符。
- `url` 是带 host 的绝对 HTTP 或 HTTPS URL。
- `sha256` 是 64 位十六进制 SHA-256。
- `size` 为正数，并必须等于下载字节数。

同一轮多个 target 返回 manifest 时，`id`、`version`、`url`、`sha256`、`size` 必须完全一致，否则跳过更新。

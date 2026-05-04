---
slug: /Node/Push
---

# Push 模式

Push 模式读取本地上报配置，把运行时指标和静态主机信息发送到 Dash。

## 启动

```bash
./node push [interval_seconds] [--net iface1,iface2] [--debug] [--require-https]
```

默认上报间隔是 `3` 秒。

## 上报配置

默认路径：

- Linux/macOS：`/var/lib/ithiltir-node/report.yaml`
- Windows：`%ProgramData%\Ithiltir-node\report.yaml`

可用 `ITHILTIR_NODE_REPORT_CONFIG` 覆盖。

配置文件缺失或 `targets` 为空时正常启动并跳过上报。配置格式错误时启动失败。

```yaml
version: 1
targets:
  - id: 1
    url: https://dashboard.example/api/node/metrics
    key: node-secret
    server_install_id: dashboard-install-id
```

写入使用原子 rename，并保持文件权限 `0600`。

## Target URL

target URL 是 Dash 的指标接口，通常是：

```text
https://dashboard.example/api/node/metrics
```

规则：

- `POST <target URL>` 接收运行时指标。
- target 路径以 `/metrics` 结尾时，静态元数据发到同级 `/static` URL。
- `report install <url> <key>` 要求 target URL 以 `/metrics` 结尾；写入本地配置前会调用同级 `/identity` URL。
- 单个 target 失败不阻塞其他 target。

## 传输和鉴权

- 每次请求携带 `X-Node-Secret: <key>`。
- `http` 和 `https` target URL 都是合法配置。
- HTTPS target 默认可按客户端规则降级到 HTTP。
- `--require-https` 会拒绝非 HTTPS target，并禁止 HTTP 回落。

## 成功响应

`200 OK` 是 Push 目标请求的唯一成功响应。target 是否成功只看 HTTP 状态；响应 body 只影响更新暂存。

`/api/node/metrics` 可以返回非 JSON 内容、空 body，或 JSON。只有 `Content-Type` 为 `application/json` 时才解析 update manifest。

更新响应示例：

```json
{
  "update": {
    "id": "release-id",
    "version": "1.2.3",
    "url": "https://dashboard.example/releases/Ithiltir-node-windows-amd64.exe",
    "sha256": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "size": 12345678
  }
}
```

其他顶层 JSON 字段会被忽略；`ok` 不是必填字段。

## Push debug

`--debug` 启动本地只读接口：

```text
http://127.0.0.1:${NODE_PORT:-9101}/
```

该接口优先返回最近一次成功上报的结果，否则返回当前快照。

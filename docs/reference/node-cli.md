---
slug: /Reference/NodeCLI
---

# Node CLI

## 参数解析

全局参数：

| 参数 | 说明 |
| --- | --- |
| `--net iface1,iface2` | 指定优先采集的网卡列表 |
| `--debug` | 输出更详细 JSON 或启用 Push debug 本地接口 |
| `--require-https` | 禁止非 HTTPS target 和 HTTP 回落 |
| `--version`、`-v` | 输出版本 |

`--net` 缺少值时会记录 warning 并忽略。

## Local

```bash
./node [--net iface1,iface2] [--debug]
./node local [listen_ip] [listen_port] [--net iface1,iface2] [--debug]
```

默认：

```text
0.0.0.0:9100
```

环境变量：

- `NODE_HOST`
- `NODE_PORT`

## Push

```bash
./node push [interval_seconds] [--net iface1,iface2] [--debug] [--require-https]
```

默认间隔：`3` 秒。

`--debug` 会额外监听：

```text
127.0.0.1:${NODE_PORT:-9101}
```

## Report

```bash
./node report install <url> <key> [--require-https]
./node report remove <id>
./node report update <id> <key>
./node report list
```

`report install`：

- URL 必须指向 Dash 的 `/api/node/metrics`。
- 会请求同级 `/identity`。
- 会把 `server_install_id` 写入配置。
- 相同 URL + key + server_install_id 重复执行不改配置。
- 相同 server_install_id 但目标不同，会要求交互选择保留或替换。

`report update`：

- 只轮换 key。
- 不改 URL。

`report list` 输出：

```text
<id>\t<url>\t<server_install_id>
```

## Report 配置路径

默认：

- Linux/macOS：`/var/lib/ithiltir-node/report.yaml`
- Windows：`%ProgramData%\Ithiltir-node\report.yaml`

覆盖：

```bash
ITHILTIR_NODE_REPORT_CONFIG=/path/report.yaml ./node push
```

格式：

```yaml
version: 1
targets:
  - id: 1
    url: https://dash.example.com/api/node/metrics
    key: node-secret
    server_install_id: dashboard-install-id
```

写入使用原子 rename，并保持文件权限 `0600`。

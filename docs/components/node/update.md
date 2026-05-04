---
slug: /Node/Update
---

# Windows Runner 与更新

Windows 自更新只在 runner 托管模式下生效。

## Runner

```powershell
.\ithiltir-runner.exe [node args...]
```

行为：

- 仅 Windows。
- 不传参数时默认执行 `push`。
- 托管 `%ProgramData%\Ithiltir-node\bin\ithiltir-node.exe`。
- 工作目录为 `%ProgramData%\Ithiltir-node`。
- 启用 Dash 指标响应里的 node 暂存更新。

直接运行 `node push` 会忽略 update manifest。

## 更新 manifest

Dash 的 `POST /api/node/metrics` 成功响应可以包含：

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

规则：

- `update.version`、`update.url`、`update.sha256` 和正数字节数 `update.size` 必填。
- `update.id` 是可选元数据。
- `update.url` 必须是带 host 的绝对 `http` 或 `https` URL。
- `update.version` 不得包含路径分隔符。
- `update.sha256` 是期望的 SHA-256 十六进制摘要。
- `update.size` 必须等于下载字节数。

## 冲突处理

如果同一轮里多个 target 返回 update manifest，所有 manifest 的 `id`、`version`、`url`、`sha256` 和 `size` 必须一致；有冲突则跳过更新。

JSON 格式错误、manifest 非法、下载失败、大小不匹配或校验和不匹配时，跳过更新并继续上报。

## 生命周期

1. node 解析 Dash 返回的 update manifest。
2. runner 模式下 node 下载并校验暂存文件。
3. 成功暂存更新后，`node push` 干净退出。
4. runner 替换 `%ProgramData%\Ithiltir-node\bin\ithiltir-node.exe`。
5. runner 重启 node。

非 Windows 不支持自更新。

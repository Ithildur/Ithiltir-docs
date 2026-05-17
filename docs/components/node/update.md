---
slug: /Node/Update
---

# 节点更新

Dash 的节点更新通过 `/api/node/metrics` 响应里的 update manifest 下发。只有托管安装布局会处理 manifest。

## 支持范围

| 平台 | 条件 | 行为 |
| --- | --- | --- |
| Windows | 由 `ithiltir-runner.exe` 启动，且 `ITHILTIR_NODE_RUNNER=1` | 暂存新二进制，退出 node，由 runner 替换并重启 |
| Linux | 当前进程位于 `/var/lib/ithiltir-node/current/ithiltir-node` 或 `/var/lib/ithiltir-node/releases/<version>/ithiltir-node` | 下载到新 release 目录，切换 `current` 软链接，退出并交给 systemd 重启 |
| macOS | 当前进程位于 `/var/lib/ithiltir-node/current/ithiltir-node` 或 `/var/lib/ithiltir-node/releases/<version>/ithiltir-node` | 下载到新 release 目录，切换 `current` 软链接，退出并交给 launchd 重启 |

安装布局外直接运行的二进制会忽略 update manifest。

## Windows Runner

```powershell
.\ithiltir-runner.exe [node args...]
```

行为：

- 仅 Windows。
- 不传参数时默认执行 `push`。
- 托管 `%ProgramData%\Ithiltir-node\bin\ithiltir-node.exe`。
- 工作目录为 `%ProgramData%\Ithiltir-node`。
- 启用 Dash 指标响应里的 node 暂存更新。

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
- `update.version` 必须是单个 release 目录名，不能是 `.` 或 `..`，且不得包含路径分隔符。
- `update.sha256` 是期望的 SHA-256 十六进制摘要。
- `update.size` 必须等于下载字节数。

## 冲突处理

如果同一轮里多个 target 返回 update manifest，所有 manifest 的 `id`、`version`、`url`、`sha256` 和 `size` 必须一致；有冲突则跳过更新。

JSON 格式错误、manifest 非法、下载失败、大小不匹配或校验和不匹配时，跳过更新并继续上报。

## 生命周期

1. node 解析 Dash 返回的 update manifest。
2. node 下载并校验文件大小和 SHA-256。
3. 成功暂存更新后，`node push` 干净退出。
4. Windows runner 替换 `%ProgramData%\Ithiltir-node\bin\ithiltir-node.exe` 并重启 node。
5. Linux/macOS 切换 `/var/lib/ithiltir-node/current` 到新 release，并由 systemd/launchd 重启 node。

如果当前托管 release 已经是 manifest 指定版本，节点不会重复安装。

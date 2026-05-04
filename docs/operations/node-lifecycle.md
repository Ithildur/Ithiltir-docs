---
slug: /Operations/NodeLifecycle
---

# 节点生命周期

节点生命周期包括创建、安装、上报、更新、轮换 secret、停用和删除。

## 创建节点

管理台创建节点时，Dash 会生成唯一 `secret`。创建接口不需要请求 body：

```text
POST /api/admin/nodes/
```

创建后在节点列表读取 secret 和安装命令。

## 安装节点

推荐通过 Dash 的 `/deploy` 安装脚本安装：

- [Linux 节点](../installation/node-linux.md)
- [macOS 节点](../installation/node-macos.md)
- [Windows 节点](../installation/node-windows.md)

安装脚本会调用：

```bash
node report install <dash-url>/api/node/metrics <secret>
```

`report install` 会先请求 `/api/node/identity`，取得 Dash 的 `install_id`，再写入本地 `report.yaml`。

## 上报状态

节点正常上报时，Dash 会更新：

- 当前指标。
- 历史指标。
- 前台热点快照。
- 节点静态信息。
- Agent 版本。
- 告警 dirty 标记。
- 流量统计输入数据。

静态信息不完整时，节点会继续重试，直到完整上报。

## Secret 轮换

1. 在 Dash 管理台修改节点 secret。
2. 在节点执行：

```bash
./node report update <id> <new-secret>
```

`report update` 只修改 key，不修改 URL。如果 URL 也变了，使用：

```bash
./node report install <new-url> <new-secret>
```

## 节点迁移到新 Dash

如果新 Dash 有不同 `install_id`，`report install` 会写入新的 target。相同 `server_install_id` 但目标不同，命令会要求交互选择保留或替换。

非交互环境中遇到重复 `server_install_id` 会失败。需要在终端执行并选择。

## 停用节点

短期停用：

```bash
systemctl stop ithiltir-node.service
```

Dash 会按 `app.node_offline_threshold` 判断离线，并触发内置离线告警。

长期停用：

1. 停止节点服务。
2. 在 Dash 管理台删除节点。
3. 按需删除节点本地 `/var/lib/ithiltir-node` 或 `%ProgramData%\Ithiltir-node`。

## 删除节点

管理 API：

```text
DELETE /api/admin/nodes/{id}
```

删除是逻辑删除，不应依赖它做历史数据清理策略。历史保留仍由 TimescaleDB 策略控制。

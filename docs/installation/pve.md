---
slug: /Install/PVE
---

# PVE 虚拟机监控

Dash `0.4.0` 配套 Node `0.3.0`，支持本机 Proxmox VE QEMU VM 的当前状态、Guest Agent IP 和 PVE RRD 历史。包含关机 VM，排除模板；不包含 LXC、HA 配置和 VM 控制。

## 安装和启用

安装 PVE 采集服务要求宿主机使用 systemd，并提供 `/etc/pve` 和 `/usr/bin/pvesh`。root helper 负责本机采集，Node 以非特权用户运行。无需 PVE API 用户、token 或本机编译器。

1. 使用携带 Node `0.3.0` 及同版本 PVE helper 的 Dash 发布包。
2. 在管理台创建节点，复制 Linux 安装命令，手动追加 `--pve`，在 PVE 宿主机执行。
3. 检查采集服务和 Node 服务：

```bash
systemctl status ithiltir-node-pve-cache.service ithiltir-node.service
journalctl -u ithiltir-node-pve-cache.service -n 100 --no-pager
```

安装器会在停止现有 Node 前校验 helper 的 SHA-256 和版本，并安装：

| 路径或服务 | 用途 |
| --- | --- |
| `/usr/local/libexec/ithiltir-node/pve-cache` | root 所有的 helper 二进制 |
| `ithiltir-node-pve-cache.service` | 运行 `pve-cache --group <运行组>` |
| `/run/ithiltir-node/pve.sock` | root 所有、运行组可访问的 Unix socket，权限 `0660` |
| Node systemd drop-in | 设置 `ITHILTIR_NODE_PVE_SOCKET=/run/ithiltir-node/pve.sock` |
| `/run/ithiltir-node/pve-guest` | 仅 root 可读的 Guest Agent 缓存和退避状态 |

Node 经 socket 读取内存中的观测结果。helper 重启后重新采集基本指标；IP 缓存状态可跨 helper 重启保留，宿主机重启时清空。

## 启用历史查询

VM 当前快照可通过 HTTP 上报；历史查询需要 Node 到 Dash 的 gRPC 查询连接。执行：

```bash
sudo systemctl edit ithiltir-node.service
```

加入：

```ini
[Service]
Environment=ITHILTIR_NODE_TRANSPORT=grpc
```

然后重启 Node：

```bash
sudo systemctl daemon-reload
sudo systemctl restart ithiltir-node.service
```

也可使用 `auto` 协商传输；默认 `http` 不建立查询连接。gRPC 与 Dash HTTP 共用监听地址，`app.grpc_port` 不生效。HTTPS 代理须支持 HTTP/2 并转发 `/ithiltir.node.v1.Node/`，配置见[反向代理](./reverse-proxy.md)。

管理员调用 `GET /api/admin/nodes/{id}/virt/capabilities`，确认 `connected` 和 `pve_history` 均为 `true`。

## 看板和访问权限

点击宿主机卡片上的 PVE 图标进入 `/pve/{id}`。页面展示 VM 列表、详情和历史曲线，`?vm=<vmid>` 选择 VM。快照每 15 秒刷新；历史在选择 VM、时间范围或手动刷新时读取。

PVE 游客访问默认关闭。管理台系统设置开启 `pve_guest_visible` 后，游客仅能查看标为游客可见的宿主机，其 VM 名称、IP、快照和历史都会开放。该开关独立于宿主历史、流量和 Uptime 权限。

节点高级设置中的 VM CPU/内存阈值仅标注历史图表，不发送告警通知。CPU 默认阈值为 80%，内存默认 90% 且需单独启用；内存按历史点的内存上限计算，缺失数据保持未知。

## 采样与新鲜度

| 数据 | 采集和有效期 |
| --- | --- |
| VM 清单 | 每 3 秒刷新本机配置 |
| VM 动态指标 | 每 VM 间隔至少 3 秒；8 路并发，单次超时 2 秒，完成后即可读取 |
| VM 观测 | 每台 VM 独立 `collected_at` 和 90 秒 TTL；过期动态指标省略、状态变为 `unknown` |
| 磁盘容量 | 每 60 秒单独查询，超过 2 分钟省略 |
| Guest Agent IP | 成功后最少 60 秒刷新；失败按 1、2、5 分钟退避；样本有效期 900 秒 |
| Node VM 上报 | 独立于宿主指标，每 3 秒读取 helper；失败后退避重试 |
| Dash 快照缓存 | Redis 或 `--no-redis` 内存保存 10 分钟，重复或更旧样本不续期 |

只有 QMP 状态为 `running` 的 VM 采集动态指标和 IP。IP 还要求 PVE 启用 Guest Agent，且 VM 内代理正常运行。IP 查询不阻塞基本指标；VM 指标和 IP 各自独立过期。字段和地址过滤规则见 [Dash API](../reference/dash-api.md)。

VM 历史按需读取 PVE RRD，支持 `hour/day/week/month/year` 与 `AVERAGE/MAX`。Dash 不把 VM 快照或历史写入 PostgreSQL，也不计入宿主流量、在线率或计费。

## 更新、停用和排错

- Node 自更新只替换普通 Node，不替换 root helper 和服务单元；更新 helper 时重新执行安装命令并加 `--pve`。
- 重装时省略 PVE 选项会保留现有选择；`--no-pve` 停用并删除服务、helper 和 drop-in。
- 没有快照：检查 helper 服务、socket 权限和 Node 的 `ITHILTIR_NODE_PVE_SOCKET`。
- 有快照但历史不可用：检查 gRPC 代理、Node transport 和 capabilities。
- 有指标但没有 IP：检查 PVE Guest Agent 配置、VM 内代理及 helper 日志；失败后按上述间隔重试。
- `node_offline` 表示查询会话未连接；`unsupported` 表示不支持历史查询；`busy` 表示查询并发已满；`deadline_exceeded` 表示查询超时。

接口详情见 [Dash API](../reference/dash-api.md) 和[节点协议](../reference/node-protocol.md)。

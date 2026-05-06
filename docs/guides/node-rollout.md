---
slug: /Guides/NodeRollout
---

# 节点批量接入

节点接入要求每台机器使用独立 secret，并将 `report.yaml` 写入本机服务目录。

## 接入模型

每个节点保存：

```yaml
version: 1
targets:
  - id: 1
    url: https://dash.example.com/api/node/metrics
    key: node-secret
    server_install_id: dash-install-id
```

`report install` 会调用同级 `/api/node/identity`，取得 `server_install_id` 后写入配置。写入使用原子 rename，权限保持 `0600`。

## 创建节点

在 Dash 管理台创建节点前，确认以下信息：

- 节点名称。
- 分组。
- 是否游客可见。
- 上报 secret。
- 是否参与流量计费。
- 是否启用 P95。
- 是否需要节点级账期覆盖。

批量接入时把节点清单写成表格：

| 主机 | 系统 | 架构 | 分组 | 网卡 | secret |
| --- | --- | --- | --- | --- | --- |
| `web-01` | Linux | amd64 | web | `eth0` | 独立生成 |
| `db-01` | Linux | arm64 | db | `ens3` | 独立生成 |

## Linux 节点

```bash
curl -fsSL https://dash.example.com/deploy/linux/install.sh -o install_node.sh
sudo bash install_node.sh dash.example.com 443 '<node-secret>' 3 --net eth0
```

安装后路径：

| 项 | 路径 |
| --- | --- |
| 服务用户 | `ithiltir` |
| 数据目录 | `/var/lib/ithiltir-node` |
| 当前版本 | `/var/lib/ithiltir-node/current` |
| 配置文件 | `/var/lib/ithiltir-node/report.yaml` |
| systemd unit | `/etc/systemd/system/ithiltir-node.service` |

检查：

```bash
systemctl status ithiltir-node.service
journalctl -u ithiltir-node.service -n 100 --no-pager
/var/lib/ithiltir-node/current/ithiltir-node report list
```

LVM thinpool 采集由脚本和 cron 支持：

| 项 | 路径 |
| --- | --- |
| 采集脚本 | `/opt/node/collect_thinpool.sh` |
| cron | `/etc/cron.d/ithiltir-node-thinpool` |
| 缓存 | `/run/ithiltir-node/thinpool.json` |

脚本检测到 LVM/LVM-thin 后才启用这部分；在 `apt-get` 系统上会自动安装 cron，不需要预先手工安装。没有 LVM 的机器会跳过并清理旧采集项。

## macOS 节点

```bash
curl -fsSL https://dash.example.com/deploy/macos/install.sh -o install_node.sh
sudo bash install_node.sh dash.example.com 443 '<node-secret>' 3
```

macOS 当前只支持 arm64。

检查：

```bash
sudo launchctl print system/com.ithiltir.node
tail -n 100 /var/log/ithiltir-node.log /var/log/ithiltir-node.err
```

## Windows 节点

管理员 PowerShell：

```powershell
Invoke-WebRequest -Uri "https://dash.example.com/deploy/windows/install.ps1" -OutFile ".\install_node.ps1"
powershell -ExecutionPolicy Bypass -File .\install_node.ps1 dash.example.com 443 "<node-secret>" 3
```

路径：

| 项 | 路径 |
| --- | --- |
| runner | `%ProgramFiles%\Ithiltir-node\ithiltir-runner.exe` |
| node | `%ProgramData%\Ithiltir-node\bin\ithiltir-node.exe` |
| 配置 | `%ProgramData%\Ithiltir-node\report.yaml` |
| 服务 | `ithiltir-node` |

检查：

```powershell
Get-Service ithiltir-node
```

Windows 自更新只在 runner 托管模式下生效。直接运行 `node push` 不处理 update manifest。

## 网卡选择

默认采集所有可见网卡。只统计业务网卡时指定：

```bash
--net eth0,eth1
```

规则：

- 逗号分隔。
- 空值会被忽略。
- 指定不存在的网卡时节点会记录警告。
- Push 和 Local 模式都支持 `--net`。

## HTTPS 严格模式

需要强制 HTTPS：

```bash
sudo bash install_node.sh dash.example.com 443 '<node-secret>' 3 --require-https
```

`--require-https` 会拒绝非 HTTPS target，并禁止 HTTP 回落。内网 HTTP 部署不使用该参数。

## 轮换 secret

节点本机更新 key：

```bash
/var/lib/ithiltir-node/current/ithiltir-node report update <id> '<new-secret>'
sudo systemctl restart ithiltir-node.service
```

`report update` 只改已有 target 的 key。URL 变化要重新执行：

```bash
/var/lib/ithiltir-node/current/ithiltir-node report install https://dash.example.com/api/node/metrics '<new-secret>'
```

## 验证标准

节点接入成功至少满足：

- 节点服务处于 running。
- `report list` 能看到目标 URL。
- Dash 管理台节点状态在线。
- `/metrics` 历史有新点。
- 静态硬件信息出现 CPU、内存、磁盘和系统字段。
- 指定网卡的流量计数持续增长。

---
slug: /Operations
---

# 运维总览

运维目标很简单：Dash 进程稳定、数据库可恢复、节点持续上报、历史数据按预期保留。

## 日常检查

Dash：

```bash
systemctl status dash.service
journalctl -u dash.service -n 100 --no-pager
```

Linux 节点：

```bash
systemctl status ithiltir-node.service
journalctl -u ithiltir-node.service -n 100 --no-pager
```

macOS 节点：

```bash
sudo launchctl print system/com.ithiltir.node
tail -n 100 /var/log/ithiltir-node.log /var/log/ithiltir-node.err
```

Windows 节点：

```powershell
Get-Service ithiltir-node
```

## 关键数据

| 数据 | 位置 | 是否必须备份 |
| --- | --- | --- |
| 指标历史、节点、告警、设置 | PostgreSQL | 是 |
| Dash 配置 | `/opt/Ithiltir-dash/configs/config.local.yaml` | 是 |
| Dash 安装身份 | `/opt/Ithiltir-dash/install_id` | 建议 |
| 自定义主题 | `/opt/Ithiltir-dash/themes` | 是 |
| Redis 状态 | Redis | 可选，通常不作为恢复主数据 |
| 节点上报配置 | 节点本机 `report.yaml` | 节点级备份 |

## 运维文档

- [节点生命周期](./node-lifecycle.md)
- [数据保留和存储](./data-retention.md)
- [备份和恢复](./backup-restore.md)
- [日志和状态检查](./logging.md)
- [性能和容量](./performance.md)
- [排错](./troubleshooting.md)

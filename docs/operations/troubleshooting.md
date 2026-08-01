---
slug: /Operations/Troubleshooting
---

# 排错

按请求路径定位问题：Dash 启动、反向代理、节点上报、历史数据、流量统计和 Windows 更新分别排查。

## Dash 无法启动

查看最近日志：

```bash
journalctl -u dash.service -n 200 --no-pager
```

常见原因：

- 配置文件没有被找到。
- 缺少 `app.listen`。
- 缺少 `app.public_url`。
- `app.public_url` 带路径前缀。
- 缺少 `auth.jwt_signing_key`。
- `monitor_dash_pwd` 未设置或包含非法字符。
- PostgreSQL 连接失败。
- PostgreSQL `goose_db_version` 与二进制不一致。
- `notify-config.key` 缺失、权限错误或与数据库密文不匹配。
- Redis 连接失败、账号无权执行 `PING`/`INFO server`，或版本低于 6.2.0。
- TimescaleDB 不可用。

手工验证迁移：

```bash
env DASH_HOME=/opt/Ithiltir-dash \
  /opt/Ithiltir-dash/bin/dash migrate \
  -config /opt/Ithiltir-dash/configs/config.local.yaml \
  -debug
```

单独检查 Redis：

```bash
env DASH_HOME=/opt/Ithiltir-dash \
  /opt/Ithiltir-dash/bin/dash check-redis \
  --addr 127.0.0.1:6379
```

Redis 使用密码时，将密码写入不带换行符、仅所有者可读的临时文件，并增加 `--password-file <path>`。该命令不会读取 Dash 配置文件。

正常启动要求 schema 与二进制完全一致。Schema 落后时执行迁移；schema 超前时不得启动旧二进制或降级数据库。

## Dash 更新要求恢复

查看更新状态和日志：

```bash
sudo /opt/Ithiltir-dash/bin/dash update --check
ls -la /opt/Ithiltir-dash/runtime/dash-update
```

错误包含 `recovery_required` 或存在未完成事务时执行：

```bash
sudo /opt/Ithiltir-dash/bin/dash update recover
```

迁移开始前，恢复可以回到原 release；迁移开始后只会激活候选 release 并向前完成。不得手工删除 `transaction.env` 或 `update.block`。

## 页面打开但 API 失败

检查反向代理：

```bash
curl -i https://dash.example.com/api/version
curl -i https://dash.example.com/theme/active.css
curl -I https://dash.example.com/deploy/linux/install.sh
```

如果 `/` 正常但 `/api` 返回 404，反向代理很可能只转发了 SPA，没有转发后端路径。

## 节点不上线

节点侧服务状态：

```bash
systemctl status ithiltir-node.service
journalctl -u ithiltir-node.service -n 200 --no-pager
```

检查 target 配置：

```bash
/var/lib/ithiltir-node/current/ithiltir-node report list
```

检查 Dash 上报接口可达性：

```bash
curl -i https://dash.example.com/api/node/identity -H 'X-Node-Secret: <secret>' -d '{}'
```

常见原因：

- secret 不匹配。
- target URL 不是 `/api/node/metrics`。
- `app.public_url` 不可从节点访问。
- HTTPS 证书问题。
- 反向代理没有转发 `/api/node/*`。
- 系统时间不同步。

## `/metrics` 返回 503

Local 模式首次采样前正常可能返回 `503`。等待一轮采样。

```bash
./node local 127.0.0.1 9100 --debug
curl http://127.0.0.1:9100/metrics
curl http://127.0.0.1:9100/static
```

## 历史指标看不到

检查：

- 是否已登录。
- `history_guest_access_mode` 是否为 `by_node`。
- 节点 `is_guest_visible` 是否为 true。
- 节点是否已经有历史数据。

## 流量日统计返回 409

`/api/statistics/traffic/daily` 要求：

```text
usage_mode=billing
```

否则返回：

```json
{ "code": "traffic_daily_requires_billing", "message": "daily traffic requires billing mode" }
```

流量手工重建同样要求 Billing 模式。Lite 模式返回 `traffic_rebuild_requires_billing`。重建状态只在当前 Dash 进程中保存，重启后恢复为 `idle`。

## P95 是 null

只有 `p95_status=available` 时 P95 字段才有值。常见状态：

- `disabled`：节点未启用 P95。
- `lite_mode`：全局流量模式不是 `billing`。
- `insufficient_samples`：样本不足。
- `snapshot_without_p95`：月度快照没有 P95。

## Windows 节点不更新

确认服务启动的是 runner：

```powershell
Get-Service ithiltir-node
```

直接运行 `ithiltir-node.exe push` 不会应用更新。runner 才会设置 `ITHILTIR_NODE_RUNNER=1` 并替换二进制。

## 通知渠道无法编辑

存量渠道无法按当前严格 schema 解码时，渠道列表仍会返回该项，但 `config` 为 `null`。该渠道只能删除后重新创建。若所有通知渠道都导致 Dash 启动失败，先确认恢复了与 PostgreSQL 备份匹配的 `configs/notify-config.key`；不要生成新密钥覆盖旧文件。

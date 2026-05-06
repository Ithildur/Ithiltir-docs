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
- Redis 连接失败。
- TimescaleDB 不可用。

手工验证迁移：

```bash
env DASH_HOME=/opt/Ithiltir-dash \
  /opt/Ithiltir-dash/bin/dash migrate \
  -config /opt/Ithiltir-dash/configs/config.local.yaml \
  -debug
```

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

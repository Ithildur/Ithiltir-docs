---
slug: /Guides/AdvancedConfiguration
---

# 高级配置路线

高级配置不是堆字段，而是先确定运行边界，再打开对应能力。配置顺序错误会制造假问题。

## 1. 固定公开 URL

先决定 Dash 的唯一公开根地址：

```yaml
app:
  public_url: "https://dash.example.com"
```

影响范围：

- 浏览器访问。
- 节点安装脚本生成下载地址。
- 节点 target URL。
- 反向代理路径。

规则：

- 可以省略 scheme；IP 默认补 `http`，域名默认补 `https`。
- 正式环境推荐显式写 HTTPS 域名，并通过 Nginx/Caddy 反向代理到 Dash 后端。
- IP+HTTP 只用于本机验证或临时内网测试，不作为长期公开入口。
- 最终 URL 不能带路径前缀。
- 改 `public_url` 后，新节点安装命令应使用新地址。
- 已安装节点的 `report.yaml` 不会自动改 URL。

## 2. 确定运行时状态后端

生产配置：

```yaml
redis:
  addr: 127.0.0.1:6379
```

降级配置：

```bash
dash --no-redis
```

Redis 承载：

- 会话。
- 热点快照。
- 告警运行时状态。

PostgreSQL 承载：

- 指标历史。
- 流量事实和汇总。
- 节点和分组。
- 告警规则和通知 outbox。
- 系统设置。
- 主题元数据。

## 3. 设置保留策略

普通监控：

```yaml
database:
  retention_days: 45
  traffic_retention_days: 45
```

流量计费：

```yaml
database:
  retention_days: 45
  traffic_retention_days: 90
```

`traffic_retention_days` 省略时使用 `max(retention_days, 45)`。需要 P95 复核时，不要把流量保留设置得太短。

## 4. 打开游客访问

历史指标游客访问：

```text
history_guest_access_mode = by_node
```

流量游客访问：

```text
traffic.guest_access_mode = by_node
```

两者仍受节点 `is_guest_visible` 限制。系统开关放行但节点不可见时，游客仍看不到该节点。

## 5. 配置流量统计

先选模式：

| 模式 | 用途 |
| --- | --- |
| `lite` | 月度入/出总量和估算峰值 |
| `billing` | 5 分钟事实、日汇总、P95、覆盖率、月度快照 |

再选账期：

| 账期 | 用途 |
| --- | --- |
| `calendar_month` | 自然月 |
| `whmcs_compatible` | WHMCS 风格锚定账期 |
| `clamp_to_month_end` | 开始日超过月份长度时夹到月末 |

再选方向：

| 方向 | 说明 |
| --- | --- |
| `out` | 只算出站 |
| `both` | 入站加出站 |
| `max` | 入站和出站取较大值 |

完整说明见 [流量统计和账期](../configuration/traffic.md)。

## 6. 配置告警

内置规则：

| ID | 指标 | 说明 |
| --- | --- | --- |
| `-1` | `node.offline` | 节点离线 |
| `-2` | `raid.failed` | RAID 失效 |

自定义规则先选指标和阈值，再挂载节点或分组。不要为每个节点复制大量同构规则，优先用分组挂载。

`core_plus` 只适用于：

- `cpu.load1`
- `cpu.load5`
- `cpu.load15`

冷却时间必须大于等于 0。持续时间只使用系统支持的档位，见 [告警规则](../configuration/alerts.md)。

## 7. 配置通知渠道

支持：

- Telegram bot。
- Telegram MTProto。
- Email SMTP。
- Webhook。

建议：

- 先用测试规则验证通道。
- Email 明确 TLS 模式。
- Webhook 配 secret 并校验 HMAC。
- 对同一严重告警避免配置过多重复渠道。

通知字段和 MTProto 登录流程见 [通知渠道](../configuration/notifications.md)。

## 8. 主题定制

主题只改 CSS token 和 recipe，不改前端代码。

包结构：

```text
theme.json
tokens.css
recipes.css
preview.png
README.md
```

约束：

- `theme.json` 和 `tokens.css` 必须存在。
- 主题 ID 使用 `[a-z0-9][a-z0-9_-]{0,63}`。
- `default` 和内置主题 ID 不可占用。
- CSS 只允许受限选择器和自定义属性。

见 [主题定制](./theme-authoring.md)。

## 9. 节点配置调整

节点上报 URL 存在本机：

- Linux/macOS：`/var/lib/ithiltir-node/report.yaml`
- Windows：`%ProgramData%\Ithiltir-node\report.yaml`

常见调整：

```bash
./ithiltir-node report list
./ithiltir-node report update <id> '<new-secret>'
./ithiltir-node report install https://dash.example.com/api/node/metrics '<node-secret>'
```

改 URL 走 `install`。只轮换 key 走 `update`。

## 10. 验证配置是否生效

Dash：

```bash
curl -fsS https://dash.example.com/api/version/
journalctl -u dash.service -n 100 --no-pager
```

节点：

```bash
systemctl status ithiltir-node.service
journalctl -u ithiltir-node.service -n 100 --no-pager
```

API：

- 登录管理台。
- 查看系统设置。
- 查看节点最新快照。
- 查看历史指标。
- 查看流量月度统计。
- 触发一次测试告警通知。

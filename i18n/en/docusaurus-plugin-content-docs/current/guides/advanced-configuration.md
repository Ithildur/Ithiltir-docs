---
slug: /Guides/AdvancedConfiguration
title: Advanced Configuration Path
---

# Advanced Configuration Path

This page covers Dash runtime boundaries, runtime state, traffic accounting, alerts, notifications, and theme configuration. Apply the sections in order to keep related settings consistent.

## 1. Fix the Public URL

Choose the single public root URL for Dash:

```yaml
app:
  public_url: "https://dash.example.com"
```

This affects:

- Browser access.
- Node install script download URLs.
- Node target URLs.
- Reverse proxy paths.

Rules:

- Scheme can be omitted; IPs default to `http`, domain names default to `https`.
- Production deployments should explicitly use an HTTPS domain and reverse-proxy to the Dash backend through Nginx or Caddy.
- IP+HTTP is only for local validation or temporary internal testing, not as a long-term public entrypoint.
- The final URL must not contain a path prefix.
- After changing `public_url`, new node install commands should use the new address.
- Existing node `report.yaml` files are not rewritten automatically.

## 2. Choose Runtime State Backend

Production:

```yaml
redis:
  addr: 127.0.0.1:6379
```

Fallback:

```bash
dash --no-redis
```

Redis stores:

- Sessions.
- Hot snapshots.
- Alert runtime state.

PostgreSQL stores:

- Metrics history.
- Traffic facts and summaries.
- Nodes and groups.
- Alert rules and notification outbox.
- System settings.
- Theme metadata.

## 3. Set Retention

Normal monitoring:

```yaml
database:
  retention_days: 45
  traffic_retention_days: 45
```

Traffic billing:

```yaml
database:
  retention_days: 45
  traffic_retention_days: 90
```

When omitted, `traffic_retention_days` uses `max(retention_days, 45)`. Do not make traffic retention too short if P95 review is required.

## 4. Enable Guest Access

Historical metrics guest access:

```text
history_guest_access_mode = by_node
```

Traffic guest access:

```text
traffic.guest_access_mode = by_node
```

Both still respect each node's `is_guest_visible` setting.

## 5. Configure Traffic Accounting

Choose the mode first:

| Mode | Use |
| --- | --- |
| `lite` | Monthly inbound/outbound total and estimated peak |
| `billing` | 5-minute facts, daily summary, P95, coverage, monthly snapshot |

Choose the billing cycle:

| Cycle | Use |
| --- | --- |
| `calendar_month` | Calendar month |
| `whmcs_compatible` | WHMCS-style anchored cycle |
| `clamp_to_month_end` | Clamp start day to month end |

Choose the direction:

| Direction | Meaning |
| --- | --- |
| `out` | outbound only |
| `both` | inbound + outbound |
| `max` | max(inbound, outbound) |

See [Traffic Accounting](../configuration/traffic.md).

## 6. Configure Alerts

Built-in rules:

| ID | Metric | Meaning |
| --- | --- | --- |
| `-1` | `node.offline` | node offline |
| `-2` | `raid.failed` | RAID failure |

For custom rules, choose metric and threshold first, then mount to nodes or groups. Prefer group mounts over copying the same rule for every node.

`core_plus` only applies to:

- `cpu.load1`
- `cpu.load5`
- `cpu.load15`

Cooldown must be greater than or equal to 0. Duration must use supported presets. See [Alert Rules](../configuration/alerts.md).

## 7. Configure Notifications

Supported channels:

- Telegram bot.
- Telegram MTProto.
- Email SMTP.
- Webhook.

Recommendations:

- Validate channels with a test rule first.
- Set an explicit TLS mode for email.
- Use a secret and verify HMAC for webhooks.
- Avoid too many duplicate channels for the same severe alert.

See [Notifications](../configuration/notifications.md).

## 8. Theme Customization

Themes change CSS tokens and recipes, not frontend code.

Package structure:

```text
theme.json
tokens.css
recipes.css
preview.png
README.md
```

Constraints:

- `theme.json` and `tokens.css` are required.
- Theme IDs use `[a-z0-9][a-z0-9_-]{0,63}`.
- `default` and built-in theme IDs are reserved.
- CSS is restricted to allowed selectors and custom properties.

See [Theme Authoring](./theme-authoring.md).

## 9. Adjust Node Config

Node report URLs live locally:

- Linux/macOS: `/var/lib/ithiltir-node/report.yaml`
- Windows: `%ProgramData%\Ithiltir-node\report.yaml`

Common commands:

```bash
./ithiltir-node report list
./ithiltir-node report update <id> '<new-secret>'
./ithiltir-node report install https://dash.example.com/api/node/metrics '<node-secret>'
```

Use `install` to change the URL. Use `update` only to rotate a key.

## 10. Verify

Dash:

```bash
curl -fsS https://dash.example.com/api/version/
journalctl -u dash.service -n 100 --no-pager
```

Node:

```bash
systemctl status ithiltir-node.service
journalctl -u ithiltir-node.service -n 100 --no-pager
```

API/UI:

- Log in to the admin console.
- Check system settings.
- Check latest node snapshots.
- Check historical metrics.
- Check monthly traffic statistics.
- Trigger one test alert notification.

---
slug: /Reference/Errors
---

# 错误语义

Dash API 错误格式：

```json
{ "code": "<string>", "message": "<string>" }
```

## 通用

| HTTP | code | 说明 |
| --- | --- | --- |
| `400` | `invalid_request` | 请求格式或字段非法 |
| `400` | `invalid_id` | 路径 ID 非法 |
| `400` | `no_fields` | PATCH 没有可更新字段 |
| `401` | `unauthorized` | 鉴权失败 |
| `403` | `forbidden` | 已识别请求但无权限 |
| `404` | `not_found` | 资源不存在 |
| `413` | `body_too_large` | 请求体过大 |
| `409` | conflict code | 状态冲突 |
| `503` | `db_error` | 数据库读写失败 |
| `503` | `redis_cache_error` | Redis 缓存同步失败 |

## 节点管理

| code | 说明 |
| --- | --- |
| `invalid_name` | 节点名为空 |
| `invalid_display_order` | 排序值不是正数 |
| `invalid_traffic_cycle_mode` | 节点账期模式非法 |
| `invalid_traffic_billing_start_day` | 账期日不在 1..31 |
| `invalid_traffic_billing_anchor_date` | 锚点日期非法 |
| `invalid_traffic_billing_timezone` | 时区非法 |
| `invalid_tags` | tags 不是字符串数组 |
| `invalid_secret` | 节点 secret 非法 |
| `invalid_group_ids` | 分组 ID 非法 |
| `secret_collision_exhausted` | secret 随机冲突重试耗尽 |
| `secret_generation_failed` | secret 生成失败 |

## 节点升级

| HTTP | code | 说明 |
| --- | --- | --- |
| `409` | `node_version_unavailable` | 打包节点版本不可用 |
| `409` | `invalid_node_version` | 打包节点版本非法 |
| `409` | `node_platform_unknown` | 节点平台未知 |
| `409` | `node_platform_unsupported` | 节点平台不支持 |
| `409` | `node_asset_missing` | 对应节点资产缺失 |
| `503` | `node_asset_error` | 生成升级资产失败 |

## 流量

| HTTP | code | 说明 |
| --- | --- | --- |
| `400` | `invalid_fields` | 流量设置字段非法 |
| `409` | `traffic_daily_requires_billing` | 日统计要求 billing 模式 |

## 告警和通知

| code | 说明 |
| --- | --- |
| `invalid_fields` | 规则、挂载、渠道或设置字段非法 |
| `not_logged_in` | Telegram MTProto 未登录 |
| `notify_error` | 测试通知发送失败 |

## 主题

| HTTP | code | 说明 |
| --- | --- | --- |
| `400` | `invalid_theme_package` | 主题包格式非法 |
| `404` | `not_found` | 主题不存在 |
| `503` | `theme_storage_error` | 主题存储不可用 |
| `500` | `theme_unavailable` | 内置主题或主题状态不可用 |

主题列表可能返回 warning header：

- `theme_active_missing`
- `theme_active_broken`

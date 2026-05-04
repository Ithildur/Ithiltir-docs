---
slug: /Config/Access
title: Access Control
---

# 访问控制

Ithiltir 有三类访问者：管理员、匿名访客和节点。

## 管理员

管理员通过：

```text
POST /api/auth/login
```

使用 `monitor_dash_pwd` 登录。登录后使用 Bearer access token 调用管理 API，refresh/logout 使用 refresh cookie 和 `X-CSRF-Token`。

管理 API：

```text
/api/admin/*
```

都要求：

```text
Authorization: Bearer <access_token>
```

## 匿名访客

匿名访问由两个独立开关控制：

| 设置 | 作用 |
| --- | --- |
| `history_guest_access_mode` | 历史指标匿名访问 |
| `traffic_guest_access_mode` | 流量统计匿名访问 |

允许值：

- `disabled`
- `by_node`

`by_node` 仍然受节点的 `is_guest_visible` 限制。也就是说，开全局开关以后，还要在节点上标记允许游客可见。

## Bearer 可选端点

这些端点允许匿名请求，也允许 Bearer：

- `/api/front/*`
- `/api/metrics/*`
- `/api/statistics/*`

缺失、格式错误、过期、已撤销或无法通过校验的 Bearer token 会被当作匿名请求处理。客户端不能仅凭 HTTP 200 判断自己拿到了管理员视图。

## 节点鉴权

节点调用：

```text
/api/node/identity
/api/node/metrics
/api/node/static
```

必须携带：

```text
X-Node-Secret: <node-secret>
```

节点 secret 在管理台创建节点后生成。不要把 secret 暴露给浏览器。

## 可见性规则

| 数据 | 匿名默认 | 可放开方式 |
| --- | --- | --- |
| 品牌信息 `/api/front/brand` | 可见 | 不需要配置 |
| 前台节点列表和指标 | 只显示游客可见节点 | 节点 `is_guest_visible=true` |
| 在线率 `/api/metrics/online` | 只显示游客可见节点 | 节点 `is_guest_visible=true` |
| 历史指标 `/api/metrics/history` | 禁止 | `history_guest_access_mode=by_node` + 节点可见 |
| 流量统计 `/api/statistics/traffic/*` | 禁止 | `traffic_guest_access_mode=by_node` + 节点可见 |

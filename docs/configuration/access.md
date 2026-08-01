---
slug: /Config/Access
---

# 访问控制

Ithiltir 有三类访问者：管理员、匿名访客和节点。

## 管理员

管理员通过：

```text
POST /api/auth/login
```

使用 `monitor_dash_pwd` 登录。直接调用登录 API 时，请求体必须包含 `password` 和 `persistence`，其中 `persistence` 为 `session` 或 `persistent`。登录后使用 Bearer access token 调用管理 API，refresh/logout 使用 refresh cookie 和 `X-CSRF-Token`。

`monitor_dash_pwd` 至少包含 8 个可见 ASCII 字符且不得含空白。Refresh cookie 使用 `SameSite=Strict`。

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

## 站点品牌

`logo_url` 接受同源绝对路径、base64 SVG/PNG/JPEG/GIF/WebP/ICO data URL，或不含用户信息的外部 HTTPS URL。新写入的外部 HTTP URL、非法 data URL 和其他媒体类型会被拒绝。

旧版本保存的外部 HTTP Logo 会继续读取，但 HTTPS 页面可能按 mixed content 规则拦截并回退到内置 Logo。`PATCH /api/admin/system/settings` 只校验本次提交的字段，因此修改其他设置不会被存量 HTTP Logo 阻断。

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

节点 secret 在管理台创建节点后生成。secret 不应暴露给浏览器。

节点 secret trim 后必须包含 8～128 个 Unicode 字符。每个节点应使用独立 secret。

## 可见性规则

| 数据 | 匿名默认 | 可放开方式 |
| --- | --- | --- |
| 品牌信息 `/api/front/brand` | 可见 | 不需要配置 |
| 前台节点列表和指标 | 只显示游客可见节点 | 节点 `is_guest_visible=true` |
| 在线率 `/api/metrics/online` | 只显示游客可见节点 | 节点 `is_guest_visible=true` |
| 历史指标 `/api/metrics/history` | 禁止 | `history_guest_access_mode=by_node` + 节点可见 |
| 流量统计 `/api/statistics/traffic/*` | 禁止 | `traffic_guest_access_mode=by_node` + 节点可见 |

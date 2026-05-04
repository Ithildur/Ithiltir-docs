---
slug: /Node/Local
---

# Local 模式

Local 模式提供内置单节点页面和本地 HTTP 接口。

## 启动

```bash
./node
./node local
./node local 127.0.0.1 9100
```

默认监听：

```text
0.0.0.0:9100
```

环境变量：

- `NODE_HOST`
- `NODE_PORT`

## 路由

| 路径 | 方法 | 响应 | 说明 |
| --- | --- | --- | --- |
| `/` | `GET` | HTML | 本地页面，返回 `Cache-Control: no-store` |
| `/local` | `GET` | HTML | `/` 的别名 |
| `/local-assets/<name>` | `GET` | 文件 | 只服务选中 `localpage/assets/` 目录下的文件 |
| `/metrics` | `GET` | `NodeReport` | 首次采样前返回 `503` |
| `/static` | `GET` | `Static` | 静态数据未就绪前返回 `503` |

本地 `GET` 路由也接受 `HEAD`。其他方法返回 `405`，并带 `Allow: GET, HEAD`。

## 页面来源

HTTP 服务启动时选择页面来源：

1. `ITHILTIR_NODE_LOCAL_PAGE_DIR` 已设置且目录内有 `page.html`：使用该目录。
2. `ITHILTIR_NODE_LOCAL_PAGE_DIR` 已设置但目录内没有 `page.html`：记录日志并使用内置页面。
3. 环境变量未设置，且二进制同级存在 `localpage/page.html`：使用该目录。
4. 其他情况使用内置页面。

外部目录：

```text
node
localpage/
  page.html
  assets/
    page.css
    page.js
```

示例：

```bash
ITHILTIR_NODE_LOCAL_PAGE_DIR=/opt/ithiltir-node/localpage ./node local
```

## 前端运行时

默认页面定义 `window.ITHILTIR_LOCAL`：

```js
window.ITHILTIR_LOCAL = {
  endpoint: "/metrics",
  staticEndpoint: "/static",
  mode: "node-report",
  pollMs: 5000
};
```

| 字段 | 默认值 | 含义 |
| --- | --- | --- |
| `endpoint` | `/metrics` | 运行时数据接口 |
| `staticEndpoint` | `/static` | 静态硬件接口，空值会禁用静态请求 |
| `mode` | `node-report` | `node-report` 适配 `NodeReport`；`local-view` 直接渲染视图模型 |
| `pollMs` | `5000` | 轮询间隔，小于 `1000` 时按 `1000` 处理 |

## 定制边界

- 视觉改动放在 `page.html` 和 `assets/page.css`。
- 数据映射改动放在 `window.ITHILTIR_LOCAL` 或 `assets/page.js`。
- `/metrics` 和 `/static` 必须保持已记录的 JSON 契约。
- 不要把 `X-Node-Secret` 或 Dash 凭据放进浏览器代码。

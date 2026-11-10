---
slug: /Install/ReverseProxy
---

# 反向代理

生产环境使用域名 + HTTPS + 反向代理部署 Dash。Dash 要求同源根路径部署，反向代理将 `/api`、`/theme`、`/deploy` 和 `/` 转发到同一个 Dash 后端。

浏览器请求默认保持同源。跨域后端地址需要同时配置 CORS、cookie 和 CSRF 策略。

`http://IP:端口` 适用于本机验证、短期内网测试或故障排查，不作为生产公开入口。

## 正确形态

```text
https://dash.example.com/
https://dash.example.com/api
https://dash.example.com/theme
https://dash.example.com/deploy
```

配置：

```yaml
app:
  public_url: "https://dash.example.com"
```

## 不支持的形态

生产环境不使用：

```text
http://10.0.0.2:8080/
```

子路径部署：

```text
https://example.com/dash/
https://example.com/dash/api
```

子路径部署会被 `app.public_url` 校验拒绝。

## Nginx 示例

在已有证书配置的 HTTPS `server` 中分别转发 gRPC 和普通 HTTP 请求。将域名和后端地址替换为实际值，保留站点的 `ssl_certificate` 和 `ssl_certificate_key` 配置：

```nginx
server {
    listen 443 ssl http2;
    server_name dash.example.com;

    location ^~ /ithiltir.node.v1.Node/ {
        grpc_pass grpc://127.0.0.1:8080;
        grpc_set_header Host $host;
        grpc_set_header X-Real-IP $remote_addr;
        grpc_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        grpc_set_header X-Forwarded-Proto $scheme;
        grpc_read_timeout 75s;
        grpc_send_timeout 75s;
    }

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Dash 配置：

```yaml
app:
  listen: ":8080"
  public_url: "https://dash.example.com"
http:
  trusted_proxies:
    - 127.0.0.1/32
    - ::1/128
```

## Caddy 示例

```caddy
dash.example.com {
    reverse_proxy 127.0.0.1:8080
}
```

Dash 配置同上。

## 可信代理

`http.trusted_proxies` 只写真实反向代理 CIDR。避免配置 `0.0.0.0/0` 或 `::/0`。如果没有反向代理，使用空数组：

```yaml
http:
  trusted_proxies: []
```

## 节点安装脚本

节点安装脚本的下载地址和上报地址都依赖 `app.public_url`。改域名、端口或 HTTPS 后，要同步更新配置并重启 Dash，否则管理台显示的安装命令会继续使用旧地址。

## Node gRPC

Node `ITHILTIR_NODE_TRANSPORT=grpc` 或 `auto` 要求代理支持 HTTP/2 和 gRPC。上面的 Nginx 示例使用 `grpc_pass` 将 `/ithiltir.node.v1.Node/` 转发到 Dash，同时保留普通 HTTP 的 `location /`。仅启用客户端侧 HTTP/2 不够，Nginx 到 Dash 的 gRPC 请求也必须使用 HTTP/2。

RPC 使用根路径 `/ithiltir.node.v1.Node/`，不是 `/api/node/metrics`，也不继承上报 URL 的自定义前缀。`app.grpc_port` 不启用第二监听端口。gRPC/auto 不会因 TLS 或鉴权失败改用明文。普通 HTTP 代理配置只能保证 HTTP 上报；[PVE 历史](./pve.md) 需要查询流正常连接。

修改后在运行 Nginx 的主机或容器内检查并重载配置：

```bash
nginx -t && nginx -s reload
```

若 Node 收到 `200 OK`、`text/html` 和 Dash 首页，说明请求没有得到 gRPC 响应。检查该路径是否落入普通 `proxy_pass`，导致转发到 Dash 时使用 HTTP/1.1。排查及恢复步骤见 [PVE 监控](./pve.md#grpc-返回-200-和-html)。

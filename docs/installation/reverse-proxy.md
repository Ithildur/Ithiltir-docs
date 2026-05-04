---
slug: /Install/ReverseProxy
---

# 反向代理

生产环境推荐使用域名 + HTTPS + 反向代理部署 Dash。Dash 要求同源根路径部署，反向代理必须把 `/api`、`/theme`、`/deploy` 和 `/` 都转发到同一个 Dash 后端。

直接暴露 `http://IP:端口` 不是推荐生产形态。它只适合本机验证、短期内网测试或故障排查。

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

## 错误形态

不推荐正式使用：

```text
http://10.0.0.2:8080/
```

错误的子路径部署：

```text
https://example.com/dash/
https://example.com/dash/api
```

这种子路径部署会被 `app.public_url` 校验拒绝。

## Nginx 示例

```nginx
server {
    listen 443 ssl http2;
    server_name dash.example.com;

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

`http.trusted_proxies` 只写真实反向代理 CIDR。不要写 `0.0.0.0/0` 或 `::/0`。如果没有反向代理，使用空数组：

```yaml
http:
  trusted_proxies: []
```

## 节点安装脚本

节点安装脚本的下载地址和上报地址都依赖 `app.public_url`。改域名、端口或 HTTPS 后，要同步更新配置并重启 Dash，否则管理台显示的安装命令会继续使用旧地址。

---
slug: /Appendix/ReverseProxy
---

# 反向代理

该页面保留用于兼容旧链接。反向代理的权威文档已经合并到 [安装部署 / 反向代理](../installation/reverse-proxy.md)。

请使用新页面中的 Nginx、Caddy、`app.public_url` 和 `trusted_proxies` 配置说明。

## 核心约束

- 生产环境推荐使用域名 + HTTPS + Nginx/Caddy 反向代理。
- Dash 只支持同源根路径部署，不支持 `/dash` 这类 URL 子路径。
- `/api`、`/theme`、`/deploy` 和 `/` 必须转发到同一个 Dash 后端。
- 直接 `http://IP:端口` 只适合临时验证或受控内网测试。

完整配置见 [反向代理](../installation/reverse-proxy.md)。

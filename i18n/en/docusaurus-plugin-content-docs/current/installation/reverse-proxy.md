---
slug: /Install/ReverseProxy
title: Reverse Proxy
---

# Reverse Proxy

Production deployments should use a domain + HTTPS + reverse proxy. Dash requires same-origin root-path deployment, and the proxy must forward `/api`, `/theme`, `/deploy`, and `/` to the same Dash backend.

Browser requests are same-origin by default. Cross-origin backend addresses require CORS, cookie, and CSRF policies to be configured together.

Direct `http://IP:port` exposure is not the recommended production shape. Use it only for local validation, short-lived internal testing, or troubleshooting.

## Correct Shape

```text
https://dash.example.com/
https://dash.example.com/api
https://dash.example.com/theme
https://dash.example.com/deploy
```

Config:

```yaml
app:
  public_url: "https://dash.example.com"
```

## Wrong Shapes

Not recommended for formal deployment:

```text
http://10.0.0.2:8080/
```

Wrong subpath deployment:

```text
https://example.com/dash/
https://example.com/dash/api
```

This subpath deployment is rejected by `app.public_url` validation.

## Nginx Example

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

Dash config:

```yaml
app:
  listen: ":8080"
  public_url: "https://dash.example.com"
http:
  trusted_proxies:
    - 127.0.0.1/32
    - ::1/128
```

## Caddy Example

```caddy
dash.example.com {
    reverse_proxy 127.0.0.1:8080
}
```

Use the same Dash config as above.

## Trusted Proxies

`http.trusted_proxies` should only contain real reverse proxy CIDRs. Do not use `0.0.0.0/0` or `::/0`. If there is no reverse proxy, use an empty list:

```yaml
http:
  trusted_proxies: []
```

## Node Install Scripts

Node install script download URLs and report URLs depend on `app.public_url`. After changing domain, port, or HTTPS settings, update the config and restart Dash; otherwise the admin console keeps showing the old install command.

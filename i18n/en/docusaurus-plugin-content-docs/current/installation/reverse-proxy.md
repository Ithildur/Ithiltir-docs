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

Route gRPC and ordinary HTTP separately inside an HTTPS `server` with certificates already configured. Replace the domain and backend address with their actual values, and retain the site's `ssl_certificate` and `ssl_certificate_key` settings:

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

Dash config:

```yaml
app:
  listen: "127.0.0.1:8080"
  public_url: "https://dash.example.com"
http:
  trusted_proxies:
    - 127.0.0.1/32
    - ::1/128
```

## Caddy Example

Caddy terminates TLS at the public endpoint and forwards RPCs under `/ithiltir.node.v1.Node/` to Dash with their paths intact. The `h2c://` upstream uses cleartext HTTP/2 on the loopback connection. The second rule handles the dashboard, HTTP API, and downloads.

```caddy
dash.example.com {
    reverse_proxy /ithiltir.node.v1.Node/* h2c://127.0.0.1:8080
    reverse_proxy 127.0.0.1:8080
}
```

Use the Dash listener and trusted proxy settings shown above. With the standard Caddyfile path, validate and reload the configuration with:

```bash
caddy validate --config /etc/caddy/Caddyfile && caddy reload --config /etc/caddy/Caddyfile
```

## Trusted Proxies

`http.trusted_proxies` should only contain real reverse proxy CIDRs. Do not use `0.0.0.0/0` or `::/0`. If there is no reverse proxy, use an empty list:

```yaml
http:
  trusted_proxies: []
```

## Node Install Scripts

Node install script download URLs and report URLs depend on `app.public_url`. After changing domain, port, or HTTPS settings, update the config and restart Dash; otherwise the admin console keeps showing the old install command.

## Node gRPC

When Node uses `ITHILTIR_NODE_TRANSPORT=grpc` or `auto`, gRPC requests need HTTP/2 on both hops. The node connects to the proxy over HTTPS. The proxy reaches the local Dash listener using `grpc_pass` (Nginx) or `h2c://` (Caddy), as shown above.

RPC uses the root service path `/ithiltir.node.v1.Node/`, not `/api/node/metrics` or any custom report-URL prefix. `app.grpc_port` does not enable a second listener. gRPC/auto never authorize plaintext fallback after TLS or authentication failure. Ordinary HTTP proxying alone supports HTTP reports; [PVE history](./pve.md) also needs a working query stream.

After editing, validate and reload the configuration on the host or inside the container running Nginx:

```bash
nginx -t && nginx -s reload
```

If Node receives `200 OK`, `text/html`, and the Dash homepage, the request did not receive a gRPC response. Check whether the service path falls through to ordinary `proxy_pass` forwarding over HTTP/1.1 to Dash. See [PVE Monitoring](./pve.md#grpc-returns-200-and-html) for diagnosis and recovery steps.

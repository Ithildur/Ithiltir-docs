---
slug: /Appendix/ReverseProxy
title: Reverse Proxy
---

# Reverse Proxy

This page is kept for compatibility with old links. The canonical reverse proxy documentation now lives at [Installation / Reverse Proxy](../installation/reverse-proxy.md).

Use that page for Nginx, Caddy, `app.public_url`, and `trusted_proxies` configuration.

## Core Constraints

- Production deployments should use a domain + HTTPS + Nginx/Caddy reverse proxy.
- Dash supports same-origin root deployment only, not URL subpaths such as `/dash`.
- `/api`, `/theme`, `/deploy`, and `/` must be forwarded to the same Dash backend.
- Direct `http://IP:port` exposure is only for temporary validation or controlled internal testing.

Full configuration: [Reverse Proxy](../installation/reverse-proxy.md).

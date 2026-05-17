---
slug: /Node/Local
title: Local Mode
---

# Local Mode

Local mode runs Ithiltir-node as a single-host HTTP server. It does not require Dash.

## Start

```bash
ithiltir-node [--net eth0,eth1]
```

Default listen address:

```text
0.0.0.0:9100
```

Environment variables:

| Variable | Description |
| --- | --- |
| `NODE_HOST` | Listen host |
| `NODE_PORT` | Listen port |
| `ITHILTIR_NODE_LOCAL_PAGE_DIR` | Override local page directory |

## Endpoints

| Method | Path | Response |
| --- | --- | --- |
| `GET`, `HEAD` | `/` | Local HTML page |
| `GET`, `HEAD` | `/local` | Alias of `/` |
| `GET`, `HEAD` | `/metrics` | `NodeReport` |
| `GET`, `HEAD` | `/static` | `Static` |

Before the first sample, `/metrics` returns `503`. Before static data is ready, `/static` returns `503`.

## Local Page Override

Directory layout:

```text
localpage/
  page.html
  assets/
    page.css
    page.js
```

Set:

```bash
export ITHILTIR_NODE_LOCAL_PAGE_DIR=/path/to/localpage
```

The node serves `page.html` for `/` and static files under `/assets/`.

---
slug: /Node/Local
title: Local Mode
---

# Local Mode

Local mode runs Ithiltir-node as a single-host HTTP server. It does not require Dash.

## Start

Download the executable for your platform from [Ithiltir-node Releases](https://github.com/Ithildur/Ithiltir-node/releases). On Linux or macOS, save it as `node` and run it from the download directory:

```bash
chmod +x ./node
./node local 127.0.0.1 9100
```

On Windows, save the executable as `node.exe` and run `.\node.exe local 127.0.0.1 9100`.

Open `http://127.0.0.1:9100/` in a browser on the same machine to see its metrics. Running `./node` or `./node local` without an address uses the default listener:

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

The node serves `page.html` for `/` and files from `localpage/assets/` under `/local-assets/`.

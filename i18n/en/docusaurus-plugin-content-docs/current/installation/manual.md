---
slug: /Install/Manual
title: Manual Install
---

# Manual Install

The source path does not invoke the release installer. Provide PostgreSQL, TimescaleDB, Redis, Go, and Bun yourself.

## Run Dash from Source

```bash
cp configs/config.example.yaml config.local.yaml
export monitor_dash_pwd='<password>'
go run ./cmd/dash migrate -config config.local.yaml
go run ./cmd/dash -debug
```

Frontend development server:

```bash
cd web
FRONT_TEST_API=http://127.0.0.1:8080 bun run dev
```

The Vite development server proxies only `/api` and `/theme`. Frontend code still uses same-origin relative paths.

## Run Node from Source

Local mode:

```bash
go run ./cmd/node
```

Push mode:

```bash
go run ./cmd/node push 3 https://dash.example.com/api/node/metrics '<node-secret>'
```

## Build Release Packages

Dash package:

```bash
bash scripts/package.sh \
  --version 1.2.3 \
  --node-version 1.2.3 \
  -o release \
  -t linux/amd64 \
  --tar-gz
```

Node snapshot build:

```bash
cd /home/dev/Ithiltir-node
./scripts/build.sh
```

## Manual Service Boundary

Manual installs must provide their own service units, log rotation, reverse proxy, TLS, and backups. For production, prefer the release package installer unless you need source-level validation.

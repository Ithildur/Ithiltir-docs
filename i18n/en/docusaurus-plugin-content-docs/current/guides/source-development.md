---
slug: /Guides/SourceDevelopment
title: Source Development
---

# Source Development

Source runs are intended for development, configuration validation, and troubleshooting. Use release packages for production deployments.

The source path does not invoke the release installer. Provide PostgreSQL, TimescaleDB, Redis, Go, and Bun yourself.

## Run Dash from Source

```bash
cp configs/config.example.yaml config.local.yaml
export monitor_dash_pwd='<password>'
go run ./cmd/dash migrate -config config.local.yaml
go run ./cmd/dash -debug
```

For local use without Redis:

```bash
go run ./cmd/dash -debug --no-redis
```

With `--no-redis`, admin sessions and frontend caches are process-local and disappear on restart. Alert pending/cooldown state and MTProto login state are process-local in both modes; open alert events and notification outbox rows persist in PostgreSQL.

Frontend development server:

```bash
cd web
FRONT_TEST_API=http://127.0.0.1:8080 bun run dev
```

The Vite development server proxies only `/api` and `/theme`. Frontend code still uses same-origin relative paths.

## Run Node from Source

Local mode:

```bash
./node local 0.0.0.0 9100
```

Push mode:

```bash
./node report install https://dash.example.com/api/node/metrics '<node-secret>'
./node push 3
```

Select interfaces:

```bash
./node push 3 --net eth0,eth1
```

Require HTTPS:

```bash
./node report install https://dash.example.com/api/node/metrics '<node-secret>' --require-https
./node push 3 --require-https
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

Node build:

```bash
./scripts/build.sh --version 1.2.3
```

See [Build](./build.md) for complete build entry points.

## Manual Service Boundary

Manual installs must provide their own service units, log rotation, reverse proxy, TLS, and backups.

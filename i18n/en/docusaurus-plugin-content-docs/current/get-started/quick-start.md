---
slug: /QuickStart
title: Quick Start
---

# Quick Start

Download a Dash release package from GitHub Releases, install Dash, then enroll one node.

## 1. Download the Dash Package

Choose the target architecture:

| Architecture | Host |
| --- | --- |
| `amd64` | x86_64 / AMD64 |
| `arm64` | ARM64 / AArch64 |

Download the latest stable release:

```bash
ARCH=amd64
curl -fL -o "Ithiltir_dash_linux_${ARCH}.tar.gz" \
  "https://github.com/Ithildur/Ithiltir/releases/latest/download/Ithiltir_dash_linux_${ARCH}.tar.gz"
```

For a fixed version:

```bash
VERSION=1.2.3
ARCH=amd64
curl -fL -o "Ithiltir_dash_linux_${ARCH}.tar.gz" \
  "https://github.com/Ithildur/Ithiltir/releases/download/${VERSION}/Ithiltir_dash_linux_${ARCH}.tar.gz"
```

## 2. Extract and Install Dash

```bash
tar -xzf "Ithiltir_dash_linux_${ARCH}.tar.gz"
cd Ithiltir-dash
sudo bash install_dash_linux.sh --lang en
```

For `app.public_url`, prefer a domain HTTPS root URL such as `https://dash.example.com`, with Nginx or Caddy reverse-proxying to the local Dash backend. Direct `http://IP:port` access is only for local checks or temporary internal testing, not for formal deployment.

On supported systemd Linux distributions, the installer detects and prepares runtime dependencies:

- PostgreSQL 16+.
- TimescaleDB.
- Redis 8.2+.
- Migrations, service files, and the admin password environment variable.

On Debian/Ubuntu systems that use `apt-get`, do not preinstall PostgreSQL, TimescaleDB, or Redis manually. The installer handles the package manager and repositories when needed. Manual dependency setup is only for source runs, restricted hosts, external database/Redis deployments, or unsupported distributions.

After installation, open the configured `app.public_url`, then open `/login` for the admin console.

## 3. Create a Node

Create a node in the admin console and copy its report secret. The node metrics endpoint is:

```text
<app.public_url>/api/node/metrics
```

## 4. Install the Linux Node

Linux nodes can use the install script served by Dash:

```bash
curl -fsSL https://dash.example.com/deploy/linux/install.sh -o install_node.sh
sudo bash install_node.sh dash.example.com 443 '<node-secret>'
```

For temporary internal HTTP or a custom port, pass the real address:

```bash
sudo bash install_node.sh 10.0.0.2 8080 '<node-secret>' 3 --net eth0,eth1
```

Formal node enrollment should use domain HTTPS, with `--require-https` where appropriate.

The node runs in push mode by default and reports metrics to `/api/node/metrics`.

The Linux node script downloads the node binary bundled in Dash and registers a systemd service. When LVM/LVM-thin is detected, it attempts to install and enable cron for thinpool cache collection; `apt-get` systems do not need cron installed ahead of time.

## 5. Verify

Check the node in the Dash dashboard. On the node:

```bash
systemctl status ithiltir-node
journalctl -u ithiltir-node -f
```

## Source Quick Check

Use the source path only for development and config validation. Prepare these yourself:

- Go 1.26+.
- Bun 1.3.11.
- PostgreSQL 16+ and TimescaleDB.
- Redis, or `--no-redis` for local trials.

Copy the sample config:

```bash
cp configs/config.example.yaml config.local.yaml
```

At minimum, set:

- `app.listen`
- `app.public_url`
- `database.user`
- `database.name`
- `redis.addr`
- `auth.jwt_signing_key`

The administrator password is read only from the environment:

```bash
export monitor_dash_pwd='<password>'
```

`app.public_url` must be a root URL. Use `https://dash.example.com` for formal deployments; `http://10.0.0.2:8080` style IP+HTTP URLs are for temporary checks only. Do not use a path prefix such as `/dash`.

Run migrations:

```bash
go run ./cmd/dash migrate -config config.local.yaml
```

Start Dash:

```bash
go run ./cmd/dash -debug
```

For a local-only page:

```bash
./node local
```

Default URL:

```text
http://127.0.0.1:9100/
```

## Next

- [Dash Config](../configuration/dash.md)
- [Node Overview](../components/node/index.md)
- [Reverse Proxy](../installation/reverse-proxy.md)
- [Production Deployment Checklist](../guides/production-deployment.md)

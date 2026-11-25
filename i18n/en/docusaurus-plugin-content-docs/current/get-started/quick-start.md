---
slug: /QuickStart
title: Quick Start
---

# Quick Start

Install Dash and connect your first Linux node to see live CPU and memory readings. For a single machine, you can also use [Node local mode](../components/node/local.md).

:::note[Before you start]

You need a [supported Linux host](../installation/requirements.md), administrator access, and a Dash address reachable from the node.

:::

## 1. Install Dash

### Download the release {/* #1-download-the-dash-package */}

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

<details>
<summary>Install a specific release</summary>

```bash
VERSION=1.2.3
ARCH=amd64
curl -fL -o "Ithiltir_dash_linux_${ARCH}.tar.gz" \
  "https://github.com/Ithildur/Ithiltir/releases/download/${VERSION}/Ithiltir_dash_linux_${ARCH}.tar.gz"
```

</details>

### Run the installer {/* #2-extract-and-install-dash */}

```bash
tar -xzf "Ithiltir_dash_linux_${ARCH}.tar.gz"
cd Ithiltir-dash
sudo bash install_dash_linux.sh --lang en --service-manager=systemd
```

For `app.public_url`, prefer a domain HTTPS root URL such as `https://dash.example.com`, with Nginx or Caddy reverse-proxying to the local Dash backend. Direct `http://IP:port` access is only for local checks or temporary internal testing, not for formal deployment.

On supported systemd Linux distributions, the installer detects and prepares runtime dependencies:

- PostgreSQL 16+.
- TimescaleDB.
- Redis 6.2.0+; 8.2.3+ recommended.
- Migrations, service files, and the admin password environment variable.

On supported Debian/Ubuntu systems, the installer uses `apt-get` to prepare local dependencies. See [requirements](../installation/requirements.md) for other distributions and manual setup.

After installation, open the configured `app.public_url`, then open `/login` for the admin console.

## 2. Connect your first node

### Create the node in Dash {/* #3-create-a-node */}

In the admin console, open the node list and create a node. Copy the deployment command for its operating system. The command includes the secret assigned to this node. Node reports go to:

```text
<app.public_url>/api/node/metrics
```

### Run the installer on the node {/* #4-install-the-linux-node */}

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

The Linux Node script supports systemd, Alpine/OpenRC, and explicit `none`. systemd uses timers for SMART, connections, and LVM thinpool collection; OpenRC uses BusyBox cron for SMART/LVM and Node's built-in connection count.

## 3. Verify reporting {/* #5-verify */}

Open the dashboard and find the node by name.

:::tip[Expected result]

The node is online and shows CPU and memory readings.

:::

If the node stays offline and uses systemd, check its service and logs.

```bash
systemctl status ithiltir-node
journalctl -u ithiltir-node -f
```

For other node platforms, see the [macOS](../installation/node-macos.md) and [Windows](../installation/node-windows.md) installation guides. For reporting errors, see [troubleshooting](../operations/troubleshooting.md).

## Source Quick Check

Use the source path only for development and config validation. Prepare these yourself:

- Go 1.27.3+.
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

The password requires at least 8 visible ASCII characters with no whitespace. `auth.jwt_signing_key` requires at least 32 bytes with no surrounding whitespace.

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
- [Production Deployment Checklist](../installation/production-deployment.md)

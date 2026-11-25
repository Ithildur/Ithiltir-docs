---
slug: /Install/AllInOne
title: Single-Host Production Deployment
---

# Single-Host Production Deployment

In a standard production deployment, one Linux host runs Dash, PostgreSQL with the TimescaleDB extension, and Redis. Browsers and nodes reach Dash through Nginx or Caddy on that host.

## Topology

```text
Browser/Node
    |
HTTPS
    |
Nginx/Caddy
    |
127.0.0.1:8080
    |
Ithiltir Dash
    |
+------------------+
| PostgreSQL       |
| TimescaleDB      |
| Redis            |
+------------------+
```

Dash is still single-instance. Do not run multiple Dash writers against the same database.

## System Check

```bash
uname -m
systemctl --version
```

Do not preinstall the database and Redis by default. On supported distributions, the release installer prepares PostgreSQL 16+, TimescaleDB, and Redis; Debian/Ubuntu uses `apt-get` and the required repositories.

Dash connects to PostgreSQL and Redis over loopback.

```yaml
database:
  host: 127.0.0.1
redis:
  addr: 127.0.0.1:6379
```

## Install Dash

```bash
tar -xzf Ithiltir_dash_linux_amd64.tar.gz
cd Ithiltir-dash
sudo bash install_dash_linux.sh --lang en --service-manager=systemd
```

The installer prepares:

- `/opt/Ithiltir-dash`
- `/opt/Ithiltir-dash/configs/config.local.yaml`
- `dash.service`
- PostgreSQL 16+, TimescaleDB, and Redis

Distribution package-manager behavior is documented in [Install Dash](./dash-linux.md).

## Public URL

Bind Dash to loopback and set `app.public_url` to the public HTTPS domain root served by the reverse proxy.

```yaml
app:
  listen: "127.0.0.1:8080"
  public_url: "https://dash.example.com"
```

## Local Reverse Proxy

Configure Nginx or Caddy to forward HTTPS requests to `127.0.0.1:8080` using the [reverse proxy examples](./reverse-proxy.md). For Node gRPC or PVE history queries, include the gRPC forwarding rule.

Dash config:

```yaml
http:
  trusted_proxies:
    - 127.0.0.1/32
    - ::1/128
```

Use the [go-live checklist](./production-deployment.md) to verify the public endpoint and node reporting.

## Verify

The installer creates the database user and database, enables the TimescaleDB extension, runs migrations, and starts `dash.service`. A standard release install does not need another manual `migrate` or `systemctl enable --now`.

```bash
systemctl status dash.service
journalctl -u dash.service -n 100 --no-pager
curl -fsS http://127.0.0.1:8080/api/version/
```

## Enroll the First Node

Create a node in the admin console and copy its secret.

Same host:

```bash
curl -fsSL http://127.0.0.1:8080/deploy/linux/install.sh -o install_node.sh
sudo bash install_node.sh 127.0.0.1 8080 '<node-secret>' 3
```

Remote host through the domain HTTPS public address:

```bash
curl -fsSL https://dash.example.com/deploy/linux/install.sh -o install_node.sh
sudo bash install_node.sh dash.example.com 443 '<node-secret>' 3 --net eth0
```

## Retention

Small deployments can use defaults:

```yaml
database:
  retention_days: 45
  traffic_retention_days: 45
```

For 95th percentile billing or cross-month review:

```yaml
database:
  retention_days: 45
  traffic_retention_days: 90
```

`billing` traffic mode writes more 5-minute facts and summary data. If disk is tight, reduce retention first; do not delete TimescaleDB chunks manually.

## Minimal Backup

```bash
pg_dump -Fc -f /root/ithiltir.dump ithiltir
tar -czf /root/ithiltir-dash-config.tgz \
  /opt/Ithiltir-dash/configs/config.local.yaml \
  /opt/Ithiltir-dash/themes \
  /opt/Ithiltir-dash/install_id
```

Back up `/opt/Ithiltir-dash/configs/notify-config.key` separately from the PostgreSQL dump. Notification credentials cannot be restored without the matching key.

Restore flow: [Backup and Restore](../operations/backup-restore.md).

---
slug: /Guides/AllInOne
title: All-in-One Deployment
---

# All-in-One Deployment

All-in-one deployment puts Dash, PostgreSQL, TimescaleDB, and Redis on one host. It fits small installations, personal use, and initial production.

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

For local all-in-one, keep database, Redis, and Dash on the same host or internal network:

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
sudo bash install_dash_linux.sh --lang en
```

The installer prepares:

- `/opt/Ithiltir-dash`
- `/opt/Ithiltir-dash/configs/config.local.yaml`
- `dash.service`
- PostgreSQL 16+, TimescaleDB, and Redis

Distribution package-manager behavior is documented in [Install Dash](../installation/dash-linux.md).

## Public URL

Recommended domain HTTPS deployment:

```yaml
app:
  public_url: "https://dash.example.com"
```

Temporary internal IP validation:

```yaml
app:
  public_url: "http://10.0.0.2:8080"
```

Do not keep IP+HTTP as the formal deployment URL. `public_url` is a root URL only; do not add `/ithiltir`, `/dash`, or any other path prefix.

## Local Reverse Proxy

Nginx forwarding to local Dash:

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
http:
  trusted_proxies:
    - 127.0.0.1/32
    - ::1/128
```

Expose only 443 externally. Dash `:8080` can listen on localhost or be restricted by firewall.

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

Restore flow: [Backup and Restore](../operations/backup-restore.md).

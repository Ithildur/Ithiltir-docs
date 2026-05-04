---
slug: /Operations/Troubleshooting
title: Troubleshooting
---

# Troubleshooting

Troubleshoot by request path first: Dash startup, reverse proxy, node reporting, historical data, traffic accounting, and Windows updates are separate paths.

## Dash Does Not Start

View recent logs:

```bash
journalctl -u dash.service -n 200 --no-pager
```

Common causes:

- Config file was not found.
- `app.listen` is missing.
- `app.public_url` is missing.
- `app.public_url` contains a path prefix.
- `auth.jwt_signing_key` is missing.
- `monitor_dash_pwd` is missing or contains invalid characters.
- PostgreSQL connection failed.
- Redis connection failed.
- TimescaleDB is unavailable.

Validate migration manually:

```bash
env DASH_HOME=/opt/Ithiltir-dash \
  /opt/Ithiltir-dash/bin/dash migrate \
  -config /opt/Ithiltir-dash/configs/config.local.yaml \
  -debug
```

## Page Loads but API Fails

Check the reverse proxy:

```bash
curl -i https://dash.example.com/api/version
curl -i https://dash.example.com/theme/active.css
curl -I https://dash.example.com/deploy/linux/install.sh
```

If `/` works but `/api` returns 404, the reverse proxy is probably forwarding only the SPA and not backend paths.

## Node Does Not Come Online

Node service state:

```bash
systemctl status ithiltir-node.service
journalctl -u ithiltir-node.service -n 200 --no-pager
```

Check target config:

```bash
/var/lib/ithiltir-node/current/ithiltir-node report list
```

Check Dash report endpoint reachability:

```bash
curl -i https://dash.example.com/api/node/identity -H 'X-Node-Secret: <secret>' -d '{}'
```

Common causes:

- Secret mismatch.
- Target URL is not `/api/node/metrics`.
- `app.public_url` is not reachable from the node.
- HTTPS certificate problem.
- Reverse proxy does not forward `/api/node/*`.
- System time is not synchronized.

## `/metrics` Returns 503

Local mode may return `503` before the first successful sample. Wait one collection interval.

```bash
./node local 127.0.0.1 9100 --debug
curl http://127.0.0.1:9100/metrics
curl http://127.0.0.1:9100/static
```

## Historical Metrics Are Missing

Check:

- Whether the user is logged in.
- Whether `history_guest_access_mode` is `by_node`.
- Whether node `is_guest_visible` is true.
- Whether the node already has historical data.

## Daily Traffic API Returns 409

`/api/statistics/traffic/daily` requires:

```text
usage_mode=billing
```

Otherwise it returns:

```json
{ "code": "traffic_daily_requires_billing", "message": "daily traffic requires billing mode" }
```

## P95 Is null

P95 fields have values only when `p95_status=available`. Common states:

- `disabled`: P95 is disabled for the node.
- `lite_mode`: global traffic mode is not `billing`.
- `insufficient_samples`: not enough samples.
- `snapshot_without_p95`: the monthly snapshot has no P95 value.

## Windows Node Does Not Update

Confirm the service starts the runner:

```powershell
Get-Service ithiltir-node
```

Running `ithiltir-node.exe push` directly does not apply updates. The runner sets `ITHILTIR_NODE_RUNNER=1` and replaces the binary.

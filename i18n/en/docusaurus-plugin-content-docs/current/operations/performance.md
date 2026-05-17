---
slug: /Operations/Performance
title: Performance and Capacity
---

# Performance and Capacity

Capacity planning focuses on database write volume and the history retention window.

## Minimum Sizing

| Scale | Recommendation |
| --- | --- |
| Small personal deployment | 1 vCPU / 2 GB RAM / 40 GB SSD |
| Below 4 GB RAM | Enable swap |
| Long retention or P95 | Dedicated PostgreSQL on SSD/NVMe |

## Write Sources

Each node push can produce:

- Current metric update.
- History metric write.
- Disk detail write.
- Physical disk temperature history write when available.
- NIC detail write.
- Front cache refresh.
- Alert dirty mark.

The default node interval is 3 seconds. Database writes grow linearly with node count.

## Reduce Write Volume

Reduce write volume in this order:

1. Increase the node push interval, for example `push 10`.
2. Lower history retention days.
3. Use `billing` traffic mode only when accounting is needed.
4. Enable P95 only for nodes that need accounting.
5. Use dedicated PostgreSQL.

## Data Retention

Normal metrics:

```yaml
database:
  retention_days: 45
```

Traffic facts:

```yaml
database:
  traffic_retention_days: 90
```

Longer retention increases query and maintenance cost.

CPU temperature history is stored in the normal metrics table. Physical disk temperature is stored in `disk_physical_metrics` and follows the normal metrics retention policy.

## Redis

Redis stores runtime state and hot cache. Production deployments should enable Redis. With `--no-redis`, hot state is lost after process restart.

## Reverse Proxy

The reverse proxy should enable keep-alive and preserve Host, X-Forwarded-For, and X-Forwarded-Proto. API and frontend should stay same-origin.

---
slug: /Operations/Performance
title: Performance and Capacity
---

# Performance and Capacity

Capacity planning focuses on database write volume and the history retention window.

## Minimum Sizing

| Scale | Core time-series storage | Practical RAM | Suggested disk |
| --- | ---: | ---: | ---: |
| Small personal deployment | Based on actual node count | 2–4 GiB | 40 GiB SSD or more |
| 100 nodes | About 24–26 GiB | 6–8 GiB | 80–100 GiB SSD |
| 500 nodes | About 120 GiB | 16 GiB | 250 GiB SSD/NVMe |

These estimates use the default three-second sample interval and default retention policy. Actual usage also depends on disk and NIC counts, sample completeness, and traffic volume in `billing` mode. Enable swap when the system has less than 4 GiB of RAM.

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
2. Reduce retention for regular metric samples, raw NIC metrics, or five-minute traffic records.
3. Use `billing` traffic mode only when accounting is needed.
4. Enable P95 only for nodes that need accounting.
5. Use dedicated PostgreSQL.

## Data Retention

Regular metric samples:

```yaml
database:
  metrics_raw_retention_days: 8
```

Regular metrics use one-hour chunks and lossless compression after one day. Raw samples, 15-minute aggregates, and one-hour aggregates use independent retention periods: the configured raw period, 16 days, and 32 days. CPU temperature, PSI, and physical-disk temperature use the same policy.

Raw NIC metrics and service checks:

```yaml
database:
  retention_days: 45
```

Five-minute traffic records:

```yaml
database:
  traffic_retention_days: 90
```

`nic_metrics` keeps one-day chunks and is compressed after seven days. `traffic_5m` continues to use row-oriented storage. Increasing raw NIC or five-minute traffic retention increases both storage use and the available rebuild period.

## Redis

Redis stores runtime state and hot cache. Production deployments should enable Redis. With `--no-redis`, hot state is lost after process restart.

## Reverse Proxy

The reverse proxy should enable keep-alive and preserve Host, X-Forwarded-For, and X-Forwarded-Proto. API and frontend should stay same-origin.

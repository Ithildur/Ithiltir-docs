---
slug: /Node/Push
title: Push Mode
---

# Push Mode

Push mode sends node metrics to Dash over HTTP(S). Dash does not connect back to nodes.

## Command

```bash
ithiltir-node push [interval_seconds] [target_url secret] [--net eth0,eth1] [--require-https]
```

When `target_url` and `secret` are omitted, the node reads `report.yaml`.

Default interval is 3 seconds.

Metrics requests (HTTP/gRPC) time out after `max(6 seconds, reporting interval + 3 seconds)`. Targets send concurrently within a round; the next round waits for all targets to finish and reads the latest snapshot. Rounds never overlap. If the reporting interval has elapsed by the end of a round, the next round starts immediately.

## Target URL

Target URL must point to Dash metrics endpoint:

```text
https://dash.example.com/api/node/metrics
```

The node derives sibling `/static` and `/identity` URLs from this target.

## HTTPS Behavior

By default, HTTPS targets can fall back to HTTP according to client rules. Use `--require-https` to reject non-HTTPS targets and disable fallback.

## Debug Endpoint

`--debug` enables a local debug endpoint bound to `127.0.0.1:<NODE_PORT or 9101>`.

## Static Reports

Static metadata is sent once after startup. If static collection is incomplete, the node retries until complete. After suppressed push failures recover, static metadata is sent again.

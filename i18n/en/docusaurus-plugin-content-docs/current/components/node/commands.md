---
slug: /Node/Commands
title: Node Commands
---

# Node Commands

## Local Mode

```bash
ithiltir-node [--net eth0,eth1]
```

Starts the local single-node HTTP page and metrics endpoints.

## Push Mode

```bash
ithiltir-node push [interval_seconds] [target_url secret] [--net eth0,eth1] [--require-https]
```

If `target_url` and `secret` are omitted, targets are read from `report.yaml`.

## Report Install

```bash
ithiltir-node report install https://dash.example.com/api/node/metrics <secret>
```

Writes a report target after reading Dash identity.

## Report Update

```bash
ithiltir-node report update <id> <secret>
```

Rotates the key for an existing target. URL is unchanged.

## Report List

```bash
ithiltir-node report list
```

Prints configured targets.

## Version

```bash
ithiltir-node --version
ithiltir-node -v
```

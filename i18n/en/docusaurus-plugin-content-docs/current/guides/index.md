---
slug: /Guides
title: Development Guides
---

# Development Guides

This section covers secondary development of Ithiltir Dash, Ithiltir-node, theme packages, and the documentation site. See [Install](../installation/index.md) for deployment, [Config Overview](../configuration/index.md) for runtime settings, and [Operations](../operations/index.md) for routine administration.

## Development Targets

| Target | Repository | Entry points |
| --- | --- | --- |
| Ithiltir Dash | [Ithiltir](https://github.com/Ithildur/Ithiltir) | [Architecture](../overview/architecture.md), [Source Development](./source-development.md), [Dash component](../components/dash/index.md) |
| Ithiltir-node | [Ithiltir-node](https://github.com/Ithildur/Ithiltir-node) | [Source Development](./source-development.md), [Node component](../components/node/index.md), [report protocol](../reference/node-protocol.md) |
| Theme packages | [Ithiltir](https://github.com/Ithildur/Ithiltir) | [Theme Development](./theme-authoring.md), [Theme Config](../configuration/themes.md) |
| Documentation | [Ithiltir-docs](https://github.com/Ithildur/Ithiltir-docs) | [Development Guidelines](./development-guidelines.md), [Build](./build.md) |

## Development Entry Points

- [Development Guidelines](./development-guidelines.md): public contracts, compatibility, tests, and documentation requirements.
- [Source Development](./source-development.md): local run commands for Dash, the frontend development server, and Ithiltir-node.
- [Build](./build.md): stable build commands for the Dash frontend, Dash release packages, and Ithiltir-node.
- [Theme Development](./theme-authoring.md): create, package, upload, and verify a custom theme package.

## Contract Locations

| Change area | Documentation |
| --- | --- |
| Dash HTTP routes, fields, and status codes | [Dash HTTP API](../reference/dash-api.md), [Error Semantics](../reference/errors.md) |
| Node commands and reporting behavior | [Node CLI](../reference/node-cli.md), [Report Protocol](../reference/node-protocol.md) |
| Dash startup and runtime settings | [Config Overview](../configuration/index.md) |
| Metrics, disk, and theme package structures | [Metrics Schema](../reference/metrics-schema.md), [Disk Schema](../reference/disk-schema.md), [Theme Package](../reference/theme-package.md) |

Update both Chinese and English documentation when a change affects user-visible behavior or a public contract.

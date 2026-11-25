---
slug: /
title: Documentation Index
---

# Documentation Index

Dash collects reports from multiple hosts in one dashboard. For a single machine, Ithiltir-node can serve a local monitoring page on its own.

## Read by Goal

| I want to | Start here |
| --- | --- |
| See metrics from my first server | [Install Dash and enroll a node](get-started/quick-start.md) |
| Inspect this host without a control server | [Run Node in local mode](components/node/local.md) |
| Add machines to an existing dashboard | [Node rollout](installation/node-rollout.md) |
| Publish a dashboard under my own name | [Site branding](configuration/themes.md#site-branding) and [guest access](configuration/access.md) |
| Find out why a node is offline | [Logs](operations/logging.md) and [troubleshooting](operations/troubleshooting.md) |
| Integrate a client or collector | [Dash HTTP API](reference/dash-api.md) and [node reporting protocol](reference/node-protocol.md) |

## Documentation Sections

<div className="guideDirectory">

<section>

### Overview

[About Ithiltir](overview/about.md) introduces Dash and Node. [Architecture](overview/architecture.md) traces reports from collection to storage and the dashboard.

</section>

<section>

### Installation

Start with the [deployment options](installation/index.md) and [requirements](installation/requirements.md). Use the [production checklist](installation/production-deployment.md) to verify the proxy, service and node connections.

</section>

<section>

### Configuration Manual

The [configuration overview](configuration/index.md) identifies where each setting is stored. For accounting and notifications, see [traffic](configuration/traffic.md), [alert rules](configuration/alerts.md) and [notification channels](configuration/notifications.md).

</section>

<section>

### Operations

Use the [operations guide](operations/index.md) for routine checks. Review [retention](operations/data-retention.md) and [backup and restore](operations/backup-restore.md) before changing storage.

</section>

<section>

### Reference

Look up command flags, payload fields and error codes in the [reference manual](reference/index.md). The [metrics schema](reference/metrics-schema.md) describes the values a node reports.

</section>

<section>

### Components

Read the [Dash](components/dash/index.md) and [Node](components/node/index.md) guides for component-specific commands, configuration and update behavior.

</section>

<section>

### Development Guides

The [development guides](guides/index.md) cover [running from source](guides/source-development.md), [building packages](guides/build.md) and [writing themes](guides/theme-authoring.md).

</section>

<section>

### Release Notes

Before an upgrade, read the [release notes](release-notes.md) and [upgrade procedure](installation/upgrade.md).

</section>

<section>

### Contributing and Releases

Contributors can consult the [development guidelines](guides/development-guidelines.md), [AI policy](contributing/ai-policy.md) and [release process](contributing/releases.md).

</section>

</div>

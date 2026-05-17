---
slug: /Dash/Deploy
title: Dash Deployment Assets
---

# Dash Deployment Assets

Dash serves node install scripts and node binaries under `/deploy`.

## Paths

| Path | Description |
| --- | --- |
| `/deploy/linux/install.sh` | Linux node install script |
| `/deploy/macos/install.sh` | macOS node install script |
| `/deploy/windows/install.ps1` | Windows node install script |
| `/deploy/linux/node_linux_amd64` | Linux amd64 node binary |
| `/deploy/linux/node_linux_arm64` | Linux arm64 node binary |
| `/deploy/macos/node_macos_arm64` | macOS arm64 node binary |
| `/deploy/windows/node_windows_amd64.exe` | Windows amd64 node binary |
| `/deploy/windows/node_windows_arm64.exe` | Windows arm64 node binary |
| `/deploy/windows/runner_windows_amd64.exe` | Windows amd64 runner |
| `/deploy/windows/runner_windows_arm64.exe` | Windows arm64 runner |

Assets come from the Dash release package. Nodes do not need to download GitHub Release binaries separately when installed through Dash scripts.

## Public URL

Install commands are generated from `app.public_url`. After changing domain, port, or HTTPS settings, update Dash config and restart Dash.

## Reverse Proxy

The reverse proxy must forward `/deploy` to Dash. Do not cache install scripts across Dash upgrades.

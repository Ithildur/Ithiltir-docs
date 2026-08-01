---
slug: /Dash/Deploy
title: Dash Deployment Assets
---

# Dash Deployment Assets

Format-v1 Dash release packages serve Node install scripts and assets under `/deploy`.

`release.env` records Dash/Node versions, target OS/architecture, and SHA-256 for all five Node binaries and two Windows runners. The updater validates every digest and candidate-reported version before stopping Dash.

Install script templates are public. Bundled Node binaries and runner assets require `X-Node-Secret`, or a short-lived `upgrade_token` generated for legacy Node upgrades.

Protected asset responses use `Cache-Control: private, no-store` and `Vary: X-Node-Secret`; shared caches must not store them.

Linux, macOS, and Windows installers follow at most five asset redirects. They keep the original host, keep the effective port on same-scheme redirects, allow HTTP-to-HTTPS upgrade only, and send `X-Node-Secret` only after validation.

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

Install commands are generated from `app.public_url`. After changing domain, port, or HTTPS settings, update Dash config and restart Dash. Installer messages follow Dash `app.language`.

The Linux node installer compiles a root-side connections helper when `cc`, `gcc`, or `clang` is available. The helper is used for full host/container network-namespace TCP/UDP connection counts. If no compiler is available, the node uses its built-in connection counting, which may miss container connections.

## Reverse Proxy

The reverse proxy must forward `/deploy` to Dash. Do not cache install scripts across Dash upgrades.

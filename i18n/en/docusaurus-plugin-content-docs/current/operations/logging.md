---
slug: /Operations/Logging
title: Logging and Status
---

# Logging and Status

## Dash Logs

systemd install:

```bash
journalctl -u dash.service -n 200 --no-pager
journalctl -u dash.service -f
```

Source run writes to stdout and stderr.

Useful checks:

```bash
systemctl status dash.service
curl -fsS http://127.0.0.1:8080/api/version/
```

## Node Logs

Linux systemd:

```bash
systemctl status ithiltir-node.service
journalctl -u ithiltir-node.service -n 200 --no-pager
journalctl -u ithiltir-node.service -f
```

macOS LaunchDaemon:

```bash
sudo launchctl print system/com.ithiltir.node
tail -f /var/log/ithiltir-node.log /var/log/ithiltir-node.err
```

Windows service:

```powershell
Get-Service ithiltir-node
```

Windows runner and service events are written to Windows Event Viewer.

## Version Status

The version endpoint returns:

```json
{
  "version": "1.2.3",
  "node_version": "1.2.3"
}
```

`version` is Dash version. `node_version` is the node version bundled in the Dash package.

## Log Level

Start Dash with `-debug` to print debug logs and redacted configuration. Do not run long-term production with debug logs unless needed for diagnosis.

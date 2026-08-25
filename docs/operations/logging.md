---
slug: /Operations/Logging
---

# 日志和状态检查

## Dash 日志

systemd：

```bash
journalctl -u dash.service -f
journalctl -u dash.service -n 200 --no-pager
```

源码运行直接输出到终端。

日志配置：

```yaml
app:
  log_level: "info"
  log_format: "text"
```

环境变量覆盖：

```bash
APP_LOG_LEVEL=debug
APP_LOG_FORMAT=json
```

`-debug` 启动参数会把日志级别提升到 debug。

HTTP 访问日志只在 `app.log_level=debug` 或使用 `-debug` 时输出。

## Dash 状态

```bash
systemctl status dash.service
curl -fsS http://127.0.0.1:8080/api/version
```

版本接口返回：

```json
{
  "version": "1.2.3",
  "node_version": "1.2.3"
}
```

## Linux 节点日志

```bash
systemctl status ithiltir-node.service
journalctl -u ithiltir-node.service -f
journalctl -u ithiltir-node.service -n 200 --no-pager
```

Push debug：

```bash
systemctl edit ithiltir-node.service
```

把 ExecStart 中加入 `--debug` 后重载并重启：

```bash
systemctl daemon-reload
systemctl restart ithiltir-node.service
curl http://127.0.0.1:9101/
```

OpenRC：

```bash
rc-service ithiltir-node status
rc-service ithiltir-node restart
```

OpenRC 使用 `/opt/node/run_node_openrc.sh` 和 `supervise-daemon`。SMART/LVM 采集计划写入 root 的 BusyBox crontab。

## Dash 更新状态

更新任务和事务文件位于：

```text
$DASH_HOME/runtime/dash-update
```

管理 API 返回最近任务的 `phase`、`failure_code`、`recovery_path` 和 `log_tail`。需要恢复时使用 `dash update recover`，不要手工清理事务文件。

## macOS 节点日志

```bash
sudo launchctl print system/com.ithiltir.node
tail -f /var/log/ithiltir-node.log /var/log/ithiltir-node.err
```

## Windows 节点日志

服务状态：

```powershell
Get-Service ithiltir-node
```

日志：

```text
Event Viewer -> Windows Logs -> Application/System
```

## 本地页面检查

本地模式：

```bash
./node local 127.0.0.1 9100 --debug
curl http://127.0.0.1:9100/metrics
curl http://127.0.0.1:9100/static
```

首次采样前 `/metrics` 和 `/static` 可能返回 `503`。

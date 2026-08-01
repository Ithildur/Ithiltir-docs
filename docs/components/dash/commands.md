---
slug: /Dash/Commands
---

# Dash 命令

## 启动服务

```bash
dash [-debug] [--no-redis]
```

| 参数 | 说明 |
| --- | --- |
| `-debug` | 启用 debug 日志 |
| `--no-redis` | 不加载或连接 Redis；会话和前台缓存使用进程内存 |

`--no-redis` 不改变持久化边界。指标历史、节点、告警规则和系统设置仍在 PostgreSQL。

## 数据库迁移

```bash
dash migrate [-config path] [-debug]
```

迁移会执行数据库结构变更，并同步 TimescaleDB 保留策略。

迁移只向前推进 schema，不读取 Redis 配置。通知配置迁移会生成 `$DASH_HOME/configs/notify-config.key`。

示例：

```bash
dash migrate -config /opt/Ithiltir-dash/configs/config.local.yaml
```

成功输出类似：

```text
migrate: total=12 applied=1 skipped=11
```

## Redis 检查

```bash
dash check-redis --addr <host:port> [--password-file path]
```

该命令对指定 Redis 端点执行 `PING`、`INFO server` 和最低版本检查。密码文件不得带换行符。

## Linux 更新

```text
dash update [--check] [--test] [-y|--yes] [--lang zh|en] [--service-manager auto|systemd|none]
dash update reinstall [--check] [--test] [-y|--yes] [--lang zh|en] [--service-manager auto|systemd|none]
dash update recover
```

`recover` 处理 `$DASH_HOME/runtime/dash-update` 中的未完成事务。数据库迁移开始后只允许向前恢复。

## 主题打包

```bash
dash pack-theme -src <theme-dir> [-out <theme.zip>]
```

`-src` 必填。`-out` 省略时输出为 `<theme-id>.zip`。输出扩展名不是 `.zip` 时会自动补 `.zip`。

## 版本

```bash
dash --version
dash -v
dash update --node-version
```

前两个命令输出 Dash 当前版本。`dash update --node-version` 输出打包携带的 Ithiltir-node 版本，供发布包校验。

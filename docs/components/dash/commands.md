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
| `--no-redis` | 不连接 Redis，使用进程内运行时状态 |

`--no-redis` 不改变持久化边界。指标历史、节点、告警规则和系统设置仍在 PostgreSQL。

## 数据库迁移

```bash
dash migrate [-config path] [-debug]
```

迁移会执行数据库结构变更，并同步 TimescaleDB 保留策略。

示例：

```bash
dash migrate -config /opt/Ithiltir-dash/configs/config.local.yaml
```

成功输出类似：

```text
migrate: total=12 applied=1 skipped=11
```

## 主题打包

```bash
dash pack-theme -src <theme-dir> [-out <theme.zip>]
```

`-src` 必填。`-out` 省略时输出为 `<theme-id>.zip`。输出扩展名不是 `.zip` 时会自动补 `.zip`。

## 版本

```bash
dash --version
dash -v
```

输出 Dash 当前版本。发布包构建时还会注入打包携带的 Ithiltir-node 版本，供 `/api/version` 和管理台判断节点是否过期。

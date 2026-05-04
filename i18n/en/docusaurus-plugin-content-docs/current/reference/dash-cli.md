---
slug: /Reference/DashCLI
title: Dash CLI
---

# Dash CLI

## 启动

```bash
dash [-debug] [--no-redis]
```

| 参数 | 说明 |
| --- | --- |
| `-debug` | 启用 debug 日志，并输出脱敏配置 |
| `--no-redis` | 不连接 Redis，使用进程内运行时状态 |

启动时会：

1. 加载配置。
2. 初始化日志。
3. 校验管理员密码。
4. 连接 PostgreSQL + TimescaleDB。
5. 同步保留策略。
6. 连接 Redis，除非 `--no-redis`。
7. 初始化 store、主题目录、默认分组、JWT。
8. 启动 HTTP、告警和流量后台服务。

## 数据库迁移

```bash
dash migrate [-config path] [-debug]
```

输出：

```text
migrate: total=<n> applied=<n> skipped=<n>
```

迁移会同步 TimescaleDB 保留策略。

## 主题打包

```bash
dash pack-theme -src <theme-dir> [-out <theme.zip>]
```

`-src` 必填。`-out` 省略时输出为 `<theme-id>.zip`。扩展名不是 `.zip` 时自动补 `.zip`。

## 版本

```bash
dash --version
dash -v
```

输出当前 Dash 版本。

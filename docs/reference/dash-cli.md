---
slug: /Reference/DashCLI
---

# Dash CLI

## 启动

```bash
dash [-debug] [--no-redis]
```

| 参数 | 说明 |
| --- | --- |
| `-debug` | 启用 debug 日志并输出脱敏配置 |
| `--no-redis` | 不加载或连接 Redis；管理员会话和前台缓存使用进程内内存 |

正常启动要求 PostgreSQL 的 `goose_db_version` 与当前二进制完全一致，并要求所有通知配置可由安装密钥解密。启用 Redis 时还会执行 `PING` 和 `INFO server`；Redis 低于 `6.2.0` 或无法识别版本时启动失败，低于推荐版本 `8.2.3` 时记录警告。

## 数据库迁移

```bash
dash migrate [-config path] [-debug]
```

迁移只向前推进旧 schema，并拒绝高于当前二进制的 schema。命令不加载 Redis 配置，也不连接 Redis。

通知配置加密迁移会创建 `$DASH_HOME/configs/notify-config.key`。密钥存在且数据库已有密文时，不会自动替换密钥。

## Redis 检查

```bash
dash check-redis --addr <host:port> [--password-file path]
```

该命令对指定端点执行 `PING`、`INFO server` 和版本检查，适用于安装前验证远端 Redis。密码文件最大 4 KiB，且必须只包含密码本身，不得带换行符。

## Linux 更新

```text
dash update [--check] [--test] [-y|--yes] [--lang zh|en] [--service-manager auto|systemd|none]
dash update reinstall [--check] [--test] [-y|--yes] [--lang zh|en] [--service-manager auto|systemd|none]
dash update recover
```

| 参数或子命令 | 说明 |
| --- | --- |
| `--check` | 只检查目标版本，不安装 |
| `--test` | 选择最新预发布版本；默认选择最新正式版本 |
| `-y`、`--yes` | 跳过交互确认 |
| `--service-manager` | 指定已安装运行方式；默认自动检测 |
| `reinstall` | 重新安装所选版本 |
| `recover` | 继续或回滚持久化事务；迁移开始后只向前完成 |

更新器只接受格式 v1 发布包，并校验 `release.env`、归档边界、资产摘要和候选二进制版本。受管安装有未完成事务时，先执行 `dash update recover`。

## 主题打包

```bash
dash pack-theme -src <theme-dir> [-out <theme.zip>]
```

`-src` 必填。省略 `-out` 时输出 `<theme-id>.zip`；缺少 `.zip` 扩展名时自动补充。

## 版本

```bash
dash --version
dash -v
dash update --node-version
```

前两个命令输出当前 Dash 版本。`dash update --node-version` 输出内置 Node 版本，供发布包校验使用。

---
slug: /Operations/BackupRestore
---

# 备份和恢复

Ithiltir 没有内置备份服务。生产部署必须用数据库和文件级备份组合。

## 必备备份

Dash 主控端：

```text
/opt/Ithiltir-dash/configs/config.local.yaml
/opt/Ithiltir-dash/configs/notify-config.key
/opt/Ithiltir-dash/themes
/opt/Ithiltir-dash/install_id
```

PostgreSQL：

```bash
pg_dump -Fc -d <db_name> -f ithiltir-$(date +%Y%m%d%H%M%S).dump
```

节点：

```text
/var/lib/ithiltir-node/report.yaml
%ProgramData%\Ithiltir-node\report.yaml
```

## 可选备份

Redis 可选。Redis 丢失会影响在线会话和前台缓存，但持久化配置、开放告警事件、通知 outbox 和流量物化进度在 PostgreSQL。

如果业务要求会话在 Redis 故障后继续有效，可以按 Redis 自身机制备份 RDB/AOF。

`notify-config.key` 必须与 PostgreSQL 备份分开保存。没有匹配密钥的数据库备份无法恢复 Telegram、SMTP 或 Webhook 凭据。

## 恢复 Dash

1. 安装同版本或兼容版本发布包。
2. 停止服务：

```bash
systemctl stop dash.service
```

3. 恢复配置、通知密钥、主题和 `install_id`：

```bash
cp config.local.yaml /opt/Ithiltir-dash/configs/config.local.yaml
cp notify-config.key /opt/Ithiltir-dash/configs/notify-config.key
cp -a themes /opt/Ithiltir-dash/themes
cp install_id /opt/Ithiltir-dash/install_id
chmod 0600 /opt/Ithiltir-dash/configs/config.local.yaml
chmod 0600 /opt/Ithiltir-dash/configs/notify-config.key
```

4. 恢复 PostgreSQL：

```bash
pg_restore -d <db_name> --clean --if-exists ithiltir.dump
```

5. 执行迁移：

```bash
env DASH_HOME=/opt/Ithiltir-dash \
  /opt/Ithiltir-dash/bin/dash migrate \
  -config /opt/Ithiltir-dash/configs/config.local.yaml
```

6. 启动服务：

```bash
systemctl start dash.service
```

## 恢复节点

Linux：

```bash
systemctl stop ithiltir-node.service
cp report.yaml /var/lib/ithiltir-node/report.yaml
chmod 0600 /var/lib/ithiltir-node/report.yaml
systemctl start ithiltir-node.service
```

Windows：

```powershell
Stop-Service ithiltir-node
Copy-Item .\report.yaml "$env:ProgramData\Ithiltir-node\report.yaml" -Force
Start-Service ithiltir-node
```

## 升级前备份

升级前至少备份：

- PostgreSQL dump。
- `/opt/Ithiltir-dash/configs/config.local.yaml`。
- `/opt/Ithiltir-dash/configs/notify-config.key`。
- `/opt/Ithiltir-dash/themes`。

更新脚本会备份安装目录，但不包含数据库备份。

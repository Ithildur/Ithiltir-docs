---
slug: /Install/Upgrade
title: Upgrade
---

# 升级

升级分两类：Dash 升级和节点升级。

## Dash 升级

Linux 发布包安装的 Dash 使用：

```bash
sudo bash /opt/Ithiltir-dash/update_dash_linux.sh --check
sudo bash /opt/Ithiltir-dash/update_dash_linux.sh -y --lang zh
```

更新脚本会：

1. 检查当前版本和发布通道。
2. 从 GitHub Release 下载新包。
3. 停止 `dash.service`。
4. 备份 `/opt/Ithiltir-dash` 到临时目录。
5. 覆盖安装文件。
6. 收紧敏感文件权限。
7. 执行数据库迁移。
8. 启动 `dash.service`。

如果迁移失败，脚本会尝试恢复安装目录并重启旧服务。数据库迁移已经提交的部分不会自动反向回滚，因此升级前必须做数据库备份。

## 手工升级 Dash

```bash
systemctl stop dash.service
cp -a /opt/Ithiltir-dash /opt/Ithiltir-dash.bak.$(date +%Y%m%d%H%M%S)
tar -xzf Ithiltir_dash_linux_amd64.tar.gz
cp -a Ithiltir-dash/. /opt/Ithiltir-dash/
env DASH_HOME=/opt/Ithiltir-dash /opt/Ithiltir-dash/bin/dash migrate -config /opt/Ithiltir-dash/configs/config.local.yaml
systemctl start dash.service
```

手工升级前备份数据库：

```bash
pg_dump -Fc -d <db_name> -f ithiltir-$(date +%Y%m%d%H%M%S).dump
```

## 节点升级

Dash 发布包携带节点资产。管理台触发节点升级时：

1. Dash 根据节点最后上报的平台选择对应资产。
2. `POST /api/admin/nodes/{id}/upgrade` 写入易失升级任务。
3. 节点下一次 `POST /api/node/metrics` 响应拿到 update manifest。
4. Windows runner 模式会暂存、校验、替换并重启 node。

当前自更新只支持 Windows runner。Linux/macOS 节点应重新执行安装脚本完成升级。

## Linux/macOS 节点重新安装

重新执行安装命令即可。脚本会下载新二进制，写入新的 release 目录，并更新 `current` 软链接。

## 版本通道

版本必须是严格 SemVer：

```text
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]
```

不使用 `v` 前缀。普通发布不能携带预发布段；预发布构建可以携带 `-rc.1`、`-alpha.1` 等。

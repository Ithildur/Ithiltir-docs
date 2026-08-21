---
slug: /Dash/Install
---

# 安装 Dash

生产环境使用 Linux 发布包。安装器只负责全新主机的首次安装；后续版本变化使用原生 `dash update`。

## 运行要求

- Linux `amd64` 或 `arm64`。
- PostgreSQL 16+。
- 与 PostgreSQL 主版本匹配的 TimescaleDB。
- Redis `6.2.0+`，推荐 `8.2.3+`；本地试用可以使用 `--no-redis`。
- 服务模式使用运行中的 systemd；其他主机显式选择 `--service-manager=none`。

源码构建还需要 Go 1.26.6+ 和 Bun 1.3.11。

## 发布包安装

```bash
tar -xzf Ithiltir_dash_linux_amd64.tar.gz
cd Ithiltir-dash
sudo bash install_dash_linux.sh --lang zh --service-manager=systemd
```

手工运行模式：

```bash
sudo bash install_dash_linux.sh --lang zh --service-manager=none
```

安装器校验 `release.env` 和候选二进制，写入 `/opt/Ithiltir-dash/releases/<version>`，再原子切换 `current`。配置、日志、主题、更新状态和 `install_id` 位于 release 外部。

完整安装边界见 [安装 Dash](../../installation/dash-linux.md)。

## 源码运行

```bash
cp configs/config.example.yaml config.local.yaml
export monitor_dash_pwd='<至少 8 个可见 ASCII 字符>'
go run ./cmd/dash migrate -config config.local.yaml
go run ./cmd/dash -debug
```

前端开发服务器：

```bash
cd web
FRONT_TEST_API=http://127.0.0.1:8080 bun run dev
```

## 更新

```bash
sudo /opt/Ithiltir-dash/bin/dash update --check
sudo /opt/Ithiltir-dash/bin/dash update
sudo /opt/Ithiltir-dash/bin/dash update reinstall
```

预发布通道使用 `--test`。`update_dash_linux.sh` 仅作为旧命令兼容包装，不实现更新事务。需要恢复时执行：

```bash
sudo /opt/Ithiltir-dash/bin/dash update recover
```

## 反向代理

反向代理必须保留同源路径 `/api`、`/theme`、`/deploy` 和 `/`。Dash 只支持根路径部署，`app.public_url` 不得包含路径前缀。

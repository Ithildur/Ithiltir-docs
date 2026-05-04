---
slug: /Dash/Install
---

# 安装 Dash

Dash 支持源码运行和 Linux 发布包安装。生产部署优先使用发布包。

## 运行要求

- Linux amd64 或 Linux arm64 发布包。
- systemd Linux 发行版。

发布包安装脚本会检测并准备 PostgreSQL 16+、TimescaleDB 和 Redis。Debian/Ubuntu 等 `apt-get` 系统不需要先手工安装这些依赖。

源码运行额外需要自己准备：

- Go 1.26+。
- Bun 1.3.11。
- PostgreSQL 16+、TimescaleDB。
- Redis，或本地试用时使用 `--no-redis`。

## 发布包安装

解压发布包：

```bash
tar -xzf Ithiltir_dash_linux_amd64.tar.gz
cd Ithiltir-dash
```

执行安装脚本：

```bash
sudo bash install_dash_linux.sh --lang zh
```

安装脚本会写入：

- 安装目录：`/opt/Ithiltir-dash`
- 配置文件：`/opt/Ithiltir-dash/configs/config.local.yaml`
- systemd 服务：`dash.service`

脚本会交互填写数据库、Redis、管理员密码、公开 URL、语言、历史保留时长和反向代理信任网段。

依赖缺失时，脚本会按系统包管理器处理；Redis 包版本不足时会提示源码安装/升级。

## 源码运行

```bash
cp configs/config.example.yaml config.local.yaml
export monitor_dash_pwd='<password>'
go run ./cmd/dash migrate -config config.local.yaml
go run ./cmd/dash -debug
```

前端开发服务器单独启动：

```bash
cd web
FRONT_TEST_API=http://127.0.0.1:8080 bun run dev
```

Vite 开发服务器只代理 `/api` 和 `/theme`，前端代码仍使用同源相对路径。

## 更新

已安装的 Linux 服务可用更新脚本检查和更新：

```bash
sudo bash /opt/Ithiltir-dash/update_dash_linux.sh --check
sudo bash /opt/Ithiltir-dash/update_dash_linux.sh -y --lang zh
```

更新脚本按当前发布通道查找更新的 Git tag，下载对应 GitHub Release asset，并保留现有配置。

## 反向代理

反向代理必须保留同源路径：

- `/api`
- `/theme`
- `/deploy`
- `/`

不要把 Dash 部署到 URL 子路径。`app.public_url` 不能是 `https://example.com/dash`。

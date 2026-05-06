---
slug: /Install/Manual
title: Manual Run
---

# 源码和手工运行

源码运行用于开发、配置验证和问题排查。生产部署使用发布包。

The source path does not invoke the release installer. You must provide the database, TimescaleDB, Redis, Go, and Bun yourself.

## Dash 源码运行

准备配置：

```bash
cp configs/config.example.yaml config.local.yaml
export monitor_dash_pwd='<password>'
```

执行迁移：

```bash
go run ./cmd/dash migrate -config config.local.yaml
```

启动：

```bash
go run ./cmd/dash -debug
```

不用 Redis 的本地试用：

```bash
go run ./cmd/dash -debug --no-redis
```

`--no-redis` 下会话、热点快照和告警运行时状态存在进程内存，重启即失效。

## 前端开发

```bash
cd web
FRONT_TEST_API=http://127.0.0.1:8080 bun run dev
```

Vite 开发服务器只代理 `/api` 和 `/theme`。前端代码仍使用同源相对路径。

## 节点手工运行

Local 模式：

```bash
./node local 0.0.0.0 9100
```

Push 模式：

```bash
./node report install https://dash.example.com/api/node/metrics '<node-secret>'
./node push 3
```

指定网卡：

```bash
./node push 3 --net eth0,eth1
```

严格 HTTPS：

```bash
./node report install https://dash.example.com/api/node/metrics '<node-secret>' --require-https
./node push 3 --require-https
```

## 手工构建

Dash 发布包：

```bash
bash scripts/package.sh \
  --version 1.2.3 \
  --node-version 1.2.3 \
  -o release \
  -t linux/amd64 \
  --tar-gz
```

节点：

```bash
./scripts/build.sh --version 1.2.3
```

更多构建信息见 [构建](../contributing/build.md)。

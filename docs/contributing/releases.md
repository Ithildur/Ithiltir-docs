---
slug: /Releases
---

# 发布版本

Ithiltir 和 Ithiltir-node 都使用严格 SemVer。

## 版本格式

```text
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]
```

规则：

- 不使用 `v` 前缀。
- `x.x.x` 或 `x.x.x+build` 是普通发布。
- `x.x.x-rc.1` 或 `x.x.x-rc.1+build` 是预发布。
- CI 和构建脚本会拒绝非法 SemVer tag。

## Dash 打包节点版本

Dash 发布包会携带 Ithiltir-node 资产。打包时可以显式指定：

```bash
bash scripts/package.sh --version 1.2.3 --node-version 1.2.3 -o release -t linux/amd64 --tar-gz
```

省略 `--node-version` 时，脚本从 `https://github.com/Ithildur/Ithiltir-node.git` 取最新兼容 tag：

- Dash 普通发布使用 node 普通发布。
- Dash 预发布构建会在 node 最新预发布和最新发布中选择更新的一个。
- 没有 node 预发布时回退到最新发布。

本地节点资产必须配合 `--node-version` 或 `ITHILTIR_NODE_VERSION`：

```bash
bash scripts/package.sh \
  --version 1.2.3-alpha.1 \
  --node-version 1.2.3-alpha.1 \
  --node-local \
  -o release \
  -t linux/amd64 \
  --tar-gz
```

## Release asset 命名

Ithiltir-node GitHub Release 使用裸二进制：

```text
Ithiltir-node-linux-amd64
Ithiltir-node-linux-arm64
Ithiltir-node-macos-arm64
Ithiltir-node-windows-amd64.exe
Ithiltir-node-windows-arm64.exe
Ithiltir-runner-windows-amd64.exe
Ithiltir-runner-windows-arm64.exe
```

Windows 保留 `.exe`，checksums 单独上传。

Dash 发布包命名：

```text
Ithiltir_dash_<os>_<arch>.tar.gz
Ithiltir_dash_<os>_<arch>.zip
```

Dash 发布包包含：

- `release.env`。
- `bin/dash`。
- `configs/config.example.yaml`。
- `dist/index.html` 和 `dist/theme-bootstrap.js`。
- `install_dash_linux.sh`。
- `update_dash_linux.sh`。
- `deploy/<platform>/install.*`。
- 5 个 Node 二进制和 2 个 Windows runner。

发布格式 v1 的 `release.env` 包含 Dash 版本、Node 版本、目标 OS/arch 和 7 个 Node/runner 资产的 SHA-256。候选 `bin/dash` 必须报告与 manifest 一致的 Dash 和 Node 版本。

发布包只包含 `configs/config.example.yaml`，不得包含 `config.local.yaml`、本机凭据或通知配置密钥。

发布包里的安装脚本负责首次安装。`apt-get` 系统会尝试准备 PostgreSQL 16、匹配主版本的 TimescaleDB 和 Redis。后续版本变化由 `dash update` 负责，`update_dash_linux.sh` 只是兼容包装。

发布工作流必须通过 Go 测试、前端 lint/typecheck/build、发布包构建和格式 v1 资产校验。缺少必需文件、空文件、版本不一致或摘要不匹配时不得发布。

## 发布说明

发布工作流会生成 GitHub Release 正文。普通发布使用上一个普通发布 tag 作为 changelog base；预发布默认使用上一个 SemVer tag。

本地生成：

```bash
scripts/release_notes.sh <version> release-notes.md
```

Ithiltir-node 稳定发布构建可以显式传入发布说明文件：

```bash
./scripts/build.sh --use-git-tag --release --release-notes release-notes.md
```

稳定发布未传 `--release-notes` 时，构建脚本会生成临时发布说明文件。预发布仍按 GoReleaser 默认行为处理。

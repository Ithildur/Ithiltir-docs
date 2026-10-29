---
slug: /Developer/Build
---

# 构建

本文记录稳定构建入口。临时开发命令不纳入发布流程。

## Dash 前端

```bash
bash scripts/build_frontend.sh --version 0.0.0-dev -o build/frontend/dist
```

构建成功要求 `dist/index.html` 和 `dist/theme-bootstrap.js` 存在且非空。

`--version` 会把 Dash 版本写入前端，使已打开的页面在后端版本变化后重新加载匹配资源。发布打包使用解析出的 Dash 版本；默认开发值为 `0.0.0-dev`。

PowerShell：

```powershell
powershell -File scripts/build_frontend.ps1 -Version 0.0.0-dev -OutDir build/frontend/dist
```

前端单独开发：

```bash
cd web
FRONT_TEST_API=http://127.0.0.1:8080 bun run dev
```

## Dash 发布包

```bash
bash scripts/package.sh \
  --version 0.4.0 \
  --node-version 0.3.0 \
  --with-pve \
  -o release \
  -t linux/amd64 \
  --tar-gz
```

常用参数：

| 参数 | 说明 |
| --- | --- |
| `-o OUT_DIR` | 输出目录，默认 `release` |
| `-t os/arch` | 目标平台，可重复或逗号分隔 |
| `--version VERSION` | 注入 Dash 版本 |
| `--use-git-tag` | 使用当前提交唯一 tag 作为版本 |
| `--node-version VERSION` | 打包携带的 Ithiltir-node 版本 |
| `--with-pve` | 包含同版本的 Linux PVE helper 及其校验清单 |
| `--node-local` | 从 `deploy/node` 读取本地节点二进制 |
| `--node-local-dir DIR` | 从指定目录读取本地节点二进制 |
| `--release` | 发布模式，要求 `--use-git-tag` |
| `--zip` | 输出 zip |
| `--tar-gz` | 输出 tar.gz |

Dash 主控端发布包当前主要面向 Linux amd64 和 Linux arm64。macOS 与 Windows 的 deploy 资产只用于节点。

每个发布包写入格式 v1 `release.env`，记录 Dash/Node 版本、目标 OS/arch 和全部 Node/runner 资产 SHA-256。包内只复制 `configs/config.example.yaml`；本地 `config.local.yaml` 不进入产物。

PowerShell：

```powershell
powershell -File scripts/package.ps1 `
  -Version 0.4.0 `
  -NodeVersion 0.3.0 `
  -WithPVE `
  -OutDir release `
  -Targets linux/amd64 `
  -Zip
```

## Ithiltir-node

构建配置在 `.goreleaser.yaml`。

Linux/macOS：

```bash
./scripts/build.sh --version 0.3.0
./scripts/build.sh --use-git-tag
./scripts/build.sh --use-git-tag --release
```

Windows：

```powershell
.\scripts\build.ps1 -Version 0.3.0
.\scripts\build.ps1 -UseGitTag
.\scripts\build.ps1 -UseGitTag -Release
```

脚本会在缺失时自动安装 GoReleaser `v2.17.1`。

本地输出：

```text
build/
  linux/
    node_linux_amd64
    node_linux_arm64
    pve_cache_linux_amd64
    pve_cache_linux_arm64
  macos/
    node_macos_arm64
  windows/
    node_windows_amd64.exe
    node_windows_arm64.exe
    runner_windows_amd64.exe
    runner_windows_arm64.exe
```

## 检查

常用检查：

```bash
go test ./...
cd web && bun run lint
cd web && bun run typecheck
cd web && bun run build
```

发布检查还必须构建目标发布包，并验证 manifest、7 个内置 Node/runner 资产、前端入口和安装/更新脚本均存在且非空。

文档构建不要求先运行测试。代码变更涉及公共契约、状态机、错误路径、并发、序列化或历史 bug 区域时，应补充对应测试。

## PVE 发布资产

正式发布工作流启用 `--with-pve`，用法见上方打包命令。helper 与 Node 共用 `--node-version`，对应资产为：

| 发布资产 | 本地路径 |
| --- | --- |
| `Ithiltir-pve-cache-linux-amd64` | `linux/pve_cache_linux_amd64` |
| `Ithiltir-pve-cache-linux-arm64` | `linux/pve_cache_linux_arm64` |

启用 `--with-pve` 后，缺少任一 helper 会导致打包失败。`deploy/linux/pve-cache.env` 记录 `format_version=1`、`node_version` 和两个 helper 的 SHA-256；`release.env` v1 仍记录七个 Node/runner 资产。发布顺序见[发布约定](../contributing/releases.md)。

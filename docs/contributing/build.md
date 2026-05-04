---
slug: /Developer/Build
---

# 构建

本文只记录稳定构建入口。临时开发命令不要写入发布流程。

## Dash 前端

```bash
bash scripts/build_frontend.sh -o build/frontend/dist
```

PowerShell：

```powershell
powershell -File scripts/build_frontend.ps1 -OutDir build/frontend/dist
```

前端单独开发：

```bash
cd web
FRONT_TEST_API=http://127.0.0.1:8080 bun run dev
```

## Dash 发布包

```bash
bash scripts/package.sh \
  --version 1.2.3-alpha.1 \
  --node-version 1.2.3-alpha.1 \
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
| `--node-local` | 从 `deploy/node` 读取本地节点二进制 |
| `--node-local-dir DIR` | 从指定目录读取本地节点二进制 |
| `--release` | 发布模式，要求 `--use-git-tag` |
| `--zip` | 输出 zip |
| `--tar-gz` | 输出 tar.gz |

Dash 主控端发布包当前主要面向 Linux amd64 和 Linux arm64。macOS 与 Windows 的 deploy 资产只用于节点。

PowerShell：

```powershell
powershell -File scripts/package.ps1 `
  -Version 1.2.3-alpha.1 `
  -NodeVersion 1.2.3-alpha.1 `
  -OutDir release `
  -Targets linux/amd64 `
  -Zip
```

## Ithiltir-node

构建配置在 `.goreleaser.yaml`。

Linux/macOS：

```bash
./scripts/build.sh --version 1.2.3-alpha.1
./scripts/build.sh --use-git-tag
./scripts/build.sh --use-git-tag --release
```

Windows：

```powershell
.\scripts\build.ps1 -Version 1.2.3-alpha.1
.\scripts\build.ps1 -UseGitTag
.\scripts\build.ps1 -UseGitTag -Release
```

脚本会在缺失时自动安装 GoReleaser `v2.15.2`。

本地输出：

```text
build/
  linux/
    node_linux_amd64
    node_linux_arm64
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
```

测试不是文档构建的前置条件。代码变更涉及公共契约、状态机、错误路径、并发、序列化或历史 bug 区域时，再写对应测试。

---
slug: /Developer/Build
title: Build
---

# Build

## Dash Frontend

```bash
cd web
bun install
bun run build
```

The frontend build writes static assets consumed by the Dash release package.

## Dash Backend

```bash
go build ./cmd/dash
```

## Dash Release Package

```bash
bash scripts/package.sh \
  --version 1.2.3 \
  --node-version 1.2.3 \
  -o release \
  -t linux/amd64 \
  --tar-gz
```

Common options:

| Option | Description |
| --- | --- |
| `-o OUT_DIR` | Output directory, default `release` |
| `--version VERSION` | Inject Dash version |
| `--use-git-tag` | Use the unique tag on the current commit as version |
| `--node-version VERSION` | Bundled Ithiltir-node version |
| `--node-local` | Use locally built node assets |
| `--release` | Release mode, requires `--use-git-tag` |

Dash release packages currently target Linux amd64 and Linux arm64. macOS and Windows deploy assets are for nodes.

PowerShell package script:

```powershell
.\scripts\package.ps1 -Version 1.2.3 -NodeVersion 1.2.3 -OutDir release -Target linux/amd64 -TarGz
```

## Ithiltir-node

Build config is in `.goreleaser.yaml`.

Local snapshot build:

```bash
./scripts/build.sh
```

Release build:

```bash
./scripts/build.sh --use-git-tag --release
```

Windows:

```powershell
.\scripts\build.ps1 -UseGitTag -Release
```

The script installs GoReleaser `v2.15.2` when missing.

## Docs

```bash
npm install
npm run build
```

Docs build does not require tests first. Code changes should add tests when they affect public contracts, state machines, error paths, concurrency, serialization, or historical bug areas.

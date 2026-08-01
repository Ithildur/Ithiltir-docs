---
slug: /Developer/Build
title: Build
---

# Build

## Dash Frontend

```bash
bash scripts/build_frontend.sh --version 0.0.0-dev -o build/frontend/dist
```

`--version` embeds the Dash version so an open browser reloads matching assets after the backend changes. Release packaging passes its resolved Dash version; the development default is `0.0.0-dev`.

Success requires non-empty `dist/index.html` and `dist/theme-bootstrap.js`.

PowerShell:

```powershell
powershell -File scripts/build_frontend.ps1 -Version 0.0.0-dev -OutDir build/frontend/dist
```

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

Each package writes format-v1 `release.env` with Dash/Node versions, target OS/architecture, and SHA-256 for all Node/runner assets. Only `configs/config.example.yaml` is copied; local config is excluded.

PowerShell package script:

```powershell
powershell -File scripts/package.ps1 -Version 1.2.3 -NodeVersion 1.2.3 -OutDir release -Targets linux/amd64 -Zip
```

## Ithiltir-node

Build config is in `.goreleaser.yaml`.

Local build:

```bash
./scripts/build.sh --version 1.2.3-alpha.1
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

Release checks also run Go tests, frontend lint/typecheck/build, package the target, and verify the manifest, seven bundled Node/runner assets, frontend entries, and install/update scripts are present and non-empty.

Docs build does not require tests first. Code changes should add tests when they affect public contracts, state machines, error paths, concurrency, serialization, or historical bug areas.

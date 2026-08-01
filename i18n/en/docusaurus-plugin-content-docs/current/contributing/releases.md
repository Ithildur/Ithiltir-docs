---
slug: /Releases
title: Releases
---

# Releases

Ithiltir and Ithiltir-node use strict SemVer.

## Version Format

```text
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]
```

Rules:

- Do not use a `v` prefix.
- `x.x.x` or `x.x.x+build` is a stable release.
- `x.x.x-rc.1` or `x.x.x-rc.1+build` is a prerelease.
- CI and build scripts reject invalid SemVer tags.

## Bundled Node Version

Dash packages include Ithiltir-node assets. Specify the bundled node version explicitly:

```bash
bash scripts/package.sh --version 1.2.3 --node-version 1.2.3 -o release -t linux/amd64 --tar-gz
```

When `--node-version` is omitted, the script fetches the latest compatible tag from `https://github.com/Ithildur/Ithiltir-node.git`:

- Stable Dash releases use stable node releases.
- Dash prerelease builds choose the newer tag from latest node prerelease and latest stable release.
- If no node prerelease exists, the latest stable release is used.

Local node assets must use `--node-version` or `ITHILTIR_NODE_VERSION`:

```bash
bash scripts/package.sh \
  --version 1.2.3-alpha.1 \
  --node-version 1.2.3-alpha.1 \
  --node-local \
  -o release \
  -t linux/amd64 \
  --tar-gz
```

## Release Asset Names

Ithiltir-node GitHub Releases use bare binaries:

```text
Ithiltir-node-linux-amd64
Ithiltir-node-linux-arm64
Ithiltir-node-macos-arm64
Ithiltir-node-windows-amd64.exe
Ithiltir-node-windows-arm64.exe
Ithiltir-runner-windows-amd64.exe
Ithiltir-runner-windows-arm64.exe
```

Windows keeps `.exe`. Checksums are uploaded separately.

Dash package names:

```text
Ithiltir_dash_<os>_<arch>.tar.gz
Ithiltir_dash_<os>_<arch>.zip
```

Dash packages include:

- `release.env`.
- `bin/dash`.
- `configs/config.example.yaml` only.
- `dist/index.html` and `dist/theme-bootstrap.js`.
- `install_dash_linux.sh`.
- `update_dash_linux.sh`.
- `deploy/<platform>/install.*`.
- Five Node binaries and two Windows runners.

Format-v1 `release.env` records Dash/Node versions, target OS/architecture, and SHA-256 for all seven Node/runner assets. Candidate `bin/dash` must report matching versions. Packages must never include `config.local.yaml`, local credentials, or the notification key.

The release workflow must pass Go tests, frontend lint/typecheck/build, package construction, and format-v1 asset validation. Missing, empty, version-mismatched, or digest-mismatched assets block publication.

## Release Notes

Release workflows generate the GitHub Release body. Stable releases use the previous stable release tag as the changelog base; prereleases default to the previous SemVer tag.

Generate locally:

```bash
scripts/release_notes.sh <version> release-notes.md
```

Ithiltir-node stable release builds can pass release notes explicitly:

```bash
./scripts/build.sh --use-git-tag --release --release-notes release-notes.md
```

When `--release-notes` is omitted for a stable release, the build script generates temporary release notes. Prereleases still use GoReleaser's default behavior.

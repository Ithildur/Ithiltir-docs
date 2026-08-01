---
slug: /Config/Themes
title: Themes
---

# Themes

Theme package format v1 is frozen and deprecated but remains supported for upload, apply, and runtime use.

## Package Layout

A ZIP may contain only these regular root-level files:

```text
theme.json
tokens.css
recipes.css
preview.png
README.md
```

Directories, symlinks, nested paths, duplicate names, and extra files are rejected. Limits are 20 MiB compressed, 50 MiB extracted, 20 MiB per entry, and 32 entries.

## Manifest

`theme.json` must be valid UTF-8, no larger than 64 KiB, contain one JSON object, and have no unknown fields. It requires all four skin fields:

- `skin.admin.shell`: `sidebar` or `topbar`
- `skin.admin.frame`: `layered` or `flat`
- `skin.dashboard.summary`: `cards` or `strip`
- `skin.dashboard.density`: `comfortable` or `compact`

There are no skin defaults. Text fields reject control characters. ID, name, version, author, and description have explicit format and length limits; see [Theme Package](../reference/theme-package.md).

## CSS

`tokens.css` and `recipes.css` must be UTF-8, at most 1 MiB each, and may contain only custom-property declarations. Across both files, at most 1024 declarations are allowed. Property names are limited to 128 bytes and values to 4096 Unicode characters.

At-rules, nested rules, normal CSS properties, `!important`, and resource-loading functions such as `url()`, `image-set()`, `-webkit-image-set()`, `src()`, and `expression()` are rejected, including escaped function names. Those words remain valid inside CSS strings.

## Optional Files

`preview.png` must fully decode as PNG and have dimensions from 1 to 4096 pixels. `README.md` must be UTF-8 and no larger than 256 KiB.

## Installation and Fallback

Upload validation completes before an atomic install. Applying a theme updates its configured ID. If that package later becomes missing or invalid, the configured ID remains and the UI exposes a repairable `missing` or `broken` entry while runtime CSS falls back to the built-in default.

`POST /api/admin/system/themes/upload` accepts a `file` part up to 20 MiB; the complete multipart body is limited to 21 MiB, with a five-minute read/write window. Root path `/theme-bootstrap.js` uses `Cache-Control: no-store`.

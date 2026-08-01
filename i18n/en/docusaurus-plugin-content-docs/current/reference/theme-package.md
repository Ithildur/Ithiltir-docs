---
slug: /Reference/ThemePackage
title: Theme Package
---

# Theme Package Format

Format v1 is frozen and deprecated but still supported.

## Archive

Only these regular root-level files are allowed:

```text
theme.json
tokens.css
recipes.css
preview.png
README.md
```

| Item | Limit |
| --- | --- |
| ZIP archive | 20 MiB |
| Extracted total | 50 MiB |
| One entry | 20 MiB |
| Entry count | 32 |

Directories, symlinks, nested paths, duplicates, and unknown files are rejected.

## `theme.json`

The manifest must be valid UTF-8, at most 64 KiB, contain exactly one JSON object, and have no unknown fields.

```json
{
  "id": "dark-modern",
  "name": "Dark Modern",
  "version": "1.0.0",
  "author": "Example",
  "description": "Compact operator skin.",
  "skin": {
    "admin": { "shell": "sidebar", "frame": "layered" },
    "dashboard": { "summary": "cards", "density": "comfortable" }
  }
}
```

All four skin fields are required; there are no defaults. `id` matches `^[a-z0-9][a-z0-9_-]{0,63}$` and cannot be `default` or a built-in ID. Name is limited to 128 Unicode characters, version and author to 64 and 128, and description to 2000. Text fields reject control characters.

## CSS

`tokens.css` and `recipes.css` must be UTF-8, at most 1 MiB each, and contain only custom-property declarations under the supported selectors. Across both files, at most 1024 declarations are allowed. Property names are limited to 128 bytes and values to 4096 Unicode characters.

At-rules, nested rules, normal properties, `!important`, and `url()`, `image-set()`, `-webkit-image-set()`, `src()`, or `expression()` functions are rejected, including escaped names. Text inside CSS strings is parsed as string content and remains valid.

## Optional Files

`preview.png` must fully decode and have dimensions in `1..4096`. `README.md` must be valid UTF-8 and no larger than 256 KiB.

## Pack Command

```bash
dash pack-theme -src theme-dir -out theme.zip
```

The command validates the same format and writes deterministic timestamps.

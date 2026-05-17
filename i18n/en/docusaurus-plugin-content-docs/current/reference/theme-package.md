---
slug: /Reference/ThemePackage
title: Theme Package
---

# Theme Package Format

A theme package is a zip file. Allowed files:

```text
manifest.json
tokens.css
recipes.css
preview.png
```

## `manifest.json`

Required:

```json
{
  "id": "dark-modern",
  "name": "Dark Modern",
  "version": "1.0.0"
}
```

## Limits

| Item | Limit |
| --- | --- |
| archive | Max 20 MiB |
| extracted total | Max 50 MiB |
| single file | Max 20 MiB |
| path | Only allowed root-level files |
| duplicate file | Not allowed |

`id` must match:

```text
^[a-z0-9][a-z0-9_-]{1,63}$
```

Reserved IDs:

- `default`
- built-in theme IDs

## CSS Files

`tokens.css` and `recipes.css` can only declare CSS custom properties.

Allowed selectors:

```css
:root { ... }
[data-theme="dark"] { ... }
[data-theme="light"] { ... }
```

Disallowed:

- `@import`
- `@font-face`
- `@keyframes`
- URLs
- selectors outside the allowed list
- nested blocks

## Pack Command

```bash
dash pack-theme -src theme-dir -out theme.zip
```

The output uses fixed timestamps to produce stable zip files.

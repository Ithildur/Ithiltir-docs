---
slug: /Guides/ThemeAuthoring
title: Theme Authoring
---

# Theme Authoring

Theme format v1 customizes supported skin choices and CSS custom properties. It is frozen and deprecated but remains usable.

## Files

```text
theme.json
tokens.css
recipes.css
preview.png
README.md
```

All files are at archive root. `preview.png` and `README.md` are optional.

## Manifest

```json
{
  "id": "dark-modern",
  "name": "Dark Modern",
  "version": "1.0.0",
  "author": "Example",
  "description": "Dark operations theme",
  "skin": {
    "admin": { "shell": "sidebar", "frame": "layered" },
    "dashboard": { "summary": "cards", "density": "comfortable" }
  }
}
```

All four skin values are required:

| Field | Values |
| --- | --- |
| `skin.admin.shell` | `sidebar`, `topbar` |
| `skin.admin.frame` | `layered`, `flat` |
| `skin.dashboard.summary` | `cards`, `strip` |
| `skin.dashboard.density` | `comfortable`, `compact` |

## CSS

Use `tokens.css` and `recipes.css` only for custom-property declarations:

```css
:root {
  --ithiltir-color-bg: #0b0d12;
  --ithiltir-color-text: #f8fafc;
}
```

Do not use at-rules, nested rules, normal properties, `!important`, or resource-loading functions. The combined declaration limit is 1024; each CSS file is limited to 1 MiB.

## Package and Apply

```bash
dash pack-theme -src <theme-dir> -out <theme.zip>
```

Upload and installation are validated before an atomic replacement. A missing or broken active package keeps its configured ID visible for repair while runtime falls back to the built-in skin.

See [Theme Package](../reference/theme-package.md) for exact limits.

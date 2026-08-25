---
slug: /Guides/ThemeAuthoring
title: Theme Development
---

# Theme Development

Theme packages change supported layout skins and CSS custom properties. They do not execute scripts or change application behavior. Format v1 is frozen and deprecated, but existing themes can still be packaged, uploaded, and applied.

See [Theme Config](../configuration/themes.md) and [Theme Package](../reference/theme-package.md) for complete field, selector, and package-size limits.

## Create the Directory

A minimal theme contains two files:

```text
my-theme/
  theme.json
  tokens.css
```

Add `recipes.css`, `preview.png`, and `README.md` when required. Package files remain at the ZIP root.

## Write the Manifest

Example `theme.json`:

```json
{
  "id": "ops-dark",
  "name": "Ops Dark",
  "version": "1.0.0",
  "description": "Dark operator theme",
  "skin": {
    "admin": {
      "shell": "sidebar",
      "frame": "layered"
    },
    "dashboard": {
      "summary": "cards",
      "density": "comfortable"
    }
  }
}
```

All four skin fields are explicit. Dash does not supply defaults for missing fields.

## Write CSS

Use `tokens.css` only for CSS custom properties:

```css
:root[data-theme="ops-dark"] {
  --color-bg: #0f172a;
  --color-surface: #111827;
  --color-text: #e5e7eb;
  --color-accent: #22c55e;
}

:root.dark[data-theme="ops-dark"] {
  --color-bg: #020617;
  --color-surface: #0f172a;
}
```

`recipes.css` uses the same selector range for recipe tokens:

```css
:root[data-theme="ops-dark"] {
  --recipe-panel-radius: 8px;
  --recipe-table-density: compact;
}
```

Do not add component selectors, normal CSS properties, at-rules, or external resource references.

## Prepare the Preview

`preview.png` is displayed in the admin console. Do not include node names, IP addresses, keys, or customer data in the image.

## Package

```bash
dash pack-theme -src ./my-theme -out ops-dark.zip
```

Without `-out`, the command writes `<theme-id>.zip`. It adds `.zip` when the supplied output name has another extension. The command validates the manifest, CSS, preview, and file list before writing the archive.

## Upload and Verify

1. Upload the package in the admin console.
2. Confirm validation succeeds.
3. Preview the theme.
4. Apply the theme.
5. Check navigation, tables, charts, and dark mode in the admin console and dashboard.

When validation fails, use the returned result to check the theme ID, required files, manifest fields, CSS syntax, and package size. If an active package becomes missing or damaged, Dash keeps the theme ID and falls back to the built-in default skin.

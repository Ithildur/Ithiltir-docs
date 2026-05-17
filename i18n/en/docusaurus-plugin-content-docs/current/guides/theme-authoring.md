---
slug: /Guides/ThemeAuthoring
title: Theme Authoring
---

# Theme Authoring

A theme package changes Dash UI tokens, density, shell layout, and dashboard summary styling.

## Package Files

```text
manifest.json
tokens.css
recipes.css
preview.png
```

Only these root-level files are accepted.

## Manifest

```json
{
  "id": "dark-modern",
  "name": "Dark Modern",
  "version": "1.0.0"
}
```

`id` uses lowercase letters, digits, `_`, and `-`. It must not collide with built-in theme IDs.

## Tokens

`tokens.css` defines CSS custom properties:

```css
:root {
  --ithiltir-color-bg: #0b0d12;
  --ithiltir-color-text: #f8fafc;
}
```

Allowed selectors are `:root`, `[data-theme="dark"]`, and `[data-theme="light"]`.

## Recipes

`recipes.css` can define additional custom properties consumed by supported Dash components. It follows the same selector and CSS restrictions as `tokens.css`.

## Preview

`preview.png` is optional. It is used in the theme management UI.

## Pack

Use Dash CLI:

```bash
dash pack-theme -src <theme-dir> -out <theme.zip>
```

The pack command validates file names, manifest fields, CSS restrictions, archive size, and duplicate entries.

## Upload and Apply

Upload in the admin console or through the system theme API. Applying a theme changes the active theme for Dash UI. Invalid packages are rejected and do not change the current active theme.

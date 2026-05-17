---
slug: /Config/Themes
title: Themes
---

# Themes

Dash supports built-in themes and custom theme packages. Themes affect the admin shell, dashboard summary layout, density, and CSS tokens.

## Theme Package

A theme package is a zip file containing allowed root-level files:

```text
manifest.json
tokens.css
recipes.css
preview.png
```

See [Theme Package](../reference/theme-package.md) for package format and validation rules.

## Upload

Theme packages can be uploaded from the admin console or through the system theme API. Invalid packages are rejected and do not change the active theme.

## Apply

Applying a theme updates the active theme setting. The browser loads the active CSS from:

```text
/theme/active.css
```

The active manifest is available at:

```text
/theme/active.json
```

The default theme can return `404` for `active.json`.

## Storage

Theme metadata and active theme setting are stored in PostgreSQL. Theme files are stored under Dash theme storage in `DASH_HOME`.

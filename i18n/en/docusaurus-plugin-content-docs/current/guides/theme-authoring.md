---
slug: /Guides/ThemeAuthoring
title: Theme Authoring
---

# 主题定制

主题系统用于改视觉 token 和布局 recipe，不用于注入脚本或改业务行为。

## 目录结构

最小主题：

```text
my-theme/
  theme.json
  tokens.css
```

完整主题：

```text
my-theme/
  theme.json
  tokens.css
  recipes.css
  preview.png
  README.md
```

允许的文件只有：

- `theme.json`
- `tokens.css`
- `recipes.css`
- `preview.png`
- `README.md`

## `theme.json`

示例：

```json
{
  "id": "ops-dark",
  "name": "Ops Dark",
  "version": "1.0.0",
  "description": "Dark operator theme",
  "skins": {
    "admin.shell": "sidebar",
    "admin.frame": "layered",
    "dashboard.summary": "cards",
    "dashboard.density": "comfortable"
  }
}
```

主题 ID：

```text
[a-z0-9][a-z0-9_-]{0,63}
```

限制：

- 不能使用 `default`。
- 不能占用内置主题 ID。
- `name` 应短而稳定。
- `version` 使用普通版本字符串。

## skins

支持的 skin：

| 区域 | 可选值 | 默认 |
| --- | --- | --- |
| `admin.shell` | `sidebar`、`topbar` | `sidebar` |
| `admin.frame` | `layered`、`flat` | `layered` |
| `dashboard.summary` | `cards`、`strip` | `cards` |
| `dashboard.density` | `comfortable`、`compact` | `comfortable` |

只配置要改变的项。未配置项使用默认值。

## `tokens.css`

只写 CSS 自定义属性：

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

允许的选择器：

- `:root`
- `:root[data-theme=...]`
- `:root.dark`
- `:root.dark[data-theme=...]`

只允许自定义属性；不支持组件选择器、全局标签选择器或嵌套规则。

## `recipes.css`

`recipes.css` 用于补充主题 recipe token。可以为空文件。

```css
:root[data-theme="ops-dark"] {
  --recipe-panel-radius: 8px;
  --recipe-table-density: compact;
}
```

同样只允许受限选择器和自定义属性。

## 禁止内容

CSS 中禁止：

- `url(`
- `expression(`
- `javascript:`
- `@import`
- `@layer`
- `@media`
- `<style`
- `</style`
- 嵌套块

主题包不能包含脚本，也不能包含额外路径。

## 预览图

`preview.png` 用于管理台预览。

建议：

- 使用 PNG。
- 文件体积保持小。
- 展示实际仪表盘或管理台视觉。
- 不放敏感节点名、IP、密钥或客户信息。

## 打包

使用 Dash CLI：

```bash
dash pack-theme -src ./my-theme -out ops-dark.zip
```

`-out` 省略时输出 `<theme-id>.zip`。扩展名不是 `.zip` 时会自动补 `.zip`。

限制：

- archive 最大 20 MiB。
- 解压后最大 50 MiB。
- 单个 entry 最大 20 MiB。

## 上传和应用

流程：

1. 在管理台上传主题包。
2. 查看校验结果。
3. 预览主题。
4. 应用主题。
5. 检查管理台和看板主要页面。

主题上传失败通常是：

- ID 非法。
- 缺少 `theme.json` 或 `tokens.css`。
- 包含不允许的文件。
- CSS 包含禁止 token。
- CSS 选择器不在允许范围内。
- 包体超过限制。

完整格式见 [主题包格式](../reference/theme-package.md)。

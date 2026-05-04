---
slug: /Config/Themes
---

# 主题

Dash 支持内置主题和自定义主题包。主题影响管理台外壳、看板摘要布局、密度和 CSS token。

## 主题目录

自定义主题保存在：

```text
$DASH_HOME/themes
```

发布包默认：

```text
/opt/Ithiltir-dash/themes
```

每个主题一个目录：

```text
themes/
  my-theme/
    theme.json
    tokens.css
    recipes.css
    preview.png
    README.md
```

## 主题包文件

允许文件：

- `theme.json`
- `tokens.css`
- `recipes.css`
- `preview.png`
- `README.md`

必填：

- `theme.json`
- `tokens.css`

`recipes.css` 省略时按空文件处理。

## `theme.json`

```json
{
  "id": "my-theme",
  "name": "My Theme",
  "version": "1.0.0",
  "author": "Team",
  "description": "Short description",
  "skin": {
    "admin": {
      "shell": "topbar",
      "frame": "flat"
    },
    "dashboard": {
      "summary": "strip",
      "density": "compact"
    }
  }
}
```

字段规则：

- `id` 必须匹配 `[a-z0-9][a-z0-9_-]{0,63}`。
- `default` 和内置主题 ID 是保留 ID。
- `name` 必填。
- `version` 必填。

## Skin 取值

| 字段 | 允许值 | 默认 |
| --- | --- | --- |
| `skin.admin.shell` | `sidebar`、`topbar` | `sidebar` |
| `skin.admin.frame` | `layered`、`flat` | `layered` |
| `skin.dashboard.summary` | `cards`、`strip` | `cards` |
| `skin.dashboard.density` | `comfortable`、`compact` | `comfortable` |

## CSS 限制

主题 CSS 只允许在这些 selector 中声明 CSS custom property：

- `:root`
- `:root[data-theme='<id>']`
- `:root[data-theme="<id>"]`
- `:root.dark`
- `:root.dark[data-theme='<id>']`
- `:root.dark[data-theme="<id>"]`

禁止：

- 嵌套 block。
- at-rules，例如 `@import`、`@media`、`@layer`。
- 非 custom property。
- `url(`、`expression(`、`javascript:`、`<style`、`</style` 等危险值。

`tokens.css` 必须至少定义一个 custom property。

## 打包

```bash
dash pack-theme -src ./my-theme -out my-theme.zip
```

上传：

```text
POST /api/admin/system/themes/upload
```

multipart 字段名：

```text
file
```

压缩包大小限制：

- archive 最大 20 MiB。
- 解压后最大 50 MiB。
- 单文件最大 20 MiB。

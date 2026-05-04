---
slug: /Reference/ThemePackage
---

# 主题包格式

主题包是 zip 文件。允许文件：

```text
theme.json
tokens.css
recipes.css
preview.png
README.md
```

必填：

- `theme.json`
- `tokens.css`

## 限制

| 项 | 限制 |
| --- | --- |
| archive | 最大 20 MiB |
| 解压总量 | 最大 50 MiB |
| 单文件 | 最大 20 MiB |
| 路径 | 只允许根目录下的允许文件 |
| 重复文件 | 不允许 |

## Manifest

```json
{
  "id": "operator-copy",
  "name": "Operator Copy",
  "version": "1.0.0",
  "author": "Team",
  "description": "Compact operator skin.",
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

`id` 必须匹配：

```text
[a-z0-9][a-z0-9_-]{0,63}
```

保留 ID：

- `default`
- 内置主题 ID

## CSS

`tokens.css` 和 `recipes.css` 都只能声明 CSS custom properties。

允许 selector：

```css
:root {
  --color-bg: #ffffff;
}

:root.dark {
  --color-bg: #111111;
}

:root[data-theme='operator-copy'] {
  --color-accent: #3b82f6;
}
```

禁止：

- `@import`
- `@media`
- `@layer`
- `url(`
- `expression(`
- `javascript:`
- `<style`
- `</style`
- 嵌套 block

## 打包命令

```bash
dash pack-theme -src ./operator-copy -out operator-copy.zip
```

输出包含固定时间戳，方便得到稳定 zip。

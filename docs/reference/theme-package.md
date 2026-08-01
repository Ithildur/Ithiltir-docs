---
slug: /Reference/ThemePackage
---

# 主题包格式

主题包是 ZIP。当前 `format_version=1` 已冻结并标记为 deprecated，仍保持兼容。

## 文件

```text
theme.json       # 必填
tokens.css       # 必填
recipes.css      # 可选
preview.png      # 可选
README.md        # 可选
```

只允许根目录下的普通文件。重复文件、额外路径和不支持的 entry 类型会被拒绝。

## 限制

| 项 | 限制 |
| --- | --- |
| archive | 20 MiB |
| 解压总量 | 50 MiB |
| 单文件 | 20 MiB |
| entry | 32 |
| `theme.json` | 有效 UTF-8，64 KiB |
| 单个 CSS 文件 | 有效 UTF-8，1 MiB |
| CSS 声明总数 | 1024 |
| custom property 名 | 128 字节 |
| custom property 值 | 4096 个 Unicode 字符 |
| `README.md` | 有效 UTF-8，256 KiB |
| `preview.png` | 完整有效 PNG，宽高 `1..4096` |

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

Manifest 只接受一个 JSON object，不允许未知字段。

| 字段 | 约束 |
| --- | --- |
| `id` | `[a-z0-9][a-z0-9_-]{0,63}`；不能是 `default` 或内置 ID |
| `name` | 必填，最多 128 个 Unicode 字符 |
| `version` | 必填，最多 64 个 Unicode 字符 |
| `author` | 最多 128 个 Unicode 字符 |
| `description` | 最多 2000 个 Unicode 字符 |

所有文本字段禁止控制字符。`skin.admin.shell`、`skin.admin.frame`、`skin.dashboard.summary` 和 `skin.dashboard.density` 必填；允许值见 [主题](../configuration/themes.md)。

## CSS

`tokens.css` 和 `recipes.css` 只允许受支持 selector 中的 CSS custom property。`tokens.css` 至少包含一条声明。

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

禁止 at-rule、嵌套 block、普通属性、`!important` 和可加载资源的函数。解析器会处理 CSS 字符串、转义、括号和函数 token。

## 打包命令

```bash
dash pack-theme -src ./operator-copy -out operator-copy.zip
```

输出使用固定时间戳，输入内容相同时可得到稳定 ZIP。

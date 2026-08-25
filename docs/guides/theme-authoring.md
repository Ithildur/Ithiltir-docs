---
slug: /Guides/ThemeAuthoring
---

# 主题开发

主题包用于调整已支持的布局 skin 和 CSS 自定义属性，不执行脚本或修改业务行为。格式 v1 已冻结并标记为 deprecated，现有主题仍可打包、上传和应用。

完整字段、选择器和包大小限制见 [主题配置](../configuration/themes.md) 和 [主题包格式](../reference/theme-package.md)。

## 建立目录

最小主题包含两个文件：

```text
my-theme/
  theme.json
  tokens.css
```

`recipes.css`、`preview.png` 和 `README.md` 按需添加。包内文件位于 ZIP 根目录。

## 写入 Manifest

`theme.json` 示例：

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

四个 skin 字段必须显式填写。Dash 不会为缺失字段补默认值。

## 写入 CSS

`tokens.css` 只声明 CSS 自定义属性：

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

`recipes.css` 使用相同的选择器范围，用于补充 recipe token：

```css
:root[data-theme="ops-dark"] {
  --recipe-panel-radius: 8px;
  --recipe-table-density: compact;
}
```

不在主题包中写组件选择器、普通 CSS 属性、at-rule 或外部资源引用。

## 准备预览图

`preview.png` 用于管理台预览。预览内容不得包含节点名、IP、密钥或客户信息。

## 打包

```bash
dash pack-theme -src ./my-theme -out ops-dark.zip
```

`-out` 省略时输出 `<theme-id>.zip`。扩展名不是 `.zip` 时自动补 `.zip`。命令在写入压缩包前校验 Manifest、CSS、预览图和文件列表。

## 上传和验证

1. 在管理台上传主题包。
2. 确认校验通过。
3. 预览主题。
4. 应用主题。
5. 检查管理台和看板的导航、表格、图表及深色模式。

校验失败时，根据返回结果检查主题 ID、必需文件、Manifest 字段、CSS 语法和包大小。运行时缺少当前主题包或主题包损坏时，Dash 保留主题 ID，并回退到内置默认 skin。

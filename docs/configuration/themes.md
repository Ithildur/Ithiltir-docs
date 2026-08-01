---
slug: /Config/Themes
---

# 主题

Dash 支持内置主题和格式 v1 的自定义主题包。主题只控制受支持的布局 skin 和 CSS custom property，不执行脚本或加载外部资源。

## 主题目录

```text
$DASH_HOME/themes
```

发布包默认路径是 `/opt/Ithiltir-dash/themes`。每个主题一个目录：

```text
themes/
  my-theme/
    theme.json
    tokens.css
    recipes.css
    preview.png
    README.md
```

## 格式状态

格式 v1 已冻结并标记为 deprecated，但没有移除日期。现有 v1 包仍可上传、应用和运行。v1 不再增加文件类型、CSS 语法或 skin 能力；新能力需要后续格式。

## 主题包文件

允许文件：

- `theme.json`
- `tokens.css`
- `recipes.css`
- `preview.png`
- `README.md`

`theme.json` 和 `tokens.css` 必填。`recipes.css` 省略时按空文件处理。ZIP 只允许根目录下的这些普通文件，不允许目录、重复文件或其他路径。

## Manifest

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

规则：

- 文件必须是有效 UTF-8、最多 64 KiB，且只包含一个 JSON object；
- 未知字段会被拒绝；
- `id` 匹配 `[a-z0-9][a-z0-9_-]{0,63}`；
- `default` 和内置主题 ID 是保留值；
- `name` 必填，最多 128 个 Unicode 字符；
- `version` 必填，最多 64 个 Unicode 字符；
- `author` 最多 128 个 Unicode 字符；
- `description` 最多 2000 个 Unicode 字符；
- 文本字段不得包含控制字符。

四个 skin 字段全部必填：

| 字段 | 允许值 |
| --- | --- |
| `skin.admin.shell` | `sidebar`、`topbar` |
| `skin.admin.frame` | `layered`、`flat` |
| `skin.dashboard.summary` | `cards`、`strip` |
| `skin.dashboard.density` | `comfortable`、`compact` |

省略字段不会补默认值。

## CSS 限制

`tokens.css` 和 `recipes.css` 必须是有效 UTF-8，每个文件最大 1 MiB。两者合计最多 1024 条声明。

只允许在以下 selector 中声明 CSS custom property：

- `:root`
- `:root[data-theme='<id>']`
- `:root[data-theme="<id>"]`
- `:root.dark`
- `:root.dark[data-theme='<id>']`
- `:root.dark[data-theme="<id>"]`

`tokens.css` 至少包含一个 custom property。属性名必须匹配受支持格式且不超过 128 字节，值最多 4096 个 Unicode 字符。

不支持：

- at-rule 或嵌套 block；
- 普通 CSS 属性；
- `!important`；
- `url()`、`image-set()`、`-webkit-image-set()`、`src()`、`expression()` 等可加载资源的函数；
- 非法/未闭合字符串、括号或方括号；
- 禁止的控制字符。

校验会解析 CSS 转义和函数 token，转义函数名不能绕过限制。禁用单词出现在引号文本中不触发拒绝。

## 其他文件

- `preview.png` 必须是可完整解码的 PNG，宽高分别在 `1..4096` 像素。
- `README.md` 必须是有效 UTF-8，最大 256 KiB。

## ZIP 限制

| 项 | 限制 |
| --- | --- |
| archive | 最大 20 MiB |
| 解压总量 | 最大 50 MiB |
| 单文件 | 最大 20 MiB |
| entry 数量 | 最多 32 |
| multipart 请求 | 最大 21 MiB |

上传路由的读取和响应窗口最长 5 分钟。

## 打包和上传

```bash
dash pack-theme -src ./my-theme -out my-theme.zip
```

上传接口：

```text
POST /api/admin/system/themes/upload
```

multipart 字段名是 `file`。上传会在临时目录完成全部校验，再原子替换同 ID 的现有主题。替换失败时恢复旧目录；旧备份清理失败会以 warning 返回，不撤销已经成功的替换。

## 缺失和损坏

当前主题 ID 保存在 PostgreSQL。对应包缺失或无法通过当前校验时，Dash 保留该 ID，并把列表项标为 `missing` 或 `broken`；运行时使用前端内置默认 skin。

主题管理仍可重新上传相同 ID 或选择其他主题。主题根目录或数据库本身不可访问时属于运行错误，不使用该降级路径。

根路径 `/theme-bootstrap.js` 使用 `Cache-Control: no-store`，确保浏览器在 Dash 版本切换后读取当前主题启动资源。

---
slug: /Config
---

# 配置总览

Ithiltir 的配置按职责分为三层。先确认配置属于哪一层，再修改对应入口。

| 层级 | 存储位置 | 修改方式 | 适用内容 |
| --- | --- | --- | --- |
| Dash 启动配置 | YAML 文件、环境变量 | 编辑配置并重启 Dash | 监听地址、公开 URL、数据库、Redis、JWT、日志、反向代理信任 |
| Dash 运行时设置 | PostgreSQL | 管理台或管理 API | 访问控制、流量模式、告警、通知、主题、节点分组 |
| 节点本地配置 | `report.yaml`、命令行参数 | 节点安装脚本或 Node CLI | Push target、secret、本机采集参数 |

## Dash 启动配置

启动配置决定进程边界：

- 监听地址。
- 公开 URL。
- 数据库。
- Redis。
- JWT 签名密钥。
- 日志。
- 时区和语言。
- 可信反向代理。

见 [Dash 配置](./dash.md) 和 [环境变量](./environment.md)。

修改启动配置后需要重启 Dash。修改 `app.public_url` 后，管理台生成的新节点安装命令会使用新地址；已安装节点的 `report.yaml` 不会自动改写。

## 运行时设置

运行时设置通过管理台或 API 修改：

- 系统品牌和游客访问范围。
- 流量统计模式、账期、方向。
- 节点账期覆盖、P95 开关、标签、分组。
- 告警规则、挂载和通知渠道。
- 主题上传和应用。

见：

- [访问控制](./access.md)
- [流量统计和账期](./traffic.md)
- [告警规则](./alerts.md)
- [通知渠道](./notifications.md)
- [主题](./themes.md)
- [高级配置路线](../guides/advanced-configuration.md)

## 节点配置

节点 Push target 保存在 `report.yaml`：

```yaml
version: 1
targets:
  - id: 1
    url: https://dash.example.com/api/node/metrics
    key: node-secret
    server_install_id: dashboard-install-id
```

见 [Node CLI](../reference/node-cli.md) 和 [节点上报协议](../reference/node-protocol.md)。

---
slug: /Architect
---

# 系统架构

Ithiltir Dash 是单实例应用。根入口只启动一个 HTTP 进程，该进程装配 API、SPA、主题资源、安装脚本、节点资产分发和后台服务。

## 运行边界

| 组件 | 责任 |
| --- | --- |
| `cmd/dash` | 进程入口、配置加载、依赖装配、迁移入口和关闭流程 |
| HTTP 服务 | 挂载 `/api`、`/theme`、`/deploy` 和 SPA |
| PostgreSQL + TimescaleDB | 持久化指标历史、流量事实、节点元数据、告警规则、告警通知 outbox 和系统设置 |
| Redis | 默认保存会话、热点快照和告警运行时状态 |
| 进程内内存 | 节点鉴权索引、易失 Agent 更新请求、流量重建状态；`--no-redis` 时承接会话和热点运行时状态 |
| Ithiltir-node | 上报指标和静态主机信息；Windows runner 启动时接收更新 manifest |
| Linux SMART 缓存 timer | root 侧 `smartctl` helper 写入 `/run/ithiltir-node/smart.json`；Ithiltir-node 只读缓存 |
| Web UI | 读取看板数据并提交管理操作 |

## HTTP 面

| 前缀 | 作用 |
| --- | --- |
| `/api/auth` | 登录、续期、登出、会话撤销 |
| `/api/version` | Dash 版本和打包携带的节点版本 |
| `/api/front` | 看板读取 |
| `/api/metrics` | 历史指标和在线率查询 |
| `/api/statistics` | 统计访问策略和流量统计查询 |
| `/api/node` | 节点上报和节点身份读取 |
| `/api/admin` | 管理台写操作 |
| `/theme` | 当前主题 CSS、主题 manifest 和预览图 |
| `/deploy` | 安装脚本和节点发布资产 |
| `/` | SPA |

## 数据流

1. Ithiltir-node 通过 `/api/node/*` 上报指标和静态主机信息。
2. 指标上报成功响应可以包含更新 manifest。
3. PostgreSQL + TimescaleDB 保存持久化历史、流量事实、配置和告警通知 outbox。
4. Redis 或进程内内存保存热点快照、会话和告警运行时状态。
5. 后台服务评估告警、发送队列通知并汇总流量数据。

节点 IP 是已鉴权 Agent 请求的观察值：有 `X-Forwarded-For` 时 Dash 取其第一个 IP，否则回退到 `RemoteAddr`；不可解析的值不会被使用。该字段用于展示和运维，不作为鉴权边界。

## 状态和保留策略

- 默认启动依赖 PostgreSQL 和 Redis。
- `--no-redis` 会把 Redis 承载的运行时状态改用进程内内存。
- `app.timezone` 在启动时编译。空值使用本地时区；非空值必须是有效 IANA 时区名，否则配置加载失败，错误中会包含配置值。
- 节点鉴权和待下发 Agent 更新请求使用进程内内存，不走 Redis。
- SMART 和 thermal 指标属于运行时状态。SMART 缓存新鲜度、helper 可用性和设备健康结果保存在独立热点缓存，不写入 PostgreSQL 指标快照。确认是物理盘的 SMART 温度会归约写入 `disk_physical_metrics.temp_c`，用于按设备查询历史；虚拟盘和 RAID 设备会被忽略。同一套后端判定会生成 `disk.temperature_devices`，供前端进入硬盘温度历史。thermal 随指标快照保存，并归约写入 `cpu_temp_c`，同时在前台缓存中拆成独立字段缓存；读取前台节点视图时再组合进 JSON。
- 告警评估读取热点快照。内置离线、RAID、SMART 健康失败和 NVMe 关键告警规则来自快照新鲜度和上报磁盘状态。
- 告警服务启动后 1 分钟内不会新开告警事件。
- 告警事件和运行时状态提交不依赖通知发送。可加载通知目标时，通知 payload 存入 PostgreSQL outbox，并由带租约的重试 worker 发送；通知目标不可用时，状态变更仍会提交，但不会新增通知 outbox。
- 数据库历史保留默认 `45 days`；普通监控用 `database.retention_days`，流量 5 分钟事实表用 `database.traffic_retention_days`。流量保留窗口同时约束自动清理和手工重建范围：`traffic_5m` 保持可写并通过滚动保留删除，历史 95 计费值保存在月度快照中。
- 流量 `lite` 模式根据近期原始网卡采样保存月度入/出总量和估算峰值，累计时按节点有效账期切分；`billing` 模式在同一条后台链路中维护当前 5 分钟事实，只 upsert 能由近期原始采样推导出的事实桶。
- 历史 5 分钟事实可通过管理端单个进程内任务按节点重建。该任务按 `database.traffic_retention_days` 裁剪，只重写 5 分钟事实，并在启动时让该节点保留窗口内重叠周期的月度快照失效。日汇总、P95、覆盖率和 billing 月度快照仍由 5 分钟流量事实派生，不会在重建启动时同步重写；同一进程内，自动物化、月度快照持久化和手工 5 分钟重建串行执行。
- 全局账期和统计方向配置是默认值；节点可覆盖账期模式、月度起始日、账期锚点、账期时区和统计方向。流量查询使用节点有效账期和统计方向；月度用量回填和月度快照使用有效账期，并保留原始入/出值供读取时选择方向。
- 流量方向模式只改变选中的计费视图；原始入站和出站计数仍分开保存。
- 历史指标默认不对游客公开。`history_guest_access_mode=by_node` 时，只对游客可见节点开放。
- 流量统计是否对游客公开由流量设置控制，并仍受节点可见性限制。

## 鉴权边界

| 区域 | 鉴权 |
| --- | --- |
| `/api/auth/login` | 管理员密码 |
| `/api/auth/refresh`、`/api/auth/logout` | refresh cookie + `X-CSRF-Token` |
| `/api/front/*`、`/api/metrics/*`、`/api/statistics/*` | Bearer 可选；匿名请求按系统可见性设置过滤 |
| `/api/node/*` | `X-Node-Secret` |
| `/api/admin/*` | `Authorization: Bearer <access_token>` |

## 前端和反向代理

默认部署边界是同源路径。生产反向代理应把 `/api`、`/theme`、`/deploy` 转给 Dash 后端，`/` 保持为 Dash SPA。跨域后端地址需要同时配置 CORS、cookie 和 CSRF 策略。`app.public_url` 必须是根路径 URL，不支持 `/dash` 这类路径前缀。

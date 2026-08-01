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
| Redis | 默认保存管理员会话和可丢弃的前台缓存 |
| 进程内内存 | 节点鉴权索引、告警 pending/cooldown、MTProto 登录握手、易失 Node 更新请求和流量重建状态；`--no-redis` 时还承接会话和前台缓存 |
| Ithiltir-node | 上报指标和静态主机信息；Windows runner 启动时接收更新 manifest |
| Dash 更新器 | 原生 `dash update` 执行格式 v1 发布包事务；任务、日志和恢复状态写入 `$DASH_HOME/runtime/dash-update` |
| Linux SMART 缓存 timer | root 侧 `smartctl` helper 写入 `/run/ithiltir-node/smart.json`；Ithiltir-node 只读缓存 |
| Linux 连接数缓存 timer | systemd 下 root 侧 `/proc` netns helper 每秒写入 `/run/ithiltir-node/connections.json`；低权限 Node 读取缓存 |
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
4. PostgreSQL 更新历史数据和当前投影；Redis 或进程内内存保存前台缓存和会话。
5. 最新上报快照进入进程内告警脏队列；开放事件和通知 outbox 提交到 PostgreSQL。
6. 后台服务评估告警、发送队列通知并汇总流量数据。

节点 IP 是已鉴权 Node 请求的观察值：有 `X-Forwarded-For` 时 Dash 取其第一个 IP，否则回退到 `RemoteAddr`；不可解析的值不会被使用。该字段用于展示和运维，不作为鉴权边界。

## 状态和保留策略

- 默认启动依赖 PostgreSQL、匹配主版本的 TimescaleDB 和 Redis `6.2.0+`。Dash 使用 `PING` 和 `INFO server` 校验实际 Redis 端点；推荐 Redis `8.2.3+`。
- `--no-redis` 会把 Redis 承载的会话和前台缓存改用进程内内存，并跳过 Redis 配置和版本校验。
- `app.timezone` 在启动时编译。空值使用本地时区；非空值必须是有效 IANA 时区名，否则配置加载失败，错误中会包含配置值。
- 管理台更新控制器要求 Linux/systemd；手工 `dash update` 也支持显式 `--service-manager=none`。任务和事务写入 `$DASH_HOME/runtime/dash-update`，不写入 PostgreSQL。
- 节点鉴权、待下发 Node 更新请求、告警 pending/cooldown、MTProto 登录握手和流量重建任务使用进程内内存，不走 Redis。
- 开放告警事件会从 PostgreSQL 恢复；pending 和 cooldown 在重启后重置。
- 流量 Usage/Facts 物化进度保存在 PostgreSQL；手工重建任务状态不持久化。
- SMART、thermal 和完整 RAID 详情属于运行时状态。SMART 缓存新鲜度、helper 可用性、设备健康结果、完整 thermal 传感器 payload 以及完整 RAID 阵列/成员 payload 保存在当前快照或热点缓存，不写入 PostgreSQL 历史指标行。确认是物理盘的 SMART 温度会归约写入 `disk_physical_metrics.temp_c`，用于按设备查询历史；虚拟盘和 RAID 设备会被忽略。同一套后端判定会生成 `disk.temperature_devices`，供前端进入硬盘温度历史。thermal 会归约写入 `cpu_temp_c` 作为主机历史；完整 thermal 详情拆成独立前台字段缓存，读取前台节点视图时再组合进 JSON。
- TCP/UDP 连接数是持久化数值指标。systemd 下完整主机/netns 连接数来自 root 侧每秒缓存；OpenRC、缓存缺失或 helper 无法编译时，Node 使用自带统计，可能缺失容器连接数据。
- Linux PSI pressure 指标是固定数值时序数据。PSI 的 `avg10`、`avg60`、`avg300` 和 `total` 会作为可空列保存到 `server_metrics` 和 `server_current_metrics`；缺失列表示不可用，不表示 0 压力。Dashboard 持久化会忽略采集原因/状态字符串。PSI 当前不接入告警评估。
- 告警评估读取进程内最新上报快照或 PostgreSQL 当前投影，不读取前台 Redis 缓存。内置离线、RAID、SMART 健康失败和 NVMe 关键告警规则来自快照新鲜度和上报磁盘状态。
- 告警服务启动后 1 分钟内不会新开告警事件。
- 告警通知写入 PostgreSQL outbox，并由单进程 worker 投递，不使用运行时租约。首次加载通知目标失败且没有 last-good 快照时，状态转换延后重试；已有 last-good 快照时继续按该快照提交事件和 outbox。远端发送失败不回滚告警事件。
- 数据库历史保留默认 `45 days`；普通监控用 `database.retention_days`，流量 5 分钟事实表用 `database.traffic_retention_days`。流量保留窗口同时约束自动清理和手工重建范围：`traffic_5m` 保持可写并通过滚动保留删除，历史 95 计费值保存在月度快照中。
- Usage 和 Facts 使用独立的 PostgreSQL 进度。Usage 在 Lite 与 Billing 中维护月度累计；Facts 只在 Billing 中维护 5 分钟事实。从 Lite 切换到 Billing 时，Facts 从最近 30 分钟开始，更早数据只能在原始指标仍保留时按节点重建。
- 历史 5 分钟事实由单个进程内任务按节点、每 6 小时分块重建。任务只在 Billing 模式运行；切换到 Lite 后完成当前分块并停止。重建状态不跨 Dash 重启。
- 账期由每个节点显式持有。全局设置只提供统计方向默认值；节点 `traffic_direction_mode=default` 时继承该方向。账期变更会局部失效并修复该节点的月度派生数据，不阻塞其他节点。
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
| `/deploy/*` 打包资产 | `X-Node-Secret` 或旧 Node 升级临时 token；安装脚本模板仍公开 |

## 前端和反向代理

默认部署边界是同源路径。生产反向代理应把 `/api`、`/theme`、`/deploy` 转给 Dash 后端，`/` 保持为 Dash SPA。跨域后端地址需要同时配置 CORS、cookie 和 CSRF 策略。`app.public_url` 必须是根路径 URL，不支持 `/dash` 这类路径前缀。

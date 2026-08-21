---
slug: /ReleaseNotes
---

# Release Notes

Release Notes 记录影响部署、升级、配置、API 和运行行为的版本变化。

## Dash

### 0.3.0

发布日期：2026-08-01

GitHub Release：[Ithiltir 0.3.0](https://github.com/Ithildur/Ithiltir/releases/tag/0.3.0)

#### 升级和运行状态

- Linux 更新逻辑移入原生 `dash update` 子命令。更新任务、阶段、日志和恢复状态会持久化到 `$DASH_HOME/runtime/dash-update`；`update_dash_linux.sh` 仅保留为兼容入口。
- 受管安装改为不可变的 `releases/<version>` 目录和原子 `current` 软链接。更新器在停止服务前校验 release manifest、Dash/Node 版本和七个内置 Node/runner 资产的 SHA-256。
- 更新事务在数据库迁移前失败时恢复旧 release。迁移开始后只允许使用候选版本向前恢复，不支持把旧二进制重新启动到已经前移的数据库 schema 上。
- Dash 启动要求数据库 `goose_db_version` 与当前二进制完全一致。`dash migrate` 只推进较旧 schema，并拒绝较新 schema。
- 告警开放事件、通知 outbox、流量物化进度、节点当前投影和流量月度累计由 PostgreSQL 持久化。告警 pending/cooldown、MTProto 登录握手、节点更新请求和流量重建任务仍是进程内状态。

#### 配置和安全边界

- YAML 现在拒绝未知字段、多文档输入和显式非法时长。环境变量只要存在就覆盖 YAML；空整数变量表示 `0`，非空非法整数会停止启动。
- `monitor_dash_pwd` 至少需要 8 个可见 ASCII 字符且不得包含空白。`auth.jwt_signing_key` 至少需要 32 字节且不得包含首尾空白。
- `app.public_url` 的主机只接受 IP 字面量或 ASCII DNS 名称；国际化域名必须使用 IDNA/punycode，端口范围为 `1..65535`。
- Redis 运行时最低版本为 `6.2.0`，推荐 `8.2.3+`。Dash 会对实际端点执行 `PING` 和 `INFO server`；`--no-redis` 跳过 Redis 配置、连接和版本校验。
- API 响应统一增加 CSP、Permissions Policy、Referrer Policy、`nosniff` 和禁止 framing 的安全头。Refresh cookie 使用 `SameSite=Strict`。
- 超过路由限制的 JSON body 返回 `413 body_too_large`，不再返回 `400 invalid_request`。

#### 通知和告警

- `dash migrate` 使用 AES-256-GCM 加密完整通知渠道配置，并创建 `$DASH_HOME/configs/notify-config.key`。数据库备份和该密钥必须分开保存；缺少匹配密钥时 Dash 拒绝启动。
- 通知渠道改为严格 schema。非法存量渠道仍会出现在管理台中，但配置返回 `null`，只能删除后重建。
- 通知 outbox 新增 `paused`、`blocked` 和 `discarded` 语义，以及 `unknown`、`healthy`、`degraded`、`disabled` 四种渠道投递状态。停用渠道暂停积压；兼容配置保存或重新启用会唤醒积压并重置重试预算。
- Webhook、Telegram 和 SMTP 请求增加字段大小、邮件地址、URL 和重定向限制。通知 HTTP 请求最多跟随五次同主机安全重定向，POST 只接受保留方法和 body 的 `307`/`308`。
- SMART 告警通知会列出受影响设备、ATA 失败属性、NVMe critical warning 和可用的 `media_errors`。Node 提供的标签会移除控制字符并限制长度和条目数。
- 规则名、持续时间、冷却时间、有限数值阈值及偏移量现在在写入边界校验。存量非法规则会关闭仍开放的事件并使用 `rule_invalid` 原因。

#### 流量和节点契约

- 账期改为每个节点显式持有。升级会把原来继承全局账期的节点固化为迁移前的有效账期；新节点默认使用从 1 号开始的自然月。
- 全局流量设置不再接受账期字段。旧输入 `traffic_cycle_mode=default` 仅作为兼容别名，写入时规范化为显式自然月。
- 流量物化拆分为独立的 Usage 和 Facts 进度。Lite 切换为 Billing 时从最近 30 分钟开始恢复 Facts；更早且仍在原始指标保留期内的数据需要按节点手工重建。
- 节点流量重建只在 Billing 模式可用。运行中切换到 Lite 时，当前分块完成后停止。
- 流量响应删除废弃字段 `partial`。`GET /api/statistics/traffic/monthly` 的 `months` 只接受 `1..24`。
- 节点名、secret、标签、分组名和备注增加明确长度及控制字符限制。节点上报的整数范围、比率、速率和写入定长列的文本会在数据库写入前校验，非法 payload 返回稳定的 `400` 或 `422`。

#### 安装、发布和界面

- `install_dash_linux.sh` 只支持首次安装。非 systemd 主机必须显式使用 `--service-manager=none`；后续版本变更统一使用 `dash update`。
- Linux Node 安装器支持 systemd、Alpine/OpenRC 和显式 `none`。安装器先暂存并执行候选二进制，再停止已有进程和切换 release；重新执行安装脚本是强制重装，不承担 Node 自更新的回滚职责。
- Linux、macOS 和 Windows Node 安装器在携带 `X-Node-Secret` 下载时最多跟随五次同主机安全重定向，拒绝 HTTPS 降级和跨主机跳转。
- 发布包只携带 `configs/config.example.yaml`，不会打包本地配置。格式 v1 的 `release.env` 记录 Dash/Node 版本、目标平台和全部内置 Node/runner 资产摘要。
- 浏览器在页面可见时检查本机 `/api/version`；Dash 版本变化后会重新加载页面，避免继续使用旧前端资源。远端 Release 查询失败不会阻止加载本机已安装版本。
- 管理台补齐跳到主内容、键盘选择、焦点约束/恢复、对话框语义、加载状态、tooltip 描述和 reduced-motion 行为。
- 看板汇总中的“告警”改名为“异常项”。该数值统计离线、RAID、CPU 和磁盘异常条件，不是已配置告警事件数。

从 `0.2.7` 升级前应先阅读 [升级](./installation/upgrade.md)。

### 0.2.7

发布日期：2026-07-01

GitHub Release：[Ithiltir 0.2.7](https://github.com/Ithildur/Ithiltir/releases/tag/0.2.7)

#### 变更

- 管理台新增 Dash 自更新页，可检查 release/prerelease 通道、查看当前版本、打包 Node 版本、最新版本、任务状态和最近日志。
- Dash 自更新支持手动更新、重新安装、仅通知和自动更新模式。自动更新通过 systemd transient unit 执行包内 `update_dash_linux.sh`，状态保存在 `DASH_HOME/runtime/dash-update`。
- 告警管理新增告警记录页，支持按节点、状态、指标和时间范围筛选，并支持分页加载。
- 节点列表新增未恢复告警入口，显示当前未恢复告警摘要并跳转到对应节点的告警记录。
- 告警通知渠道新增搜索和状态整理，Dash 自动更新通知复用已启用的全局通知渠道。
- 系统设置新增 `dash_update_channel` 和 `dash_update_mode` 运行时配置。

#### 修复

- Dash 更新完成后，管理台会重新同步 `/api/version` 和更新检查结果，避免“当前安装版本”和“最新版本”标签停留在旧状态。
- Dash 自更新边界更严格：缺少 systemd、git、tar、curl/wget 或 `update_dash_linux.sh` 时返回明确不可用原因。
- 系统设置 PATCH/PUT 明确区分局部更新和全量替换，避免保存时丢失新增字段。
- 告警记录筛选的自定义时间范围校验更严格，避免无效范围发起查询。
- 节点自动更新最低版本调整为 `0.2.3`，低版本节点需要重新执行安装命令或手工替换二进制。

#### 兼容性

- Dash 自更新仅支持 Linux/systemd 包安装布局。非 systemd 环境会显示更新器不可用。
- `PUT /api/admin/system/settings` 是全量替换，必须提交 `history_guest_access_mode`、`dash_update_channel`、`dash_update_mode`、`logo_url`、`page_title` 和 `topbar_text`。局部更新应使用 `PATCH`。
- `prerelease` 通道只检查 prerelease tag，不回退到普通 release。
- 节点列表的未恢复告警摘要是进入节点页时加载的快照，不是实时轮询。

### 0.2.6

发布日期：2026-06-17

GitHub Release：[Ithiltir 0.2.6](https://github.com/Ithildur/Ithiltir/releases/tag/0.2.6)

#### 变更

- Dash 更新脚本新增 `reinstall` 命令。已安装版本与目标版本相同时，也可以重新安装当前通道的最新发布包。
- 打包携带的 `/deploy/*` Node 二进制和 runner 资产改为受保护下载。正常请求需要 `X-Node-Secret`；旧 Node 自动升级使用 Dash 生成的短期 `upgrade_token`。
- Node 自动升级处理支持 SemVer build metadata。同一 SemVer 优先级但 build metadata 不同的 Node 二进制仍可下发。
- Linux Node 安装脚本支持中文和英文输出。
- Linux Node 安装脚本在存在 `cc`、`gcc` 或 `clang` 时编译 root 侧连接数缓存 helper，用于统计主机和容器网络命名空间中的 TCP/UDP 连接数。
- 运行时指标和历史指标的存储边界调整。TCP/UDP 连接数继续作为历史数值指标保存；SMART、温度和完整运行时明细保留在当前快照或前端缓存中。

#### 修复

- 旧 Node 自动升级下载不发送 `X-Node-Secret` 时，Dash 返回带临时授权的下载 URL。
- 更新 Node secret 时，如果新 secret 已属于其他节点，Dash 返回 `409 duplicate_secret`。
- 前端缓存重建不再依赖发起请求的取消状态。
- Dash 优雅关闭失败后会关闭底层 server。

#### 兼容性

- Dash 管理台自动下发 Node 更新的最低 Node 版本仍为 `0.2.1`。
- `/deploy/*` 中的安装脚本模板仍可公开读取；打包携带的 Node 二进制和 runner 资产需要鉴权。
- 生产升级仍应先备份数据库。发布包更新脚本会执行迁移；手工替换二进制后必须手工执行迁移。

## Node

### 0.2.4

发布日期：2026-08-21

GitHub Release：[Ithiltir-node 0.2.4](https://github.com/Ithildur/Ithiltir-node/releases/tag/0.2.4)

#### 变更

- 磁盘 SMART 上报新增可选 `media_errors` 字段，用于携带 NVMe SMART 的媒体和数据完整性错误累计值。

#### 兼容性

- `smartctl` 未提供该值时，Node 会省略 `media_errors`。该字段是向后兼容的 JSON 扩展，现有接收端可以继续忽略未知字段。

### 0.2.3

发布日期：2026-06-17

GitHub Release：[Ithiltir-node 0.2.3](https://github.com/Ithildur/Ithiltir-node/releases/tag/0.2.3)

#### 变更

- Node 下载 update manifest 中的资产时，会发送当前 target key 作为 `X-Node-Secret`。
- Linux 和 macOS 托管安装布局完成暂存更新后，会切换 `/var/lib/ithiltir-node/current` 并以原参数和环境执行更新后的 Node。
- Windows 托管安装完成暂存更新后，由 runner 替换二进制并重启 Node。
- 不支持自更新的安装布局会报告 `self update disabled`，并继续执行上报循环。
- Linux 连接数缓存缺失、过期或不可用时，Node 保留内置连接数统计作为回退路径。

#### 修复

- 修复暂存更新后未正确重启或未执行新二进制的问题。
- 修复受保护下载资产的认证处理。
- 修复连接数缓存不可用时可能丢失回退统计的问题。

#### 兼容性

- Windows 自更新要求 runner 托管。
- Linux 和 macOS 自更新要求 `/var/lib/ithiltir-node/releases/<version>` 和 `/var/lib/ithiltir-node/current` 安装布局。
- 安装布局外直接运行的二进制不会应用 update manifest。需要重新执行安装命令或手工替换二进制。

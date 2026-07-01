---
slug: /ReleaseNotes
---

# Release Notes

Release Notes 记录普通发布中影响部署、升级、配置、API 和运行行为的变化。

预发布版本不单独记录。预发布阶段的变化合并到对应的普通发布版本。

## Dash

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

- 预发布版本不作为独立 Release Notes 记录。
- Dash 管理台自动下发 Node 更新的最低 Node 版本仍为 `0.2.1`。
- `/deploy/*` 中的安装脚本模板仍可公开读取；打包携带的 Node 二进制和 runner 资产需要鉴权。
- 生产升级仍应先备份数据库。发布包更新脚本会执行迁移；手工替换二进制后必须手工执行迁移。

## Node

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

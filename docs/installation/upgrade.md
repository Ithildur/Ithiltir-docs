---
slug: /Install/Upgrade
---

# 升级

Ithiltir 有两类升级：Dash 升级和 Node 升级。Dash 数据库迁移只支持前向演进。

## 从 0.2.7 升级

升级前确认：

- `monitor_dash_pwd` 至少包含 8 个可见 ASCII 字符，且不含空白。
- `auth.jwt_signing_key` 至少为 32 字节，且不含首尾空白。
- `app.public_url` 使用 IP 字面量或 ASCII DNS 名称；国际化域名使用 IDNA/punycode。
- YAML 不含未知字段或显式非法时长。
- 数据库和 Redis 连接池数值符合当前约束。
- Redis 实际服务端为 `6.2.0+`，并允许配置账号执行 `PING` 和 `INFO server`。
- PostgreSQL 与 TimescaleDB 使用相同 PostgreSQL 主版本。

升级前至少备份 PostgreSQL、`configs/config.local.yaml`、`themes` 和 `install_id`。迁移成功后还必须备份新生成的 `configs/notify-config.key`。该密钥必须与 PostgreSQL 分开保存。

迁移期间会临时解压保留期内的磁盘指标时间分块，并重建连续聚合。数据库必须预留额外的临时空间。迁移完成后会恢复压缩策略，符合条件的时间分块随后重新压缩。

更新器按以下顺序执行升级：

1. 停止 Dash。
2. 串行执行数据库迁移。
3. 启动新版本。

迁移会依次回填最近 16 天的 15 分钟聚合和最近 31 天的 1 小时聚合。执行时间取决于现有数据量。

已有原始数据分块不会重新切分。1 小时时间分块仅用于迁移后写入的数据。新的原始数据保留策略只在回填成功后启用。

迁移会暂停相关 TimescaleDB 后台任务，并等待正在运行的任务结束。无需手工暂停 TimescaleDB，但不得同时运行其他数据库迁移命令。

从旧平铺安装布局发起第一次升级时，使用当前安装中的兼容脚本：

```bash
sudo bash /opt/Ithiltir-dash/update_dash_linux.sh --check
sudo bash /opt/Ithiltir-dash/update_dash_linux.sh -y --lang zh
```

第一次升级完成后，安装目录会迁移到 `releases/<version>` + `current` 布局。后续使用原生更新命令。

## Dash 更新命令

```bash
/opt/Ithiltir-dash/bin/dash update --check
sudo /opt/Ithiltir-dash/bin/dash update --yes --lang zh
```

预发布通道和重新安装：

```bash
/opt/Ithiltir-dash/bin/dash update --check --test
sudo /opt/Ithiltir-dash/bin/dash update --yes --test --lang zh
sudo /opt/Ithiltir-dash/bin/dash update reinstall --yes --test --lang zh
```

`--test` 只选择最新 prerelease。默认只选择最新 release。当前 prerelease 高于最新 release 时，默认 release 更新会停止，调用方应明确选择 `--test`。

`reinstall` 允许在版本号相同时重新应用所选通道的最新包，不允许用较旧目标覆盖当前版本。

`update_dash_linux.sh` 继续接受旧参数，但不再实现更新事务，只把参数转交给 `dash update`。

## 管理台更新

管理台“系统 / Dash 更新”支持 `release` 和 `prerelease` 通道：

- `manual`：只在页面内手工检查和更新。
- `notify`：每 6 小时检查一次，有可用更新时通过已启用渠道发送通知。
- `auto`：每 6 小时检查一次并自动更新，任务进入终态后发送结果通知。

管理台控制器要求 Linux/systemd 和 `systemd-run`。它会把不可变执行计划持久化后，通过 transient unit 启动包内 `dash update execute`。手工 `dash update` 可以在显式 `--service-manager=none` 模式下运行。

## 事务和恢复

更新器会：

1. 解析目标 release，并固定目标版本、当前版本和安装修订号。
2. 下载并检查归档边界：单一根目录、仅普通文件和目录、压缩不超过 1 GiB、解压不超过 4 GiB、条目不超过 20000，并校验 release manifest。
3. 校验候选 Dash 报告的 Dash/Node 版本，以及七个内置 Node/runner 资产的 SHA-256。
4. 取得 root 所有的跨进程锁，并再次核对安装修订号。
5. 暂存到安装目录旁的同一文件系统，写入持久化事务和启动阻断文件。
6. 原子切换 `current`，执行 `dash migrate`，再启动服务。systemd 服务必须连续 5 秒保持 `active/running`，且 `NRestarts` 不增加。

迁移开始前失败时，更新器恢复旧 release 和原运行状态。迁移开始后不再恢复旧二进制，只保留候选版本并要求向前恢复。

管理台状态显示 `failure_code=recovery_required` 或本机存在未完成事务时，以 root 执行：

```bash
sudo /opt/Ithiltir-dash/bin/dash update recover
```

恢复命令会根据持久化阶段决定迁移前回滚或迁移后向前完成。不得手工删除 `$DASH_HOME/runtime/dash-update/transaction.env`、`update.block` 或管理台返回的 `recovery_path`。

## 数据库 schema

`goose_db_version` 是唯一 schema 版本来源：

- Dash 正常启动要求数据库版本与二进制内置迁移完全一致。
- `dash migrate` 推进较旧 schema。
- `dash migrate` 拒绝较新 schema。
- schema 前移后不支持启动旧 Dash 二进制，也不支持降级安装。

手工替换 `bin/dash` 或把新归档覆盖到现有目录会破坏 release 和恢复不变量，不属于受支持的升级路径。非 systemd 手工安装使用：

```bash
sudo /opt/Ithiltir-dash/bin/dash update --service-manager=none
```

该模式更新文件和数据库，不负责启动长期运行的 Dash 进程。

## 0.3 数据迁移结果

- 通知渠道完整配置会被 AES-256-GCM 加密；明文逻辑列改为 `{}`。
- 原来继承全局账期的节点会保存迁移前的实际有效账期。新节点默认使用从 1 号开始的自然月。
- 流量用量累计和五分钟流量明细的处理进度写入 PostgreSQL。升级时，系统从升级前 30 分钟开始生成五分钟流量明细；更早的数据不会自动补算。
- 已有流量月度累计的 `covered_from` 按旧版完整账期语义初始化；该值不是由历史原始采样重新证明的覆盖范围。
- 通知 `failed_permanent` 任务迁移为 `blocked`，并恢复低频探测。
- 告警开放事件会从 PostgreSQL 恢复；告警待定状态和冷却状态不会恢复。
- 前台缓存使用 `ithiltir:dash:front:v2:*` namespace。旧 v1、未带 namespace 的 v2、告警运行态和 MTProto 登录态 key 会被忽略，不自动删除；管理员 session 继续使用兼容前缀 `auth:jwt:*`。

迁移后的存量非法通知渠道会保留在管理台中，只能删除后重建。存量非法告警规则会被标记为无效，并以 `rule_invalid` 关闭仍开放的事件。

## Node 升级

Dash 发布包携带 Node 资产。管理台触发升级时：

1. Dash 根据节点最后上报的平台选择对应资产。
2. `POST /api/admin/nodes/{id}/upgrade` 写入易失升级任务。
3. Node 下一次 `POST /api/node/metrics` 响应取得 update manifest。
4. 支持的托管安装布局下载、校验、切换并重启 Node。

manifest 的 `url` 可能包含短期有效的 `upgrade_token`，用于访问受保护的 `/deploy/*` 资产。Node 必须按原样使用返回的 URL。

支持范围：

- Windows：必须由 runner 托管。
- Linux/macOS：必须使用 `/var/lib/ithiltir-node/releases/<version>` 和 `/var/lib/ithiltir-node/current` 安装布局。

:::warning 自动下发版本要求

Dash 管理台自动下发更新要求当前 Node 版本为 `0.2.3` 或更高。低于该版本时，需要重新执行安装命令或手工替换二进制。

:::

安装布局外直接运行的二进制会忽略 update manifest。

## Linux/macOS Node 重新安装

不能使用托管自更新时，可以重新执行安装命令。安装器会先暂存并执行候选二进制，再停止现有服务或受管路径中的手工进程，强制替换目标 release、上报配置和服务资产，并原子切换 `current`。

重新安装同一版本会替换该 release，不提供安装器回滚。版本升级及恢复语义属于 Node 自更新路径。

## 版本通道

版本必须是严格 SemVer：

```text
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]
```

不使用 `v` 前缀。普通发布不能携带预发布段；预发布构建可以携带 `-rc.1`、`-alpha.1` 等。

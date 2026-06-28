# 用 AI Agent 部署

这个仓库适合交给本地 AI 编程 Agent 处理，例如 Codex、Claude Code 或其他能读写文件、运行命令的 Agent。

你可以复制 [../agent/install.prompt.md](../agent/install.prompt.md)，或者把下面这段提示词发给 Agent：

```text
Follow AGENTS.md and agent/SKILL.md in this repository. Help me deploy this Sub-Store Cloudflare project to my Cloudflare account. Ask me only for missing inputs, prepare my subscription sources and collections, generate the D1 seed SQL, deploy the Worker, import the seed, and give me the final admin URL plus collection download URLs.
```

## Agent 会问你什么

Agent 不应该让你手工改一堆文件。它应该主动询问缺失信息：

- Cloudflare 是否已经登录 Wrangler。
- 是否使用 `workers.dev`，还是绑定自己的域名。
- 是否需要单独的下载域名。
- 管理 token 和下载 token：你提供，或让 Agent 本地生成。
- 远程订阅链接。
- 本地节点文本，例如 `vless://`、`trojan://`、`ss://`、`vmess://`。
- 想创建哪些组合订阅。
- 每个组合订阅包含哪些订阅源。
- 使用哪套分流模板。
- 是否需要节点过滤，例如去掉“官网/剩余/流量/倍率”，或只保留某些地区。

## 推荐输入格式

你可以直接用自然语言给 Agent，例如：

```text
我有三个远程订阅源，名字分别是 Airport A、Airport B、Home。
我想创建一个 daily 组合订阅，包含全部订阅源。
默认用 acl4ssr-mihomo。
过滤掉名字里包含 官网、剩余、流量、过期、倍率 的节点。
按 server + port 去重，最后按名称排序。
```

如果你有本地节点，也可以直接给：

```text
我还有一个自建节点，内容是：
vless://...
把它命名为 home-node，也加入 daily。
```

## Agent 应该如何落地配置

Agent 会把部署配置写到：

```text
config/agent-setup.local.json
```

这个文件按 [../config/agent-setup.schema.json](../config/agent-setup.schema.json) 写。常用过滤器可以直接写 `filterPresetIds`，Agent 会在生成 SQL 时展开成 Worker 能读取的过滤器。

然后生成 D1 导入 SQL：

```bash
pnpm run seed:validate
pnpm run seed:render
```

生成文件：

```text
cloudflare/agent.seed.local.sql
```

导入到远程 D1：

```bash
pnpm run seed:remote
```

`config/rule-presets.json` 里有可选的模板和过滤器预设。Agent 会根据你的描述选择：

- 默认均衡：`acl4ssr-mihomo`
- 不要 emoji：`acl4ssr-mihomo-no-emoji`
- AI / 流媒体更明确：`ai-streaming-mihomo`
- 白名单思路：`loyalsoldier-whitelist`
- 黑名单思路：`loyalsoldier-blacklist`
- 最小可读配置：`mihomo-basic`

常用过滤器：

- `clean-provider-nodes`：去掉“官网、剩余、流量、过期、倍率”等信息节点。
- `dedupe-by-endpoint`：按 `server + port` 去重。
- `sort-by-name`：按节点名排序。
- `hk-jp-sg-us-only`：只保留香港、日本、新加坡、美国；这个会删掉其他地区节点，Agent 应先确认。

## 内置模板怎么选

- `acl4ssr-mihomo`：推荐默认值，适合大多数用户。
- `acl4ssr-mihomo-no-emoji`：和默认模板同源，但分组名不带 emoji。
- `mihomo-basic`：最小模板，方便检查和改造。
- `loyalsoldier-whitelist`：直连优先的白名单思路。
- `loyalsoldier-blacklist`：代理优先的黑名单思路。
- `ai-streaming-mihomo`：AI、流媒体、Telegram、GitHub 分流更明确。

## 访问保护

这个项目默认使用两层 token：

- `SUB_STORE_ADMIN_TOKEN`：保护管理界面和 `/api/*`。
- `SUB_STORE_PUBLIC_DOWNLOAD_TOKEN`：保护 `/download/*`。

管理界面使用 `?token=<admin-token>`，下载链接使用 `?token=<download-token>`。如果使用单独下载域名，把它写到 `SUB_STORE_PUBLIC_DOWNLOAD_HOSTS`，该域名只开放 `/download/*`。

## 验证清单

部署完成后，Agent 应该验证：

- `pnpm run check:release` 通过。
- `/api/env` 能用管理 token 访问。
- `/api/templates` 返回内置模板。
- `/api/sources` 和 `/api/collections` 返回你的配置。
- `/api/link/collection/<id>` 返回带下载 token 的链接。
- `/download/collection/<id>/mihomo?token=...` 能返回 YAML。

最后，Agent 应该给出管理地址、组合订阅下载地址，以及已导入的 sources / collections 摘要。

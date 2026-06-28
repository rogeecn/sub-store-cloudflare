# 一句话安装提示词

把下面这段发给 Codex、Claude Code 或其他本地 AI 编程 Agent：

```text
Follow AGENTS.md and agent/SKILL.md in this repository. Deploy this Sub-Store Cloudflare project to my Cloudflare account. Ask me only for missing inputs. Write my setup to config/agent-setup.local.json, use config/rule-presets.json for templates and filters, validate with pnpm run seed:validate, deploy the Cloudflare Worker with D1, import my sources and collections, and return the final admin URL plus download URLs.
```

如果你还没有整理订阅源，可以直接继续告诉 Agent：

```text
我有几个远程订阅链接和一个自建节点。请你问我要缺失的信息，然后帮我创建一个 daily 组合订阅。默认用 acl4ssr-mihomo，过滤掉官网、剩余、流量、过期、倍率这类信息节点，按 server + port 去重，再按名称排序。
```

English:

```text
Follow AGENTS.md and agent/SKILL.md. Ask only for missing inputs, create config/agent-setup.local.json, deploy the Cloudflare Worker with D1, import the generated seed, and return ready-to-copy admin and download URLs.
```

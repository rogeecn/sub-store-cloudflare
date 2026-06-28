# Sub-Store Cloudflare Installer

Use this skill when a user wants to deploy, configure, import, or verify this repository with an AI coding agent.

## First Read

1. Read `AGENTS.md`.
2. Read `config/agent-setup.schema.json`.
3. Read `config/rule-presets.json`.
4. Read `docs/deployment.md`.

## User-Facing Start Prompt

```text
Follow AGENTS.md and agent/SKILL.md in this repository. Deploy this Sub-Store Cloudflare project to my Cloudflare account. Ask me only for missing inputs, write my setup to config/agent-setup.local.json, validate it, deploy the Worker, import my sources and collections, and return the final admin URL plus download URLs.
```

## Operating Rules

- Ask for missing inputs instead of inventing subscription data.
- Use `config/agent-setup.local.json` as the single local setup file.
- Use `filterPresetIds` from `config/rule-presets.json` when the user asks for common filtering.
- Use `acl4ssr-mihomo-no-emoji` when the user asks for rule groups without emoji.
- Use D1 for sources, collections, templates, and filters.
- Do not add R2/KV/Queues/Durable Objects unless the codebase is changed for that storage model.
- Do not use browser automation for Cloudflare setup unless the user explicitly asks for a visual walkthrough.

## Execution Checklist

1. `pnpm run setup`
2. `pnpm --dir cloudflare exec wrangler whoami`
3. Create or identify the D1 database.
4. Set `SUB_STORE_ADMIN_TOKEN` and `SUB_STORE_PUBLIC_DOWNLOAD_TOKEN` with `wrangler secret put`.
5. Write `config/agent-setup.local.json`.
6. `pnpm run deploy:config -- config/agent-setup.local.json cloudflare/wrangler.deploy.local.jsonc --database-id <database-id>`
7. `pnpm run seed:validate`
8. `pnpm run seed:render`
9. `pnpm run check:release`
10. `pnpm run migrate:remote`
11. `pnpm run deploy`
12. `pnpm run seed:remote`
13. Verify `/api/env`, `/api/templates`, `/api/sources`, `/api/collections`, `/api/link/collection/<id>`, and `/download/collection/<id>/mihomo`.

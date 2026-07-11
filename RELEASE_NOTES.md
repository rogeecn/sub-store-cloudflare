# v0.3.0

Build-time JavaScript compatibility release for Sub-Store Cloudflare.

## Highlights

- Adds JavaScript Filter / Operator modules bundled by Wrangler, without runtime `eval()` or `new Function()`.
- Supports the upstream-style `filter(proxies, targetPlatform, context)` and `operator(proxies, targetPlatform, context)` contracts with `$arguments`, `$options`, and a bounded `ProxyUtils` subset.
- Ships two Free-verified built-ins: TLS fingerprint and node-name regex filtering.
- Adds script selection and metadata-driven arguments to the source and collection action editor.
- Lets Agent/CLI users compile personal trusted scripts from gitignored local manifests and source directories.
- Keeps browser-pasted, D1-stored, and remote script source out of the runtime boundary.
- Adds Worker/D1 integration tests, generated-registry validation, a two-script-per-stage limit, strict output validation, and a no-node-growth rule.
- Keeps the architecture on Workers Static Assets + Worker API + D1 + Worker Secrets.

## Install

Use the Deploy to Cloudflare button in `README.md` for the built-in scripts, or run:

```bash
pnpm run install:cloudflare
```

For personal scripts, follow `docs/script-plugins.md` and redeploy through the Agent/CLI installer.

# v0.2.0

Runtime hardening and performance release for Sub-Store Cloudflare.

## Highlights

- Removes request-time schema work; D1 migrations now own schema changes and built-in templates ship directly with Worker code.
- Adds hard limits for API bodies and remote responses, hardened security headers, and generic client-facing 500 errors.
- Removes admin tokens from browser URLs and exports backups through an authenticated blob request.
- Lazy-loads the settings route and CodeMirror editor to reduce the initial frontend payload.
- Consolidates the repository into one pnpm workspace and updates the Worker/frontend toolchain.
- Adds Workers/D1 integration tests, production dependency audits, and a real Worker startup smoke test to `pnpm run check:release`.
- Keeps the architecture focused on Workers Static Assets + Worker API + D1 + Worker Secrets.

## Install

Use the Deploy to Cloudflare button in `README.md`, or run:

```bash
pnpm run install:cloudflare
```

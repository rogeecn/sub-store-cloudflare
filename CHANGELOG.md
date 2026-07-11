# Changelog

All notable changes to this project will be documented in this file.

This project follows semantic versioning where practical.

## [Unreleased]

### Changed

- Aligned source and collection validation, immutable IDs, partial updates, and empty-collection membership semantics across the Worker, frontend, installer, and documentation.
- Removed the advertised `surge-mac` target because it had no independent renderer; use `surge` or a supported YAML target instead.

### Documentation

- Documented the accepted, not-yet-implemented design for Free-compatible build-time JavaScript filters and operators, including upstream compatibility levels, deployment paths, security boundaries, and performance gates.

## [0.2.0] - 2026-07-10

### Added

- Added Workers runtime and D1 migration integration tests for auth, storage restore, downloads, parsers, and payload limits.
- Added a real `wrangler dev` startup smoke test and production dependency audits to the release gate.
- Added bounded readers for API bodies, remote subscriptions, flow metadata, and DoH responses.

### Changed

- Moved built-in routing templates from D1 seed rows into Worker-owned code so template fixes reach existing deployments immediately.
- Removed request-time schema creation and default seeding; D1 migrations are now the only schema path.
- Consolidated the repository into one pnpm workspace and one root lockfile.
- Updated Wrangler, Workers types, Hono, Axios, Vite, Vue tooling, TypeScript, and YAML dependencies.
- Lazy-loaded the settings route and CodeMirror editor, and removed redundant precompression output.
- Updated Wrangler compatibility settings to `2026-07-08` with `nodejs_compat` across all generated and checked configs.

### Security

- Added CSP, frame denial, no-referrer, no-sniff, and permissions-policy response headers.
- Changed unhandled failures to structured server logs plus generic client-facing 500 responses.
- Removed the admin token from the browser URL after ingest and changed backup export to authenticated blob download.
- Stopped the installer from printing private D1 database IDs and strengthened ignored-file privacy verification.

### Documentation

- Documented the new runtime limits, code-owned template model, release checks, and header-authenticated backup export.

## [0.1.1] - 2026-06-28

### Changed

- Removed repository GitHub Actions and Dependabot so the upstream project does not depend on GitHub automation.
- Kept lightweight GitHub issue forms and a pull request template for contributor intake; they do not run CI/CD.
- Clarified that the Cloudflare Deploy Button is the Cloudflare-hosted template import path, while `pnpm run install:cloudflare` is the local Agent/CLI deployment path.
- Updated Worker compatibility dates and documented the Node 22 + pnpm local development baseline.

### Verification

- Local release checks and Wrangler dry-run deployment remain the release gate.

## [0.1.0] - 2026-06-28

### Added

- Cloudflare-native Worker application with Static Assets, Worker API, D1, and Worker Secrets.
- Source and collection management for remote subscription URLs and local node text.
- Node filters for include/exclude, rename, delete-field, dedupe, sort, regex-sort, flag handling, quick options, and DNS resolve workflows.
- Built-in routing templates for Mihomo-compatible YAML output.
- Output targets for Mihomo, Stash, Surge, Surfboard, Loon, Egern, Shadowrocket, Quantumult X, sing-box, v2ray, URI, and JSON.
- Preview, backup/restore, temporary `url` / `content` / `ua` conversion parameters, and subscription usage metadata.
- Deploy to Cloudflare button support with root `wrangler.jsonc`.
- Agent/CLI installer via `pnpm run install:cloudflare`.
- Release checks for Worker/frontend builds, agent setup, deployment config, worker contract, module format, open-source hygiene, and git history privacy.

### Documentation

- Added deployment, AI agent install, architecture, and product-scope documentation.
- Added contributing, support, security, code of conduct, release notes, and local release checks.

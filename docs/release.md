# Release Process

Use this checklist before publishing a release.

## 1. Verify

```bash
git status --short
pnpm run release:prepare -- v0.1.0
pnpm run check:release
pnpm run deploy:dry-run
```

The release must not include:

- subscription URLs
- node URIs
- admin tokens
- download tokens
- private D1 database IDs
- generated local seed SQL

## 2. Update Version Notes

Update:

- `package.json`
- `cloudflare/package.json`
- `CHANGELOG.md`

For the first public release this is `0.1.0`.

## 3. Tag

```bash
git tag -a v0.1.0 -m "v0.1.0"
git push origin main --tags
```

## 4. Create GitHub Release

```bash
gh release create v0.1.0 \
  --title "v0.1.0" \
  --notes-file RELEASE_NOTES.md
```

Do not attach local setup files or generated seed SQL.

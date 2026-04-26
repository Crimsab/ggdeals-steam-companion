# GG.deals Steam Companion

This repository contains an unofficial GG.deals companion for Steam store pages.

## Project Shape

- `userscript.user.js` is the installable userscript artifact.
- `extension/` contains the Chrome/Steam browser extension wrapper.
- `extension/src/` contains TypeScript source for extension-only code.
- `scripts/build-extension.ts` builds the unpacked extension and zip artifact.
- `scripts/release-version.ts` prepares versioned releases.
- `scripts/verify-release-version.ts` validates release version consistency.
- `tests/` contains Bun/jsdom smoke tests for the userscript behavior.

## Conventions

- Use `bun`, not npm.
- Keep the userscript and extension standalone: changes that affect settings or behavior should work in both.
- The userscript header version, `package.json`, and `extension/manifest.json` must stay in sync.
- Keep `CHANGELOG.md` updated. Release sections use `## x.y.z - YYYY-MM-DD`.
- Do not commit `dist/` or `node_modules/`.
- Do not use the official GG.deals logo as the extension identity unless permission is explicit.
- The project is unofficial; preserve the disclaimer and avoid implying affiliation with GG.deals or Steam.

## Verification

Run:

```bash
bun install --frozen-lockfile
bun run check
```

`bun run check` performs syntax checks, TypeScript checks, jsdom tests, and extension build.

## Release Flow

Prepare a version with:

```bash
bun run release:version 2.0.0
bun run check
```

After the version commit is pushed to `main`, the `Tag Release` workflow creates `v<version>` if it does not already exist. The tag then triggers the `Release` workflow, which uploads:

- `userscript.user.js`
- `dist/ggdeals-steam-companion-chrome.zip`

## Design Notes

- Compact view is the recommended default.
- Bundle/sub inline displays are disabled by default to avoid redundant price blocks.
- API settings should remain visible enough that users understand how to recover from Cloudflare blocks.
- Cloudflare, missing API key, invalid API key, not-found, and free-game states should be visibly distinct.

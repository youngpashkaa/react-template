---
paths:
  - 'package.json'
  - 'pnpm-workspace.yaml'
  - '.husky/**'
  - '*.config.{ts,js}'
  - 'knip.json'
  - 'AGENTS.md'
  - 'CLAUDE.md'
  - 'README.md'
  - 'docs/agents/**'
---

# Commands, checks and maintenance

## Choosing checks

| Change                                    | Run                                                                      |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| TypeScript or TSX                         | `pnpm typecheck`, `pnpm lint:check`, `pnpm prettier:check`               |
| Files, exports or dependencies added      | the above plus `pnpm knip`                                               |
| Vite config, aliases, CSS or `index.html` | `pnpm build`                                                             |
| Docs only                                 | `pnpm prettier:check` does not cover them; check links and paths by hand |

- `pnpm lint:check` lints the whole repo, not just `src`. `pnpm prettier:check` covers `src/**/*.{ts,tsx,js,json}` only; `src/app/styles/index.css` is ignored.
- Do not report a check as passed unless you ran it. Name anything you did not verify.
- The dev server uses HTTPS with a self-signed certificate. Run `pnpm dev` only when the task needs a browser.

## Hooks

Husky runs `pnpm pre-commit` → `lint-staged` on commit. It runs `eslint --cache --fix` and `prettier --write` on the staged `js`, `jsx`, `ts` and `tsx` files only. Do not bypass the hook with `--no-verify`.

## Dependencies

- Package manager is pnpm; the version is pinned by `packageManager`.
- `pnpm-workspace.yaml` holds `overrides` (security pins) and `allowBuilds`. Do not remove or loosen an override without checking why it exists in git history.
- Add a dependency only when asked. Knip reports unused ones.
- `knip.json` treats the page and shared-unit barrels (`src/pages/*/index.ts`, `src/shared/*/index.ts`, `src/shared/ui/*/index.ts`) as public entry points, so the template's unused building blocks are not reported. Files and exports not reachable from `src/main.tsx` or a barrel are.

## Maintaining these docs

- Edit rules only in `docs/agents/rules`. `.claude/rules` is a relative symlink to that directory.
- `AGENTS.md` is the single entry point and the only file Codex loads automatically. `CLAUDE.md` only imports it. Keep `AGENTS.md` short; detail goes in a profile.
- Each fact has one home. Link to it instead of repeating it.
- Do not write dependency versions in the docs; read `package.json`.
- When a profile is added, renamed or removed, update the table in `AGENTS.md` and the map in `docs/agents/README.md` in the same change.
- When a check is added or removed, update the enforcement table in `AGENTS.md`.
- The import boundaries are generated in `scripts/eslint/import-boundaries.js` from the folders in `src/pages` and `src/shared`. Adding a layer means changing that file, `tsconfig.json` aliases, `knip.json` entries and `architecture.md` together.
- A rule is not "enforced" until a tool enforces it. Say "review only" otherwise.
- Commit messages follow Conventional Commits.

# AGENTS.md

Single-page React starter: Vite, React, TypeScript, Tailwind CSS v4 (CSS-first), Zustand, pnpm.
Versions are in `package.json`. Entry: `src/main.tsx` → `src/app/app.tsx`.
Browsers: modern only (Tailwind v4 floor). Do not reintroduce a legacy build target.

## Commands

```bash
pnpm dev             # Vite dev server over HTTPS (self-signed cert), --host
pnpm build           # tsc && vite build
pnpm typecheck       # tsc --noEmit
pnpm lint:check      # ESLint, no fixes
pnpm prettier:check  # Prettier check on src
pnpm knip            # unused files, exports, dependencies
pnpm lint            # ESLint --fix
pnpm prettier        # Prettier --write on src
```

Before finishing a code change: `pnpm typecheck && pnpm lint:check && pnpm prettier:check`.
Run `pnpm knip` after adding or removing files, exports or dependencies.
There is no test framework. Husky runs `lint-staged` on commit; lint errors block the commit.
Commit messages use Conventional Commits (`feat(...)`, `fix(...)`, `chore(deps): ...`).

## Read before editing

Claude Code loads these automatically when it reads matching files. Codex does not: open the file yourself first.

| Task                                                                     | Read                                                 |
| ------------------------------------------------------------------------ | ---------------------------------------------------- |
| Markup, Tailwind classes, `src/app/styles/index.css`, tokens, animations | [styling.md](docs/agents/rules/styling.md)           |
| Adding or moving modules, layers, aliases, barrels, providers, state     | [architecture.md](docs/agents/rules/architecture.md) |
| TypeScript, ESLint or Prettier rules, naming                             | [code-style.md](docs/agents/rules/code-style.md)     |
| Scripts, dependencies, hooks, `pnpm-workspace.yaml`, these docs          | [workflow.md](docs/agents/rules/workflow.md)         |

Wiring and map of all agent docs: [docs/agents/README.md](docs/agents/README.md).

## Hard constraints

- Layers: `app` -> `pages` -> `shared`. Start code in its page; move it to `shared` only when a second page needs it. A page never imports another page; `shared` never imports `pages` or `app`.
- Import a page as `@pages/<name>` and shared code as `@shared/ui/<unit>` or `@shared/<folder>`: only through an `index.ts`, never a file inside it. Inside a unit use relative imports, not its own index.
- Style with Tailwind utilities only. No styled-components, no `tailwind.config.js`, no inline `style` for sizes.
- Write sizes in `rem` as design pixels (see Gotchas). New tokens go in `@theme` in `src/app/styles/index.css`.
- Build class names from complete static strings; never assemble them from props.
- Do not add a dependency, a data-fetching layer or a router without asking. None exists yet.
- Do not edit the `overrides` in `pnpm-workspace.yaml`: they are security pins.

## Gotchas

- `1rem` is not 16px. The root font size is `100vw / 1920` (desktop) or `100vw / 480` (mobile), so `1rem = 1px` at the design width.
- Tailwind's `--text-*` and `--breakpoint-*` defaults are cleared: `text-sm`, `sm:` and `md:` produce nothing. Only `desktop:` and `max-desktop:` exist. The layout is desktop-first by convention.
- The desktop breakpoint is defined once: `--breakpoint-desktop` in `src/app/styles/index.css`. CSS uses `desktop:`, `max-desktop:` or `@variant max-desktop`; JavaScript reads the variable (see `src/shared/stores/use-device.ts`). Never hard-code `1000` or a `max-width` media query.
- `cn()` only joins strings. It does not resolve conflicts, so the later class in the stylesheet wins, not the later in `className`. Never pass conflicting utilities.
- `POPUP_DELAY` in `src/shared/ui/popup/constants.ts` must match the `300ms` durations in `popup-transitions.css`.
- `src/app/styles/index.css` is excluded from Prettier. Class order inside `cn(...)` and `className` is owned by the Prettier plugin; do not hand-sort.
- `pnpm build` is not needed for a type check: use `pnpm typecheck`.

## Where rules are enforced

| Rule                                                   | Enforced by                       |
| ------------------------------------------------------ | --------------------------------- |
| Types, unused locals and parameters                    | `pnpm typecheck` (strict)         |
| Import order, hooks rules, formatting, class order     | ESLint, Prettier                  |
| Canonical Tailwind class names (`z-2`, `size-8`)       | ESLint `better-tailwindcss`       |
| Layer direction, page isolation, public-index imports  | ESLint `no-restricted-imports`    |
| Unused files, exports and dependencies                 | Knip                              |
| Folder placement, promotion to `shared`, styling, a11y | Review only: no tool checks these |

## Agent skills

Issue tracker: local markdown files under `.scratch/` (gitignored). See [issue-tracker.md](docs/agents/issue-tracker.md).
Triage labels: default five-label vocabulary. See [triage-labels.md](docs/agents/triage-labels.md).
Domain docs: single-context. See [domain.md](docs/agents/domain.md).

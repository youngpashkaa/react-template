# Agent-friendly docs for react-template (Codex + Claude Code)

Research only. Accessed 2026-11-15 unless noted. Nothing in this repo except this file was changed.
Location note: the repo has no docs/notes convention for research (only `docs/agents/*.md`, which are skill-config files from the mattpocock skills setup, and a gitignored `.scratch/` issue tracker), so this file uses `docs/research/` as instructed.

## 1. TL;DR

Keep the work template's shape (it is sound and now matches Anthropic's documented pattern), but adapt it:

1. **AGENTS.md is the single source of truth; `CLAUDE.md` = `@AGENTS.md` + Claude-only extras.** The repo already does this. Keep the CLAUDE.md. Reason: when a `CLAUDE.md` exists anywhere on the path, Claude Code reads only CLAUDE.md files and ignores AGENTS.md unless imported. The `@AGENTS.md` import is explicitly documented as the way to share one file with other tools.
2. **Do not start from scratch: the repo already has a 7.8 KB AGENTS.md.** The task is a restructure: shrink AGENTS.md to commands, hard constraints and gotchas, and move per-area detail to `docs/agents/rules/*.md`. The current file has stale claims (see section 2).
3. **Codex has no imports, no `paths` frontmatter, no lazy per-directory loading.** It reads only AGENTS.md files on the root-to-cwd chain (32 KiB cap, combined). Detail docs reach Codex only through an explicit "when X, read file Y" table in AGENTS.md. Claude additionally gets path-scoped autoload via `.claude/rules` (symlink to `docs/agents/rules`).
4. **Proposed profiles (3 rules + workflow, no more):** `architecture.md` (the existing type-based layout, aliases, barrels, state), `styling.md` (Tailwind v4 CSS-first plus this repo's fluid-rem system), `code-style.md`, `workflow.md`. No data-fetching, API, FSD, Stylelint or shadcn profiles: the repo has none of those layers.
5. **Fix the work template's four weaknesses structurally:** README map lists every file in `docs/agents/` (including the 3 existing skill docs); no duplicated paragraphs (each fact has one home, AGENTS.md links instead of restating); wide `paths` globs derived from the real layout plus a rule that "always needed" content lives in AGENTS.md, not in a path-scoped file; no hard-coded versions (point at `package.json`).
6. **Highest-value content is the repo's gotchas** (section 6.4): `cn()` does not de-conflict Tailwind classes, `--text-*` is cleared so `text-sm` etc. do nothing, the breakpoint value exists in 3 places not 2, README says Node 18+ while Vite requires 20.19+/22.12+.
7. **Enforce with tools that both agents trigger:** husky + lint-staged already runs on every commit regardless of agent. Put verification commands in AGENTS.md; use Claude hooks only for rules with zero exceptions (optional, Claude-only).

## 2. Repo findings (~/projects/react-template)

Facts as inspected on 2026-11-15 (branch `main`; a parallel `styled-components` branch exists; working tree clean; `pnpm lint:check`, `tsc`, `prettier:check` all pass).

| Area | Fact |
| --- | --- |
| Stack | React 19, TypeScript 6 (`strict`, but `noImplicitAny: false`, `noUnusedLocals/Parameters` on), Vite 8 with `@vitejs/plugin-react`, `@tailwindcss/vite`, `vite-plugin-svgr`, `vite-plugin-basic-ssl` (HTTPS dev). Zustand + lodash + react-transition-group + body-scroll-lock. No router, no data-fetching lib, no test framework. Exact versions: read `package.json` (do not copy them into docs). |
| Package manager | pnpm (`packageManager` field pins it; `pnpm-workspace.yaml` holds `overrides` for security pins and `allowBuilds`). No `.nvmrc`/`engines`. |
| Tailwind | **v4** (`tailwindcss` + `@tailwindcss/vite` ^4.3.x). CSS-first: `src/index.css` starts with `@import 'tailwindcss'`, tokens in `@theme`; no `tailwind.config.js`; no PostCSS config. |
| Styling system | Fluid rem: `html { font-size: calc(100vw / 1920) }` (desktop) / `calc(100vw / 480)` (< 999px) so 1rem = 1px at design width. `--spacing: 4rem`. `--text-*: initial` and `--breakpoint-*: initial` clear Tailwind defaults; one custom breakpoint `--breakpoint-desktop: 1000px` (used as `desktop:` / `max-desktop:`). Tokens: `--color-black/white/popup/popup-mobile`, `--font-inter`. Arbitrary CSS var syntax `h-(--full-height)` (v4 form). |
| Class helper | `cn` in `src/utils/index.ts` is `classes.filter(Boolean).join(' ')`. **No `clsx`, no `tailwind-merge`, no `cva`.** |
| Class sorting | `prettier-plugin-tailwindcss` with `tailwindStylesheet: ./src/index.css`, `tailwindFunctions: ["cn"]`. `.prettierignore` skips `src/index.css`; the `prettier` scripts only cover `src/**/*.{ts,tsx,js,json}`. |
| Layout | Type-based, flat: `src/{components,ui-kit,pages,providers,hooks,stores,tokens,constants,utils,models}` + `app.tsx`, `main.tsx`, `index.css`. Folder-per-unit (kebab-case folder, main file, `index.ts`) for components/pages/providers/ui-kit; flat files for hooks/stores/constants. Only `ui-kit/popup`, `providers/popups-provider`, `pages/main-page`, `stores/use-device`, `tokens/*` have content; `components/` and `hooks/` barrels are empty. |
| Aliases | `tsconfig.json` `paths` (no `baseUrl`): `@providers @ui-kit @stores @pages @utils @models @hooks @router @components @tokens @constants` each -> `src/<dir>/index`; `@images/*`; `@app/*` -> `src/*` (catch-all deep import). Vite resolves them via `resolve.tsconfigPaths: true`. `@router` target does not exist. |
| Barrels | Every domain dir has `index.ts`; mixed `export *` (stores, models, providers, ui-kit) and explicit exports (pages, tokens, popup). |
| Lint/format | ESLint 10 flat config: ts-eslint recommended, react-hooks, react-refresh, `simple-import-sort` (groups: react, packages, `@`), prettier. Prettier: no semicolons, single quotes, 120 cols. No Knip, no Stylelint, no boundary/cycle rules, no jsx-a11y, no tests. |
| Hooks | husky `pre-commit` -> `pnpm pre-commit` -> `lint-staged` -> `npm run lint` + `npm run prettier` on staged ts/tsx/js/jsx. Those scripts are `eslint --cache . --fix` / `prettier --write "src/..."`; lint-staged appends file names, so my reading is that each commit lints the whole repo, not just staged files (inference, not tested). |
| Scripts | `dev`, `build` (= `tsc && vite build`), `preview`, `lint:check`, `lint`, `prettier:check`, `prettier`. No standalone `typecheck` script. |
| Existing agent docs | `AGENTS.md` (7.8 KB, English), `CLAUDE.md` (`@AGENTS.md` + an "Agent skills" block pointing to `docs/agents/{issue-tracker,triage-labels,domain}.md`, which belong to the mattpocock skills setup and use `.scratch/`). `.gitignore` has a stray `instructions` line. No `.claude/`, `.codex/`, `.cursor/`, `.github/`, CI, or Dockerfile. |
| Comments | Hand-written code and CSS contain comments (the work template bans them). |

Staleness / inconsistencies already present in the current docs (illustrates why versions and lists should not be hand-copied):

- AGENTS.md says `@api, @models, @router` do not exist yet; `@models` exists and `@api` is not in tsconfig.
- README says "Node.js 18+"; Vite's guide says "Vite requires Node.js version 20.19+, 22.12+." (https://vite.dev/guide/).
- AGENTS.md says the breakpoint is mirrored in 2 places; it is in 3: `--breakpoint-desktop: 1000px`, `Breakpoints.DESKTOP = 999.9` (JS), and a hard-coded `@media screen and (max-width: 999px)` in `index.css`.
- `popup-layout.tsx` imports `PopupProps` from `@ui-kit` (its own ancestor barrel; type-only so harmless at runtime, but exactly the pattern the work template's "do not import your own barrel" rule forbids).
- `eslint.config.js` ignores `src/api/generated/**` (leftover from the work template; no such dir).
- `popup-layout.tsx` uses px literals (`py-[30px]`, `h-[2px]`) although AGENTS.md says all sizes are rem.

## 3. Q1 - OpenAI Codex

Sources: https://developers.openai.com/codex/guides/agents-md (308-redirects to https://learn.chatgpt.com/docs/agent-configuration/agents-md), config reference https://learn.chatgpt.com/docs/config-file/config-reference, and the source at github.com/openai/codex `codex-rs/core/src/agents_md.rs` read at commit `ee344ca` (main, 2026-11-15; latest release tag rust-v0.169.0, 2026-11-13).

**Discovery and load order**
- Global: `~/.codex` (or `CODEX_HOME`): `AGENTS.override.md` if present, else `AGENTS.md`; "Codex uses only the first non-empty file at this level."
- Project: start at the project root (found by walking up to a `project_root_markers` entry, default `.git`; none found -> only cwd), walk down to cwd. In each directory check `AGENTS.override.md`, then `AGENTS.md`, then `project_doc_fallback_filenames`; "Codex includes at most one file per directory." Source: `candidate_filenames()` puts `AGENTS.override.md`, `AGENTS.md`, then fallbacks (names containing `/` are ignored).
- Concatenation: root first, joined with blank lines; closer files come later and "override earlier guidance". Empty files are skipped. Built once per run/TUI session.
- An `AGENTS.override.md` in a directory causes that directory's `AGENTS.md` to be ignored.
- Source module doc: "We do **not** walk past the project root."

**Size cap**
- `project_doc_max_bytes`, default **32 KiB** (`DEFAULT_PROJECT_DOC_MAX_BYTES = 32 * 1024` in `config_toml.rs`). It is a **total budget across all project files**: each file consumes `remaining`; a file larger than the remainder is truncated and a warning is emitted; once the budget is 0 later (deeper) files are skipped with a warning. Set in `~/.codex/config.toml`, e.g. `project_doc_max_bytes = 65536`.
- Consequence: a fat root AGENTS.md starves nested ones. Keep the root file well under the cap (target <= 8 KB).

**Trust gate (easy to miss)**: `load_project_instructions` returns nothing when `config.active_project.is_untrusted()`. Config reference: `projects.<path>.trust_level`: "Untrusted projects skip project-scoped `.codex/` layers"; "Codex loads project-scoped config files only when you trust the project." Whether the doc only (not `.codex/`) is also skipped is shown in source (early return) but not stated in the prose docs. Verify empirically (section 9).

**What Codex does NOT support (as far as primary sources show)**
- `@path` imports/includes: not mentioned in the guide; no import expansion in `agents_md.rs` (negative evidence from reading the source, not an explicit statement).
- Frontmatter / `paths:` scoping: not mentioned in the guide or source.
- Lazy loading of AGENTS.md files in subdirectories below cwd: the guide says Codex "stops searching at the current directory"; no lazy loader found in `agents_md.rs`/`agents_md_manager.rs`. Nested files help only when Codex is launched inside that directory (or it is on the root->cwd chain).
- Does not read `.claude/rules`, `CLAUDE.md` (unless you add it to `project_doc_fallback_filenames`, which only applies when AGENTS.md is missing in that directory).
- **Symlinks: supported** for discovery (source doc comment: "Symlinks are allowed"), so `AGENTS.md` may itself be a symlink.

**How detail docs reach Codex**: only through text in AGENTS.md that tells the model to open a file (it uses shell reads). OpenAI's guidance favours contextual pointers, not up-front reads: "database.md for schema changes, and deployment.md when preparing a deployment" is the good example; "Before every edit, read architecture.md, database.md, and deployment.md" is the bad one (https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra). This is exactly the work template's table-pointer approach. Write each row as trigger -> file.

**Other mechanisms**
- Skills: directories with `SKILL.md` (`name`, `description` required), repo location `.agents/skills` in each dir from cwd up to repo root; user `$HOME/.agents/skills`; progressive disclosure (only name/description loaded first, capped at 2% of context); "Symlinked skill folders are followed"; invoke with `$name` or `/skills`; `agents/openai.yaml` for policy (https://learn.chatgpt.com/docs/build-skills, redirect of https://developers.openai.com/codex/skills). The skills page does not say how skills relate to AGENTS.md; OpenAI's blog describes "repository policy in AGENTS.md, repo-local skills in .agents/skills/" (https://developers.openai.com/blog/skills-agents-sdk, via search result summary).
- `config.toml` knobs relevant to a template: `project_doc_max_bytes`, `project_doc_fallback_filenames`, `project_root_markers`. Project-scoped `.codex/config.toml` exists but only loads for trusted projects. A template does not need any of these.
- Verifying (from the guide): `codex --ask-for-approval never "Summarize the current instructions."`, `codex --cd <dir> ... "List the instruction sources you loaded."`, `codex status`.

## 4. Q2 - Claude Code

Primary source: https://code.claude.com/docs/en/memory (and /best-practices, /large-codebases, /features-overview, /skills). All claims below are from the memory page unless stated.

**Discovery**
- Scopes in load order (broad to specific): managed policy, user `~/.claude/CLAUDE.md`, project `./CLAUDE.md` or `./.claude/CLAUDE.md`, local `./CLAUDE.local.md` (gitignore it).
- CLAUDE.md and CLAUDE.local.md in cwd **and every parent** load at launch; "concatenated into context rather than overriding"; root-to-cwd order; within a directory `CLAUDE.local.md` last. Subdirectory files under cwd load **on demand** when Claude reads/writes/edits a file there.
- HTML block comments in CLAUDE.md are stripped before injection (maintainer notes cost no tokens; Claude-only, Codex would see them).
- CLAUDE.md is delivered as a user message after the system prompt; "no guarantee of strict compliance".
- After `/compact`: project-root CLAUDE.md is re-read from disk; nested files and path-scoped rules reload on demand.

**Imports**: `@path/to/import`, relative to the containing file, max depth four hops; skipped inside code spans/fences (wrap a path in backticks to keep it literal). Imports "don't reduce [the] context cost". An import resolving outside the working directory triggers a one-time approval dialog (declining disables them). `@AGENTS.md` next to a CLAUDE.md is inside the project, so no approval needed (inference from the "outside your working directory" wording).

**`.claude/rules/`**
- All `.md` files discovered recursively. No `paths` frontmatter => loaded at launch, same priority as `.claude/CLAUDE.md`.
- With `paths:` (YAML list or comma string; `paths` is the only frontmatter field read): "A path-scoped rule loads when Claude uses the Read, Write, or Edit tool on a matching file", also on a single-file Bash `cat`/`head`. So: **on-demand, triggered by touching a matching file, not by listing/searching** and not at launch. Patterns are relative to the directory containing `.claude`. Glob table: `**/*.ts`; `src/**/*`; `*.md` (anywhere); `/*.md` (root only); `src/components/*.tsx` (not subfolders); brace expansion supported. Invalid YAML => frontmatter ignored, rule loads unconditionally (`claude --debug` shows the error).
- Symlinks supported: "The `.claude/rules/` directory supports symlinks"; circular ones handled. A symlink whose target is **outside** the working directory is treated like an external import (needs approval; then only rules without `paths` load). A relative symlink inside the repo (`../docs/agents/rules`) is not external.
- Size: on-demand files (nested CLAUDE.md, path-scoped rules) are truncated beyond 40,000 characters on a 200K window (150,000-200,000 on 1M); Claude receives only the start plus a note.
- User-level rules: `~/.claude/rules/`, loaded before project rules.

**Verifying**: `/context all` lists loaded **Memory files**; `/memory` lists CLAUDE.md/AGENTS.md and lets you open them; subdirectory CLAUDE.md files show a `Loaded` line in the terminal when pulled in; `InstructionsLoaded` hook logs what loaded and why (useful for path-scoped rules); `/doctor` proposes trims; `/doctor prompt-audit` (v2.1.283+) flags stale/contradictory instructions and missing file references.

**Size guidance**: "target under 200 lines per CLAUDE.md file"; warnings at startup/`/status` for over-length files and for combined overage; each CLAUDE.md, rule and import counts as a separate file. Files over 4 MiB are skipped.

**AGENTS.md interoperability (verified, important)**
- Claude Code v2.1.277+ reads `AGENTS.md` **only when there is no CLAUDE.md/.claude/CLAUDE.md/CLAUDE.local.md in cwd or above** (`~/.claude/CLAUDE.md` and `.claude/rules/` do not count). If both exist, "Claude reads your `CLAUDE.md` files only" unless the **Project instructions** setting (`/config`) is `claude-md-and-agents-md`, which de-dupes an AGENTS.md that CLAUDE.md already imports.
- "A `CLAUDE.md` containing `@AGENTS.md`: you can leave it. Keeping the import never makes Claude read `AGENTS.md` twice." Section "Share one file with other coding tools" gives exactly:
  ```markdown
  @AGENTS.md

  ## Claude Code
  ...Claude-specific instructions...
  ```
  and "If you don't need Claude-specific content, a symlink also works: `ln -s AGENTS.md CLAUDE.md`".
- Symlink caveats stated there: Edit/Write tools refuse to write through a symlink (they redirect to the target); on Windows "use the `@AGENTS.md` import instead" (symlinks need Administrator/Developer Mode and Git checks out a committed symlink as a plain text file unless `core.symlinks` is enabled, leaving a one-line CLAUDE.md).
- AGENTS.md read via the setting differs: `InstructionsLoaded` hooks do not fire for it; external imports load without a prompt if previously approved. Not read at all: `AGENTS.local.md`, `AGENTS.override.md`, `.agents/`.
- So "`@AGENTS.md` import" is **officially documented**, not just a community habit. The work template's `.claude/rules` symlink is covered by "Share rules across projects with symlinks".

**Skills / subagents / hooks: do they belong in a template?**
- Anthropic's order of adoption (https://code.claude.com/docs/en/features-overview, "Build your setup over time"): add to CLAUDE.md when Claude gets something wrong twice; skill when you paste the same playbook a third time; hook when something must happen every time; subagent when a side task floods the conversation. i.e. add on trigger, not up front.
- Skills: `.claude/skills/<name>/SKILL.md`, descriptions always in context, body on demand; `paths` frontmatter supported; symlinked skill dirs supported; follows the Agent Skills open standard (https://code.claude.com/docs/en/skills). Whether Claude Code also reads `.agents/skills` is **unverified** (not mentioned in the part of the page I could read).
- Hooks: deterministic, Claude-only; "If something has to happen every time, make it a hook" (e.g. `Stop` hook running `tsc`). https://code.claude.com/docs/en/best-practices.
- Verdict for this template: ship no skills/subagents/hooks initially. The mattpocock skills are user-level tooling, already referenced from CLAUDE.md. At most, document an optional `Stop` hook snippet in `workflow.md` (decision 7).

## 5. Q3 - Single source of truth for both agents

What each agent loads automatically:

| Artifact | Claude Code | Codex |
| --- | --- | --- |
| `AGENTS.md` (root) | Only if no CLAUDE.md exists on the path, or via `@AGENTS.md` import | Always (root->cwd chain, 32 KiB total) |
| `CLAUDE.md` | Always | Never (unless `project_doc_fallback_filenames`, and then only when AGENTS.md is absent) |
| `@` imports | Yes (4 hops, expanded into context) | No |
| `.claude/rules/*.md` | Yes; `paths:` scoped on file touch | No |
| Nested `dir/AGENTS.md` | Only if no CLAUDE.md anywhere on path; lazily on read in that dir | Only when cwd is in/below that dir (chain), not lazily |
| Nested `dir/CLAUDE.md` | Lazy on touching a file in dir | No |
| Skills | `.claude/skills` | `.agents/skills` |

Options:

| Option | Claude | Codex | Trade-offs |
| --- | --- | --- | --- |
| **(a) CLAUDE.md = `@AGENTS.md` + `.claude/rules` -> `docs/agents/rules` symlink** | AGENTS.md + rules with path scoping | AGENTS.md + table pointers | One source; Claude gets autoload, Codex relies on the table. Fragile points: the rules symlink on Windows (checked out as a text file => rules silently missing; documented fallback: `@` imports of specific files, losing path scoping) and the "Edit tool won't write through symlink" nuance (rules are edited at the real path `docs/agents/rules`, so fine). **Recommended** (documented pattern, already in the repo, matches work template). |
| (a') Same, but real files live in `.claude/rules/` (no symlink) and AGENTS.md table points at `.claude/rules/x.md` | Same | Same; Codex reads the files by path | Removes the symlink risk; docs live under a Claude-named dir (naming smell, no technical issue); `paths:` frontmatter is visible noise to Codex. Good fallback if Windows contributors appear. |
| (b) `CLAUDE.md` symlink -> `AGENTS.md` | Reads it (if symlink survives checkout) | Reads AGENTS.md | No Claude-only extras possible; the existing "Agent skills" block would have to move into AGENTS.md, polluting Codex context; Windows caveat; officially mentioned as a valid option. Not recommended here. |
| (c) Everything in AGENTS.md | Whole file every session | Whole file, capped 32 KiB | Simplest and no symlinks. But Claude's guidance is <200 lines per file, Codex's budget is shared, and everything is always in context. Acceptable only while total content is < ~150 lines. |
| (d) Nested AGENTS.md/CLAUDE.md per directory | Lazy per directory (needs CLAUDE.md or Claude's AGENTS.md fallback rules) | Only if launched in that dir | Good for monorepos (https://code.claude.com/docs/en/large-codebases, https://agents.md "closest file wins"); poor fit for a flat 10-folder SPA, and Codex behaviour would diverge from Claude's. Not recommended. |

Duplication risk: only (a)/(a') are safe if rules are never copied into AGENTS.md. AGENTS.md should link, not restate.

Path scoping is Claude-only. Codex equivalent: a table in AGENTS.md "When you will touch ... read ...", phrased by file areas ("editing `src/**/*.tsx` or `src/index.css` -> read styling.md"). That gives Codex the same trigger but it is model-judged, not deterministic (open question 1).

## 6. Q4 - Writing good instructions

Primary-source guidance, condensed:

**Include** (https://code.claude.com/docs/en/best-practices, "Keep CLAUDE.md short"): exact verification commands ("the exact test, typecheck, and lint commands, and how to run a single test file"); "places where the code is misleading"; decisions not in the repo; "anything you've had to correct twice already". agents.md recommends: overview, build/test commands, code style, testing, security, PR/commit conventions, gotchas (https://agents.md). Make instructions verifiable: "Use 2-space indentation" not "Format code properly" (memory page).

**Leave out**: what Claude can derive from code. Anthropic's "What you can stop doing" table lists "Describe your architecture and file layout in CLAUDE.md -> Claude reads the repo itself. Only write down what isn't in there." `/doctor` trims "directory layouts, dependency lists, and architecture overviews". Style a linter already enforces (Codex guide tip 4: "Keep code review rules concise, and leave formatting and lint checks to CI"). Routine "run tests" nags (OpenAI blog: such instructions can cause unnecessary testing).

**Length**: Claude: <200 lines per file; "Longer files consume more context and reduce adherence". Codex: 32 KiB total. Practical target here: AGENTS.md <= ~100 lines / <= 6 KB; each rule <= ~100 lines / <= 6 KB.

**Emphasis**: Anthropic says piling on IMPORTANT/ALL CAPS "mostly makes Claude over-apply the rule"; if a rule cannot bend, make it a hook/deny rule or CI check; if a line gets lost, shorten the file. Use plain declarative wording; no contradictions (Claude "may pick one arbitrarily").

**Enforcement**: CLAUDE.md is guidance, not enforcement ("whether Claude follows that line on a given turn is still Claude's call"). Deterministic options: hooks (Claude-only), CI, and in this repo husky + lint-staged (agent-agnostic).

**Keeping from going stale**: treat edits like docs in PRs; revisit after major model releases (large-codebases page); add a rule when a mistake recurs; run `/doctor prompt-audit` periodically (finds references to files/commands that no longer exist); OpenAI: "revisit each instruction and ask yourself whether it's still needed". Concrete anti-staleness rules for this repo: (1) never write version numbers or counts (point at `package.json`); (2) never list directory contents the filesystem shows; (3) reference commands by script name, which `package.json` proves; (4) one home per fact; (5) a short "docs map" in `docs/agents/README.md` that is checked by eye whenever a file is added (or by a 5-line script, optional).

**Codex-relevant caveat**: HTML comments are stripped only by Claude; do not hide maintainer notes in them if the same file is read by Codex.

## 7. Q5 - Adaptation for a default-architecture + Tailwind template

### 7.1 Tailwind facts to encode (v4, https://tailwindcss.com/docs)

- CSS-first config: `@import "tailwindcss"` replaces `@tailwind` directives; "JavaScript config files are still supported ... but they are no longer detected automatically in v4"; load one explicitly with `@config`. `corePlugins`, `safelist`, `separator` unsupported (use `@source inline()`). Browser floor "Safari 16.4+, Chrome 111+, and Firefox 128+" (https://tailwindcss.com/docs/upgrade-guide). v3 differences that confuse models: `bg-(--var)` not `bg-[--var]`; `!` goes at the end (`flex!`); `shadow-sm`->`shadow-xs`; `outline-none`->`outline-hidden`; `ring`->`ring-3`; default border colour is `currentColor`; `bg-opacity-*` removed (use `bg-black/50`). Worth a "v3 habits to avoid" line in `styling.md`, because model training data is mostly v3.
- Tokens: `@theme` variables "influence which utility classes exist"; namespaces `--color-*`, `--font-*`, `--text-*`, `--spacing-*`/`--spacing`, `--breakpoint-*`; clear with `--text-*: initial` (removes the default utilities of that namespace); `@theme` for tokens that need utilities, `:root` for plain CSS variables; `@theme inline` when a token references another variable (https://tailwindcss.com/docs/theme). In this repo: add tokens in `@theme` in `src/index.css`, not in components; `src/tokens/*.ts` (`colors`, `breakpoints`) are JS mirrors and must be kept in sync (decision 5).
- Breakpoints: Tailwind is mobile-first (unprefixed = all sizes); custom via `--breakpoint-*`; "use the same unit throughout" (https://tailwindcss.com/docs/responsive-design). This repo is **desktop-first by convention** (`desktop:` for >= 1000px, `max-desktop:` for mobile overrides, defaults cleared, px not rem). The docs should state this plainly, since it contradicts the default mental model.
- Dark mode: default `prefers-color-scheme`; class/data-attribute strategy needs `@custom-variant dark (...)` (https://tailwindcss.com/docs/dark-mode). The repo has no dark mode (single dark theme); say "not used" rather than invent a convention.
- Dynamic classes: Tailwind scans source as plain text; "Don't use props to build class names dynamically"; map props to complete class names (https://tailwindcss.com/docs/detecting-classes-in-source-files). Highly relevant to agents.
- Conflicts: "the class that appears later in the stylesheet wins" (not later in `class`); "you should just never add two conflicting classes to the same element" (https://tailwindcss.com/docs/styling-with-utility-classes). **The repo's `cn()` does not merge**; `PopupLayout` passes an overridable `className` into `cn(...)`, so overrides can silently lose. Two ways to document it: (i) rule: "never pass conflicting utilities; expose props/variants instead" (Tailwind's own advice for component libraries), or (ii) add `tailwind-merge` (supported "up to v4.3" per its README; https://github.com/dcastil/tailwind-merge). If (ii): modified theme namespaces must be registered with `extendTailwindMerge` ("If you modified one of the theme namespaces in your Tailwind config, you need to add the variable names to the `theme` object in tailwind-merge as well"; `--color-*` need not be configured; https://github.com/dcastil/tailwind-merge/blob/v3.4.1/docs/configuration.md). This repo modifies `--spacing`, `--text-*`, and `--breakpoint-*`, so a naive `twMerge` setup may mis-merge; whether it does is **unverified**. If (ii) is adopted, add `tailwindFunctions` entries to Prettier accordingly (already has `cn`).
- Class ordering: `prettier-plugin-tailwindcss`; for v4 set `tailwindStylesheet` (v3: `tailwindConfig`); `tailwindFunctions` for `clsx()`-like helpers; the plugin "must be loaded last" among Prettier plugins (https://github.com/tailwindlabs/prettier-plugin-tailwindcss). Already configured; doc line: "class order is formatter-owned; do not hand-sort".
- cva/clsx: not installed; do not document them as conventions. Mention only in decisions.
- A11y: Tailwind docs do not contain an a11y policy to cite. Keep a short generic rule (semantic elements, keyboard operation, visible focus, `aria-label` for icon-only buttons as `Popup` does) and mark it **project convention, not sourced**. `eslint-plugin-jsx-a11y` is not installed.
- `@apply`/`@utility`: `@apply` exists (https://tailwindcss.com/docs/functions-and-directives); the styling-with-utility-classes page recommends components over custom CSS. The repo uses a plain CSS file for animations (`popup-transitions.css`); document "component-local `.css` only for transitions that utilities cannot express".

### 7.2 What this repo needs and what to drop from the work template

| Work template doc / idea | Here | Why |
| --- | --- | --- |
| `architecture.md` (ARCH-001..007: FSD layers, Steiger, `template/source-layout`, pages isolation, public `index.ts` per slice, `@shared/ui/button`, shared-only barrels) | **Rewrite, much shorter**: describe the existing type-based layout, alias+barrel policy, where state lives, what is not present. Drop FSD layers, Steiger, per-slice isolation, `Реализованные границы FSD`. Keep: "Transitional state" table idea, "existing exceptions do not extend to new code", "linters check the formalizable part" table. | FSD-specific; no equivalent tooling here. |
| `api.md` (Kubb, MSW, OpenAPI, QueryClient, generated API) | **Drop** for now. Add a single AGENTS.md line: "No data-fetching layer exists; creating one is a decision, ask first." Add a `data-fetching.md` only when a layer lands. | Nothing to describe; inventing rules would be unverifiable. |
| `ui.md` (styled-components, `S.` imports, shadcn adaptation, a11y) | **Replace with `styling.md`** (Tailwind v4 + fluid rem, tokens in `@theme`, breakpoint convention, `cn`, class-detection rule, v3-habit list, a11y line). Drop styled-components, Stylelint, shadcn. | Different styling engine. |
| `code-style.md` (comment ban, strict TS, Node 24, ESM, linter levels) | **Keep, adapt** (TS strictness actually enabled, ESLint set actually installed, naming, import sorting is enforced by simple-import-sort so do not restate order). Comment policy is a user decision. | Content differs; structure transfers. |
| `workflow.md` (npm commands, Knip, CI, GitLab, Dockerfile, husky, docs-maintenance) | **Keep, shrink**: pnpm commands, "which check for which change", husky behaviour, how to maintain these docs, Conventional Commits (documented in current AGENTS.md; commit style visible in git log). Drop CI/Docker/Knip/Stylelint (not present). | |
| `docs/agents/steiger.md`, `dependency-security.md` | **Drop steiger.md**. Optional tiny `maintenance.md`/section for the pnpm `overrides` in `pnpm-workspace.yaml` (security pins: do not remove without checking; reason lives in git history) only if wanted. | Steiger is FSD-only; the overrides are a real gotcha but small. |
| `docs/agents/README.md` | **Keep**, map must list every file in `docs/agents/` incl. `domain.md`, `issue-tracker.md`, `triage-labels.md` and `rules/*` (fixes weakness 1). | |
| Russian text | Decision (current AGENTS.md is English). | |

Enforcement tools present here: TypeScript (`tsc` inside `build`), ESLint (hooks, refresh, import sort, ts-recommended), Prettier + Tailwind class sorting, husky/lint-staged. **Not present** (so docs must not claim they enforce anything): boundary/cycle checks, barrel policy, unused-code detection, CSS lint, a11y lint, tests. Possible additions (suggestions, not sourced, decisions for the user): `no-restricted-imports` for `@app/*` deep imports and own-barrel imports, `import-x/no-cycle`, `jsx-a11y`, Knip, a `typecheck` script (`tsc --noEmit`) so agents can verify without a full build.

### 7.3 Default architecture convention to document (descriptive, matches code)

- Layout: `src/<domain>/` folders (components, ui-kit, pages, providers, hooks, stores, tokens, constants, utils, models); folder-per-unit with `index.ts` for components/pages/providers/ui-kit, flat `use-x.ts` files for hooks/stores; kebab-case files/folders, PascalCase component exports, `useX` hooks/stores.
- Imports: alias to the domain barrel (`@hooks`), never a deep path; inside a unit, import siblings directly (relative), never your own or an ancestor barrel. Decision: explicit exports vs `export *` for new barrels.
- Where things go (wiring table; this is the one part of the current layout table worth keeping because the "export from barrel" and "mount provider in app.tsx" steps are not derivable).
- State: server state: none yet; global client state: small Zustand stores in `src/stores` (`useXStore`); local state in components; no copies of server data in stores (adopt only when a data layer exists).
- Pages: `src/pages/<name>/` exported through `@pages`; no router yet (`@router` alias is a placeholder).
- Data fetching: none (see above).

### 7.4 Proposed file tree

```
AGENTS.md                         entry point; no frontmatter; <= ~100 lines / 6 KB
CLAUDE.md                         "@AGENTS.md" + existing "Agent skills" block (Claude-only; keep <= 30 lines)
.claude/
  rules -> ../docs/agents/rules   relative symlink (committed)
docs/agents/
  README.md                       wiring, full docs map, verification steps, Windows fallback; ~40 lines
  rules/
    architecture.md               ~80 lines / 5 KB
    styling.md                    ~100 lines / 6 KB
    code-style.md                 ~50 lines / 3 KB
    workflow.md                   ~60 lines / 4 KB
  domain.md                       existing (skills config) - keep
  issue-tracker.md                existing - keep
  triage-labels.md                existing - keep
docs/research/agent-friendly-docs.md   this file (delete or keep as history)
```

Frontmatter and globs (patterns relative to repo root; only Read/Write/Edit/`cat` of a matching file triggers loading, so make them broad):

| File | `paths` | Rationale |
| --- | --- | --- |
| `architecture.md` | `src/**/*.{ts,tsx}`, `tsconfig*.json`, `vite.config.ts` | Any code edit touches structure/imports/aliases/barrels. Alternatively omit frontmatter (loads every session) if it stays under ~60 lines. |
| `styling.md` | `src/**/*.{tsx,css}`, `index.html`, `.prettierrc`, `src/tokens/**` | All markup/styling work. (The work template's globs were too narrow: `pages/**/*.tsx` etc.) |
| `code-style.md` | `src/**/*.{ts,tsx}`, `eslint.config.js`, `.prettierrc`, `.prettierignore`, `tsconfig*.json` | Overlaps `architecture.md` on purpose; keep it small so double-loading is cheap. |
| `workflow.md` | `package.json`, `pnpm-workspace.yaml`, `.husky/**`, `*.config.{ts,js}`, `eslint.config.js`, `AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/agents/**` | Dependency/script/docs edits. Do **not** include `pnpm-lock.yaml` (huge file, would load on every read). |

Everything that must be known on **every** task (commands, hard constraints, gotchas) stays in AGENTS.md with no frontmatter, so a narrow glob can never hide it. Profile docs are depth, not prerequisites.

### 7.5 AGENTS.md outline (not prose)

1. One-paragraph summary: purpose, stack in words (React + Vite + TS, Tailwind v4, Zustand, pnpm); "versions: see package.json"; modern-browsers-only and why (single sentence; the "do not reintroduce legacy target" instruction is a real gotcha).
2. Commands (verified): `pnpm dev`, `pnpm build` (includes typecheck), `pnpm lint:check`, `pnpm prettier:check`, `pnpm lint` / `pnpm prettier` (fix). "Before finishing a code change run: `pnpm lint:check && pnpm exec tsc && pnpm prettier:check`" (or add a `typecheck` script). "No tests exist." One-line husky note.
3. Docs map table (trigger -> file): editing `src/**/*.tsx|css` or tokens -> `docs/agents/rules/styling.md`; adding/moving modules, aliases, barrels, state -> `architecture.md`; TS/ESLint/Prettier rules -> `code-style.md`; scripts, deps, hooks, doc maintenance -> `workflow.md`. Sentence: "Claude Code loads these automatically; Codex: open the file yourself before editing that area."
4. Hard constraints (5-8 bullets): import via domain alias/barrel; styling only with Tailwind utilities (no styled-components, no inline px); tokens only in `@theme`; use full static class names; no new dependency/layer without asking; do not touch `pnpm-workspace.yaml` overrides; no data layer exists.
5. Gotchas (the content the code does not reveal): see 7.6.
6. "Where this is enforced": one table, linter/formatter vs review-only.
7. Pointer to `docs/agents/README.md` for wiring/maintenance and to the skills docs via CLAUDE.md.

### 7.6 Gotchas worth writing down (all observed in this repo)

- 1rem != 16px: root font-size is `100vw/1920` (or `/480`); write sizes as design px in rem units; spacing scale unit is `4rem`.
- Tailwind default `--text-*` and `--breakpoint-*` are cleared: `text-sm`/`sm:`/`md:` produce nothing; only `desktop:`/`max-desktop:`; font sizes need `text-[16rem]` or a new `--text-*` token.
- Breakpoint lives in `index.css` (`--breakpoint-desktop` and a hard-coded `max-width: 999px` media query) and `src/tokens/breakpoints` (`DESKTOP = 999.9`); change all.
- `POPUP_DELAY` (JS) must match the `300ms` transition durations in `popup-transitions.css`.
- `cn()` only joins strings; later conflicting classes do not win by order (CSS order decides).
- `src/index.css` is excluded from Prettier; class order inside `cn(...)` is auto-sorted.
- Dev server is HTTPS with a self-signed cert.
- `build` is the only typecheck entry.

### 7.7 Work-template items with no equivalent here (flag)

FSD layers and `template/source-layout` Steiger rule; Steiger patches/maintenance doc; `import * as S from '...styled'` and `.styled.ts` globs; Stylelint for styled-components; `@shared/ui/<component>` per-component imports; Kubb/OpenAPI/MSW/QueryClient/generated API; shadcn adaptation; npm + Node 24 + `.nvmrc`; GitLab CI / hosting Dockerfile / `build:hosting`; Knip; comment ban (code here has comments); Russian-language docs.

## 8. Pitfalls and open questions

**Verify empirically**
1. Does Codex open `docs/agents/rules/*.md` when the AGENTS.md table says so, and when it does not? Test: fresh session, task "change popup colour"; check whether it reads `styling.md` (`codex -c log_dir=...` or session jsonl). Repeat with Codex started in `src/` (nested chain) and in repo root.
2. Large-file behaviour: put a >32 KiB dummy AGENTS.md in a scratch copy and confirm the truncation warning and that the tail is not seen (source says it truncates and warns; confirm in the TUI).
3. Claude: with the symlink in place run `/context all`, then read a `.tsx` and confirm `styling.md` appears (and `InstructionsLoaded` hook output) and does not appear at launch.
4. Codex trust gate: in an untrusted project directory, does AGENTS.md still load? (source early-returns; prose docs only mention `.codex/` layers.)
5. `@AGENTS.md` import shows once in `/memory` (docs say it is not double-read).
6. Tailwind-merge behaviour with `--spacing: 4rem`, cleared `--text-*`, and `desktop:` variant (unverified) if you adopt it.
7. Whether Claude Code also scans `.agents/skills` (unverified) and whether Codex's `.agents/skills` can be shared via symlink to `.claude/skills` (both docs say symlinks are followed; combination untested).
8. Git on Windows: `.claude/rules` symlink checkout (documented as a problem; not tested).

**Decisions for you**
1. Keep the `.claude/rules` symlink (a) or use real files in `.claude/rules` (a')? Needed only if non-macOS clones matter.
2. Language of docs: English (current) or Russian (work template).
3. Comment policy for hand-written code (work template: banned; this repo: comments exist).
4. Add `tailwind-merge` (+ `clsx`)? Or document "never pass conflicting classes"? The latter needs no dependency.
5. Remove `Breakpoints.DESKTOP`/colors JS mirrors, or keep and document? Resolve the 999 / 999.9 / 1000 inconsistency.
6. Barrel policy for new code: explicit exports only, and ban own/ancestor-barrel imports (and `@app/*` deep imports) via ESLint `no-restricted-imports`?
7. Optional Claude-only Stop hook (`pnpm exec tsc`) vs relying on husky + AGENTS.md commands. Suggestion: start with commands only.
8. Add a `typecheck` script, a `docs:check` map script, Knip, jsx-a11y: none exist today.
9. Should skills docs (`domain.md`, `issue-tracker.md`, `triage-labels.md`) be visible to Codex (currently referenced only from CLAUDE.md)? If you use the same skills in Codex, move the pointer into AGENTS.md.
10. Fix stale items found in section 2 (README Node version, `@api`, stray `.gitignore` line, `eslint` ignore leftover) in the same change that creates the docs.
11. Dark mode/data layer: explicitly "not used" in docs, or create conventions now? Recommendation: "not present", add when needed.

## 9. Sources (access date 2026-11-15)

Claude Code
- https://code.claude.com/docs/en/memory (discovery, imports, rules, paths, symlinks, AGENTS.md, size, /memory, /context, compaction)
- https://code.claude.com/docs/en/best-practices (formerly https://www.anthropic.com/engineering/claude-code-best-practices, 308 redirect; keep CLAUDE.md short, emphasis, hooks, verification)
- https://code.claude.com/docs/en/large-codebases (per-directory CLAUDE.md vs path-scoped rules; keeping files current)
- https://code.claude.com/docs/en/features-overview (CLAUDE.md vs rules vs skills vs hooks; build-over-time triggers)
- https://code.claude.com/docs/en/skills (locations, frontmatter, symlinks; the last ~20 KB of the page was not read)

OpenAI Codex / AGENTS.md
- https://developers.openai.com/codex/guides/agents-md -> https://learn.chatgpt.com/docs/agent-configuration/agents-md
- https://learn.chatgpt.com/docs/config-file/config-reference (first ~100 KB of 164 KB read)
- https://learn.chatgpt.com/docs/build-skills (<- https://developers.openai.com/codex/skills)
- https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra
- https://developers.openai.com/blog/skills-agents-sdk (search-result summary only, not fetched)
- https://github.com/openai/codex : `codex-rs/core/src/agents_md.rs`, `agents_md_manager.rs`, `codex-rs/config/src/config_toml.rs`, `codex-rs/core/src/config/mod.rs` @ `ee344ca` (main); release rust-v0.169.0
- https://agents.md (format, nested files, conflicts, symlink migration; Claude Code is not named on the page content I got)

Tailwind / tooling
- https://tailwindcss.com/docs/theme, /upgrade-guide, /detecting-classes-in-source-files, /responsive-design, /dark-mode, /styling-with-utility-classes, /functions-and-directives
- https://github.com/tailwindlabs/prettier-plugin-tailwindcss
- https://github.com/dcastil/tailwind-merge and https://github.com/dcastil/tailwind-merge/blob/v3.4.1/docs/configuration.md
- https://vite.dev/guide/ (Node version), https://vite.dev/config/shared-options (`resolve.tsconfigPaths`: boolean, default false)

## 10. Claims that could not be verified from primary sources

- Codex ignores `@` imports and frontmatter, and has no lazy subdirectory loading: inferred from absence in docs and source, not stated.
- Whether untrusted-project gating also suppresses AGENTS.md in practice (source early return only).
- Whether Claude Code reads `.agents/skills` (not covered in the portion of the skills page read).
- `core.symlinks` Git behaviour: the git-config page fetch was truncated; the Windows symlink caveat is cited from the Claude memory page instead.
- tailwind-merge correctness with this repo's customised theme (`--spacing`, `--text-*`, `desktop:` variant); the README range "up to v4.3" vs repo's ^4.3.5.
- Tailwind accessibility guidance: none found; a11y line is project convention.
- Suggested extra linters (jsx-a11y, import-x, Knip, `no-restricted-imports`) are suggestions without a fetched primary source.
- lint-staged runs the whole repo on each commit: reasoning from script text, not tested.

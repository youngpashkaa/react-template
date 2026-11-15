# Agent docs

One set of instructions for Codex and Claude Code. `AGENTS.md` is the entry point; detail lives in `rules/`.

## Structure

```text
AGENTS.md                       entry point, loaded by both agents
CLAUDE.md                       imports @AGENTS.md
.claude/rules -> ../docs/agents/rules
docs/agents/
  README.md                     this file
  rules/
    architecture.md             structure, aliases, barrels, state
    styling.md                  Tailwind v4, fluid rem, tokens
    code-style.md               TypeScript, ESLint, Prettier
    workflow.md                 commands, checks, hooks, doc maintenance
  domain.md                     skills config: domain docs
  issue-tracker.md              skills config: local issue tracker
  triage-labels.md              skills config: triage labels
```

## How each agent loads them

- **Codex** reads `AGENTS.md` from the repository root down to the working directory. It has no `@` imports, no `paths` frontmatter and no automatic loading of other files. The table in `AGENTS.md` tells it which profile to open for a task. There is a combined size limit (`project_doc_max_bytes`, 32 KiB by default), so keep `AGENTS.md` short.
- **Claude Code** reads `CLAUDE.md`, which imports `AGENTS.md`. Files in `.claude/rules` load automatically: `paths` frontmatter loads a profile when Claude reads a matching file. Everything that must apply to every task stays in `AGENTS.md`, because a glob can miss.

## Map

| File                    | Content                                                    |
| ----------------------- | ---------------------------------------------------------- |
| `rules/architecture.md` | Layout, wiring table, imports and barrels, state           |
| `rules/styling.md`      | Fluid rem, breakpoints, tokens, class rules, v3 pitfalls   |
| `rules/code-style.md`   | Compiler, lint and format settings                         |
| `rules/workflow.md`     | Choosing checks, hooks, dependencies, maintaining the docs |
| `domain.md`             | Where skills find domain docs                              |
| `issue-tracker.md`      | Local markdown issue tracker under `.scratch/`             |
| `triage-labels.md`      | Triage label vocabulary                                    |

Every file in this directory is listed above. Add a row when you add a file.

## Verifying the setup

- Claude Code: `/memory` lists loaded instruction files; `/context` shows what is in context. Read a `.tsx` file and confirm `styling.md` appears.
- Codex: start a session and ask which instruction files it loaded. Then give it a styling task and check that it opens `styling.md`.
- Windows: a checkout without symlink support turns `.claude/rules` into a plain file. Enable symlinks, or replace it with `@docs/agents/rules/<file>.md` imports in `CLAUDE.md`.
- Research and sources: [../research/agent-friendly-docs.md](../research/agent-friendly-docs.md).

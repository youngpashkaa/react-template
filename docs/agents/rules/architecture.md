---
paths:
  - 'src/**/*.{ts,tsx}'
  - 'tsconfig*.json'
  - 'vite.config.ts'
  - 'scripts/eslint/**'
---

# Structure, imports and state

Pages-first layout: three layers, page code lives in the page, shared code is promoted only when a second page needs it.

## Layers

```text
src/
  main.tsx
  app/                  assembles the app: root component, providers, global styles
    app.tsx, index.ts
    providers/<name>-provider/
    styles/index.css
  pages/<name>/         everything one page owns
    index.ts            exports the page component only
    <name>-page.tsx
    components/ hooks/ stores/ constants/ ...   page-private, create only when used
  shared/               code used by two or more pages, no page knowledge
    ui/<unit>/          primitives (folder + index.ts)
    components/<unit>/  cross-page components that are not primitives (folder + index.ts)
    hooks/ stores/ utils/ models/ tokens/   flat files + one index.ts per folder
    assets/
```

Create a folder only when it has content. `features/` does not exist; see "Promotion" below.

| Layer      | May import              | Must not import    |
| ---------- | ----------------------- | ------------------ |
| `app`      | `pages`, `shared`       | -                  |
| `pages`    | its own files, `shared` | other pages, `app` |
| `shared`   | other `shared` units    | `pages`, `app`     |
| `main.tsx` | `app`                   | -                  |

## Placement

- Start in the page. Move code to `shared` only when a second page needs it.
- Code with no page knowledge (UI primitive, formatter, device store) may go to `shared` at once.
- A unit used only by one shared unit lives inside that unit, for example `shared/ui/popup/constants.ts`.
- Names: kebab-case files and folders, PascalCase component and provider exports, `use-x.ts` exports `useX`.
- Shared helper types live in `shared/models`. Component prop types live in the unit's `types.ts`.

## Imports

Aliases in `tsconfig.json`: `@pages/*` and `@shared/*`. There is no alias for `app`; only `src/main.tsx` imports it, relatively.

- Another page's code, or `shared`, is imported through the public index: `@pages/<name>` (only from `app`), `@shared/ui/<unit>`, `@shared/<folder>` (`@shared/utils`, `@shared/stores`).
- Inside a page or unit, import siblings relatively. Never import your own index.
- Never import a file inside another unit: not `@pages/main-page/components/x`, not `@shared/hooks/use-x`, not `@shared/ui/popup/popup`. `@shared/assets/**` is free.
- A page does not import `@pages/*` at all: not another page and not itself.
- Barrels: one per page, one per `shared/ui` and `shared/components` unit, one per flat shared folder. None inside page segments (`pages/<name>/components` has no index). New barrels list exports by name; existing `export *` barrels are not rewritten.
- A lazy page gets its own entry file. Do not route through one barrel that imports every page.
- Import order is enforced by `simple-import-sort`.

ESLint (`scripts/eslint/import-boundaries.js`, rule `no-restricted-imports`) enforces layer direction, page isolation, index-only imports and the no-own-index rule. It does not check where barrels exist or whether a page uses a lazy entry. The generator reads the `src/pages` and `src/shared` folders, so new pages and units need no config change.

## Wiring

| Adding a…               | Where                                     | Wire it                                                                                 |
| ----------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------- |
| **Page**                | `src/pages/<name>/`                       | `index.ts` exporting the page; render it from `src/app/app.tsx`                         |
| **Page-private** code   | `src/pages/<name>/components/` etc.       | nothing; import relatively inside the page                                              |
| **UI primitive**        | `src/shared/ui/<name>/`                   | folder + `index.ts`                                                                     |
| **Shared component**    | `src/shared/components/<name>/`           | folder + `index.ts`                                                                     |
| **Shared hook / store** | `src/shared/hooks/`, `src/shared/stores/` | create the folder on first use; add the file and export it from the folder's `index.ts` |
| **Provider**            | `src/app/providers/<name>-provider/`      | folder + `index.ts`; mount it in `src/app/app.tsx`                                      |
| **Design token**        | `@theme` in `src/app/styles/index.css`    | a JS mirror, if needed, goes in `src/shared/tokens`; keep both in sync                  |

The `index.ts` export and the provider mount are easy to forget; nothing fails until the import is used.

## Promotion

- A component, hook or store is needed by a second page: move it to `shared`.
- It carries business logic with state or API calls and is reused: create `src/features/<name>`, and add the layer to this file, the aliases and the lint zones in one change.
- A business concept with its own data and UI is used on 2+ pages: `src/entities/<name>`, same rule.
- A page folder grows past about 30 files: add sub-folders inside the page. That is not a reason for a new layer.
- A second developer joins or the project outlives about six months: consider Steiger and the full layer set.

## State

- Local state stays in the component.
- State owned by one page is a Zustand store inside that page. State shared by several pages is a store in `src/shared/stores`.
- There is no server-state or data-fetching layer. Do not create one or add a library without asking.
- If a data layer is added later, do not copy server data into Zustand stores.

## Not present

A router, a data-fetching layer, dark mode, tests, CI, Docker, Steiger. Do not describe them as existing, and do not add them as a side effect of an unrelated task.

Review only (no tool checks it): folder placement, the promotion rule, unknown top-level folders in `src`, segment structure inside a page.

---
paths:
  - 'src/**/*.{ts,tsx}'
  - 'tsconfig*.json'
  - 'vite.config.ts'
---

# Structure, imports and state

## Layout

All code is under `src/`, in top-level domain folders. Each folder has an `index.ts` barrel and a `tsconfig.json` alias.

- Folder-per-unit (kebab-case folder, main file, `index.ts`): `components`, `ui-kit`, `pages`, `providers`.
- Flat files (`use-x.ts`, `<name>.ts`): `hooks`, `stores`, `constants`, `models`, `utils`.
- Names: kebab-case files and folders, PascalCase component and provider exports, `use-x.ts` exports `useX`.
- Types: shared helper types live in `models`; component prop types live in the unit's `types.ts`.

## Where to add code

| Adding a…                 | Where                                                                 | Wire it                                                                         |
| ------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Shared **component**      | `src/components/<name>/`                                              | folder + `index.ts`; export from `src/components/index.ts`                      |
| Reusable **UI primitive** | `src/ui-kit/<name>/`                                                  | folder + `index.ts`; export from `src/ui-kit/index.ts`                          |
| **Page**                  | `src/pages/<name>/`                                                   | folder + `index.ts`; export from `src/pages/index.ts`                           |
| **Hook**                  | `src/hooks/use-<name>.ts`                                             | export from `src/hooks/index.ts`                                                |
| **Store** (Zustand)       | `src/stores/use-<name>.ts`                                            | export from `src/stores/index.ts`                                               |
| **Provider**              | `src/providers/<name>-provider/` (`<name>-provider.tsx` + `index.ts`) | export from `src/providers/index.ts` **and** mount it in `src/app.tsx`          |
| **Design token**          | `src/tokens/<group>/` (+ `index.ts`)                                  | export from `src/tokens/index.ts`; a CSS twin goes in `@theme` (see styling.md) |
| **Constant**              | `src/constants/<file>.ts`                                             | export from `src/constants/index.ts`                                            |
| **Util**                  | `src/utils/`                                                          | export from `src/utils/index.ts`                                                |

The barrel export and the provider mount are the steps that are easy to forget; nothing fails until the import is used.

## Imports

- Outside a module: import from the domain alias (`@hooks`, `@ui-kit`, `@constants`, ...), never a deep path.
- Inside a module: import siblings directly with relative paths. Never import your own barrel or an ancestor barrel.
- `@app/*` (a catch-all for `src/*`) exists only as a legacy alias. Do not use it in new code.
- `@images/*` points to `src/assets/images/*`.
- Order is enforced by `simple-import-sort`; do not restate it by hand.
- New barrels list their exports by name. Existing barrels that use `export *` are not rewritten; when adding to one, follow its style.
- Barrel policy for own/ancestor barrels and `@app/*` is enforced by ESLint `no-restricted-imports`. The rest of this file is not.

## State

- Local state stays in the component.
- Shared client state is a small Zustand store in `src/stores` (for example `use-device` exposes `isMobile`).
- There is no server-state or data-fetching layer. Do not create one or add a library without asking.
- If a data layer is added later, do not copy server data into Zustand stores.

## Pages and routing

Pages live in `src/pages/<name>/` and are exported through `@pages`. There is no router. The `@router` alias points to a directory that does not exist; it is a placeholder.

## Not present

Dark mode, tests, a router, a data-fetching layer, CI and a Docker setup. Do not describe them as existing, and do not add them as a side effect of an unrelated task.

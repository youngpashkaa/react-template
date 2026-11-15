# React + Vite + TypeScript Starter — Tailwind CSS v4

A single-page web application built with **React 19**, **Vite 8**, and **TypeScript**,
styled with **Tailwind CSS v4** (CSS-first, no `tailwind.config.js`). Its defining feature
is a **fluid, rem-based design system**: every size is authored in `rem` as if it were
`px`, and the entire layout scales proportionally with the viewport.

## Features

- **Fluid rem-based scaling** — design in `px`, render in scalable `rem`; one root
  font-size in `vw` makes the whole UI scale with the viewport (see [Styling](#styling-system)).
- **Tailwind v4 CSS-first config** — tokens, colors, and breakpoints declared in `@theme`.
- **Pages-first structure** — `app` / `pages` / `shared` layers, boundaries enforced by ESLint.
- **Accessible popup system** — portal-based modals with enter/exit transitions.
- **Zustand** for lightweight client state, **react-transition-group** for animations.
- Pre-wired **ESLint + Prettier** with a husky pre-commit hook.

## Tech stack

| Area       | Package                                 |
| ---------- | --------------------------------------- |
| Framework  | React 19                                |
| Build tool | Vite 8 (HTTPS dev server via basic-ssl) |
| Language   | TypeScript (strict)                     |
| Styling    | Tailwind CSS v4 (`@tailwindcss/vite`)   |
| State      | Zustand                                 |
| Animations | react-transition-group                  |
| Tooling    | pnpm, ESLint, Prettier, husky           |

## Getting started

### Prerequisites

- **Node.js** 20.19+ or 22.12+ (Vite requirement)
- **pnpm** (`npm i -g pnpm`)

### Install & run

```bash
pnpm install
pnpm dev        # https://localhost:5173 (self-signed cert)
```

> [!TIP]
> The dev server runs over HTTPS via `@vitejs/plugin-basic-ssl`; accept the self-signed
> certificate warning on first load.

## Scripts

| Command               | Description                                 |
| --------------------- | ------------------------------------------- |
| `pnpm dev`            | Start the Vite dev server (HTTPS, `--host`) |
| `pnpm build`          | Type-check (`tsc`) and build to `dist/`     |
| `pnpm preview`        | Serve the production build locally          |
| `pnpm lint`           | Run ESLint with `--fix`                     |
| `pnpm lint:check`     | Run ESLint without fixing (CI/verify)       |
| `pnpm prettier`       | Format `src` with Prettier                  |
| `pnpm prettier:check` | Check `src` formatting without writing      |
| `pnpm typecheck`      | Type-check only (`tsc --noEmit`)            |
| `pnpm knip`           | Find unused files, exports and dependencies |

> [!NOTE]
> There is no test runner configured. A husky pre-commit hook runs ESLint + Prettier on
> staged files, so commits with lint errors are blocked.

## Project structure

```
src/
├── main.tsx              # Entry point
├── app/                  # Root component, providers, global styles
│   ├── app.tsx
│   ├── providers/        # React context providers
│   └── styles/index.css  # Tailwind @theme + global base layer (fluid rem scaling)
├── pages/<name>/         # One folder per page: page component + its private code
└── shared/               # Code used by two or more pages
    ├── ui/<unit>/        # Reusable UI primitives (e.g. popup)
    ├── stores/           # Zustand stores
    ├── utils/            # Utilities (incl. the cn() class-joining helper)
    ├── models/           # Shared helper types
    ├── tokens/           # JS mirrors of design tokens
    └── assets/
```

Start new code in the page that needs it; move it to `shared/` when a second page does.
Import a page as `@pages/<name>` and shared code as `@shared/ui/<unit>` or `@shared/<folder>`:
only through an `index.ts`, never a file inside it. ESLint enforces this.
See [`docs/agents/rules/architecture.md`](docs/agents/rules/architecture.md).

| Adding a…    | Where                                  | How to wire it                                            |
| ------------ | -------------------------------------- | --------------------------------------------------------- |
| Page         | `src/pages/<name>/`                    | `index.ts` exports the page; render it from `app/app.tsx` |
| UI primitive | `src/shared/ui/<name>/`                | folder + `index.ts`                                       |
| Shared hook  | `src/shared/hooks/use-<name>.ts`       | create the folder and its `index.ts` on first use         |
| Store        | `src/shared/stores/use-<name>.ts`      | export from `src/shared/stores/index.ts`                  |
| Provider     | `src/app/providers/<name>-provider/`   | folder + `index.ts`, mount in `app/app.tsx`               |
| Design token | `@theme` in `src/app/styles/index.css` | use the generated utility (`bg-*`, `font-*`, …)           |

## Styling system

The core idea: **author every size in `rem` as if it were `px`, and the whole layout
scales fluidly with the viewport.** Configured in `src/app/styles/index.css`.

- `html` has a `vw`-based font-size (`calc(100vw / 1920)` desktop, `calc(100vw / 480)` below 1000px), making
  **`1rem = 1px`** at the design width. `body` sets a `16rem` (≈16px) base text size,
  inherited by everything — including modals in the `#popups` portal.
- **`--spacing: 4rem`** in `@theme` rescales Tailwind's spacing scale so **1 unit = 4rem
  (≈4px at design width)** — same px semantics as stock Tailwind, but in scalable rem:
  - `w-4` → `16rem`, `p-10` → `40rem`, `top-6` → `24rem`
  - arbitrary values for the rest: `rounded-[12rem]`, `h-[3.2rem]`, `bg-[#0d1a2a]`
- **Custom breakpoint** `--breakpoint-desktop: 1000px` (default `sm/md/lg/…` are cleared):
  - `desktop:` → `min-width: 1000px` · `max-desktop:` → mobile overrides

  Keep breakpoints in `px`, not `rem`. This is the only definition: `use-device.ts` reads
  `--breakpoint-desktop` from the document at runtime.

- Style with utility classes; merge/conditionally join them with the **`cn(...)`** helper
  from `@shared/utils`.

## Browser support

Targets modern browsers (Chrome 111+ / Safari 16.4+). Tailwind v4 relies on cascade
layers, `@property`, and `color-mix`, so older browsers are not supported.

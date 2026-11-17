---
paths:
  - 'src/**/*.{tsx,css}'
  - 'src/tokens/**'
  - 'index.html'
  - '.prettierrc'
---

# Styling with Tailwind CSS v4

Tailwind v4 is configured in CSS only: `src/index.css` starts with `@import 'tailwindcss'` and declares tokens in `@theme`. There is no `tailwind.config.js` and no PostCSS config.

## Fluid rem

- `html { font-size: calc(100vw / 1920) }` on desktop and `calc(100vw / 480)` below 1000px. At the design width `1rem = 1px`.
- Write every size as the design pixel value in `rem`: `rounded-[12rem]`, `h-[3.2rem]`, `text-[16rem]`.
- `--spacing: 4rem`, so one spacing unit is about 4px at the design width: `w-4` is `16rem`, `p-10` is `40rem`.
- Use arbitrary values for non-multiples and non-spacing properties. Use the v4 variable syntax: `h-(--full-height)`.
- Media queries stay in `px`; `rem` there is relative to the browser root, not to this system.

## Breakpoints

The layout is desktop-first by convention, which is the opposite of Tailwind's mobile-first default.

- `desktop:` is `min-width: 1000px`.
- `max-desktop:` is the exact complement (`width < 1000px`). In plain CSS use `@variant max-desktop { ... }`, not a `max-width` media query.
- `sm:`, `md:`, `lg:` and the other defaults are cleared and produce nothing. Do not add them back.
- `--breakpoint-desktop` in `src/index.css` is the only definition (in an `@theme static` block so it stays in `:root`). JavaScript reads it with `getComputedStyle` in `use-device.ts`, which throws if the variable is missing; do not add a JS constant.

## Tokens

- Colors, fonts and other tokens go in `@theme` in `src/index.css`, not in component files. Current tokens: `--color-black`, `--color-white`, `--font-inter`.
- Tailwind's default `--text-*` scale is cleared, because it would render at about 1px under the vw root. Add a `--text-*` token if a named text size is needed.
- Use `:root` for plain CSS variables that need no utility (for example `--full-height`).
- `src/tokens/colors` mirrors black and white for JavaScript. Change the CSS and the mirror together.
- There is no dark mode. Do not add dark-mode variants.

## Writing classes

- Tailwind scans only `src` (`source('.')` on the import in `src/index.css`). Classes used only in `index.html`, docs or other folders are not generated.
- Class names must be complete static strings. Tailwind scans source as plain text, so `` `bg-${color}` `` produces nothing. Map props or state to full class names.
- Use `cn(...)` from `@utils` to join classes conditionally. It does not merge conflicts: never pass two utilities that set the same property. Expose a prop or variant instead of letting callers override with `className`.
- Class order is owned by `prettier-plugin-tailwindcss` (configured for `cn`). Do not hand-sort; run `pnpm prettier`.
- Write canonical classes: `z-2` not `z-[2]`, `size-8` not `h-8 w-8`, `transform-[...]` not `[transform:...]`. ESLint `better-tailwindcss/enforce-canonical-classes` reports the rest and `pnpm lint` fixes it. It reads `src/index.css`, so it knows the custom `--spacing` and breakpoints.
- `cva`, `clsx` and `tailwind-merge` are not installed. Do not use them without asking.

## v3 habits that break in v4

- `bg-[--var]` is now `bg-(--var)`.
- The important modifier goes at the end: `flex!`.
- `bg-opacity-*` is removed: use `bg-black/50`.
- `shadow-sm` became `shadow-xs`, `outline-none` became `outline-hidden`, `ring` became `ring-3`.
- The default border color is `currentColor`.

## Component-local CSS

Plain `.css` next to a component is only for styles that utilities cannot express (for example keyframe-driven transitions). Import it from the component.

## Accessibility

Project convention, not tool-enforced: use semantic elements, keep every control keyboard-operable with a visible focus state, and give icon-only buttons an `aria-label`. Check keyboard behaviour by hand when you change interactive markup.

---
paths:
  - 'src/**/*.{ts,tsx}'
  - 'eslint.config.js'
  - '.prettierrc'
  - '.prettierignore'
  - 'tsconfig*.json'
---

# TypeScript and lint rules

- TypeScript is `strict`, with `noUnusedLocals`, `noUnusedParameters` and `noFallthroughCasesInSwitch`. `noImplicitAny` is off. Unused variables fail `pnpm typecheck` and `pnpm build`.
- Prettier: no semicolons, single quotes, 120 columns, trailing commas `es5`. Run `pnpm prettier` instead of formatting by hand.
- ESLint flat config: TypeScript recommended, `react-hooks` (rules-of-hooks is an error, exhaustive-deps a warning), `react-refresh` (warning), `simple-import-sort` (error), Prettier.
- Import groups are `react`, then packages, then `@` aliases. The sorter fixes this; run `pnpm lint`.
- Do not disable a lint rule to get past an error; fix the cause or ask.
- Prefer named exports. A component file exports components only (`react-refresh/only-export-components`).
- Comments are not regulated. Write one when the reason is not visible in the code (for example the `POPUP_DELAY` and `300ms` coupling).
- Warnings do not block commits. Mention any you leave behind.

Exact settings are in `eslint.config.js`, `.prettierrc` and `tsconfig.json`. Change a convention and its configuration together.

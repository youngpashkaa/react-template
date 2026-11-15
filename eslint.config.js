import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss'
import eslintPluginPrettier from 'eslint-plugin-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'

import eslint from '@eslint/js'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'

const sourceFiles = ['src/**/*.{ts,tsx}']
const toolingFiles = ['*.{js,ts}']

const domainAliases = {
  components: '@components',
  constants: '@constants',
  hooks: '@hooks',
  models: '@models',
  pages: '@pages',
  providers: '@providers',
  stores: '@stores',
  tokens: '@tokens',
  'ui-kit': '@ui-kit',
  utils: '@utils',
}

const deepImportPattern = {
  group: ['@app/*'],
  message: 'Import through the domain alias barrel instead of a deep @app/* path.',
}

const domainImportRules = Object.entries(domainAliases).map(([dir, alias]) => ({
  files: [`src/${dir}/**/*.{ts,tsx}`],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [{ name: alias, message: `Use a relative import inside ${alias}, not its own barrel.` }],
        patterns: [deepImportPattern],
      },
    ],
  },
}))

export default [
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  {
    ...eslint.configs.recommended,
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: [...sourceFiles, ...toolingFiles],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [['^react$'], ['^[a-z]'], ['^@']],
        },
      ],
    },
  },
  {
    files: sourceFiles,
    rules: {
      'no-restricted-imports': ['error', { patterns: [deepImportPattern] }],
    },
  },
  ...domainImportRules,
  {
    files: sourceFiles,
    plugins: { 'better-tailwindcss': eslintPluginBetterTailwindcss },
    settings: { 'better-tailwindcss': { entryPoint: 'src/index.css' } },
    rules: { 'better-tailwindcss/enforce-canonical-classes': 'error' },
  },
  eslintConfigPrettier,
  {
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
]

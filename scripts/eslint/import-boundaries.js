import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '../..')
const unitContainers = ['ui', 'components']
const freeFolders = ['assets']

const listDirs = (relativeDir) => {
  const dir = path.join(root, relativeDir)
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
}

const sharedFolders = listDirs('src/shared').filter((name) => !freeFolders.includes(name))
const flatSharedFolders = sharedFolders.filter((name) => !unitContainers.includes(name))
const sharedBarrels = sharedFolders.flatMap((name) =>
  unitContainers.includes(name)
    ? listDirs(`src/shared/${name}`).map((unit) => ({
        dir: `src/shared/${name}/${unit}`,
        alias: `@shared/${name}/${unit}`,
      }))
    : [{ dir: `src/shared/${name}`, alias: `@shared/${name}` }]
)

const publicApiGroups = [
  {
    group: ['@pages/*/**'],
    message: 'Import a page only through its index: @pages/<name>.',
  },
  {
    group: ['@shared/*/*/*', '!@shared/assets/**'],
    message: 'Import a shared unit only through its index: @shared/ui/<unit>.',
  },
  ...(flatSharedFolders.length
    ? [
        {
          group: flatSharedFolders.map((name) => `@shared/${name}/*`),
          message: 'Import from the folder index, for example @shared/utils, not from a file inside it.',
        },
      ]
    : []),
]

const appGroup = {
  group: ['@app', '@app/**', '../**/app', '../**/app/**'],
  message: 'Only src/main.tsx imports the app layer.',
}

const pagesGroup = {
  group: ['@pages', '@pages/**', '../**/pages', '../**/pages/**'],
  message: 'Shared code must not import pages.',
}

const noPagesImportingPagesGroup = {
  group: ['@pages', '@pages/**'],
  message: 'A page must not import another page or its own index. Share code through src/shared.',
}

const rule = (extraGroups = [], paths = []) => ['error', { paths, patterns: [...publicApiGroups, ...extraGroups] }]

export const importBoundaryConfigs = [
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': rule() },
  },
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': rule([pagesGroup, appGroup]) },
  },
  {
    files: ['src/pages/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': rule([noPagesImportingPagesGroup, appGroup]) },
  },
  ...sharedBarrels.map(({ dir, alias }) => ({
    files: [`${dir}/**/*.{ts,tsx}`],
    rules: {
      'no-restricted-imports': rule(
        [pagesGroup, appGroup],
        [{ name: alias, message: `Use a relative import inside ${alias}, not its own index.` }]
      ),
    },
  })),
]

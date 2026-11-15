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

const pages = listDirs('src/pages')
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

const aliasPagesGroup = {
  group: ['@pages', '@pages/**'],
  message: 'A page must not import another page or its own index. Share code through src/shared.',
}

const relativeSharedGroup = {
  group: ['../**/shared', '../**/shared/**'],
  message: 'Import shared code through the @shared/* alias, not a relative path.',
}

const relativePagesGroup = {
  group: ['../**/pages', '../**/pages/**'],
  message: 'Import a page through the @pages/<name> alias, not a relative path.',
}

const otherPagesGroups = (page) => {
  const group = pages.filter((other) => other !== page).flatMap((other) => [`../**/${other}`, `../**/${other}/**`])
  return group.length ? [{ group, message: 'A page must not import another page. Share code through src/shared.' }] : []
}

const globToRegExp = (glob) => {
  let source = ''
  for (let index = 0; index < glob.length;) {
    if (glob.startsWith('/**/', index)) {
      source += '/(?:.*/)?'
      index += 4
    } else if (glob.startsWith('**', index)) {
      source += '.*'
      index += 2
    } else if (glob[index] === '*') {
      source += '[^/]*'
      index += 1
    } else {
      source += glob[index].replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      index += 1
    }
  }
  return new RegExp(`^${source}(?:/.*)?$`)
}

const noRestrictedDynamicImports = {
  meta: {
    type: 'problem',
    schema: [
      {
        type: 'object',
        properties: { paths: { type: 'array' }, patterns: { type: 'array' } },
        additionalProperties: false,
      },
    ],
    messages: { restricted: "'{{source}}' import is restricted. {{message}}" },
  },
  create(context) {
    const { paths = [], patterns = [] } = context.options[0] ?? {}
    const compiled = patterns.map(({ group, message }) => ({
      message,
      include: group.filter((glob) => !glob.startsWith('!')).map(globToRegExp),
      exclude: group.filter((glob) => glob.startsWith('!')).map((glob) => globToRegExp(glob.slice(1))),
    }))

    return {
      ImportExpression(node) {
        if (node.source.type !== 'Literal' || typeof node.source.value !== 'string') return
        const source = node.source.value
        const pathMatch = paths.find(({ name }) => name === source)
        const patternMatch = compiled.find(
          ({ include, exclude }) =>
            include.some((regExp) => regExp.test(source)) && !exclude.some((regExp) => regExp.test(source))
        )
        const message = pathMatch?.message ?? patternMatch?.message
        if (message) context.report({ node, messageId: 'restricted', data: { source, message } })
      },
    }
  },
}

const boundariesPlugin = { rules: { 'no-restricted-dynamic-imports': noRestrictedDynamicImports } }

const block = (files, extraGroups = [], paths = []) => {
  const options = { paths, patterns: [...publicApiGroups, ...extraGroups] }
  return {
    files,
    plugins: { boundaries: boundariesPlugin },
    rules: {
      'no-restricted-imports': ['error', options],
      'boundaries/no-restricted-dynamic-imports': ['error', options],
    },
  }
}

export const importBoundaryConfigs = [
  block(['src/**/*.{ts,tsx}']),
  block(['src/app/**/*.{ts,tsx}'], [relativePagesGroup, relativeSharedGroup]),
  block(['src/shared/**/*.{ts,tsx}'], [pagesGroup, appGroup]),
  ...pages.map((page) =>
    block(
      [`src/pages/${page}/**/*.{ts,tsx}`],
      [aliasPagesGroup, appGroup, relativeSharedGroup, ...otherPagesGroups(page)]
    )
  ),
  ...sharedBarrels.map(({ dir, alias }) =>
    block(
      [`${dir}/**/*.{ts,tsx}`],
      [pagesGroup, appGroup],
      [{ name: alias, message: `Use a relative import inside ${alias}, not its own index.` }]
    )
  ),
]

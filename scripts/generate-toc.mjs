import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import MarkdownIt from 'markdown-it'
import { sidebar } from '../.vuepress/sidebar.mjs'

const rootDir = process.cwd()
const outputFile = 'end/toc.md'
const dataFile = '.vuepress/data/article-index.json'
const skipFiles = new Set([outputFile])
const markdown = new MarkdownIt({ html: true })
const searchEntries = []
const plainText = (body) => markdown.utils.unescapeAll(markdown.render(body).replace(/<!--[\s\S]*?-->/gu, '').replace(/<[^>]*>/gu, ' ')).replace(/\s+/gu, ' ').trim()

const stripFrontmatter = (content) => {
  if (!content.startsWith('---\n')) return { frontmatter: '', body: content }

  const end = content.indexOf('\n---\n', 4)
  if (end === -1) return { frontmatter: '', body: content }

  return {
    frontmatter: content.slice(4, end),
    body: content.slice(end + 5),
  }
}

const getFrontmatterTitle = (frontmatter) => {
  const match = frontmatter.match(/^title:\s*['"]?(.+?)['"]?\s*$/m)
  return match?.[1]?.trim() ?? ''
}

const getMarkdownTitle = (body, filePath) => {
  const heading = body.match(/^#\s+(.+)$/m)?.[1]?.trim()
  if (heading) return heading.replace(/\s+#*$/, '')

  const basename = path.basename(filePath, '.md')
  return basename === 'README' ? path.basename(path.dirname(filePath)) : basename
}

const getWordNumber = (content) => {
  const words =
    content.match(/[\w\d\s\u00C0-\u024F\u0400-\u04FF.@/]+/giu)?.reduce((total, word) => {
      const trimmed = word.trim()
      return total + (trimmed === '' ? 0 : trimmed.split(/\s+/u).length)
    }, 0) ?? 0

  const chinese = content.match(/[\u4E00-\u9FD5]/gu)?.length ?? 0

  return words + chinese
}

const normalizeConfiguredPath = (configuredPath) => {
  let filePath = configuredPath.startsWith('/') ? configuredPath.slice(1) : configuredPath
  if (filePath.endsWith('/')) filePath = `${filePath}README.md`
  if (!filePath.endsWith('.md')) filePath = `${filePath}.md`
  return filePath
}

const hasDescendantPath = (items = [], configuredPath) => {
  const targetPath = normalizeConfiguredPath(configuredPath)

  return items.some((item) => {
    if (typeof item === 'string') {
      return normalizeConfiguredPath(item) === targetPath
    }

    if (item.link && normalizeConfiguredPath(item.link) === targetPath) {
      return true
    }

    return hasDescendantPath(item.children, configuredPath)
  })
}

const toRoute = (filePath) => {
  if (filePath === 'README.md') return '/'

  const withoutExt = filePath.replace(/\.md$/u, '')
  if (/\/(README|index)$/u.test(withoutExt)) {
    return `/${withoutExt.replace(/\/(README|index)$/u, '')}/`
  }

  return `/${withoutExt}.html`
}

const getGroup = (filePath) => filePath.split('/')[0]

const readArticle = async (filePath, order, titleOverride = '') => {
  const raw = await readFile(path.join(rootDir, filePath), 'utf8')
  const { frontmatter, body } = stripFrontmatter(raw)
  const title = titleOverride || getFrontmatterTitle(frontmatter) || getMarkdownTitle(body, filePath)

  const text = plainText(body)
  const hasContent = plainText(body.replace(/^#{1,6}\s+.*$/gmu, '')).length > 0
  if (hasContent) searchEntries.push({ filePath, title, route: toRoute(filePath), text })

  return {
    filePath,
    title,
    hasContent,
    route: toRoute(filePath),
    group: getGroup(filePath),
    words: getWordNumber(body),
    order,
  }
}

const createBuilder = () => {
  const seenFiles = new Set()
  const articles = []
  let order = 0

  const makeArticleNode = async (configuredPath, trail, titleOverride = '') => {
    const filePath = normalizeConfiguredPath(configuredPath)
    if (skipFiles.has(filePath) || seenFiles.has(filePath)) return null

    seenFiles.add(filePath)
    const article = await readArticle(filePath, order, titleOverride)
    order += 1

    const articleWithTrail = {
      ...article,
      trail,
      groupName: trail[0] ?? article.group,
    }

    articles.push(articleWithTrail)

    return {
      type: 'article',
      ...articleWithTrail,
    }
  }

  const buildNodes = async (items, trail) => {
    const nodes = []

    for (const item of items) {
      if (typeof item === 'string') {
        const articleNode = await makeArticleNode(item, trail)
        if (articleNode) nodes.push(articleNode)
        continue
      }

      const groupTrail = [...trail, item.text].filter(Boolean)
      const children = []

      if (item.link && !hasDescendantPath(item.children, item.link)) {
        const articleNode = await makeArticleNode(item.link, groupTrail, '总览')
        if (articleNode) children.push(articleNode)
      }

      if (item.children) {
        children.push(...(await buildNodes(item.children, groupTrail)))
      }

      if (children.length > 0) {
        nodes.push({
          type: 'group',
          text: item.text,
          children,
        })
      }
    }

    return nodes
  }

  return {
    articles,
    buildNodes,
    makeArticleNode,
  }
}

const flattenArticles = (nodes) => {
  return nodes.flatMap((node) => {
    if (node.type === 'article') return [node]
    return flattenArticles(node.children)
  })
}

const findFirstRoute = (nodes) => {
  for (const node of nodes) {
    if (node.type === 'article') return node.route

    const childRoute = findFirstRoute(node.children)
    if (childRoute) return childRoute
  }

  return ''
}

const countGroups = (nodes) => {
  return nodes.reduce((total, node) => {
    if (node.type === 'article') return total
    return total + 1 + countGroups(node.children)
  }, 0)
}

const enrichGroupStats = (nodes) => {
  return nodes.map((node) => {
    if (node.type === 'article') return node

    const children = enrichGroupStats(node.children)
    const childArticles = flattenArticles(children)

    return {
      ...node,
      children,
      articleCount: childArticles.length,
      words: childArticles.reduce((total, article) => total + article.words, 0),
      firstRoute: findFirstRoute(children),
    }
  })
}

const buildToc = async () => {
  const builder = createBuilder()
  const sectionConfigs = sidebar.filter((item) => typeof item !== 'string' && item.children?.length)
  const sections = []

  for (const [index, sectionConfig] of sectionConfigs.entries()) {
    const nodes = []

    if (sectionConfig.link && !hasDescendantPath(sectionConfig.children, sectionConfig.link)) {
      const articleNode = await builder.makeArticleNode(sectionConfig.link, [sectionConfig.text], '总览')
      if (articleNode) nodes.push(articleNode)
    }

    nodes.push(...(await builder.buildNodes(sectionConfig.children, [sectionConfig.text])))

    const children = enrichGroupStats(nodes)
    const sectionArticles = flattenArticles(children)

    if (sectionArticles.length > 0) {
      sections.push({
        key: `${index}-${sectionConfig.text}`,
        name: sectionConfig.text,
        children,
        articleCount: sectionArticles.length,
        words: sectionArticles.reduce((total, article) => total + article.words, 0),
        firstRoute: findFirstRoute(children),
      })
    }
  }

  const articles = builder.articles
  const readyCount = articles.filter((article) => article.hasContent).length
  const totalWords = articles.reduce((total, article) => total + article.words, 0)
  const topicCount = sections.reduce((total, section) => total + countGroups(section.children), 0)

  const lines = [
    '---',
    'title: 目录',
    'articleIndex: true',
    'comment: false',
    '---',
    '',
    '# 目录',
    '',
    '<!-- AUTO-GENERATED by scripts/generate-toc.mjs. Do not edit this file directly. -->',
    '',
    '<ArticleIndex />',
    '',
  ]

  await mkdir(path.dirname(path.join(rootDir, dataFile)), { recursive: true })
  await writeFile(
    path.join(rootDir, dataFile),
    `${JSON.stringify({ totalWords, articleCount: articles.length, readyCount, topicCount, sections, articles }, null, 2)}\n`,
    'utf8',
  )
  await readArticle('README.md', -1)
  const searchData = searchEntries.map((entry) => ({ ...entry, trail: articles.find((article) => article.filePath === entry.filePath)?.trail ?? [] }))
  await mkdir(path.join(rootDir, '.vuepress/public'), { recursive: true })
  await writeFile(path.join(rootDir, '.vuepress/public/search-index.json'), JSON.stringify(searchData), 'utf8')
  await writeFile(path.join(rootDir, outputFile), `${lines.join('\n')}\n`, 'utf8')
}

await buildToc()

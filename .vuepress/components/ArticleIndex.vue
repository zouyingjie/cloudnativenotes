<template>
  <div class="article-index">
    <div class="index-introduction">
      <p class="index-deck">从工程实践出发，理解系统背后的设计。</p>
      <p class="index-facts"><span>{{ data.sections.length }} 个部分</span><span>{{ data.articleCount }} 篇文章</span><span>{{ formatNumber(data.totalWords) }} 字</span></p>
    </div>
    <section class="index-tools" aria-label="筛选文章">
      <label class="search-box">
        <span class="search-symbol" aria-hidden="true"></span>
        <input v-model.trim="query" type="search" placeholder="搜索文章标题或主题" aria-label="搜索目录">
      </label>
      <label class="ready-filter"><input v-model="readyOnly" type="checkbox">只看已有正文</label>
      <div v-if="hasActiveFilter" class="result-meta" aria-live="polite">
        <span>{{ resultSummary }}</span>
        <button type="button" @click="resetFilters">清除筛选</button>
      </div>
    </section>
    <ol class="toc-sections">
      <li v-for="section in displaySections" :id="section.anchor" :key="section.key" class="toc-section">
        <header class="section-line">
          <span class="section-number" aria-hidden="true">{{ String(section.number).padStart(2, '0') }}</span>
          <h2 class="section-heading"><span class="sr-only">第 {{ section.number }} 部分：</span>{{ section.name }}</h2>
          <p class="section-description">{{ sectionDescriptions[section.number - 1] }}</p>
          <span class="section-meta">{{ section.articleCount }} 篇文章</span>
        </header>
        <ol class="toc-entries">
          <li v-for="row in section.rows" :key="row.key" class="toc-entry" :class="[`is-${row.node.type}`, `is-depth-${row.depth}`]" :style="{ '--entry-indent': row.indent }">
            <div v-if="row.node.type === 'group'" class="group-line">
              <RouterLink class="group-title" :to="row.node.firstRoute"><span class="entry-number">{{ row.node.number }}.</span> {{ row.node.text }}</RouterLink>
            </div>
            <RouterLink v-else class="article-line" :to="row.node.route">
              <span class="article-title"><span class="entry-number">{{ row.node.number }}</span><span>{{ row.node.title }}</span></span>
              <small :class="{ 'draft-status': !row.node.hasContent }">{{ row.node.hasContent ? `${formatNumber(row.node.words)} 字` : '待完善' }}</small>
            </RouterLink>
          </li>
        </ol>
      </li>
    </ol>
    <p v-if="displaySections.length === 0" class="empty-state">没有匹配的文章，请换个关键词试试。</p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import data from '../data/article-index.json'

const query = ref('')
const readyOnly = ref(false)
const sectionDescriptions = [
  '数据、接口与工程质量',
  '理解分布式系统的基本约束',
  '从理论走向工程实现',
  '构建、治理与运行现代应用',
  '技术之外的判断与思考',
]

const numberNodes = (nodes, prefix) => nodes.map((node, index) => {
  const number = [...prefix, index + 1]
  return {
    ...node,
    number: number.join('.'),
    ...(node.children ? { children: numberNodes(node.children, number) } : {}),
  }
})
const numberedSections = data.sections.map((section, index) => ({
  ...section,
  children: numberNodes(section.children, [index + 1]),
}))

const formatNumber = (value) => new Intl.NumberFormat('zh-CN').format(value ?? 0)
const normalizeText = (value) => String(value ?? '').toLowerCase()

const normalizedQuery = computed(() => normalizeText(query.value))

const getNodeArticles = (nodes) => {
  return nodes.flatMap((node) => {
    if (node.type === 'article') return [node]
    return getNodeArticles(node.children)
  })
}

const countGroups = (nodes) => {
  return nodes.reduce((total, node) => {
    if (node.type === 'article') return total
    return total + 1 + countGroups(node.children)
  }, 0)
}

const getFirstRoute = (nodes) => {
  for (const node of nodes) {
    if (node.type === 'article') return node.route

    const childRoute = getFirstRoute(node.children)
    if (childRoute) return childRoute
  }

  return '/end/toc.html'
}

const matchesQuery = (values) => {
  if (normalizedQuery.value === '') return true
  return values.map(normalizeText).join(' ').includes(normalizedQuery.value)
}

const filterNodes = (nodes, inheritedMatch = false) => {
  if (normalizedQuery.value === '' && !readyOnly.value) return nodes

  return nodes
    .map((node) => {
      if (node.type === 'article') {
        if (readyOnly.value && !node.hasContent) return null
        const articleMatch = inheritedMatch || matchesQuery([
          node.title,
          node.filePath,
          node.trail?.join(' '),
        ])

        return articleMatch ? node : null
      }

      const groupMatch = inheritedMatch || matchesQuery([node.text])
      const children = filterNodes(node.children, groupMatch)

      if (children.length === 0) return null

      const articles = getNodeArticles(children)

      return {
        ...node,
        children,
        articleCount: articles.length,
        words: articles.reduce((total, article) => total + article.words, 0),
        firstRoute: getFirstRoute(children),
      }
    })
    .filter(Boolean)
}

const flattenRows = (nodes, sectionNumber, prefix = [], depth = 1) => {
  return nodes.flatMap((node, index) => {
    const currentPrefix = [...prefix, index + 1]
    const row = {
      key: node.type === 'article' ? node.filePath : `${sectionNumber}-${currentPrefix.join('.')}-${node.text}`,
      node,
      depth,
      indent: `${Math.max(0, depth - 1) * 1.2}rem`,
    }

    if (node.type === 'article') return [row]

    return [
      row,
      ...flattenRows(node.children, sectionNumber, currentPrefix, depth + 1),
    ]
  })
}

const displaySections = computed(() => {
  return numberedSections
    .map((section, index) => {
      const sectionMatch = normalizedQuery.value !== '' && matchesQuery([section.name])
      const children = filterNodes(section.children, sectionMatch)
      const articles = getNodeArticles(children)

      return {
        ...section,
        number: index + 1,
        anchor: `part-${index + 1}`,
        children,
        rows: flattenRows(children, index + 1),
        articleCount: articles.length,
        topicCount: countGroups(children),
        words: articles.reduce((total, article) => total + article.words, 0),
        firstRoute: getFirstRoute(children),
      }
    })
    .filter((section) => section.articleCount > 0)
})

const visibleTopicCount = computed(() => {
  return displaySections.value.reduce((total, section) => total + section.topicCount, 0)
})

const visibleArticleCount = computed(() => {
  return displaySections.value.reduce((total, section) => total + section.articleCount, 0)
})

const resultSummary = computed(() => {
  if (normalizedQuery.value === '' && !readyOnly.value) return '全部章节'
  return `显示 ${visibleArticleCount.value} 篇，${visibleTopicCount.value} 个主题`
})

const hasActiveFilter = computed(() => query.value !== '' || readyOnly.value)

const resetFilters = () => {
  query.value = ''
  readyOnly.value = false
}
</script>

<style scoped>
.article-index { color: var(--c-text); font-family: var(--font-family); }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.index-introduction { margin-bottom: 30px; }
.article-index .index-deck { margin: 0 0 14px; color: var(--c-text-light); font-size: 1rem; }
.article-index .index-facts { display: flex; flex-wrap: wrap; gap: 6px 0; margin: 0; color: var(--c-text-lighter); font-size: .76rem; font-variant-numeric: tabular-nums; }
.index-facts span + span::before { content: '/'; margin: 0 14px; color: var(--cn-border-strong); }
.index-tools { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 10px 24px; margin: 0 0 28px; padding: 10px 0; border-block: 1px solid var(--cn-border); }
.search-box { box-sizing: border-box; display: flex; align-items: center; gap: 12px; max-width: 360px; min-width: 0; padding: 0 2px; color: var(--c-text-lighter); }
.search-box .search-symbol { flex: none; width: 11px; height: 11px; }
.search-box input { box-sizing: border-box; width: 100%; min-width: 0; height: 32px; border: 0; outline: 0; padding: 0; background: transparent; color: var(--c-text); font: inherit; font-size: .83rem; }
.search-box input::placeholder { color: var(--c-text-lighter); opacity: 1; }
.search-box:focus-within { color: var(--cn-accent); outline: 2px solid var(--cn-accent); outline-offset: 5px; }
.ready-filter { display: flex; align-items: center; gap: 7px; min-height: 32px; color: var(--c-text-light); font-size: .76rem; cursor: pointer; }
.ready-filter input { margin: 0; accent-color: var(--cn-accent); }
.result-meta { grid-column: 1 / -1; display: flex; align-items: center; gap: 18px; color: var(--c-text-light); font-size: .8rem; }
.result-meta button { border: 0; padding: 5px 0; color: var(--cn-blue); background: none; font: inherit; cursor: pointer; }
.article-index .toc-sections, .article-index .toc-entries { margin: 0; padding: 0; list-style: none; }
.article-index .toc-section { display: grid; grid-template-columns: minmax(0, 1fr); gap: 22px; margin: 0; padding: 32px 0 36px; border-bottom: 1px solid var(--cn-border); scroll-margin-top: calc(var(--navbar-height) + 24px); }
.article-index .toc-section:first-child { padding-top: 8px; }
.section-line { display: grid; grid-template-columns: 60px minmax(0, 1fr) auto; align-items: center; gap: 4px 16px; }
.section-number { display: block; grid-row: span 2; margin: 0; color: var(--cn-accent); font-family: var(--font-family-display); font-size: 3rem; font-weight: 400; line-height: 1; letter-spacing: -.06em; }
.article-index .section-heading { margin: 0; padding: 0; border: 0 !important; font-family: var(--font-family-display); font-size: 1.45rem; font-weight: 700; line-height: 1.5; letter-spacing: .03em; }
.article-index .section-description { grid-column: 2; margin: 0; color: var(--c-text-light); font-size: .74rem; line-height: 1.8; }
.section-meta { grid-column: 3; grid-row: 1 / span 2; color: var(--c-text-lighter); font-size: .7rem; }
.article-index .toc-entry { margin: 0; padding-left: var(--entry-indent); }
.group-line { padding: 16px 0 5px; }
.toc-entry:first-child > .group-line { padding-top: 0; }
.article-index .group-title { color: var(--c-text); font-size: .86rem; font-weight: 600; text-decoration: none; }
.group-title .entry-number { margin-right: 6px; }
.entry-number { flex: none; color: var(--c-text-lighter); font-family: var(--font-family-code); font-size: .66rem; font-weight: 400; font-variant-numeric: tabular-nums; }
.article-index .article-line { box-sizing: border-box; display: flex; align-items: baseline; justify-content: space-between; gap: 16px; min-height: 38px; padding: 7px 0; border-bottom: 1px solid var(--cn-border-muted); color: var(--c-text-light); text-decoration: none; }
.article-title { display: flex; align-items: baseline; gap: 12px; min-width: 0; font-size: .9rem; line-height: 1.7; overflow-wrap: anywhere; }
.article-title .entry-number { min-width: 3.4em; }
.article-line small { flex: none; color: var(--c-text-lighter); font-size: .68rem; white-space: nowrap; font-variant-numeric: tabular-nums; }
.article-line .draft-status { font-size: .68rem; }
.article-index .article-line:hover { color: var(--cn-accent); border-bottom-color: var(--cn-accent); }
.article-index .article-line:hover .article-title > span:last-child, .article-index .group-title:hover { color: var(--cn-accent); }
.article-index a:focus-visible, .article-index button:focus-visible { outline: 2px solid var(--cn-accent); outline-offset: 3px; }
.article-index .empty-state { padding: 20px 0; color: var(--c-text-light); }
@media (min-width: 720px) and (max-width: 1100px) {
  .article-index .toc-section { grid-template-columns: 1fr; gap: 20px; }
  .section-line { display: grid; grid-template-columns: 52px 1fr auto; align-items: center; gap: 4px 14px; }
  .section-number { grid-row: span 2; margin: 0; font-size: 2.5rem; }
  .article-index .section-description { grid-column: 2; margin: 0; }
  .section-meta { grid-column: 3; grid-row: 1 / span 2; }
}
@media (max-width: 719px) {
  .index-introduction { margin-bottom: 24px; }
  .article-index .index-deck { font-size: .9rem; }
  .index-tools { gap: 6px 12px; margin-bottom: 24px; }
  .search-box input { font-size: 16px; height: 40px; }
  .ready-filter { font-size: .72rem; min-height: 40px; }
  .article-index .toc-section { grid-template-columns: 1fr; gap: 20px; padding-block: 26px; }
  .section-line { display: grid; grid-template-columns: 52px 1fr auto; align-items: center; gap: 4px 14px; }
  .section-number { grid-row: span 2; margin: 0; font-size: 2.7rem; }
  .article-index .section-heading { font-size: 1.35rem; }
  .article-index .section-description { grid-column: 2; margin: 0; font-size: .7rem; }
  .section-meta { grid-column: 3; grid-row: 1 / span 2; font-size: .66rem; }
  .article-index .toc-entry { padding-left: calc(var(--entry-indent) * .6); }
  .article-index .article-line { min-height: 44px; gap: 10px; }
  .article-title { font-size: .88rem; gap: 8px; }
  .article-title .entry-number { font-size: .62rem; min-width: 3em; }
  .article-line small { font-size: .66rem; }
}
@media (max-width: 419px) {
  .index-tools { grid-template-columns: 1fr; gap: 0; }
  .section-line { column-gap: 10px; }
  .article-index .article-line { gap: 8px; }
}
@media print { .index-tools { display: none; } }
</style>

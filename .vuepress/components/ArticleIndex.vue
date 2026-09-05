<template>
  <div class="article-index">
    <section class="index-tools" aria-label="筛选文章">
      <p class="index-stats">
        {{ formatNumber(data.readyCount) }} 篇正文 · {{ data.articleCount - data.readyCount }} 篇待完善 · {{ formatNumber(data.totalWords) }} 字
      </p>

      <label class="search-box">
        <span class="visually-hidden">搜索</span>
        <input
          v-model.trim="query"
          type="search"
          placeholder="标题、主题、路径"
        >
      </label>

      <label class="ready-filter"><input v-model="readyOnly" type="checkbox">只看已有正文</label>
      <div class="result-meta" aria-live="polite">
        <span>{{ resultSummary }}</span>
        <button v-if="hasActiveFilter" type="button" @click="resetFilters">清除</button>
      </div>
    </section>

    <ol class="toc-sections">
      <li
        v-for="section in displaySections"
        :key="section.key"
        class="toc-section"
      >
        <header class="section-line">
          <RouterLink class="section-title" :to="section.firstRoute">
            <span>{{ section.name }}</span>
          </RouterLink>
          <span class="section-meta">{{ section.articleCount }} 篇 · {{ formatNumber(section.words) }} 字</span>
        </header>

        <ol class="toc-entries">
          <li
            v-for="row in section.rows"
            :key="row.key"
            class="toc-entry"
            :class="[`is-${row.node.type}`, `is-depth-${row.depth}`]"
            :style="{ paddingLeft: row.indent }"
          >
            <div v-if="row.node.type === 'group'" class="entry-line group-line">
              <RouterLink class="group-title" :to="row.node.firstRoute">
                <span>{{ row.node.text }}</span>
              </RouterLink>
              <span class="entry-meta">{{ row.node.articleCount }} 篇 · {{ formatNumber(row.node.words) }} 字</span>
            </div>

            <div v-else class="entry-line article-line">
              <RouterLink class="article-title" :to="row.node.route">
                <span>{{ row.node.title }}</span>
              </RouterLink>
              <small :class="{ 'draft-status': !row.node.hasContent }">{{ row.node.hasContent ? `${formatNumber(row.node.words)} 字` : '待完善' }}</small>
            </div>
          </li>
        </ol>
      </li>
    </ol>

    <p v-if="displaySections.length === 0" class="empty-state">
      没有匹配的文章。
    </p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import data from '../data/article-index.json'

const query = ref('')
const readyOnly = ref(false)

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
      indent: `${depth * .95}rem`,
    }

    if (node.type === 'article') return [row]

    return [
      row,
      ...flattenRows(node.children, sectionNumber, currentPrefix, depth + 1),
    ]
  })
}

const displaySections = computed(() => {
  return data.sections
    .map((section, index) => {
      const sectionMatch = normalizedQuery.value !== '' && matchesQuery([section.name])
      const children = filterNodes(section.children, sectionMatch)
      const articles = getNodeArticles(children)

      return {
        ...section,
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
.article-index {
  --index-surface: var(--cn-surface, #fff);
  --index-muted: var(--cn-surface-muted, #f6f8fa);
  --index-text: var(--c-text, #24292f);
  --index-subtle: var(--c-text-light, #57606a);
  --index-faint: var(--c-text-lighter, #6e7781);
  --index-border: var(--cn-border, #d0d7de);
  --index-accent: var(--cn-blue, #0969da);
  box-sizing: border-box;
  margin-top: .35rem;
  color: var(--index-text);
  font-family: var(--font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
}

.index-tools {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: .75rem;
  align-items: center;
  margin-bottom: 1.45rem;
  padding: .68rem 0 .95rem;
  border-bottom: 1px solid var(--index-border);
}

.index-stats {
  grid-column: 1 / -1;
  margin: 0;
  color: var(--index-subtle);
  font-size: .9rem;
  line-height: 1.5;
  white-space: normal;
}

.search-box {
  display: grid;
  color: var(--index-subtle);
  font-size: .82rem;
  font-weight: 700;
}

.search-box input {
  box-sizing: border-box;
  width: 100%;
  min-height: 34px;
  padding: 0 .65rem;
  border: 1px solid var(--index-border);
  border-radius: 6px;
  color: var(--index-text);
  background: var(--index-surface);
  font-family: inherit;
}

.ready-filter {
  display: flex;
  gap: .4rem;
  align-items: center;
  font-size: .85rem;
  color: var(--index-subtle);
}
.ready-filter input { accent-color: var(--index-accent); }
.draft-status { font-style: italic; }
.result-meta {
  display: flex;
  gap: .6rem;
  align-items: center;
  justify-content: space-between;
  grid-column: 1 / -1;
  min-height: 34px;
  color: var(--index-subtle);
  font-size: .86rem;
}

.result-meta button {
  min-height: 32px;
  padding: 0 .62rem;
  border: 1px solid var(--index-border);
  border-radius: 6px;
  color: var(--index-text);
  background: var(--index-surface);
  font-family: inherit;
  cursor: pointer;
}

.toc-sections,
.toc-entries {
  margin: 0;
  padding: 0;
  list-style: none;
}

.toc-sections {
  display: grid;
  gap: 1.12rem;
}

.toc-section {
  padding-bottom: .9rem;
  border-bottom: 1px solid var(--index-border);
}

.toc-section:last-child {
  border-bottom: 0;
}

.section-line,
.entry-line {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: baseline;
}

.section-line {
  margin-bottom: .35rem;
}

.section-title,
.group-title,
.article-title {
  display: inline-flex;
  gap: .45rem;
  min-width: 0;
  color: var(--index-text);
  text-decoration: none;
}

.section-title {
  color: var(--index-text);
  font-size: .98rem;
  font-weight: 700;
}

.group-title {
  color: var(--index-subtle);
  font-size: .94rem;
  font-weight: 500;
}

.article-title {
  color: var(--index-accent);
  font-size: .93rem;
  overflow-wrap: anywhere;
}

.section-title:hover,
.group-title:hover,
.article-title:hover {
  color: var(--index-accent);
}

.section-meta,
.entry-meta,
.article-line small {
  color: var(--index-faint);
  font-size: .82rem;
  white-space: nowrap;
}

.toc-entries {
  margin-left: 0;
}

.toc-entry {
  margin: .04rem 0;
}

.toc-entry.is-group {
  margin-top: .22rem;
}

.toc-entry.is-article {
  min-height: 2.2rem;
}

.toc-entry.is-group.is-depth-1 {
  margin-top: .18rem;
}

.toc-entry.is-group.is-depth-1 .group-title {
  color: var(--index-subtle);
  font-weight: 600;
}

.toc-entry.is-group:not(.is-depth-1) .group-title {
  color: var(--index-subtle);
  font-size: .92rem;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

.empty-state {
  padding: 1.4rem;
  border: 1px dashed var(--index-accent);
  border-radius: 8px;
  color: var(--index-subtle);
  text-align: center;
}

@media (max-width: 760px) {
  .index-tools {
    grid-template-columns: 1fr;
    align-items: stretch;
  }

  .index-stats {
  grid-column: 1 / -1;
    white-space: normal;
  }

  .section-line,
  .entry-line {
    grid-template-columns: 1fr;
    gap: .35rem;
  }

  .toc-entries {
    margin-left: 0;
  }

  .result-meta {
    justify-content: flex-start;
  }

  .section-meta,
  .entry-meta,
  .article-line small {
    white-space: normal;
  }
}
</style>

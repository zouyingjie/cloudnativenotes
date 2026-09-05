<template>
  <button ref="trigger" type="button" class="book-search-trigger" aria-label="搜索笔记" aria-haspopup="dialog" @click="openSearch">
    <span class="search-symbol" aria-hidden="true"></span><span class="search-label">搜索笔记</span><kbd aria-hidden="true">{{ shortcut }}</kbd>
  </button>
  <ClientOnly>
    <Teleport to="body">
      <dialog ref="dialog" class="book-search-dialog" aria-labelledby="book-search-title" @click="onBackdrop" @close="onClose" @keydown="onKeydown">
        <div class="book-search-heading"><h2 id="book-search-title">搜索笔记</h2><button type="button" @click="closeSearch">关闭</button></div>
        <input ref="input" v-model="query" type="search" aria-label="搜索标题或正文" placeholder="搜索概念、问题或文章…" autocomplete="off">
        <p class="search-status" role="status">{{ status }}</p>
        <ul v-if="results.length" class="book-search-results">
          <li v-for="result in results" :key="result.route">
            <RouterLink :to="result.route" @click="closeSearch"><strong>{{ result.title }}</strong><span>{{ result.trail?.join(' / ') || '前言' }}</span><p>{{ result.excerpt }}</p></RouterLink>
          </li>
        </ul>
        <button v-if="error" type="button" class="search-retry" @click="loadIndex">重新加载</button>
      </dialog>
    </Teleport>
  </ClientOnly>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { withBase } from '@vuepress/client'

const trigger = ref(null)
const dialog = ref(null)
const input = ref(null)
const query = ref('')
const entries = ref([])
const loading = ref(false)
const error = ref(false)
const loaded = ref(false)
const shortcut = ref('Ctrl K')
const terms = computed(() => query.value.trim().toLocaleLowerCase().split(/\s+/u).filter(Boolean))
const results = computed(() => {
  if (!terms.value.length) return []
  return entries.value.map((entry) => {
    const title = entry.title.toLocaleLowerCase()
    const searchable = `${entry.title} ${entry.trail?.join(' ')} ${entry.text}`.toLocaleLowerCase()
    const score = terms.value.every((term) => searchable.includes(term)) ? terms.value.reduce((sum, term) => sum + (title.includes(term) ? 10 : 1), 0) : 0
    const index = entry.text.toLocaleLowerCase().indexOf(terms.value[0])
    const start = Math.max(0, index - 38)
    return { ...entry, score, excerpt: `${start ? '…' : ''}${entry.text.slice(start, start + 125)}${entry.text.length > start + 125 ? '…' : ''}` }
  }).filter((entry) => entry.score > 0).sort((a, b) => b.score - a.score).slice(0, 20)
})
const status = computed(() => loading.value ? '正在加载搜索索引…' : error.value ? '搜索索引加载失败，请重试。' : !terms.value.length ? '搜索全书标题和正文，例如“Buffer Pool”或“分布式锁”。' : results.value.length ? `找到 ${results.value.length}${results.value.length === 20 ? '+' : ''} 篇相关内容` : '没有匹配的内容，试试其他关键词。')
const loadIndex = async () => {
  if (loaded.value || loading.value) return
  loading.value = true
  error.value = false
  try {
    const response = await fetch(withBase('/search-index.json'))
    if (!response.ok) throw new Error('Search index unavailable')
    entries.value = await response.json()
    loaded.value = true
  } catch { error.value = true } finally { loading.value = false }
}
const openSearch = async () => {
  await nextTick()
  if (!dialog.value || dialog.value.open) return
  dialog.value.showModal()
  document.documentElement.classList.add('search-open')
  input.value?.focus()
  void loadIndex()
}
const closeSearch = () => dialog.value?.close()
const onClose = () => {
  document.documentElement.classList.remove('search-open')
  trigger.value?.focus({ preventScroll: true })
}
const onBackdrop = (event) => {
  if (event.target !== dialog.value) return
  const bounds = dialog.value.getBoundingClientRect()
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeSearch()
}
const onKeydown = (event) => {
  if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return
  const links = [...dialog.value.querySelectorAll('.book-search-results a')]
  if (!links.length) return
  event.preventDefault()
  const current = links.indexOf(document.activeElement)
  const next = event.key === 'ArrowDown' ? (current + 1) % links.length : (current <= 0 ? links.length - 1 : current - 1)
  links[next].focus()
}
const shortcutHandler = (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    if (dialog.value?.open) closeSearch()
    else void openSearch()
  }
}
onMounted(() => {
  shortcut.value = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ K' : 'Ctrl K'
  window.addEventListener('keydown', shortcutHandler)
})
onUnmounted(() => {
  window.removeEventListener('keydown', shortcutHandler)
  document.documentElement.classList.remove('search-open')
})
</script>

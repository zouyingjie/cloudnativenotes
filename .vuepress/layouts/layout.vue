<template>
  <div class="theme-container reading-theme" :class="{ 'sidebar-open': sidebarOpen, 'has-outline': hasOutline, 'is-index': isIndex }">
    <a class="skip-to-content" href="#main-content">跳到正文</a>
    <header class="navbar">
      <button ref="menuButton" type="button" class="toggle-sidebar-button" aria-label="全书章节" aria-controls="book-sidebar" :aria-expanded="sidebarOpen" @click="sidebarOpen = !sidebarOpen"><span class="icon" aria-hidden="true"><span></span><span></span><span></span></span></button>
      <RouterLink to="/" class="book-brand" aria-label="云原生架构笔记 · 首页">
        <svg class="book-mark" viewBox="0 0 36 36" fill="none" aria-hidden="true"><path d="M5 7h10c3 0 3 2 3 2s0-2 3-2h10v23H21c-3 0-3 2-3 2s0-2-3-2H5V7Z" stroke="currentColor" stroke-width="1.5"/><path d="M18 10v18M9 13h5M9 18h5M22 18h5M22 23h5" stroke="currentColor" stroke-width="1.5"/><path d="M24 4h5v9l-2.5-2-2.5 2V4Z" fill="var(--cn-accent)"/></svg>
        <span class="site-name">云原生架构笔记</span>
      </RouterLink>
      <div class="navbar-items-wrapper"><NavbarItems class="can-hide" /><BookSearch /><ToggleColorModeButton /></div>
    </header>
    <div class="sidebar-mask" aria-hidden="true" @click="sidebarOpen = false"></div>
    <aside id="book-sidebar" ref="sidebar" class="sidebar" :inert="isMobile && !sidebarOpen" :aria-hidden="isMobile && !sidebarOpen ? true : undefined">
      <NavbarItems />
      <div class="sidebar-caption"><span>阅读导航</span><span aria-hidden="true">CONTENTS</span></div>
      <nav aria-label="全书章节"><ul class="chapter-tree"><BookSidebarItem v-for="item in sidebarItems" :key="item.link || item.text" :item="item" /></ul></nav>
      <div class="sidebar-note">从工程实践出发，<br>理解系统背后的设计。<a href="https://github.com/zouyingjie/cloudnativenotes" target="_blank" rel="noopener noreferrer">GitHub · 交流与勘误 ↗</a></div>
    </aside>
    <main id="main-content" class="page reading-main" tabindex="-1">
      <div class="theme-default-content">
        <div v-if="isIndex" class="book-kicker"><span>云原生架构笔记</span><span aria-hidden="true">CLOUD NATIVE NOTES</span></div>
        <Content :key="page.path" />
        <div v-if="!isIndex" class="page-info"><GithubButton data-icon="octicon-star" href="https://github.com/zouyingjie/cloudnativenotes">Star 关注</GithubButton><span v-if="pageWords">{{ pageWords.toLocaleString('zh-CN') }} 字</span></div>
        <CommentService v-if="!isIndex && frontmatter.comment !== false" :key="page.path" :darkmode="isDarkMode" class="layout-comment" />
      </div>
      <PageMeta />
      <PageNav />
    </main>
    <PageOutline />
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { usePageData, usePageFrontmatter } from '@vuepress/client'
import { useRoute } from 'vue-router'
import { useDarkMode, useSidebarItems } from '@vuepress/theme-default/lib/client/composables/index.js'
import NavbarItems from '@vuepress/theme-default/lib/client/components/NavbarItems.vue'
import ToggleColorModeButton from '@vuepress/theme-default/lib/client/components/ToggleColorModeButton.vue'
import PageMeta from '@vuepress/theme-default/lib/client/components/PageMeta.vue'
import PageNav from '@vuepress/theme-default/lib/client/components/PageNav.vue'
import { useReadingTimeData } from 'vuepress-plugin-reading-time2/client'
import GithubButton from 'vue-github-button'
import BookSidebarItem from '../components/BookSidebarItem.vue'
import BookSearch from '../components/BookSearch.vue'
import PageOutline from '../components/PageOutline.vue'

const page = usePageData()
const frontmatter = usePageFrontmatter()
const route = useRoute()
const sidebarItems = useSidebarItems()
const isDarkMode = useDarkMode()
const readingTime = useReadingTimeData()
const pageWords = computed(() => readingTime.value?.words ?? 0)
const isIndex = computed(() => frontmatter.value.articleIndex === true)
const hasOutline = computed(() => !isIndex.value && Boolean(page.value.headers?.length))
const sidebarOpen = ref(false)
const isMobile = ref(false)
const menuButton = ref(null)
const sidebar = ref(null)
let mobileQuery
let sidebarFrame = 0
const revealCurrentChapter = () => {
  if (typeof window === 'undefined') return
  cancelAnimationFrame(sidebarFrame)
  sidebarFrame = requestAnimationFrame(() => {
    const container = sidebar.value
    const current = container?.querySelector('[aria-current="page"]')
    if (!current || (isMobile.value && !sidebarOpen.value)) return
    const bounds = container.getBoundingClientRect()
    const item = current.getBoundingClientRect()
    if (item.top < bounds.top + 16 || item.bottom > bounds.bottom - 16) {
      container.scrollTop += item.top - bounds.top - container.clientHeight / 3
    }
  })
}
const syncMobile = () => {
  isMobile.value = mobileQuery.matches
  if (!isMobile.value) sidebarOpen.value = false
  revealCurrentChapter()
}
const closeOnEscape = (event) => {
  if (event.key === 'Escape' && sidebarOpen.value) {
    sidebarOpen.value = false
    menuButton.value?.focus()
  }
}
watch(() => route.path, async () => {
  sidebarOpen.value = false
  await nextTick()
  revealCurrentChapter()
})
watch(sidebarOpen, async (open) => {
  if (typeof document !== 'undefined') document.documentElement.classList.toggle('book-menu-open', open)
  if (open) {
    await nextTick()
    revealCurrentChapter()
  }
})
onMounted(() => {
  mobileQuery = window.matchMedia('(max-width: 719px)')
  syncMobile()
  mobileQuery.addEventListener('change', syncMobile)
  window.addEventListener('keydown', closeOnEscape)
})
onUnmounted(() => {
  mobileQuery?.removeEventListener('change', syncMobile)
  window.removeEventListener('keydown', closeOnEscape)
  document.documentElement.classList.remove('book-menu-open')
  cancelAnimationFrame(sidebarFrame)
})
</script>

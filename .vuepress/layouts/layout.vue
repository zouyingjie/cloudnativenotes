<template>
  <div class="theme-container reading-theme" :class="{ 'sidebar-open': sidebarOpen, 'focus-reading': focusReading, 'has-outline': hasOutline, 'is-index': isIndex }">
    <a class="skip-to-content" href="#main-content">跳到正文</a>
    <header class="navbar">
      <button ref="menuButton" type="button" class="toggle-sidebar-button" aria-label="全书章节" aria-controls="book-sidebar" :aria-expanded="sidebarOpen" @click="sidebarOpen = !sidebarOpen"><span class="icon" aria-hidden="true"><span></span><span></span><span></span></span></button>
      <NavbarBrand />
      <div class="navbar-items-wrapper"><NavbarItems class="can-hide" /><BookSearch /><ToggleColorModeButton /></div>
    </header>
    <div class="sidebar-mask" aria-hidden="true" @click="sidebarOpen = false"></div>
    <aside id="book-sidebar" class="sidebar" :inert="(isMobile && !sidebarOpen) || (focusReading && !isMobile)">
      <NavbarItems />
      <p class="chapter-label">全书章节</p>
      <nav aria-label="全书章节"><ul class="chapter-tree"><BookSidebarItem v-for="item in sidebarItems" :key="item.link || item.text" :item="item" /></ul></nav>
      <div class="sidebar-note">从工程实践出发，<br>理解系统背后的设计。<a href="https://github.com/zouyingjie/cloudnativenotes" target="_blank" rel="noopener noreferrer">GitHub · 交流与勘误 ↗</a></div>
    </aside>
    <main id="main-content" class="page reading-main" tabindex="-1">
      <div class="theme-default-content">
        <div class="reading-toolbar">
          <span class="reading-trail">{{ breadcrumb }}</span>
          <button type="button" class="focus-toggle" :aria-pressed="focusReading" @click="focusReading = !focusReading">{{ focusReading ? '退出专注' : '专注阅读' }}</button>
        </div>
        <PageOutline compact />
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
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { usePageData, usePageFrontmatter } from '@vuepress/client'
import { useRoute } from 'vue-router'
import { useDarkMode, useSidebarItems } from '@vuepress/theme-default/lib/client/composables/index.js'
import NavbarBrand from '@vuepress/theme-default/lib/client/components/NavbarBrand.vue'
import NavbarItems from '@vuepress/theme-default/lib/client/components/NavbarItems.vue'
import ToggleColorModeButton from '@vuepress/theme-default/lib/client/components/ToggleColorModeButton.vue'
import PageMeta from '@vuepress/theme-default/lib/client/components/PageMeta.vue'
import PageNav from '@vuepress/theme-default/lib/client/components/PageNav.vue'
import { useReadingTimeData } from 'vuepress-plugin-reading-time2/client'
import GithubButton from 'vue-github-button'
import BookSidebarItem from '../components/BookSidebarItem.vue'
import BookSearch from '../components/BookSearch.vue'
import PageOutline from '../components/PageOutline.vue'
import data from '../data/article-index.json'

const page = usePageData()
const frontmatter = usePageFrontmatter()
const route = useRoute()
const sidebarItems = useSidebarItems()
const isDarkMode = useDarkMode()
const readingTime = useReadingTimeData()
const pageWords = computed(() => readingTime.value?.words ?? 0)
const isIndex = computed(() => frontmatter.value.articleIndex === true)
const hasOutline = computed(() => !isIndex.value && Boolean(page.value.headers?.length))
const article = computed(() => data.articles.find((entry) => entry.filePath === page.value.filePathRelative))
const breadcrumb = computed(() => article.value?.trail?.join(' / ') || (isIndex.value ? '全书目录' : page.value.title))
const sidebarOpen = ref(false)
const focusReading = ref(false)
const isMobile = ref(false)
const menuButton = ref(null)
let mobileQuery
const syncMobile = () => {
  isMobile.value = mobileQuery.matches
  if (!isMobile.value) sidebarOpen.value = false
}
const closeOnEscape = (event) => {
  if (event.key === 'Escape' && sidebarOpen.value) {
    sidebarOpen.value = false
    menuButton.value?.focus()
  }
}
watch(() => route.path, () => { sidebarOpen.value = false })
watch(sidebarOpen, (open) => {
  if (typeof document !== 'undefined') document.documentElement.classList.toggle('book-menu-open', open)
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
})
</script>

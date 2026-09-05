<template>
  <component
    :is="compact ? 'details' : 'aside'"
    v-if="visible && items.length"
    ref="outline"
    :class="compact ? 'mobile-outline' : 'page-outline'"
    aria-label="本页目录"
  >
    <summary v-if="compact">本页目录</summary>
    <p v-else class="outline-title">本页内容</p>
    <nav>
      <ul class="outline-list">
        <li v-for="item in items" :key="item.link" :class="{ 'outline-child': item.depth > 0 }">
          <a :href="item.link" :class="{ active: activeHash === normalizeHash(item.link) }" :aria-current="activeHash === normalizeHash(item.link) ? 'location' : undefined" @click="navigate($event, item.link)">{{ item.title }}</a>
        </li>
      </ul>
    </nav>
  </component>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { usePageData, usePageFrontmatter } from '@vuepress/client'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps({ compact: Boolean })
const page = usePageData()
const frontmatter = usePageFrontmatter()
const route = useRoute()
const router = useRouter()
const outline = ref(null)
const activeHash = ref('')
const visible = computed(() => frontmatter.value.articleIndex !== true && frontmatter.value.sidebar !== false)
const flatten = (headers, depth = 0) => headers.flatMap((header) => [{ ...header, depth }, ...(depth < 1 ? flatten(header.children ?? [], depth + 1) : [])])
const items = computed(() => {
  const headers = page.value.headers ?? []
  return flatten(headers[0]?.level === 1 ? headers[0].children ?? [] : headers)
})
const normalizeHash = (hash = '') => {
  try { return decodeURIComponent(hash) } catch { return hash }
}
let headings = []
let frame = 0
let observer
let mounted = false

const updateActive = () => {
  frame = 0
  if (!headings.length) return
  const top = (document.querySelector('.navbar')?.getBoundingClientRect().bottom ?? 60) + 32
  let current = headings[0]
  for (const heading of headings) {
    if (heading.element.getBoundingClientRect().top <= top) current = heading
    else break
  }
  activeHash.value = normalizeHash(current.link)
}
const scheduleUpdate = () => {
  if (!frame) frame = requestAnimationFrame(updateActive)
}
const refresh = () => {
  headings = items.value.map((item) => ({ link: item.link, element: document.getElementById(normalizeHash(item.link).slice(1)) })).filter((item) => item.element)
  scheduleUpdate()
}
const navigate = async (event, hash) => {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  if (props.compact && outline.value) outline.value.open = false
  await router.push({ hash })
  activeHash.value = normalizeHash(hash)
}
watch(() => route.path, async () => {
  if (!mounted) return
  if (props.compact && outline.value) outline.value.open = false
  await nextTick()
  refresh()
})
onMounted(() => {
  mounted = true
  refresh()
  window.addEventListener('scroll', scheduleUpdate, { passive: true })
  window.addEventListener('resize', refresh)
  observer = new MutationObserver(refresh)
  const content = document.querySelector('.reading-main')
  if (content) observer.observe(content, { childList: true, subtree: true })
})
onUnmounted(() => {
  mounted = false
  cancelAnimationFrame(frame)
  observer?.disconnect()
  window.removeEventListener('scroll', scheduleUpdate)
  window.removeEventListener('resize', refresh)
})
</script>

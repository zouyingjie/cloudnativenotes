<template>
  <aside v-if="showOutline && outlineItems.length" class="page-outline" aria-label="本页目录">
    <p class="outline-title">本页导航</p>
    <nav>
      <ul class="outline-list">
        <li v-for="item in outlineItems" :key="item.link">
          <a
            :href="item.link"
            :class="{ active: isActive(item.link) }"
            @click.prevent="scrollToHeader(item.link)"
          >
            {{ item.title }}
          </a>
          <ul v-if="item.children?.length">
            <li v-for="child in item.children" :key="child.link">
              <a
                :href="child.link"
                :class="{ active: isActive(child.link) }"
                @click.prevent="scrollToHeader(child.link)"
              >
                {{ child.title }}
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePageData, usePageFrontmatter } from '@vuepress/client'

const page = usePageData()
const frontmatter = usePageFrontmatter()
const route = useRoute()
const router = useRouter()
const activeHash = ref('')

const outlineItems = computed(() => {
  const headers = page.value.headers ?? []
  if (headers[0]?.level === 1) return headers[0].children ?? []

  return headers
})

const showOutline = computed(() => frontmatter.value.articleIndex !== true)

const normalizeHash = (hash) => {
  if (!hash) return ''

  try {
    return decodeURIComponent(hash)
  } catch {
    return hash
  }
}

const getHeaderElement = (hash) => {
  const id = normalizeHash(hash).slice(1)
  if (!id) return null

  return document.getElementById(id)
}

const scrollToHash = async (hash, behavior = 'smooth') => {
  await nextTick()

  requestAnimationFrame(() => {
    getHeaderElement(hash)?.scrollIntoView({
      behavior,
      block: 'start',
    })
  })
}

const scrollToHeader = async (hash) => {
  const normalizedHash = normalizeHash(hash)
  activeHash.value = normalizedHash

  if (route.hash !== hash) {
    await router.replace({ hash })
  }

  await scrollToHash(normalizedHash)
}

const isActive = (hash) => activeHash.value === normalizeHash(hash)

watch(
  () => route.hash,
  (hash) => {
    activeHash.value = normalizeHash(hash)
  },
  { immediate: true }
)
</script>

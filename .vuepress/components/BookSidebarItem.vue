<template>
  <li class="chapter-node" :class="{ 'chapter-section': depth === 0 && item.children?.length }">
    <template v-if="item.children?.length">
      <div
        class="chapter-group"
        :class="{ 'in-current-section': active }"
      >
        {{ item.text }}
      </div>
      <ul class="chapter-children">
        <li v-if="hasOwnPage">
          <RouterLink :to="item.link" class="chapter-link" :class="{ active: isCurrent(item.link) }" :aria-current="isCurrent(item.link) ? 'page' : undefined">总览</RouterLink>
        </li>
        <BookSidebarItem v-for="child in item.children" :key="child.link || child.text" :item="child" :depth="depth + 1" />
      </ul>
    </template>
    <RouterLink v-else-if="item.link" :to="item.link" class="chapter-link" :class="{ active: isCurrent(item.link) }" :aria-current="isCurrent(item.link) ? 'page' : undefined">{{ item.text }}</RouterLink>
  </li>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({ item: { type: Object, required: true }, depth: { type: Number, default: 0 } })
const route = useRoute()
const normalize = (value = '') => decodeURI(value).split(/[?#]/)[0].replace(/(?:index|README)?\.(?:md|html)$/, '').replace(/\/$/, '')
const isCurrent = (link) => Boolean(link) && normalize(link) === normalize(route.path)
const containsLink = (items, link) => items.some((item) => normalize(item.link) === normalize(link) || containsLink(item.children ?? [], link))
const isActive = (item) => isCurrent(item.link) || (item.children ?? []).some(isActive)
const active = computed(() => isActive(props.item))
const hasOwnPage = computed(() => props.item.link && !containsLink(props.item.children, props.item.link))
</script>

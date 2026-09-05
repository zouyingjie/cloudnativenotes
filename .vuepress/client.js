import { defineClientConfig, usePageData, usePageFrontmatter } from '@vuepress/client'
import { isArray, isFunction, isPlainObject, isString, resolveLocalePath } from '@vuepress/shared'
import {
  sidebarItemsSymbol,
  useThemeLocaleData,
} from '@vuepress/theme-default/lib/client/composables/index.js'
import { computed, nextTick, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Layout from './layouts/layout.vue'
import ArticleIndex from './components/ArticleIndex.vue'

const headerToSidebarItem = (header, sidebarDepth) => ({
  text: header.title,
  link: header.link,
  children: headersToSidebarItemChildren(header.children, sidebarDepth),
})

const headersToSidebarItemChildren = (headers = [], sidebarDepth) =>
  sidebarDepth > 0
    ? headers.map((header) => headerToSidebarItem(header, sidebarDepth - 1))
    : []

const setupStableSidebarItems = () => {
  const themeLocale = useThemeLocaleData()
  const frontmatter = usePageFrontmatter()
  const page = usePageData()
  const route = useRoute()
  const router = useRouter()

  const resolveRouteWithRedirect = (...args) => {
    const resolvedRoute = router.resolve(...args)
    const lastMatched = resolvedRoute.matched[resolvedRoute.matched.length - 1]

    if (!lastMatched?.redirect) {
      return resolvedRoute
    }

    const { redirect } = lastMatched
    const resolvedRedirect = isFunction(redirect) ? redirect(resolvedRoute) : redirect
    const resolvedRedirectObj = isString(resolvedRedirect)
      ? { path: resolvedRedirect }
      : resolvedRedirect

    return resolveRouteWithRedirect({
      hash: resolvedRoute.hash,
      query: resolvedRoute.query,
      params: resolvedRoute.params,
      ...resolvedRedirectObj,
    })
  }

  const resolveNavLink = (item) => {
    const resolved = resolveRouteWithRedirect(encodeURI(item))

    return {
      text: resolved.meta.title || item,
      link: resolved.name === '404' ? item : resolved.fullPath,
    }
  }

  const resolveAutoSidebarItems = (sidebarDepth) => [
    {
      text: page.value.title,
      children: headersToSidebarItemChildren(page.value.headers, sidebarDepth),
    },
  ]

  const resolveArraySidebarItems = (sidebarConfig, sidebarDepth) => {
    const handleChildItem = (item) => {
      const childItem = isString(item) ? resolveNavLink(item) : item

      if (childItem.children) {
        return {
          ...childItem,
          children: childItem.children.map((child) => handleChildItem(child)),
        }
      }

      if (childItem.link === route.path) {
        const headers = page.value.headers[0]?.level === 1
          ? page.value.headers[0].children
          : page.value.headers

        return {
          ...childItem,
          children: headersToSidebarItemChildren(headers, sidebarDepth),
        }
      }

      return childItem
    }

    return sidebarConfig.map((item) => handleChildItem(item))
  }

  const resolveSidebarItems = () => {
    const sidebarConfig = frontmatter.value.sidebar ?? themeLocale.value.sidebar ?? 'auto'
    const sidebarDepth = frontmatter.value.sidebarDepth ?? themeLocale.value.sidebarDepth ?? 2

    if (frontmatter.value.home || sidebarConfig === false) {
      return []
    }

    if (sidebarConfig === 'auto') {
      return resolveAutoSidebarItems(sidebarDepth)
    }

    if (isArray(sidebarConfig)) {
      return resolveArraySidebarItems(sidebarConfig, sidebarDepth)
    }

    if (isPlainObject(sidebarConfig)) {
      const sidebarPath = resolveLocalePath(sidebarConfig, route.path)
      return resolveArraySidebarItems(sidebarConfig[sidebarPath] ?? [], sidebarDepth)
    }

    return []
  }

  provide(sidebarItemsSymbol, computed(resolveSidebarItems))
}

export default defineClientConfig({
  setup () {
    setupStableSidebarItems()
  },
  enhance ({ app, router }) {
    // The reading layout has no page transition. Keep anchors clear of the fixed navbar.
    router.options.scrollBehavior = async (to, from, savedPosition) => {
      if (savedPosition) return savedPosition
      await nextTick()
      if (to.hash) {
        let id = to.hash.slice(1)
        try { id = decodeURIComponent(id) } catch { /* Keep malformed hashes literal. */ }
        const el = document.getElementById(id)
        if (el) return { el, top: (document.querySelector('.navbar')?.getBoundingClientRect().height ?? 68) + 24, behavior: 'auto' }
      }
      return to.path !== from.path ? { top: 0, behavior: 'auto' } : false
    }
    app.component('ArticleIndex', ArticleIndex)
  },
  layouts: {
    Layout
  }
})

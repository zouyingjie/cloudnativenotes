<template>
  <ParentLayout>
    <template #page-content-bottom>
      
       <div v-if="showPageExtras" class="page-info">

        <div class="star">
          <github-button  data-icon="octicon-star" href="https://github.com/zouyingjie/cloudnativenotes">Star 关注</github-button>
        </div>
          <div class="last-updated" >
            <span class="prefix" v-if="hasPageWords">总字数:</span>
            <span class="words" v-if="hasPageWords"> {{ pageWords}} </span>
            <span class="prefix" v-if="hasPageWords">字</span>
        </div>
      </div>
      <CommentService v-if="showPageExtras" :darkmode="isDarkMode" class="layout-comment" />

    </template>
  </ParentLayout>
  <PageOutline />
</template>
<script setup>
  import { ref, onMounted, onUnmounted, computed } from 'vue'
  import { usePageFrontmatter } from '@vuepress/client'
  import { useReadingTimeData } from 'vuepress-plugin-reading-time2/client'
  import GithubButton from 'vue-github-button'


  import ParentLayout from '@vuepress/theme-default/layouts/Layout.vue'
  import PageOutline from '../components/PageOutline.vue'

  const readingTime = useReadingTimeData()
  const frontmatter = usePageFrontmatter()

  const pageWords = computed(() => {
    return readingTime.value?.words ?? 0;
  })

  const hasPageWords = computed(() => pageWords.value > 0)
  const showPageExtras = computed(() => {
    return frontmatter.value.articleIndex !== true
  })

  const isDarkMode = ref(false)
  let observer

  onMounted(() => {
    const htmlDom = document.documentElement
    isDarkMode.value = htmlDom.classList.contains('dark')

    observer = new MutationObserver(() => {
      isDarkMode.value = htmlDom.classList.contains('dark')
    })

    observer.observe(htmlDom, {
      attributeFilter: ['class']
    })
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })

</script>
<style lang="scss" scoped>
  .qrcode {
    position: fixed;
    bottom: 40px;
    right: 20px;
    border:1px solid #444
  }

  @media screen and (max-width: 1024px) {
      .qrcode {
        display: none;
      }
  }
  .qrcode img {
    border-radius: 6px;
    box-shadow: 0 3px 3px 1px rgba(0,0,0,0.1);
  }
  .layout-comment {
    max-width: var(--content-width, 860px);
    margin: 4rem auto 0;
    padding: 0 2.5rem;
  }
  .page-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    max-width: var(--content-width, 860px);
    margin: 2.25rem auto 0;
    padding: .85rem 0;
    border-top: 1px solid var(--cn-border, #d0d7de);
    border-bottom: 1px solid var(--cn-border, #d0d7de);
    color: var(--c-text-light, #57606a);
  }
  .last-updated {
    text-align:right;
    font-size: .9rem;
  }
  .prefix {
    font-weight: 500;
    color: var(--c-text-light, #57606a);
  }
  .words {
    font-weight: 700;
    color: var(--cn-blue, #0969da);
    padding: 0px 3px;
  }

  @media screen and (max-width: 719px) {
    .layout-comment {
      padding: 0 1.5rem;
    }

    .page-info {
      margin-right: 1.5rem;
      margin-left: 1.5rem;
    }
  }
</style>

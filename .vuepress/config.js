import { defineUserConfig, defaultTheme } from 'vuepress';
import { mdEnhancePlugin } from "vuepress-plugin-md-enhance";
import { commentPlugin } from "vuepress-plugin-comment2";
import { readingTimePlugin } from "vuepress-plugin-reading-time2";

import { containerPlugin } from '@vuepress/plugin-container'
import imsize from 'markdown-it-imsize'
import { sidebar } from './sidebar.mjs'


export default defineUserConfig({

  lang: 'zh-CN',
  title: '云原生架构笔记',
  description: '构建大规模高可用的分布式系统',
  base: "/cloudnativenotes/",
  extendsMarkdown: (md) => {
      md.use(imsize)
  },


  plugins: [
    mdEnhancePlugin({
      // 启用脚注
      footnote: true,
      katex: true,
      sub: true,
    }),
    containerPlugin({
      type: 'center'
    }),
    containerPlugin({
      type: 'right'
    }),
    commentPlugin({
      provider: "Giscus",
      repo: "zouyingjie/cloudnativenotes",
      repoId: "R_kgDOPOHDYg",
      category: "General",
      categoryId: "DIC_kwDOPOHDYs4CtIgJ"
    }),
    readingTimePlugin({
      // your options
    }),
    // markdownImagePlugin({
    //   // Enable figure
    //   figure: true,
    //   // Enable image lazyload
    //   lazyload: true,
    //   // Enable image mark
    //   mark: true,
    //   // Enable image size
    //   size: true,
    // }),

  ],
  theme: defaultTheme({

    logo: '/images/microservices-logo.svg',

    lastUpdated: '最后更新',
    smoothScroll: true,

    editLinks: true,
    editLinkText: '在GitHub中编辑',

    repo: 'https://github.com/zouyingjie/cloudnativenotes',
    repoLabel: 'GitHub',
    navbar: [{
      text: '首页',
      link: '/'
    },
    // {
    //   text: '作者',
    //   link: '/about.md'
    // },
    {
      text: '讨论',
      link: 'https://github.com/zouyingjie/cloudnativenotes/discussions'
    }
    ],
    sidebar,
  })
});

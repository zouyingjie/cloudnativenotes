import { defineUserConfig, defaultTheme } from 'vuepress';
import { mdEnhancePlugin } from "vuepress-plugin-md-enhance";
import { commentPlugin } from "vuepress-plugin-comment2";
import { readingTimePlugin } from "vuepress-plugin-reading-time2";

import { containerPlugin } from '@vuepress/plugin-container'
import imsize from 'markdown-it-imsize'


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
    sidebar: [
      {
        text: '前言',
        link: '/end/about.md',
      },
      {
        text: '目录',
        link: '/end/toc.md',
      },
      {
        text: '通用设计',
        children: [
          {
            text: '数据建模',
            children: [
              '/common-design/modeling/history.md',
              '/common-design/modeling/index.md',
              '/common-design/modeling/mysql.md',
              '/common-design/modeling/nosql.md',
            ]
          },
          {
            text: 'API 设计',
            children: [
              '/common-design/api/rest',
              '/common-design/api/webapi',
            ]
          },

          // {
          //   text: '软件测试',
          //   children: [
          //     '/common-design/testing/unit-test',
          //     '/common-design/testing/function',
          //     '/common-design/testing/contract',
          //     '/common-design/testing/load'
          //   ]
          // },
          {
            text: '认证与授权',
            children: [
              '/common-design/security/roadmap',
              '/common-design/security/auth',
              '/common-design/security/permission'
            ]
          }
        ]
      },
      {
        text: '分布式系统-理论篇',
        children: [
          '/distributed-system-theory/overview.md',
          '/distributed-system-theory/sharding-and-replication.md',
          '/distributed-system-theory/consistency-and-consensus.md',
          '/distributed-system-theory/transaction.md',
          '/distributed-system-theory/clock.md'
        ]
      },
      {
        text: '分布式系统-工程篇',
        sidebarDepth: 1,
        children: [
          '/distributed-system-engineering/distributed-lock.md',
          '/distributed-system-engineering/uniqueid.md',
          '/distributed-system-engineering/cron.md',
          '/distributed-system-engineering/session.md',
          '/distributed-system-engineering/tracing.md'
        ]
      },
      {
        text: '云原生架构',
        collapsable: true,
        link: '/cloudnative/summary.md',
        sidebarDepth: 1,
        children: [
          {
            text: '什么是云原生',
            children: [
              '/cloudnative/architecture/architecture',
              '/cloudnative/architecture/definition',
              '/cloudnative/architecture/pass'
            ]
          },
          {
            text: '不可变基础设施',
            children: [
              {
                text: '容器',
                children: [
                  '/cloudnative/container/docker-namespace',
                  '/cloudnative/container/docker-cgroups',
                  '/cloudnative/container/docker-filesystem',
                  '/cloudnative/container/docker-devicemapper',
                  '/cloudnative/container/docker',

                ]
              },
              {
                text: 'Kubernetes',
                children: [
                  '/cloudnative/kubernetes/architecture',
                  '/cloudnative/kubernetes/pod',
                  '/cloudnative/kubernetes/controller',
                  '/cloudnative/kubernetes/config',
                  '/cloudnative/kubernetes/network',
                  '/cloudnative/kubernetes/storage',
                  '/cloudnative/kubernetes/scheduler',
                  '/cloudnative/kubernetes/security',
                  '/cloudnative/kubernetes/application',
                  '/cloudnative/kubernetes/monitoring',
                  // '/cloudnative/kubernetes/future',
                  // '/cloudnative/kubernetes/cka',

                ]
              },
              {
                text: '服务网格',
                children: [
                  '/cloudnative/servicemesh/communication',
                  '/cloudnative/servicemesh/servicemesh',
                  '/cloudnative/servicemesh/design',
                ]
              }
            ]
          },
          {
            text: '服务治理',
            children: [
              '/cloudnative/service/dependency',
              '/cloudnative/service/stack',
              '/cloudnative/service/discovery',
              '/cloudnative/service/lifecycle',
              // {
              //   text: '服务弹力设计',
              //   children: [
              //     '/cloudnative/service/resilience/availability',
              //     '/cloudnative/service/resilience/redundancy',
              //     '/cloudnative/service/resilience/decoupling',
              //     '/cloudnative/service/resilience/fault-tolerance',
              //     '/cloudnative/service/resilience/patterns',

              //   ]
              // }
            ]
          },
          {
            text: '流量治理',
            children: [
              '/cloudnative/service/traffic/loadbalancing',
              '/cloudnative/service/traffic/routing',
              '/cloudnative/service/traffic/rate-limiting',
              '/cloudnative/service/traffic/mirroring',
            ]
          },
          {
            text: '可观测性',
            // link: '/observability/',
            collapsable: false,
            children: [
              '/cloudnative/observability/definition',
              '/cloudnative/observability/metrics',
              '/cloudnative/observability/logging',
              '/cloudnative/observability/trace',
              '/cloudnative/observability/monitoring',
            ]
          },
          {
            text: 'DevOps',
            // link: '/devops/',
            children: [
              '/cloudnative/devops/devops',
              '/cloudnative/devops/gitflow',
              '/cloudnative/devops/cicd',
            ]
          },
        ]
      },

      {
        text: '何以为架构师',
        children: [
          '/end/responsibility',
          '/end/perspective',
          '/end/learn.md',
        ]
      },
      // {
      //   text: '后记：那些平淡的一天',
      //   link: '/end/dots.md',
      // },
    ],
  })
});
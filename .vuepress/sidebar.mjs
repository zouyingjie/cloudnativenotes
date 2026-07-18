export const sidebar = [
  {
    text: '前言',
    link: '/',
  },
  {
    text: '目录',
    link: '/end/toc',
  },
  {
    text: '通用设计',
    link: '/common-design/modeling/history',
    children: [
      {
        text: '数据建模',
        link: '/common-design/modeling/history',
        children: [
          '/common-design/modeling/history.md',
          '/common-design/modeling/innodb.md',
          '/common-design/modeling/index.md',
          '/common-design/modeling/newsql.md',
        ],
      },
      {
        text: 'API 设计',
        link: '/common-design/api/rest',
        children: [
          '/common-design/api/rest',
          '/common-design/api/webapi',
        ],
      },
      {
        text: '软件测试',
        link: '/common-design/testing/unit-test',
        children: [
          '/common-design/testing/unit-test',
          '/common-design/testing/function',
          '/common-design/testing/contract',
          '/common-design/testing/load',
        ],
      },
      {
        text: '认证与授权',
        link: '/common-design/security/roadmap',
        children: [
          '/common-design/security/roadmap',
          '/common-design/security/auth',
          '/common-design/security/permission',
        ],
      },
    ],
  },
  {
    text: '分布式理论',
    link: '/distributed-system-theory/overview',
    children: [
      '/distributed-system-theory/overview.md',
      '/distributed-system-theory/sharding.md',
      '/distributed-system-theory/replication.md',
      '/distributed-system-theory/transaction.md',
      '/distributed-system-theory/clock.md',
      '/distributed-system-theory/consistency-consensus.md',
    ],
  },
  {
    text: '分布式工程',
    link: '/distributed-system-engineering/uniqueid',
    sidebarDepth: 1,
    children: [
      '/distributed-system-engineering/uniqueid.md',
      '/distributed-system-engineering/lock.md',
      '/distributed-system-engineering/cache.md',
      '/distributed-system-engineering/session.md',
      '/distributed-system-engineering/cron.md',
    ],
  },
  {
    text: '云原生架构',
    collapsable: true,
    link: '/cloudnative/summary',
    sidebarDepth: 1,
    children: [
      {
        text: '什么是云原生',
        link: '/cloudnative/architecture/architecture',
        children: [
          '/cloudnative/architecture/architecture',
          '/cloudnative/architecture/definition',
          '/cloudnative/architecture/pass',
        ],
      },
      {
        text: '不可变基础设施',
        link: '/cloudnative/container/docker-namespace',
        children: [
          {
            text: '容器',
            link: '/cloudnative/container/docker-namespace',
            children: [
              '/cloudnative/container/docker-namespace',
              '/cloudnative/container/docker-cgroups',
              '/cloudnative/container/docker-filesystem',
              '/cloudnative/container/docker-devicemapper',
              '/cloudnative/container/docker',
            ],
          },
          {
            text: 'Kubernetes',
            link: '/cloudnative/kubernetes/architecture',
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
            ],
          },
          {
            text: '服务网格',
            link: '/cloudnative/servicemesh/communication',
            children: [
              '/cloudnative/servicemesh/communication',
              '/cloudnative/servicemesh/servicemesh',
              '/cloudnative/servicemesh/design',
            ],
          },
        ],
      },
      {
        text: '服务治理',
        link: '/cloudnative/service/dependency',
        children: [
          '/cloudnative/service/dependency',
          '/cloudnative/service/stack',
          '/cloudnative/service/discovery',
          '/cloudnative/service/lifecycle',
        ],
      },
      {
        text: '流量治理',
        link: '/cloudnative/traffic/overview',
        children: [
          '/cloudnative/traffic/overview',
          '/cloudnative/traffic/routing',
          '/cloudnative/traffic/resilience',
          '/cloudnative/traffic/publish',
        ],
      },
      {
        text: '可观测性',
        collapsable: false,
        link: '/cloudnative/observability/definition',
        children: [
          '/cloudnative/observability/definition',
          '/cloudnative/observability/metrics',
          '/cloudnative/observability/logging',
          '/cloudnative/observability/trace',
          '/cloudnative/observability/monitoring',
        ],
      },
      {
        text: 'DevOps',
        link: '/cloudnative/devops/devops',
        children: [
          '/cloudnative/devops/devops',
          '/cloudnative/devops/gitflow',
          '/cloudnative/devops/cicd',
        ],
      },
    ],
  },
  {
    text: '何以为架构师',
    link: '/end/responsibility',
    children: [
      '/end/responsibility',
      '/end/perspective',
      '/end/learn.md',
    ],
  },
]

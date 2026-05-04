// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    {type: 'doc', id: 'index', label: '文档索引'},
    {
      type: 'category',
      label: '概览',
      link: {type: 'doc', id: 'overview/about'},
      items: [
        'overview/architecture',
        'get-started/quick-start',
      ],
    },
    {
      type: 'category',
      label: '安装部署',
      link: {type: 'doc', id: 'installation/index'},
      items: [
        'installation/requirements',
        'installation/dash-linux',
        'installation/manual',
        'installation/node-linux',
        'installation/node-macos',
        'installation/node-windows',
        'installation/reverse-proxy',
        'installation/upgrade',
      ],
    },
    {
      type: 'category',
      label: '配置',
      link: {type: 'doc', id: 'configuration/index'},
      items: [
        'configuration/dash',
        'configuration/environment',
        'configuration/access',
        'configuration/traffic',
        'configuration/alerts',
        'configuration/notifications',
        'configuration/themes',
        'configuration/security',
      ],
    },
    {
      type: 'category',
      label: '指南',
      link: {type: 'doc', id: 'guides/index'},
      items: [
        'guides/production-deployment',
        'guides/all-in-one',
        'guides/node-rollout',
        'guides/security-hardening',
        'guides/advanced-configuration',
        'guides/traffic-billing',
        'guides/theme-authoring',
      ],
    },
    {
      type: 'category',
      label: '运维',
      link: {type: 'doc', id: 'operations/index'},
      items: [
        'operations/node-lifecycle',
        'operations/data-retention',
        'operations/backup-restore',
        'operations/logging',
        'operations/performance',
        'operations/troubleshooting',
      ],
    },
    {
      type: 'category',
      label: '参考',
      link: {type: 'doc', id: 'reference/index'},
      items: [
        'reference/dash-cli',
        'reference/node-cli',
        'reference/dash-api',
        'reference/node-protocol',
        'reference/metrics-schema',
        'reference/disk-schema',
        'reference/theme-package',
        'reference/filesystem',
        'reference/errors',
      ],
    },
    {
      type: 'category',
      label: '组件',
      items: [
        {
          type: 'category',
          label: 'Dash',
          link: {type: 'doc', id: 'components/dash/index'},
          items: [
            'components/dash/install',
            'components/dash/config',
            'components/dash/commands',
            'components/dash/api',
            'components/dash/deploy',
          ],
        },
        {
          type: 'category',
          label: 'Node',
          link: {type: 'doc', id: 'components/node/index'},
          items: [
            'components/node/install',
            'components/node/commands',
            'components/node/local',
            'components/node/push',
            'components/node/api',
            'components/node/disk',
            'components/node/update',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: '开发和发布',
      items: [
        'contributing/build',
        'contributing/releases',
      ],
    },
  ],
};

export default sidebars;

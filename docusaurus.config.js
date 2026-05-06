// @ts-check

import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';
import {themes} from 'prism-react-renderer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteUrl = process.env.DOCUSAURUS_URL ?? 'https://ithildur.github.io';
const siteBaseUrl = process.env.DOCUSAURUS_BASE_URL ?? '/Ithiltir-docs/';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Ithiltir',
  tagline: 'Ithiltir / Ithiltir-node',
  favicon: 'img/favicon.svg',

  url: siteUrl,
  baseUrl: siteBaseUrl,
  organizationName: 'Ithildur',
  projectName: 'Ithiltir-docs',
  trailingSlash: false,
  future: {
    v4: true,
  },

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  i18n: {
    defaultLocale: 'zh-CN',
    locales: ['zh-CN', 'en'],
    localeConfigs: {
      'zh-CN': {
        label: '简体中文',
        htmlLang: 'zh-CN',
      },
      en: {
        label: 'English',
        htmlLang: 'en-US',
      },
    },
  },

  presets: [
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: 'docs',
          routeBasePath: 'docs',
          sidebarPath: path.resolve(__dirname, 'sidebars.js'),
          include: ['**/*.md'],
          showLastUpdateAuthor: false,
          showLastUpdateTime: false,
        },
        blog: false,
        theme: {
          customCss: path.resolve(__dirname, 'src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/social-card.svg',
      colorMode: {
        defaultMode: 'light',
        respectPrefersColorScheme: true,
        disableSwitch: false,
      },
      navbar: {
        title: 'Ithiltir',
        logo: {
          alt: 'Ithiltir',
          src: 'img/logo.svg',
        },
        items: [
          {type: 'docSidebar', sidebarId: 'docs', label: '文档', position: 'left'},
          {type: 'doc', docId: 'installation/index', label: '部署', position: 'left'},
          {type: 'doc', docId: 'configuration/index', label: '配置', position: 'left'},
          {type: 'doc', docId: 'guides/index', label: '指南', position: 'left'},
          {type: 'doc', docId: 'reference/index', label: '参考', position: 'left'},
          {
            href: 'https://demo.ithiltir.dev/',
            label: 'Demo',
            position: 'right',
          },
          {
            href: 'https://github.com/Ithildur/Ithiltir',
            label: 'Ithiltir',
            position: 'right',
          },
          {
            href: 'https://github.com/Ithildur/Ithiltir-node',
            label: 'Ithiltir-node',
            position: 'right',
          },
          {type: 'localeDropdown', position: 'right'},
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '文档',
            items: [
              {label: '快速开始', to: 'docs/QuickStart'},
              {label: '安装部署', to: 'docs/Install'},
              {label: '运维', to: 'docs/Operations'},
            ],
          },
          {
            title: '参考',
            items: [
              {label: 'Dash API', to: 'docs/Reference/DashAPI'},
              {label: 'Node CLI', to: 'docs/Reference/NodeCLI'},
              {label: '指标结构', to: 'docs/Reference/MetricsSchema'},
            ],
          },
          {
            title: '项目',
            items: [
              {label: 'Demo', href: 'https://demo.ithiltir.dev/'},
              {label: 'Ithiltir', href: 'https://github.com/Ithildur/Ithiltir'},
              {
                label: 'Ithiltir-node',
                href: 'https://github.com/Ithildur/Ithiltir-node',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Ithiltir contributors.`,
      },
      docs: {
        sidebar: {
          autoCollapseCategories: true,
        },
      },
      prism: {
        theme: themes.github,
        darkTheme: themes.dracula,
        additionalLanguages: ['bash', 'json', 'nginx', 'powershell', 'yaml'],
      },
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 4,
      },
    }),
};

export default config;

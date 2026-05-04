import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';

const sections = [
  {
    title: '快速开始',
    titleEn: 'Quick Start',
    meta: 'QuickStart',
    text: 'Dash / Node',
    textEn: 'Dash / Node',
    to: '/docs/QuickStart',
  },
  {
    title: '安装部署',
    titleEn: 'Install',
    meta: 'Install',
    text: 'Linux / Proxy / Upgrade',
    textEn: 'Linux / Proxy / Upgrade',
    to: '/docs/Install',
  },
  {
    title: '高级配置',
    titleEn: 'Advanced Config',
    meta: 'Config',
    text: 'Access / Traffic / Alert',
    textEn: 'Access / Traffic / Alert',
    to: '/docs/Guides/AdvancedConfiguration',
  },
  {
    title: '参考手册',
    titleEn: 'Reference',
    meta: 'Reference',
    text: 'API / CLI / Metrics',
    textEn: 'API / CLI / Metrics',
    to: '/docs/Reference',
  },
];

const copy = {
  'zh-CN': {
    title: 'Ithiltir 文档',
    description: '部署 / 节点 / 配置 / API',
    eyebrow: 'Ithiltir Docs',
    primary: '打开文档',
    secondary: '快速开始',
    indexLabel: '核心文档入口',
  },
  en: {
    title: 'Ithiltir Docs',
    description: 'Deploy / Nodes / Config / API',
    eyebrow: 'Ithiltir Docs',
    primary: 'Open Docs',
    secondary: 'Quick Start',
    indexLabel: 'Core documentation entry points',
  },
};

export default function Home() {
  const {
    i18n: {currentLocale},
  } = useDocusaurusContext();
  const logoUrl = useBaseUrl('img/logo.svg');
  const text = copy[currentLocale] ?? copy['zh-CN'];

  return (
    <Layout
      title={text.title}
      description={text.description}>
      <main className="docsHome">
        <section className="docsHome__hero">
          <div className="docsHome__shell">
            <div className="docsHome__copy">
              <p className="docsHome__eyebrow">{text.eyebrow}</p>
              <h1>{text.title}</h1>
              <p>{text.description}</p>
              <div className="docsHome__actions">
                <Link className="docsHome__button docsHome__button--primary" to="/docs/">
                  {text.primary}
                </Link>
                <Link
                  className="docsHome__button docsHome__button--secondary"
                  to="/docs/QuickStart">
                  {text.secondary}
                </Link>
              </div>
            </div>
            <div className="docsHome__stage" aria-hidden="true">
              <div className="docsHome__ring docsHome__ring--outer" />
              <div className="docsHome__ring docsHome__ring--inner" />
              <img className="docsHome__logo" src={logoUrl} alt="" />
              <span className="docsHome__node docsHome__node--dash">Dash</span>
              <span className="docsHome__node docsHome__node--node">Node</span>
              <span className="docsHome__node docsHome__node--api">API</span>
              <span className="docsHome__node docsHome__node--ops">Ops</span>
            </div>
          </div>
        </section>
        <section className="docsHome__index" aria-label={text.indexLabel}>
          <div className="docsHome__grid">
            {sections.map((section) => (
              <Link className="docsHome__card" to={section.to} key={section.to}>
                <span>{section.meta}</span>
                <h2>{currentLocale === 'en' ? section.titleEn : section.title}</h2>
                <p>{currentLocale === 'en' ? section.textEn : section.text}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}

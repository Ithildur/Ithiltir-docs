import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';

const guides = [
  {
    title: ['部署与接入', 'Deployment'],
    links: [
      ['Install', '安装 Dash', 'Install Dash'],
      ['Install/NodeRollout', '接入更多节点', 'Enroll more nodes'],
      ['Install/ReverseProxy', '配置反向代理', 'Configure a reverse proxy'],
    ],
  },
  {
    title: ['配置与运维', 'Operations'],
    links: [
      ['Config/Alerts', '设置告警规则', 'Configure alerts'],
      ['Operations/BackupRestore', '备份与恢复', 'Back up and restore'],
      ['Operations/Troubleshooting', '排查上报故障', 'Troubleshoot reporting'],
    ],
  },
  {
    title: ['开发与参考', 'Development'],
    links: [
      ['Reference/DashAPI', 'Dash HTTP API', 'Dash HTTP API'],
      ['Reference/NodeCLI', 'Node 命令行', 'Node CLI'],
      ['Guides', '源码与构建', 'Source and build guides'],
    ],
  },
];

export default function Home() {
  const {i18n: {currentLocale}, siteConfig} = useDocusaurusContext();
  const english = currentLocale === 'en';
  const title = english ? 'Documentation' : '文档';
  const description = english
    ? 'Monitor your servers with Ithiltir Dash. Connect a node to see live metrics, then explore its history, traffic and alerts.'
    : '用 Ithiltir Dash 集中监控服务器。接入第一台节点后，即可查看实时指标、历史曲线、流量和告警。';
  const preview = useBaseUrl(`img/dashboard-${english ? 'en' : 'zh'}.jpg`);
  return (
    <Layout title={title} description={description}>
      <main className="docsHome">
        <header className="docsHome__intro">
          <div>
            <h1>{siteConfig.title} <br />{title}</h1>
            <p>{description}</p>
            <div className="docsHome__actions">
              <Link className="button button--primary" to="docs/QuickStart">
                {english ? 'Connect your first node' : '接入第一台节点'} <span aria-hidden="true">→</span>
              </Link>
              <Link to="docs/Node/Local">{english ? 'Run Node locally' : '使用 Node 本地模式'}</Link>
            </div>
          </div>
          <a className="docsHome__preview" href="https://demo.ithiltir.dev/">
            <figure>
              <div className="docsHome__viewport">
                <img src={preview} width="1920" height="1200" alt={english ? 'Node metrics in Ithiltir Dash' : 'Ithiltir Dash 的节点指标看板'} />
              </div>
              <figcaption>{english ? 'Explore the live dashboard' : '打开在线演示'} <span aria-hidden="true">↗</span></figcaption>
            </figure>
          </a>
        </header>
        <section className="docsHome__guides">
          <header>
            <h2>{english ? 'Browse the guides' : '查阅指南'}</h2>
            <Link to="docs">{english ? 'All documentation' : '完整文档索引'} <span aria-hidden="true">→</span></Link>
          </header>
          <div className="docsHome__topics">
            {guides.map(({title: labels, links}) => (
              <section key={labels[1]}>
                <h3>{labels[english ? 1 : 0]}</h3>
                <ul>{links.map(([slug, zh, en]) => (
                  <li key={slug}><Link to={`docs/${slug}`}>{english ? en : zh}</Link></li>
                ))}</ul>
              </section>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}

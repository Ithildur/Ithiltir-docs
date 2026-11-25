import Translate from '@docusaurus/Translate';
import DesktopTOC from '@theme-original/DocItem/TOC/Desktop';

export default function DocTableOfContents(props) {
  return (
    <nav className="docContents" aria-labelledby="doc-contents-title">
      <strong id="doc-contents-title">
        <Translate id="theme.TOCCollapsible.toggleButtonLabel">On this page</Translate>
      </strong>
      <DesktopTOC {...props} />
    </nav>
  );
}

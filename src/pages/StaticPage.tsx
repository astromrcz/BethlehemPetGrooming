import { useEffect, useState } from 'react';
import { PAGES } from './generated';

// Renders a page's verbatim body markup from the original repo. Applies the
// exact <body> class list (and data-icon-library) to the real document body —
// mirroring the original — so theme + body.* state selectors in custom.css
// resolve identically. Design is reproduced 1:1; nothing is re-authored.
export default function StaticPage({ pageKey }: { pageKey: string }) {
  const meta = PAGES[pageKey];
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    meta?.load().then((h) => alive && setHtml(h));
    return () => {
      alive = false;
    };
  }, [meta]);

  useEffect(() => {
    if (!meta) return;
    const body = document.body;
    const prevClass = body.className;
    const prevIcon = body.getAttribute('data-icon-library');
    body.className = meta.bodyClass;
    if (meta.iconLib) body.setAttribute('data-icon-library', meta.iconLib);
    return () => {
      body.className = prevClass;
      if (prevIcon === null) body.removeAttribute('data-icon-library');
      else body.setAttribute('data-icon-library', prevIcon);
    };
  }, [meta]);

  if (!meta) return <div style={{ padding: 24 }}>Unknown page: {pageKey}</div>;
  if (html === null) return null;
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

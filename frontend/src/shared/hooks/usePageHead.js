import { useEffect } from 'react';

import { formatTitle } from '@/shared/hooks/useDocumentTitle';

const upsertCanonical = (href) => {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
};

const upsertOg = (property, content) => {
  let el = document.head.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

/**
 * Tab title, canonical URL and Open Graph url/title.
 * `canonicalPath` is an in-app path (e.g. `/az/cars` from ROUTES.cars).
 */
export const usePageHead = ({ title, canonicalPath }) => {
  useEffect(() => {
    if (title) document.title = formatTitle(title);
    if (!canonicalPath) return undefined;
    const url = `${window.location.origin}${canonicalPath}`;
    upsertCanonical(url);
    upsertOg('og:url', url);
    upsertOg('og:type', 'website');
    if (title) upsertOg('og:title', formatTitle(title));
    return () => {
      document.head.querySelector('link[rel="canonical"]')?.remove();
      document.head.querySelector('meta[property="og:url"]')?.remove();
      document.head.querySelector('meta[property="og:type"]')?.remove();
      document.head.querySelector('meta[property="og:title"]')?.remove();
    };
  }, [title, canonicalPath]);
};

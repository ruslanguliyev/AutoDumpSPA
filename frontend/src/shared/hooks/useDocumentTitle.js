import { useEffect } from 'react';

export const APP_NAME = 'AvtoBaz';

/** "Page — AvtoBaz", or just "AvtoBaz" when there is no page title. */
export const formatTitle = (title) => {
  const clean = typeof title === 'string' ? title.trim() : '';
  return clean ? `${clean} — ${APP_NAME}` : APP_NAME;
};

/**
 * Sets the browser tab title. Pass a falsy value while data is still loading to keep the
 * current title.
 */
export const useDocumentTitle = (title) => {
  useEffect(() => {
    if (!title) return;
    document.title = formatTitle(title);
  }, [title]);
};

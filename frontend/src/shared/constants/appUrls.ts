const DEFAULT_PUBLIC_APP_URL = 'https://autobaz.az';

function readPublicAppUrl(): string {
  const configured = import.meta.env.VITE_PUBLIC_APP_URL;
  const raw = typeof configured === 'string' ? configured.trim() : '';
  return (raw || DEFAULT_PUBLIC_APP_URL).replace(/\/+$/, '');
}

/** Origin for login and account-action links. Baked in at build time. */
export const APP_BASE_URL = readPublicAppUrl();

export function appLoginUrl(returnPath?: string) {
  const path = returnPath ? `?return=${encodeURIComponent(returnPath)}` : '';
  return `${APP_BASE_URL}/login${path}`;
}

/** External account app — login, report, and review actions that need an account. */
export const APP_BASE_URL = 'https://app.avtobaz.example';

export function appLoginUrl(returnPath?: string) {
  const path = returnPath ? `?return=${encodeURIComponent(returnPath)}` : '';
  return `${APP_BASE_URL}/login${path}`;
}

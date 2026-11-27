/**
 * Client-side checks on the stored login token. The server stays the judge of validity;
 * this only spots a token that has plainly run out, so the app can send the user to log in
 * instead of failing requests silently.
 */

/** Fired on `window` when the server rejects the stored token. */
export const SESSION_EXPIRED_EVENT = 'autobaz:session-expired';

/** Expiry of a JWT in ms, or null when the token has no readable `exp`. */
export const getTokenExpiry = (token: string | null | undefined): number | null => {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof json.exp === 'number' ? json.exp * 1000 : null;
  } catch {
    return null;
  }
};

/** True when the token's `exp` is in the past. A token without `exp` is left to the server. */
export const isTokenExpired = (token: string | null | undefined, now = Date.now()): boolean => {
  const expiry = getTokenExpiry(token);
  return expiry !== null && expiry <= now;
};

export const notifySessionExpired = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
};

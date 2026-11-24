import type { Request } from 'express';

/**
 * How many reverse proxies sit in front of the app. Matches `trust proxy` in main.ts:
 * hop 0 is the socket, and only that many addresses from the right of X-Forwarded-For
 * are treated as proxies. Anything further left can be spoofed by the client.
 */
export function trustedProxyHops(): number {
  const raw = Number(process.env.TRUSTED_PROXY_HOPS ?? 1);
  if (!Number.isFinite(raw) || raw < 0) return 0;
  return Math.floor(raw);
}

/** X-Forwarded-For, rightmost address first, the same order Express uses. */
function parseForwarded(header: string): string[] {
  const list: string[] = [];
  let start = header.length;
  let end = header.length;
  for (let i = header.length - 1; i >= 0; i -= 1) {
    const code = header.charCodeAt(i);
    if (code === 0x20) {
      if (start === end) start = end = i;
    } else if (code === 0x2c) {
      if (start !== end) list.push(header.substring(start, end));
      start = end = i;
    } else {
      start = i;
    }
  }
  if (start !== end) list.push(header.substring(start, end));
  return list;
}

type MaybeRequest = Pick<Request, 'ip' | 'headers' | 'socket'> | null | undefined;

/** Visitor address, after dropping TRUSTED_PROXY_HOPS trusted proxies. */
export function clientIp(req: MaybeRequest): string {
  const hops = trustedProxyHops();
  const header = req?.headers?.['x-forwarded-for'];
  const raw = Array.isArray(header) ? header.join(',') : header || '';
  const forwarded = parseForwarded(raw);
  const socket = req?.socket?.remoteAddress || req?.ip || '';
  const addrs = socket ? [socket, ...forwarded] : [...forwarded];
  if (addrs.length === 0) return 'unknown';

  let end = addrs.length;
  for (let i = 0; i < addrs.length - 1; i += 1) {
    if (i < hops) continue;
    end = i + 1;
    break;
  }
  return addrs[end - 1] || 'unknown';
}

export function readUserAgent(req: MaybeRequest): string {
  const header = req?.headers?.['user-agent'];
  if (Array.isArray(header)) return header.join(' ');
  return typeof header === 'string' ? header : '';
}

const BOT_MARKERS = ['bot', 'crawler', 'spider'];

/** Empty agents and obvious crawlers are not visitors. */
export function isIgnoredUserAgent(userAgent: string | null | undefined): boolean {
  const ua = (userAgent ?? '').trim().toLowerCase();
  if (!ua) return true;
  return BOT_MARKERS.some((marker) => ua.includes(marker));
}

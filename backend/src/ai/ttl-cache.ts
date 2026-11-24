/** A small in-memory cache with a time-to-live and a size cap (oldest entries go first). */
export class TtlCache<T> {
  private readonly store = new Map<string, { expires: number; value: T }>();

  constructor(private readonly maxEntries = 500) {}

  get(key: string, now = Date.now()): T | null {
    const row = this.store.get(key);
    if (!row) return null;
    if (row.expires <= now) {
      this.store.delete(key);
      return null;
    }
    return row.value;
  }

  set(key: string, value: T, ttlMs: number, now = Date.now()): void {
    this.store.delete(key);
    this.store.set(key, { expires: now + ttlMs, value });
    while (this.store.size > this.maxEntries) {
      const oldest = this.store.keys().next().value;
      if (oldest === undefined) break;
      this.store.delete(oldest);
    }
  }
}

/** JSON with sorted keys and without empty values, so equal searches give equal keys. */
export function stableKey(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value ?? null);
  if (Array.isArray(value)) return `[${value.map(stableKey).join(',')}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, item]) => item !== null && item !== undefined && item !== '' && item !== false)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableKey(item)}`).join(',')}}`;
}

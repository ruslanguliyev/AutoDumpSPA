import { Injectable } from '@nestjs/common';

import type { NormalizedSearch } from './catalog/normalize-search';

@Injectable()
export class SearchParseCache {
  private readonly store = new Map<string, { expires: number; value: NormalizedSearch }>();

  static key(query: string, language: string): string {
    return `${language}|${query.trim().toLowerCase().replace(/\s+/g, ' ')}`;
  }

  get(key: string, now = Date.now()): NormalizedSearch | null {
    const row = this.store.get(key);
    if (!row) return null;
    if (row.expires <= now) {
      this.store.delete(key);
      return null;
    }
    return row.value;
  }

  set(key: string, value: NormalizedSearch, ttlMs: number, now = Date.now()): void {
    this.store.set(key, { expires: now + ttlMs, value });
  }
}

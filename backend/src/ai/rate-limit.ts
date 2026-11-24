import { Injectable } from '@nestjs/common';

@Injectable()
export class AiRateLimiter {
  private readonly hits = new Map<string, number[]>();

  /** Returns false when the caller is over the limit for this window. */
  take(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
    const fresh = (this.hits.get(key) ?? []).filter((stamp) => now - stamp < windowMs);
    if (fresh.length >= limit) {
      this.hits.set(key, fresh);
      return false;
    }
    fresh.push(now);
    this.hits.set(key, fresh);
    return true;
  }
}

/**
 * Tiny in-memory sliding-window counter for failed attempts (e.g. wrong passwords).
 *
 * State lives in the process, so it resets on restart and is not shared between several
 * server instances. For a multi-instance deployment move this to Redis.
 */
export class FailureLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly maxFailures: number,
    private readonly windowMs: number,
  ) {}

  private recent(key: string, now: number): number[] {
    const list = (this.hits.get(key) ?? []).filter((t) => now - t < this.windowMs);
    if (list.length > 0) this.hits.set(key, list);
    else this.hits.delete(key);
    return list;
  }

  isBlocked(key: string, now = Date.now()): boolean {
    return this.recent(key, now).length >= this.maxFailures;
  }

  record(key: string, now = Date.now()): void {
    const list = this.recent(key, now);
    list.push(now);
    this.hits.set(key, list);

    // Keep memory bounded when many different keys are probed.
    if (this.hits.size > 10_000) {
      for (const k of this.hits.keys()) this.recent(k, now);
    }
  }

  reset(key: string): void {
    this.hits.delete(key);
  }
}

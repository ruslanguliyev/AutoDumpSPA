/** How long one arrangement of the VIP block stays put before it moves on. */
export const ROTATION_STEP_MS = 10 * 60 * 1000;

/**
 * Picks `limit` items out of `pool`, starting at an offset that advances with the clock.
 *
 * Turbo.az shuffles its VIP block at random, so a listing can miss a whole day by bad
 * luck. Rotating instead gives every paying listing the same share of the block: over
 * a day each one spends the same number of slots at the front.
 */
export function rotate<T>(pool: T[], limit: number, now: number = Date.now()): T[] {
  if (pool.length === 0 || limit <= 0) return [];
  if (pool.length <= limit) return pool;
  const offset = Math.floor(now / ROTATION_STEP_MS) % pool.length;
  return [...pool.slice(offset), ...pool.slice(0, offset)].slice(0, limit);
}

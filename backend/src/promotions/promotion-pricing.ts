import { PromotionTier } from '@prisma/client';

/**
 * The price list for paid placement, and the rules that turn a package into a schedule.
 *
 * Money is counted in qapik (1 AZN = 100 qapik) so that nothing is ever a float.
 * Prices live in code on purpose for now: changing them is a deploy, which is also the
 * record of when they changed. An administrator-editable price list is the next step.
 */

/** Listings of cars cost more to promote than parts, and profiles sit in between. */
export type PromotionAudience = 'VEHICLE' | 'PART' | 'PROFILE';

export interface PromotionPackage {
  /** Stable identifier sent by the client and stored on the order, e.g. "vehicle_vip_15". */
  code: string;
  tier: PromotionTier;
  audience: PromotionAudience;
  /** How many days the placement lasts. */
  days: number;
  /** How many automatic bumps the package carries in total. */
  bumps: number;
  /** How many of those happen per day; it picks the bump slots below. */
  bumpsPerDay: number;
  /** Price in qapik. */
  amount: number;
  /** The best value of its tier, highlighted in the picker. */
  recommended?: boolean;
}

/**
 * Bump times, in Baku local hours.
 *
 * Turbo.az bumps every 8 hours around the clock, which spends a third of the package
 * while the country is asleep. We spend every bump when people are actually looking.
 */
const BUMP_SLOTS_BY_RATE: Record<number, number[]> = {
  1: [9],
  2: [9, 19],
  3: [9, 13, 19],
};

/** Azerbaijan is UTC+4 all year; the country has had no daylight saving since 2016. */
const BAKU_OFFSET_MS = 4 * 60 * 60 * 1000;

function pkg(
  audience: PromotionAudience,
  tier: PromotionTier,
  days: number,
  bumpsPerDay: number,
  amount: number,
  recommended = false,
): PromotionPackage {
  const suffix = tier === PromotionTier.BUMP ? `${days}x` : `${days}d`;
  return {
    code: `${audience.toLowerCase()}_${tier.toLowerCase()}_${suffix}`,
    tier,
    audience,
    days,
    bumps: days * bumpsPerDay,
    bumpsPerDay,
    amount,
    ...(recommended ? { recommended: true } : {}),
  };
}

/**
 * A BUMP package is sold as "N bumps, one a day", so its window is N days long.
 * VIP adds the VIP block and one bump a day; PREMIUM adds the home page and three.
 */
function priceList(
  audience: PromotionAudience,
  bump: [number, number, number, number],
  vip: [number, number, number, number],
  premium: [number, number, number, number],
): PromotionPackage[] {
  const bumpDays = [1, 3, 5, 10];
  const placementDays = [1, 5, 15, 30];
  return [
    ...bumpDays.map((d, i) => pkg(audience, PromotionTier.BUMP, d, 1, bump[i], d === 5)),
    ...placementDays.map((d, i) => pkg(audience, PromotionTier.VIP, d, 1, vip[i], d === 15)),
    ...placementDays.map((d, i) => pkg(audience, PromotionTier.PREMIUM, d, 3, premium[i], d === 15)),
  ];
}

export const PROMOTION_PACKAGES: PromotionPackage[] = [
  priceList('VEHICLE', [300, 600, 900, 1500], [500, 1500, 2500, 4000], [700, 2000, 4500, 6000]),
  priceList('PART', [200, 400, 600, 1000], [300, 900, 1500, 2500], [400, 1200, 2700, 3600]),
  priceList('PROFILE', [200, 400, 600, 1000], [300, 900, 1500, 2500], [500, 1400, 3000, 4000]),
].flat();

export function packagesFor(audience: PromotionAudience): PromotionPackage[] {
  return PROMOTION_PACKAGES.filter((p) => p.audience === audience);
}

export function findPackage(code: string): PromotionPackage | undefined {
  return PROMOTION_PACKAGES.find((p) => p.code === code);
}

/** Catalogues sort by this: a bigger number wins. BUMP changes the order, not the rank. */
export function rankOf(tier: PromotionTier): number {
  if (tier === PromotionTier.PREMIUM) return 2;
  if (tier === PromotionTier.VIP) return 1;
  return 0;
}

/**
 * The badge a card shows, read back from the stored rank.
 *
 * `promotedUntil` is checked as well, so a placement that ran out between two ticks of
 * the scheduler stops being advertised at once, even though its rank is still stored.
 */
export function visibleTier(
  promotionRank: number,
  promotedUntil: Date | null,
  now: Date = new Date(),
): PromotionTier | null {
  if (!promotedUntil || promotedUntil <= now) return null;
  if (promotionRank >= 2) return PromotionTier.PREMIUM;
  if (promotionRank >= 1) return PromotionTier.VIP;
  return null;
}

/** Catalogue ordering: paid placement first, then whatever was bumped most recently. */
export const PROMOTED_FIRST = [
  { promotionRank: 'desc' as const },
  { bumpedAt: 'desc' as const },
];

/**
 * How many promoted rows are read before the block rotates. Big enough that every
 * paying listing takes its turn, small enough to stay one cheap query.
 */
export const PROMOTED_POOL_LIMIT = 120;

/** VIP and PREMIUM hold a place in the catalogue; a BUMP is spent the moment it happens. */
export function isPlacement(tier: PromotionTier): boolean {
  return rankOf(tier) > 0;
}

/**
 * The first bump slot strictly after `after`.
 *
 * Works on the Baku wall clock: the instant is shifted into UTC+4, the slot is found
 * there, and the result is shifted back.
 */
export function nextBumpSlot(after: Date, bumpsPerDay: number): Date {
  const hours = BUMP_SLOTS_BY_RATE[bumpsPerDay] ?? BUMP_SLOTS_BY_RATE[1];
  const local = new Date(after.getTime() + BAKU_OFFSET_MS);
  for (let dayOffset = 0; dayOffset <= 1; dayOffset += 1) {
    for (const hour of hours) {
      const candidate = Date.UTC(
        local.getUTCFullYear(),
        local.getUTCMonth(),
        local.getUTCDate() + dayOffset,
        hour,
      );
      if (candidate > local.getTime()) return new Date(candidate - BAKU_OFFSET_MS);
    }
  }
  // Unreachable: the loop always covers a full day ahead.
  return new Date(after.getTime() + 24 * 60 * 60 * 1000);
}

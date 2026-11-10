import { SUPPORTED_LANGUAGES } from '@/i18n/config';
import type { ListingKind } from '@/dashboard/api/listings.api';
import type { ActiveProfile } from '@/dashboard/types/dashboard.types';

/** Listing kinds the dashboard can honestly show for each profile (from `myListings.kind`). */
export const LISTING_KINDS_BY_PROFILE: Record<ActiveProfile['type'], readonly ListingKind[]> = {
  user: ['vehicle', 'part'],
  seller: ['vehicle', 'part'],
  service: ['service'],
};

export function listingKindsForProfile(profile: ActiveProfile): readonly ListingKind[] {
  return LISTING_KINDS_BY_PROFILE[profile.type];
}

export function listingMatchesProfile(kind: ListingKind, profile: ActiveProfile): boolean {
  return listingKindsForProfile(profile).includes(kind);
}

export function profileMatches(a: ActiveProfile, b: ActiveProfile): boolean {
  if (a.type !== b.type) return false;
  if (a.type === 'user' && b.type === 'user') return true;
  return (a as { id: string }).id === (b as { id: string }).id;
}

export function profileToKey(p: ActiveProfile): string {
  if (p.type === 'user') return 'user';
  return `${p.type}-${p.id}`;
}

/** If the stored seller/service card is gone (or the id is stale), fall back to personal. */
export function resolveActiveProfile(
  active: ActiveProfile,
  available: ActiveProfile[],
): ActiveProfile {
  if (available.some((p) => profileMatches(p, active))) return active;
  return { type: 'user' };
}

export function stripLangPrefix(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] && (SUPPORTED_LANGUAGES as readonly string[]).includes(segments[0])) {
    const rest = segments.slice(1).join('/');
    return rest ? `/${rest}` : '/';
  }
  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

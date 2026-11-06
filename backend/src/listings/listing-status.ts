import { ListingStatus } from '@prisma/client';

/** Listings in these statuses are visible only to their owner (and moderators). */
export const HIDDEN_STATUSES: ListingStatus[] = [ListingStatus.DRAFT, ListingStatus.BLOCKED];

export const isHiddenFromPublic = (status: ListingStatus): boolean =>
  HIDDEN_STATUSES.includes(status);

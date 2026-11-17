import type { PromotionTarget } from '@/features/promotions/api/promotions.api';

const TARGET_FROM_PATH: Record<string, PromotionTarget> = {
  listing: 'LISTING',
  specialist: 'SPECIALIST',
  'service-center': 'SERVICE_CENTER',
};

export const promotionTargetFromPath = (segment: string | undefined): PromotionTarget =>
  TARGET_FROM_PATH[segment ?? ''] ?? 'LISTING';

export const promotePath = (targetType: PromotionTarget, targetId: string): string => {
  const segment = Object.keys(TARGET_FROM_PATH).find((key) => TARGET_FROM_PATH[key] === targetType);
  return `/promote/${segment ?? 'listing'}/${targetId}`;
};

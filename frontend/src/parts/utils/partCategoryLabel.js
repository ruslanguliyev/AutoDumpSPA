import { getPartCategoryKey } from '@/parts/utils/parts.constants';

/**
 * Resolve a part category slug from the API to an i18n key under `part:categories.*`.
 * Unknown slugs are returned as-is for display.
 */
export const getPartCategoryI18nKey = (rawCategory) => {
  const normalized = getPartCategoryKey(rawCategory);
  if (normalized) return normalized;
  const slug = String(rawCategory ?? '').trim().toLowerCase();
  return slug || null;
};

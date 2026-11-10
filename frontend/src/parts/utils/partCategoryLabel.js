import { getPartCategoryKey } from '@/parts/utils/parts.constants';

/**
 * Resolve a part category slug from the API to an i18n key under `part:categories.*`.
 * Unknown slugs are returned as-is so the caller can fall back to the raw value.
 */
export const getPartCategoryI18nKey = (rawCategory) => {
  const normalized = getPartCategoryKey(rawCategory);
  if (normalized) return normalized;
  const slug = String(rawCategory ?? '').trim().toLowerCase();
  return slug || null;
};

/**
 * Label for a part category: translated when the dictionary has the key, otherwise the API value.
 * @param {(key: string, opts?: { defaultValue?: string }) => string} t
 * @param {unknown} rawCategory
 */
export const formatPartCategoryLabel = (t, rawCategory) => {
  const raw = String(rawCategory ?? '').trim();
  if (!raw) return '';
  const key = getPartCategoryI18nKey(raw);
  if (!key) return raw;
  const label = t(`categories.${key}`, { defaultValue: '' });
  return label || raw;
};

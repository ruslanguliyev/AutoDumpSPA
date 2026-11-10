const SERVICE_TYPE_KEYS = ['garage', 'official', 'detailing', 'tire', 'electric', 'body'];

/**
 * Service type from the API → i18n `filters.serviceTypes.*`.
 * Unknown values (including uppercase seed slugs) fall back to the raw string.
 */
export const formatServiceTypeLabel = (t, rawType) => {
  const raw = String(rawType ?? '').trim();
  if (!raw) return '';
  const key = raw.toLowerCase();
  if (!SERVICE_TYPE_KEYS.includes(key)) return raw;
  const label = t(`filters.serviceTypes.${key}`, { defaultValue: '' });
  return label || raw;
};

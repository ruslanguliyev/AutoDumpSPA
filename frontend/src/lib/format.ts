/**
 * "189 900 AZN", the order the design writes prices in, and a dash when there is no
 * price. The old fallback was the Russian word for "negotiable", hardcoded — a caller
 * that wants to say that should say it in the reader's language.
 */
export const formatPrice = (
  value: number | null | undefined,
  currency = 'AZN',
  locale = 'ru-RU'
): string => (value != null ? `${value.toLocaleString(locale)} ${currency}` : '—');

export const formatMileage = (
  value: number | null | undefined,
  locale = 'ru-RU'
): string => (value != null ? `${value.toLocaleString(locale)} km` : '—');

export const formatYear = (value: number | string | null | undefined): string =>
  value != null && String(value).trim() ? String(value) : '—';

export const formatNumber = (
  value: number | null | undefined,
  locale = 'ru-RU'
): string => (value != null ? value.toLocaleString(locale) : '—');

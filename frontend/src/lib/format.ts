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

const toDate = (value: string | number | Date | null | undefined): Date | null => {
  if (value == null || value === '') return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** "10 Nov 2026" in the reader's language; empty string when the date is missing or invalid. */
export const formatDate = (
  value: string | number | Date | null | undefined,
  locale = 'ru-RU'
): string => {
  const date = toDate(value);
  return date ? date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' }) : '';
};

/** "Nov 2026" — for "member since", where the day is noise. */
export const formatMonthYear = (
  value: string | number | Date | null | undefined,
  locale = 'ru-RU'
): string => {
  const date = toDate(value);
  return date ? date.toLocaleDateString(locale, { month: 'long', year: 'numeric' }) : '';
};

/** BCP-47 tag for the active i18next language, for Intl and toLocaleString. */
export const intlLocale = (language: string | undefined): string =>
  language === 'az' ? 'az-Latn-AZ' : language === 'en' ? 'en-US' : 'ru-RU';

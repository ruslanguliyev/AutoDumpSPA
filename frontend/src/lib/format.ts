/**
 * Locale-aware numbers and dates for catalogue and detail pages.
 * Prices: "189 900 AZN" (order fixed); missing values render as "—".
 */
export const formatNumber = (
  value: number | null | undefined,
  locale = 'ru-RU',
): string => {
  if (value == null || !Number.isFinite(Number(value))) return '—';
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(Number(value));
};

export const formatPrice = (
  value: number | null | undefined,
  currency = 'AZN',
  locale = 'ru-RU',
): string => {
  if (value == null || !Number.isFinite(Number(value))) return '—';
  return `${formatNumber(Number(value), locale)} ${currency}`;
};

export const formatKm = (
  value: number | null | undefined,
  locale = 'ru-RU',
): string => {
  if (value == null || !Number.isFinite(Number(value))) return '—';
  return `${formatNumber(Number(value), locale)} km`;
};

export const formatMileage = formatKm;

export const formatYear = (value: number | string | null | undefined): string =>
  value != null && String(value).trim() ? String(value) : '—';

const toDate = (value: string | number | Date | null | undefined): Date | null => {
  if (value == null || value === '') return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isDateOnlyString = (value: unknown): boolean =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);

/** Calendar date, e.g. 10.11.2026 — numeric day/month/year for AZ/RU/EN. */
export const formatDate = (
  value: string | number | Date | null | undefined,
  locale = 'ru-RU',
): string => {
  const date = toDate(value);
  if (!date) return '';
  const dateOnly = isDateOnlyString(value);
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(dateOnly ? { timeZone: 'UTC' } : {}),
  }).format(date);
};

/** ICU for az-Latn can emit skeleton tokens like "2026 M04"; use explicit AZ month names then. */
const AZ_MONTHS = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avqust',
  'sentyabr',
  'oktyabr',
  'noyabr',
  'dekabr',
];

/** Month + year for “member since” — long month name avoids broken short labels on az. */
export const formatMonthYear = (
  value: string | number | Date | null | undefined,
  locale = 'ru-RU',
): string => {
  const date = toDate(value);
  if (!date) return '';
  const dateOnly = isDateOnlyString(value);
  const formatted = new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    ...(dateOnly ? { timeZone: 'UTC' } : {}),
  }).format(date);
  if (/M\d{1,2}/.test(formatted)) {
    const monthIndex = dateOnly ? date.getUTCMonth() : date.getMonth();
    const year = dateOnly ? date.getUTCFullYear() : date.getFullYear();
    return `${AZ_MONTHS[monthIndex]} ${year}`;
  }
  return formatted;
};

/** BCP-47 tag for the active i18next language, for Intl and toLocaleString. */
export const intlLocale = (language: string | undefined): string =>
  language === 'az' ? 'az-Latn-AZ' : language === 'en' ? 'en-US' : 'ru-RU';

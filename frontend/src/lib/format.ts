export const formatPrice = (
  value: number | null | undefined,
  currency = 'AZN',
  locale = 'ru-RU'
): string => (value != null ? `${currency} ${value.toLocaleString(locale)}` : 'Договорная');

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

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

/** Two-decimal amounts (promotion qapik → manat). Integer catalogue prices use `formatPrice`. */
export const formatDecimalPrice = (
  value: number | null | undefined,
  currency = 'AZN',
  locale = 'ru-RU',
): string => {
  if (value == null || !Number.isFinite(Number(value))) return '—';
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
  return `${formatted} ${currency}`;
};

/** RU uses Cyrillic units; AZ and EN use Latin km / HP / L. */
const unitLabels = (locale = 'ru-RU') =>
  String(locale).startsWith('ru')
    ? { km: 'км', hp: 'л.с.', liter: 'л' }
    : { km: 'km', hp: 'HP', liter: 'L' };

export const formatKm = (
  value: number | null | undefined,
  locale = 'ru-RU',
): string => {
  if (value == null || !Number.isFinite(Number(value))) return '—';
  return `${formatNumber(Number(value), locale)} ${unitLabels(locale).km}`;
};

export const formatMileage = formatKm;

export const formatEngineDisplacement = (
  value: number | null | undefined,
  locale = 'ru-RU',
): string => {
  if (value == null || !Number.isFinite(Number(value))) return '';
  const formatted = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(Number(value));
  return `${formatted} ${unitLabels(locale).liter}`;
};

/** Catalogue cards always show one decimal, as in "2.0 L". */
export const formatCardEngine = (
  value: number | null | undefined,
  locale = 'ru-RU',
): string => {
  if (value == null || !Number.isFinite(Number(value)) || Number(value) <= 0) return '';
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Number(value));
  return `${formatted} ${unitLabels(locale).liter}`;
};

export const formatHorsepower = (
  value: number | null | undefined,
  locale = 'ru-RU',
): string => {
  if (value == null || !Number.isFinite(Number(value))) return '';
  return `${formatNumber(Number(value), locale)} ${unitLabels(locale).hp}`;
};

export const formatYear = (value: number | string | null | undefined): string =>
  value != null && String(value).trim() ? String(value) : '—';

const toDate = (value: string | number | Date | null | undefined): Date | null => {
  if (value == null || value === '') return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isDateOnlyString = (value: unknown): boolean =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);

const BAKU_TZ = 'Asia/Baku';

const bakuDayKey = (date: Date): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: BAKU_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

/** Calendar day in Baku, shifted by whole days. Noon UTC stays on that day in UTC+4. */
const bakuDaysAgo = (date: Date, days: number): string => {
  const [year, month, day] = bakuDayKey(date).split('-').map(Number);
  return bakuDayKey(new Date(Date.UTC(year, month - 1, day - days, 12)));
};

export type ListingFreshness =
  | { kind: 'today' | 'yesterday'; time: string }
  | { kind: 'date'; date: string };

/**
 * The quiet line on a catalogue card: "today 00:27" / "yesterday 18:40",
 * or a short date once the listing is older. Clock and day are Baku time.
 */
export const listingFreshness = (
  value: string | number | Date | null | undefined,
  locale = 'ru-RU',
  now: Date = new Date(),
): ListingFreshness | null => {
  const date = toDate(value);
  if (!date) return null;
  const time = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: BAKU_TZ,
  }).format(date);
  const day = bakuDayKey(date);
  if (day === bakuDayKey(now)) return { kind: 'today', time };
  if (day === bakuDaysAgo(now, 1)) return { kind: 'yesterday', time };
  return {
    kind: 'date',
    date: new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: BAKU_TZ,
    }).format(date),
  };
};

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

/** Russian genitive months for “с ноября 2026 г.” — Intl month+year is nominative. */
const RU_MONTHS_GENITIVE = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Address line plus city, without repeating the city when it is already in the address
 * (“Nizami küçəsi 45, Baku” + city “Baku” → one “Baku”).
 */
export const formatPlace = (
  address?: string | null,
  city?: string | null,
): string => {
  const line = String(address ?? '').trim();
  const town = String(city ?? '').trim();
  if (!line) return town;
  if (!town) return line;
  const haystack = line.toLowerCase();
  const needle = town.toLowerCase();
  if (haystack === needle) return line;
  const cityAtEnd = new RegExp(`(^|[,\\s])${escapeRegExp(needle)}\\.?$`, 'i');
  if (cityAtEnd.test(line) || haystack.includes(`, ${needle}`)) return line;
  return `${line}, ${town}`;
};

/** Month + year for “member since” — long month name avoids broken short labels on az. */
export const formatMonthYear = (
  value: string | number | Date | null | undefined,
  locale = 'ru-RU',
): string => {
  const date = toDate(value);
  if (!date) return '';
  const dateOnly = isDateOnlyString(value);
  const monthIndex = dateOnly ? date.getUTCMonth() : date.getMonth();
  const year = dateOnly ? date.getUTCFullYear() : date.getFullYear();
  if (String(locale).startsWith('ru')) {
    return `${RU_MONTHS_GENITIVE[monthIndex]} ${year} г.`;
  }
  const formatted = new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    ...(dateOnly ? { timeZone: 'UTC' } : {}),
  }).format(date);
  if (/M\d{1,2}/.test(formatted)) {
    return `${AZ_MONTHS[monthIndex]} ${year}`;
  }
  return formatted;
};

/** BCP-47 tag for the active i18next language, for Intl and toLocaleString. */
export const intlLocale = (language: string | undefined): string =>
  language === 'az' ? 'az-Latn-AZ' : language === 'en' ? 'en-US' : 'ru-RU';

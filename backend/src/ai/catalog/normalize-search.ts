import {
  brandForUniqueModel,
  isAznCurrency,
  matchBrand,
  matchCity,
  matchCondition,
  matchFuel,
  matchModel,
  matchTransmission,
} from './match-catalog';

export type RawSearchParse = {
  brand?: unknown;
  model?: unknown;
  priceFrom?: unknown;
  priceTo?: unknown;
  priceCurrency?: unknown;
  pricePhrase?: unknown;
  yearFrom?: unknown;
  yearTo?: unknown;
  city?: unknown;
  condition?: unknown;
  fuel?: unknown;
  transmission?: unknown;
  unapplied?: unknown;
};

export type SearchFilters = {
  brand: string | null;
  model: string | null;
  priceFrom: number | null;
  priceTo: number | null;
  yearFrom: number | null;
  yearTo: number | null;
  condition: string | null;
  fuel: string | null;
  transmission: string | null;
  location: string | null;
};

export type NormalizedSearch = {
  filters: SearchFilters;
  unapplied: string[];
};

const text = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const money = (value: unknown): number | null => {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100_000_000) return null;
  return Math.round(parsed);
};

const year = (value: unknown): number | null => {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(parsed) || parsed < 1950 || parsed > 2035) return null;
  return parsed;
};

const emptyFilters = (): SearchFilters => ({
  brand: null,
  model: null,
  priceFrom: null,
  priceTo: null,
  yearFrom: null,
  yearTo: null,
  condition: null,
  fuel: null,
  transmission: null,
  location: null,
});

/**
 * Keeps only values that exist in the project catalogs and in VehiclesFilterInput.
 * Anything else is returned in the user's wording via `unapplied`.
 */
export function normalizeSearch(raw: RawSearchParse | null | undefined): NormalizedSearch {
  const filters = emptyFilters();
  const unapplied: string[] = [];
  const push = (phrase: string | null | undefined) => {
    const value = phrase?.trim();
    if (!value || unapplied.includes(value)) return;
    unapplied.push(value);
  };

  if (Array.isArray(raw?.unapplied)) {
    for (const item of raw.unapplied) {
      if (typeof item === 'string') push(item);
    }
  }

  const source = raw ?? {};
  const rawBrand = text(source.brand);
  const rawModel = text(source.model);
  let brand = matchBrand(rawBrand);
  if (!brand && rawModel) brand = brandForUniqueModel(rawModel);
  if (rawBrand && !brand) push(rawBrand);
  if (brand) filters.brand = brand;

  const model = brand ? matchModel(brand, rawModel) : null;
  if (rawModel && !model) push(rawModel);
  if (model) filters.model = model;

  const currency = text(source.priceCurrency);
  const priceFrom = money(source.priceFrom);
  const priceTo = money(source.priceTo);
  const priceMentioned = priceFrom != null || priceTo != null || currency != null;
  if (priceMentioned && !isAznCurrency(currency)) {
    push(text(source.pricePhrase) ?? [currency, priceTo ?? priceFrom].filter(Boolean).join(' '));
  } else {
    if (priceFrom != null) filters.priceFrom = priceFrom;
    if (priceTo != null) filters.priceTo = priceTo;
    if (
      filters.priceFrom != null &&
      filters.priceTo != null &&
      filters.priceFrom > filters.priceTo
    ) {
      push(text(source.pricePhrase));
      filters.priceFrom = null;
      filters.priceTo = null;
    }
  }

  const yearFrom = year(source.yearFrom);
  const yearTo = year(source.yearTo);
  if (yearFrom != null) filters.yearFrom = yearFrom;
  if (yearTo != null) filters.yearTo = yearTo;
  if (filters.yearFrom != null && filters.yearTo != null && filters.yearFrom > filters.yearTo) {
    push(`${filters.yearFrom}–${filters.yearTo}`);
    filters.yearFrom = null;
    filters.yearTo = null;
  }

  const rawCity = text(source.city);
  const city = matchCity(rawCity);
  if (rawCity && !city) push(rawCity);
  if (city) filters.location = city;

  const rawCondition = text(source.condition);
  const condition = matchCondition(rawCondition);
  if (rawCondition && !condition) push(rawCondition);
  if (condition) filters.condition = condition;

  const rawFuel = text(source.fuel);
  const fuel = matchFuel(rawFuel);
  if (rawFuel && !fuel) push(rawFuel);
  if (fuel) filters.fuel = fuel;

  const rawTransmission = text(source.transmission);
  const transmission = matchTransmission(rawTransmission);
  if (rawTransmission && !transmission) push(rawTransmission);
  if (transmission) filters.transmission = transmission;

  return { filters, unapplied };
}

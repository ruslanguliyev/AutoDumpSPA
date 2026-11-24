/**
 * When a search finds nothing, these are the softer versions of it we try, in order,
 * so the assistant can offer a near match (another year, a nearby city in Azerbaijan)
 * instead of a bare "no". Each step changes one thing and says what it changed.
 */

/** Neighbouring towns, Azerbaijan only. Keys and values are as the catalogue stores them. */
const NEARBY_CITIES: Record<string, string[]> = {
  baku: ['Sumqayit', 'Khirdalan'],
  sumqayit: ['Baku', 'Khirdalan'],
  khirdalan: ['Baku', 'Sumqayit'],
  ganja: ['Shamkir', 'Goygol', 'Naftalan'],
  shamkir: ['Ganja', 'Tovuz'],
  goygol: ['Ganja'],
  naftalan: ['Ganja', 'Goranboy'],
  mingachevir: ['Yevlakh'],
  yevlakh: ['Mingachevir', 'Barda'],
  barda: ['Yevlakh', 'Aghdam'],
  lankaran: ['Masalli', 'Astara', 'Lerik'],
  masalli: ['Lankaran', 'Jalilabad'],
  astara: ['Lankaran'],
  sheki: ['Gakh', 'Oghuz'],
  gakh: ['Sheki', 'Zagatala'],
  zagatala: ['Balakan', 'Gakh'],
  shirvan: ['Salyan', 'Hajigabul'],
  salyan: ['Shirvan', 'Neftchala'],
  quba: ['Qusar', 'Khachmaz'],
  qusar: ['Quba', 'Khachmaz'],
  khachmaz: ['Quba', 'Qusar'],
  shamakhi: ['Ismayilli', 'Aghsu'],
  nakhchivan: [],
};

export function nearbyCities(city: string | null | undefined): string[] {
  if (!city) return [];
  return NEARBY_CITIES[city.trim().toLowerCase()] ?? [];
}

/** One softer search: the input to run and, in English for the model, what differs. */
export type Relaxation<T> = { input: T; changed: string };

type Filters = {
  city?: string | null;
  yearFrom?: number | null;
  yearTo?: number | null;
  priceTo?: number | null;
  pricePerDayTo?: number | null;
  color?: string | null;
  model?: string | null;
  brand?: string | null;
  carModel?: string | null;
  carBrand?: string | null;
  condition?: string | null;
  mileageTo?: number | null;
};

const YEAR_STEP = 2;
const PRICE_STEP = 1.2;

/** Softer versions of a search, most similar first. Empty when nothing can be loosened. */
export function relaxations<T extends Filters>(tool: string, input: T): Relaxation<T>[] {
  const steps: Relaxation<T>[] = [];
  const add = (patch: Partial<Filters>, changed: string) =>
    steps.push({ input: { ...input, ...patch } as T, changed });

  const cityStep = () => {
    if (!input.city) return;
    const nearby = nearbyCities(input.city);
    for (const city of nearby.slice(0, 2)) add({ city }, `city ${city} (nearby) instead of ${input.city}`);
    add({ city: null }, `any city in Azerbaijan instead of ${input.city}`);
  };

  if (tool === 'search_cars' || tool === 'search_rentals') {
    if (input.yearFrom != null || input.yearTo != null) {
      const yearFrom = input.yearFrom != null ? input.yearFrom - YEAR_STEP : null;
      const yearTo = input.yearTo != null ? input.yearTo + YEAR_STEP : null;
      add({ yearFrom, yearTo }, `years ${yearFrom ?? 'any'}-${yearTo ?? 'any'} instead of ${input.yearFrom ?? 'any'}-${input.yearTo ?? 'any'}`);
    }
    cityStep();
    if (input.priceTo != null) {
      const priceTo = Math.round(input.priceTo * PRICE_STEP);
      add({ priceTo }, `price up to ${priceTo} AZN instead of ${input.priceTo} AZN`);
    }
    if (input.pricePerDayTo != null) {
      const pricePerDayTo = Math.round(input.pricePerDayTo * PRICE_STEP);
      add({ pricePerDayTo }, `up to ${pricePerDayTo} AZN per day instead of ${input.pricePerDayTo} AZN`);
    }
    if (input.mileageTo != null) {
      const mileageTo = Math.round(input.mileageTo * 1.5);
      add({ mileageTo }, `mileage up to ${mileageTo} km instead of ${input.mileageTo} km`);
    }
    if (input.color) add({ color: null }, `any colour instead of ${input.color}`);
    if (input.model && input.brand) add({ model: null }, `other ${input.brand} models instead of ${input.model}`);
  } else if (tool === 'search_parts') {
    if (input.carModel && input.carBrand) add({ carModel: null }, `parts for any ${input.carBrand} instead of ${input.carModel}`);
    cityStep();
    if (input.condition) add({ condition: null }, `new or used instead of only ${input.condition}`);
    if (input.priceTo != null) {
      const priceTo = Math.round(input.priceTo * PRICE_STEP);
      add({ priceTo }, `price up to ${priceTo} AZN instead of ${input.priceTo} AZN`);
    }
  } else {
    cityStep();
    if (input.carBrand) add({ carBrand: null }, `any car make instead of only ${input.carBrand}`);
  }
  return steps;
}

/** Strips anything that looks like a phone number or an e-mail before a search is logged. */
export function scrubFilters(input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === null || value === undefined || value === '' || value === false) continue;
    out[key] =
      typeof value === 'string'
        ? value
            .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '[email]')
            // Azerbaijani numbers: +994 50 123 45 67, 050 123 45 67, 0501234567.
            .replace(/(?:\+?994|\b0)[\s()-]*\d{2}[\s()-]*\d{3}[\s()-]*\d{2}[\s()-]*\d{2}\b/g, '[phone]')
        : value;
  }
  return out;
}

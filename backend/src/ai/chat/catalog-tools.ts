import { SEARCH_BRANDS } from '../catalog/search-catalog.data';
import {
  SEARCH_CITIES,
  SEARCH_CONDITIONS,
  SEARCH_FUELS,
  SEARCH_TRANSMISSIONS,
} from '../catalog/match-catalog';
import type { AiTool } from '../providers/ai-provider';

/**
 * The assistant's only window onto data: one search tool per catalogue.
 * Every tool is read-only and returns real rows; the model never writes or invents entries.
 */

export type CarSearchInput = {
  brand?: string | null;
  model?: string | null;
  yearFrom?: number | null;
  yearTo?: number | null;
  priceFrom?: number | null;
  priceTo?: number | null;
  mileageTo?: number | null;
  color?: string | null;
  bodyType?: string | null;
  fuel?: string | null;
  transmission?: string | null;
  condition?: string | null;
  city?: string | null;
  drive?: string | null;
};

export type RentalSearchInput = Omit<CarSearchInput, 'priceFrom' | 'priceTo' | 'mileageTo' | 'condition'> & {
  pricePerDayTo?: number | null;
};

export type PartSearchInput = {
  query?: string | null;
  oemCode?: string | null;
  carBrand?: string | null;
  carModel?: string | null;
  condition?: string | null;
  city?: string | null;
  priceTo?: number | null;
};

export type KeywordSearchInput = {
  query?: string | null;
  city?: string | null;
  carBrand?: string | null;
};

export type SpecialistSearchInput = KeywordSearchInput & { mobileService?: boolean | null };

export type SellerSearchInput = {
  query?: string | null;
  city?: string | null;
  type?: 'DEALER' | 'PARTS_DEALER' | null;
};

export const BODY_TYPES = [
  'sedan',
  'suv',
  'hatchback',
  'wagon',
  'coupe',
  'convertible',
  'minivan',
  'pickup',
  'van',
] as const;

const str = { type: ['string', 'null'] };
const int = { type: ['integer', 'null'] };
const num = { type: ['number', 'null'] };

const object = (properties: Record<string, unknown>) => ({
  type: 'object',
  additionalProperties: false,
  properties,
});

const vehicleProps = {
  brand: { ...str, description: `Make in Latin script, e.g. ${SEARCH_BRANDS.slice(0, 8).join(', ')}.` },
  model: { ...str, description: 'Model name in Latin script, e.g. Camry, X5, Prius.' },
  yearFrom: int,
  yearTo: int,
  color: { ...str, description: 'Colour in English: White, Black, Gray, Silver, Blue, Red, Green, Brown, Beige, Yellow.' },
  bodyType: { ...str, enum: [...BODY_TYPES, null] },
  fuel: { ...str, enum: [...SEARCH_FUELS, null] },
  transmission: { ...str, enum: [...SEARCH_TRANSMISSIONS, null] },
  city: { ...str, description: `City in Latin script. Known cities: ${SEARCH_CITIES.join(', ')}.` },
  drive: { ...str, description: 'Drive type in English: AWD, FWD, RWD, 4WD.' },
};

export const CATALOG_TOOLS: AiTool[] = [
  {
    name: 'search_cars',
    description:
      'Search cars FOR SALE on AutoBaz. Prices are in AZN. Returns real listings with their total count. Leave a filter out when the user did not ask for it. brand and model match as substrings and catalogue model names vary ("G-Class", "G 63", "G 500"), so when a model search finds little, search again with the brand only and pick the matching rows.',
    schema: object({
      ...vehicleProps,
      priceFrom: num,
      priceTo: num,
      mileageTo: { ...int, description: 'Maximum mileage in km.' },
      condition: { ...str, enum: [...SEARCH_CONDITIONS, null] },
    }),
  },
  {
    name: 'search_rentals',
    description:
      'Search cars FOR RENT (daily rental) on AutoBaz. pricePerDayTo is the maximum price per day in AZN.',
    schema: object({ ...vehicleProps, pricePerDayTo: num }),
  },
  {
    name: 'search_parts',
    description:
      'Search spare parts on AutoBaz. query holds the part words in English AND in the user\'s language (e.g. "brake pads тормозные колодки"). carBrand/carModel narrow to parts for that car.',
    schema: object({
      query: str,
      oemCode: { ...str, description: 'OEM / article number if the user gave one.' },
      carBrand: str,
      carModel: str,
      condition: { ...str, enum: ['new', 'used', null] },
      city: str,
      priceTo: num,
    }),
  },
  {
    name: 'search_car_services',
    description:
      'Search car service centres (repair shops, detailing, tyre service, diagnostics). query holds the kind of work in English AND in the user\'s language, e.g. "diagnostics диагностика", "detailing", "tire шины", "maintenance repair".',
    schema: object({ query: str, city: str, carBrand: str }),
  },
  {
    name: 'search_specialists',
    description:
      'Search individual mechanics / masters. query holds the skill in English AND in the user\'s language; known skills: ENGINE, TRANSMISSION, ELECTRICAL, DETAILING, TUNING, SUSPENSION, BRAKES, AC, DIAGNOSTICS. mobileService=true for a master who comes to the client.',
    schema: object({
      query: str,
      city: str,
      carBrand: str,
      mobileService: { type: ['boolean', 'null'] },
    }),
  },
  {
    name: 'search_sellers',
    description:
      'Search dealers and parts dealers (companies) on AutoBaz by name or city. Private sellers are not listed.',
    schema: object({
      query: str,
      city: str,
      type: { ...str, enum: ['DEALER', 'PARTS_DEALER', null] },
    }),
  },
];

export const CATALOG_TOOL_NAMES = CATALOG_TOOLS.map((tool) => tool.name);

const text = (value: unknown, max = 80): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, max) : null;
};

const bounded = (value: unknown, min: number, max: number, integer = false): number | null => {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) return null;
  return integer ? Math.round(parsed) : parsed;
};

const oneOf = <T extends string>(value: unknown, allowed: readonly T[]): T | null => {
  const found = allowed.find((item) => typeof value === 'string' && item.toLowerCase() === value.trim().toLowerCase());
  return found ?? null;
};

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

const year = (value: unknown) => bounded(value, 1950, 2035, true);
const price = (value: unknown) => bounded(value, 0, 100_000_000);

/** Tool input comes from the model: keep only known fields with sane values. */
export function readCarInput(raw: unknown): CarSearchInput {
  const input = record(raw);
  return {
    brand: text(input.brand),
    model: text(input.model),
    yearFrom: year(input.yearFrom),
    yearTo: year(input.yearTo),
    priceFrom: price(input.priceFrom),
    priceTo: price(input.priceTo),
    mileageTo: bounded(input.mileageTo, 0, 2_000_000, true),
    color: text(input.color, 30),
    bodyType: oneOf(input.bodyType, BODY_TYPES),
    fuel: oneOf(input.fuel, SEARCH_FUELS),
    transmission: oneOf(input.transmission, SEARCH_TRANSMISSIONS),
    condition: oneOf(input.condition, SEARCH_CONDITIONS),
    city: text(input.city, 40),
    drive: text(input.drive, 10),
  };
}

export function readRentalInput(raw: unknown): RentalSearchInput {
  const { priceFrom: _from, priceTo: _to, mileageTo: _mileage, condition: _condition, ...rest } =
    readCarInput(raw);
  return { ...rest, pricePerDayTo: price(record(raw).pricePerDayTo) };
}

export function readPartInput(raw: unknown): PartSearchInput {
  const input = record(raw);
  return {
    query: text(input.query, 160),
    oemCode: text(input.oemCode, 40),
    carBrand: text(input.carBrand),
    carModel: text(input.carModel),
    condition: oneOf(input.condition, ['new', 'used'] as const),
    city: text(input.city, 40),
    priceTo: price(input.priceTo),
  };
}

export function readKeywordInput(raw: unknown): KeywordSearchInput {
  const input = record(raw);
  return {
    query: text(input.query, 160),
    city: text(input.city, 40),
    carBrand: text(input.carBrand),
  };
}

export function readSpecialistInput(raw: unknown): SpecialistSearchInput {
  return { ...readKeywordInput(raw), mobileService: record(raw).mobileService === true };
}

export function readSellerInput(raw: unknown): SellerSearchInput {
  const input = record(raw);
  return {
    query: text(input.query, 120),
    city: text(input.city, 40),
    type: oneOf(input.type, ['DEALER', 'PARTS_DEALER'] as const),
  };
}

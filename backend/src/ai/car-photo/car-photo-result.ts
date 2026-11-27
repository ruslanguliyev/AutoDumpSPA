import { matchBrand, matchModel } from '../catalog/match-catalog';
import { SEARCH_MODELS } from '../catalog/search-catalog.data';
import {
  CAR_BODY_VALUES,
  CAR_DRIVETRAIN_VALUES,
  CAR_FUEL_VALUES,
  CAR_GUESS_FIELDS,
  CAR_TRANSMISSION_VALUES,
  type CarBodyValue,
  type CarDrivetrainValue,
  type CarFuelValue,
  type CarGuessField,
  type CarTransmissionValue,
} from './car-photo-prompt';

export type CarPhotoConfidence = 'high' | 'medium' | 'low';

/** What the server read from a photo of a car. Price, mileage, condition, VIN and plate are never in it. */
export type CarPhotoResult = {
  isCar: boolean;
  confidence: CarPhotoConfidence;
  /** A make from our catalogue, or '' when none matched. */
  brand: string;
  /** A model of that make from our catalogue, or '' when none matched. */
  model: string;
  bodyType: CarBodyValue | null;
  yearFrom: number | null;
  yearTo: number | null;
  fuel: CarFuelValue | null;
  transmission: CarTransmissionValue | null;
  drivetrain: CarDrivetrainValue | null;
  /** Filled fields the model inferred from the look of the car; the seller should check them. */
  likely: CarGuessField[];
  description: string;
};

export class CarPhotoValidationError extends Error {}

const URL_OR_EMAIL = /https?:\/\/|www\.|\S+@\S+\.\S+/i;
const EMOJI = /\p{Extended_Pictographic}/u;
const CURRENT_YEAR = new Date().getFullYear();

const text = (value: unknown, max: number) => {
  if (typeof value !== 'string') return '';
  const cleaned = value.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim();
  return cleaned.length > max ? '' : cleaned;
};

const year = (value: unknown) =>
  typeof value === 'number' && Number.isInteger(value) && value >= 1950 && value <= CURRENT_YEAR + 1 ? value : null;

const pick = <T extends string>(values: readonly T[], value: unknown): T | null =>
  values.includes(value as T) ? (value as T) : null;

const foldModel = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '');

/** Exact catalogue model first, then the longest catalogue name the text starts with ("Golf V" → Golf). */
function catalogModel(brand: string, raw: unknown): string {
  if (typeof raw !== 'string' || !raw.trim()) return '';
  const exact = matchModel(brand, raw);
  if (exact) return exact;
  const folded = foldModel(raw.replace(/\([^)]*\)/g, ' '));
  let best = '';
  for (const model of SEARCH_MODELS[brand] ?? []) {
    const key = foldModel(model);
    if (key.length >= 2 && folded.startsWith(key) && key.length > foldModel(best).length) best = model;
  }
  return best;
}

const EMPTY: Omit<CarPhotoResult, 'isCar' | 'confidence'> = {
  brand: '',
  model: '',
  bodyType: null,
  yearFrom: null,
  yearTo: null,
  fuel: null,
  transmission: null,
  drivetrain: null,
  likely: [],
  description: '',
};

export function buildCarPhotoResult(raw: unknown): CarPhotoResult {
  if (!raw || typeof raw !== 'object') throw new CarPhotoValidationError('shape');
  const value = raw as Record<string, unknown>;
  const confidence: CarPhotoConfidence =
    value.confidence === 'high' || value.confidence === 'medium' ? value.confidence : 'low';

  if (value.isCar !== true) return { isCar: false, confidence, ...EMPTY, likely: [] };

  const description = text(value.description, 900);
  if (description && (URL_OR_EMAIL.test(description) || EMOJI.test(description))) {
    throw new CarPhotoValidationError('description');
  }

  // Only makes and models our catalogue knows; anything else is left for the seller.
  const brand = matchBrand(typeof value.brand === 'string' ? value.brand : null) ?? '';
  const model = brand ? catalogModel(brand, value.model) : '';

  let yearFrom = year(value.yearFrom);
  let yearTo = year(value.yearTo);
  if (yearFrom && yearTo && yearTo < yearFrom) [yearFrom, yearTo] = [yearTo, yearFrom];
  // Years without a model say nothing useful.
  if (!model) {
    yearFrom = null;
    yearTo = null;
  }

  const result: CarPhotoResult = {
    isCar: true,
    confidence,
    brand,
    model,
    bodyType: pick(CAR_BODY_VALUES, value.bodyType),
    yearFrom,
    yearTo,
    fuel: pick(CAR_FUEL_VALUES, value.fuel),
    transmission: pick(CAR_TRANSMISSION_VALUES, value.transmission),
    drivetrain: pick(CAR_DRIVETRAIN_VALUES, value.drivetrain),
    likely: [],
    description,
  };

  const filled: Record<CarGuessField, boolean> = {
    model: Boolean(result.model),
    bodyType: Boolean(result.bodyType),
    years: Boolean(result.yearFrom || result.yearTo),
    fuel: Boolean(result.fuel),
    transmission: Boolean(result.transmission),
    drivetrain: Boolean(result.drivetrain),
  };
  const likely: unknown[] = Array.isArray(value.likely) ? value.likely : [];
  // With low confidence every filled field is a guess.
  result.likely = CAR_GUESS_FIELDS.filter(
    (field) => filled[field] && (confidence === 'low' || likely.includes(field)),
  );
  return result;
}

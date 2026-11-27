import type { CarPhotoResult } from '@/features/addItem/ai/partPhoto.api';
import {
  CAR_BRANDS,
  getModelsForBrand,
  isVehicleCategoryId,
} from '@/features/addItem/constants/vehicleCatalog';

type GuessField = CarPhotoResult['likely'][number];

/** The wizard's own option lists (VehicleStep). Anything else from the server is dropped. */
const FUELS = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'Gas'];
const TRANSMISSIONS = ['Automatic', 'Manual', 'Semi-Automatic'];
const DRIVETRAINS = ['FWD', 'RWD', 'AWD'];
const YEAR_MIN = 1990;
const YEAR_MAX = 2026;

const fold = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '');
const findIn = (list: readonly string[], value: string | null | undefined) =>
  value ? (list.find((item) => fold(item) === fold(value)) ?? '') : '';

/** The server's suggestion narrowed to the values this wizard can hold. */
export type CarFill = {
  brand: string;
  model: string;
  /** The exact year, only when the server named a single year in our range. */
  year: string;
  yearFrom: number | null;
  yearTo: number | null;
  bodyType: string;
  fuel: string;
  transmission: string;
  drivetrain: string;
  description: string;
  likely: GuessField[];
};

export function toCarFill(result: CarPhotoResult): CarFill {
  const brand = findIn(CAR_BRANDS, result.brand);
  const model = brand ? findIn(getModelsForBrand(brand), result.model) : '';
  const single = model && result.yearFrom && result.yearFrom === result.yearTo ? result.yearFrom : null;
  return {
    brand,
    model,
    year: single && single >= YEAR_MIN && single <= YEAR_MAX ? String(single) : '',
    yearFrom: model ? result.yearFrom : null,
    yearTo: model ? result.yearTo : null,
    bodyType: result.bodyType && isVehicleCategoryId(result.bodyType) ? result.bodyType : '',
    fuel: findIn(FUELS, result.fuel),
    transmission: findIn(TRANSMISSIONS, result.transmission),
    drivetrain: findIn(DRIVETRAINS, result.drivetrain),
    description: result.description,
    likely: result.likely,
  };
}


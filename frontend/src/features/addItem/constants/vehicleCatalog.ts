/**
 * Central vehicle taxonomy for add-item wizard (brands, models, trims).
 * Values are stable English identifiers / OEM-style names for storage & API.
 */

export const VEHICLE_CATEGORY_IDS = [
  'sedan',
  'hatchback',
  'liftback',
  'wagon',
  'suv',
  'crossover',
  'coupe',
  'convertible',
  'minivan',
  'van',
  'pickup',
  'sport',
  'other',
] as const;

export type VehicleCategoryId = (typeof VEHICLE_CATEGORY_IDS)[number];

export const isVehicleCategoryId = (v: string): v is VehicleCategoryId =>
  (VEHICLE_CATEGORY_IDS as readonly string[]).includes(v);

/** English short labels for auto-title (no i18n in validate utils). */
export const VEHICLE_CATEGORY_TITLE_LABEL: Record<VehicleCategoryId, string> = {
  sedan: 'Sedan',
  hatchback: 'Hatchback',
  liftback: 'Liftback',
  wagon: 'Wagon',
  suv: 'SUV',
  crossover: 'Crossover',
  coupe: 'Coupe',
  convertible: 'Convertible',
  minivan: 'Minivan',
  van: 'Van',
  pickup: 'Pickup',
  sport: 'Sports car',
  other: 'Other',
};

/** When brand has no curated model list, allow this sentinel only. */
export const VEHICLE_MODEL_OTHER_VALUE = '__other__';

export const CAR_BRANDS = [
  'Audi',
  'BMW',
  'Chevrolet',
  'Chery',
  'Chrysler',
  'Citroen',
  'Daewoo',
  'Fiat',
  'Ford',
  'GAZ',
  'Geely',
  'Honda',
  'Hyundai',
  'Infiniti',
  'Jaguar',
  'Jeep',
  'Kia',
  'Land Rover',
  'Lexus',
  'Mazda',
  'Mercedes-Benz',
  'Mitsubishi',
  'Nissan',
  'Opel',
  'Peugeot',
  'Porsche',
  'Renault',
  'Skoda',
  'Subaru',
  'Suzuki',
  'Tesla',
  'Toyota',
  'VAZ (LADA)',
  'Volkswagen',
  'Volvo',
] as const;

export type CarBrand = (typeof CAR_BRANDS)[number];

export const CAR_MODELS: Record<string, string[]> = {
  Audi: ['A3', 'A4', 'A6', 'A7', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'TT', 'R8'],
  BMW: [
    '1 Series',
    '2 Series',
    '3 Series',
    '4 Series',
    '5 Series',
    '6 Series',
    '7 Series',
    'X1',
    'X2',
    'X3',
    'X4',
    'X5',
    'X6',
    'X7',
    'M3',
    'M5',
    'M4',
  ],
  Chevrolet: ['Captiva', 'Cruze', 'Equinox', 'Malibu', 'Spark', 'Tahoe', 'Traverse'],
  Chery: ['Arrizo 5', 'Arrizo 6', 'Tiggo 4', 'Tiggo 7', 'Tiggo 8'],
  Chrysler: ['300C', 'Pacifica', 'Voyager'],
  Citroen: ['C3', 'C4', 'C5', 'Berlingo', 'C-Elysee'],
  Daewoo: ['Matiz', 'Nexia', 'Lanos', 'Gentra'],
  Fiat: ['500', '500X', 'Tipo', 'Doblo', 'Panda'],
  Ford: [
    'EcoSport',
    'Edge',
    'Escape',
    'Explorer',
    'F-150',
    'Focus',
    'Fusion',
    'Kuga',
    'Mondeo',
    'Mustang',
    'Ranger',
  ],
  GAZ: ['Volga', 'Sobol', 'Gazelle'],
  Geely: ['Atlas', 'Atlas Pro', 'Coolray', 'Emgrand'],
  Honda: ['Accord', 'City', 'Civic', 'CR-V', 'HR-V', 'Jazz', 'Pilot'],
  Hyundai: ['Accent', 'Elantra', 'i20', 'i30', 'ix35', 'Kona', 'Santa Fe', 'Sonata', 'Tucson'],
  Infiniti: ['Q50', 'Q60', 'QX50', 'QX60', 'QX80'],
  Jaguar: ['XE', 'XF', 'F-Pace', 'E-Pace', 'I-Pace'],
  Jeep: ['Wrangler', 'Grand Cherokee', 'Compass', 'Renegade', 'Cherokee'],
  Kia: ['Carnival', 'Cerato', 'K5', 'Optima', 'Rio', 'Sorento', 'Sportage', 'Stinger', 'Telluride'],
  'Land Rover': [
    'Defender',
    'Discovery',
    'Discovery Sport',
    'Freelander',
    'Range Rover',
    'Range Rover Evoque',
    'Range Rover Sport',
  ],
  Lexus: ['ES', 'GS', 'GX', 'IS', 'LS', 'LX', 'NX', 'RX', 'UX'],
  Mazda: ['CX-3', 'CX-5', 'CX-9', 'Mazda2', 'Mazda3', 'Mazda6'],
  'Mercedes-Benz': [
    'A-Class',
    'B-Class',
    'C-Class',
    'CLA',
    'CLS',
    'E-Class',
    'G-Class',
    'GLA',
    'GLB',
    'GLC',
    'GLE',
    'GLS',
    'ML-Class',
    'S-Class',
    'SLK',
    'Vito',
  ],
  Mitsubishi: ['ASX', 'Eclipse Cross', 'Galant', 'L200', 'Lancer', 'Outlander', 'Pajero'],
  Nissan: [
    'Altima',
    'Juke',
    'Kicks',
    'Leaf',
    'Maxima',
    'Murano',
    'Pathfinder',
    'Qashqai',
    'Rogue',
    'Sentra',
    'Tiida',
    'X-Trail',
  ],
  Opel: ['Astra', 'Crossland', 'Grandland', 'Insignia', 'Mokka', 'Zafira'],
  Peugeot: ['2008', '208', '3008', '308', '408', '508'],
  Porsche: ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan'],
  Renault: ['Captur', 'Clio', 'Duster', 'Kadjar', 'Koleos', 'Logan', 'Megane', 'Sandero'],
  Skoda: ['Fabia', 'Karoq', 'Kodiaq', 'Octavia', 'Rapid', 'Superb'],
  Subaru: ['Forester', 'Impreza', 'Legacy', 'Outback', 'XV'],
  Suzuki: ['Swift', 'Vitara', 'SX4', 'Jimny', 'Grand Vitara'],
  Tesla: ['Model 3', 'Model S', 'Model X', 'Model Y'],
  Toyota: [
    'Auris',
    'Avensis',
    'Camry',
    'C-HR',
    'Corolla',
    'FJ Cruiser',
    'Fortuner',
    'Hilux',
    'Land Cruiser',
    'Prado',
    'Prius',
    'RAV4',
    'Yaris',
  ],
  Volkswagen: ['Golf', 'ID.4', 'Jetta', 'Passat', 'Polo', 'T-Roc', 'Tiguan', 'Touareg', 'Touran'],
  Volvo: ['S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90'],
  'VAZ (LADA)': ['Granta', 'Niva', 'Vesta', 'XRAY'],
};

const trimKey = (brand: string, model: string) => `${brand}::${model}`;

/** Curated trims per brand+model; otherwise UI uses {@link DEFAULT_TRIM_VALUES}. */
export const CAR_TRIMS_BY_BRAND_MODEL: Record<string, string[]> = {
  [trimKey('BMW', '3 Series')]: ['320i', '330i', '325d', '330d', 'M340i', '330e'],
  [trimKey('BMW', '5 Series')]: ['520i', '530i', '530d', '540i', 'M550i', 'M5'],
  [trimKey('BMW', 'X5')]: ['xDrive30d', 'xDrive40i', 'M50i', 'M Competition'],
  [trimKey('Mercedes-Benz', 'C-Class')]: ['C180', 'C200', 'C220d', 'C300', 'AMG C43', 'AMG C63'],
  [trimKey('Mercedes-Benz', 'E-Class')]: ['E200', 'E220d', 'E300', 'E400', 'AMG E53'],
  [trimKey('Audi', 'A4')]: ['35 TFSI', '40 TFSI', '45 TFSI', 'S4', 'RS4'],
  [trimKey('Audi', 'Q5')]: ['40 TDI', '45 TFSI', 'SQ5', 'e-tron'],
  [trimKey('Toyota', 'Camry')]: ['LE', 'SE', 'XLE', 'XSE'],
  [trimKey('Toyota', 'RAV4')]: ['LE', 'XLE', 'Limited', 'Adventure', 'TRD Off-Road'],
  [trimKey('Volkswagen', 'Golf')]: ['Trendline', 'Comfortline', 'Highline', 'GTI', 'R'],
  [trimKey('Hyundai', 'Tucson')]: ['Start', 'Prime', 'Elegance', 'N Line'],
  [trimKey('Kia', 'Sportage')]: ['LX', 'EX', 'SX', 'GT-Line'],
  [trimKey('Tesla', 'Model 3')]: ['Standard Range', 'Long Range', 'Performance'],
  [trimKey('Tesla', 'Model Y')]: ['Long Range', 'Performance'],
};

/** Generic trim tiers when no curated list exists (values stored as-is). */
export const DEFAULT_TRIM_VALUES = [
  'Base',
  'Comfort',
  'Prestige',
  'Sport',
  'Luxury',
  'AMG / M-line',
];

export function normalizeBrandKey(brand: string | undefined | null): string {
  if (brand == null) return '';
  return String(brand).trim();
}

export function getModelsForBrand(brand: string): string[] {
  const key = normalizeBrandKey(brand);
  if (!key) return [];
  const list = CAR_MODELS[key];
  if (list?.length) return [...list];
  return [VEHICLE_MODEL_OTHER_VALUE];
}

export function getTrimOptionsForVehicle(brand: string, model: string): string[] {
  const b = normalizeBrandKey(brand);
  const m = String(model ?? '').trim();
  if (!b || !m || m === VEHICLE_MODEL_OTHER_VALUE) return [];
  const specific = CAR_TRIMS_BY_BRAND_MODEL[trimKey(b, m)];
  if (specific?.length) return [...specific];
  return [...DEFAULT_TRIM_VALUES];
}

export function isModelAllowedForBrand(brand: string, model: string): boolean {
  const m = String(model ?? '').trim();
  if (!m) return true;
  const models = getModelsForBrand(brand);
  return models.includes(m);
}

export function isTrimAllowedForVehicle(brand: string, model: string, trim: string): boolean {
  const t = String(trim ?? '').trim();
  if (!t) return true;
  const opts = getTrimOptionsForVehicle(brand, model);
  if (!opts.length) return true;
  return opts.includes(t);
}

import { SEARCH_BRANDS, SEARCH_MODELS } from './search-catalog.data';

/** Locations that real listings use. There is no city catalog in the API. */
export const SEARCH_CITIES = ['Baku', 'Sumqayit'] as const;

export const SEARCH_FUELS = ['Petrol', 'Diesel', 'Hybrid', 'Electric'] as const;
export const SEARCH_TRANSMISSIONS = ['Automatic', 'Manual'] as const;
/** Values the cars filter actually offers. `certified` is not one of them. */
export const SEARCH_CONDITIONS = ['new', 'used'] as const;

const fold = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/ı/g, 'i')
    .replace(/ə/g, 'e')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/[^a-z0-9\u0400-\u04ff]+/gi, '');

const alias = (pairs: Array<[string, string]>) => {
  const map = new Map<string, string>();
  for (const [from, to] of pairs) map.set(fold(from), to);
  return map;
};

const BRAND_ALIASES = alias([
  ['mercedes', 'Mercedes-Benz'],
  ['mercedes benz', 'Mercedes-Benz'],
  ['mercedesbenz', 'Mercedes-Benz'],
  ['мерседес', 'Mercedes-Benz'],
  ['мерседес бенц', 'Mercedes-Benz'],
  ['toyota', 'Toyota'],
  ['тойота', 'Toyota'],
  ['bmw', 'BMW'],
  ['бмв', 'BMW'],
  ['audi', 'Audi'],
  ['ауди', 'Audi'],
  ['bentley', 'Bentley'],
  ['бентли', 'Bentley'],
  ['volkswagen', 'Volkswagen'],
  ['фольксваген', 'Volkswagen'],
  ['hyundai', 'Hyundai'],
  ['хендай', 'Hyundai'],
  ['хёндай', 'Hyundai'],
  ['kia', 'Kia'],
  ['киа', 'Kia'],
  ['nissan', 'Nissan'],
  ['ниссан', 'Nissan'],
  ['honda', 'Honda'],
  ['хонда', 'Honda'],
  ['lexus', 'Lexus'],
  ['лексус', 'Lexus'],
  ['lada', 'VAZ (LADA)'],
  ['лада', 'VAZ (LADA)'],
  ['ваз', 'VAZ (LADA)'],
  ['skoda', 'Skoda'],
  ['шкода', 'Skoda'],
  ['renault', 'Renault'],
  ['рено', 'Renault'],
  ['peugeot', 'Peugeot'],
  ['пежо', 'Peugeot'],
  ['opel', 'Opel'],
  ['опель', 'Opel'],
  ['mazda', 'Mazda'],
  ['мазда', 'Mazda'],
  ['subaru', 'Subaru'],
  ['субару', 'Subaru'],
  ['suzuki', 'Suzuki'],
  ['сузуки', 'Suzuki'],
  ['volvo', 'Volvo'],
  ['вольво', 'Volvo'],
  ['chevrolet', 'Chevrolet'],
  ['шевроле', 'Chevrolet'],
  ['ford', 'Ford'],
  ['форд', 'Ford'],
  ['jeep', 'Jeep'],
  ['джип', 'Jeep'],
  ['tesla', 'Tesla'],
  ['тесла', 'Tesla'],
  ['porsche', 'Porsche'],
  ['порше', 'Porsche'],
  ['ferrari', 'Ferrari'],
  ['феррари', 'Ferrari'],
  ['lamborghini', 'Lamborghini'],
  ['ламборгини', 'Lamborghini'],
  ['infiniti', 'Infiniti'],
  ['инфинити', 'Infiniti'],
  ['jaguar', 'Jaguar'],
  ['ягуар', 'Jaguar'],
  ['land rover', 'Land Rover'],
  ['ленд ровер', 'Land Rover'],
  ['лэнд ровер', 'Land Rover'],
  ['chery', 'Chery'],
  ['черри', 'Chery'],
  ['geely', 'Geely'],
  ['джили', 'Geely'],
  ['mitsubishi', 'Mitsubishi'],
  ['мицубиси', 'Mitsubishi'],
  ['citroen', 'Citroen'],
  ['ситроен', 'Citroen'],
  ['fiat', 'Fiat'],
  ['фиат', 'Fiat'],
]);

const MODEL_ALIASES = alias([
  ['camry', 'Camry'],
  ['камри', 'Camry'],
  ['corolla', 'Corolla'],
  ['королла', 'Corolla'],
  ['rav4', 'RAV4'],
  ['рав4', 'RAV4'],
]);

const FUEL_ALIASES = alias([
  ['petrol', 'Petrol'],
  ['gasoline', 'Petrol'],
  ['gas', 'Petrol'],
  ['бензин', 'Petrol'],
  ['benzin', 'Petrol'],
  ['diesel', 'Diesel'],
  ['дизель', 'Diesel'],
  ['dizel', 'Diesel'],
  ['hybrid', 'Hybrid'],
  ['гибрид', 'Hybrid'],
  ['hibrid', 'Hybrid'],
  ['electric', 'Electric'],
  ['электро', 'Electric'],
  ['elektrik', 'Electric'],
]);

const TRANSMISSION_ALIASES = alias([
  ['automatic', 'Automatic'],
  ['auto', 'Automatic'],
  ['автомат', 'Automatic'],
  ['avtomat', 'Automatic'],
  ['avtomatik', 'Automatic'],
  ['акпп', 'Automatic'],
  ['manual', 'Manual'],
  ['механика', 'Manual'],
  ['mexanika', 'Manual'],
  ['mexaniki', 'Manual'],
  ['мкпп', 'Manual'],
]);

const CONDITION_ALIASES = alias([
  ['new', 'new'],
  ['новый', 'new'],
  ['yeni', 'new'],
  ['used', 'used'],
  ['бу', 'used'],
  ['б/у', 'used'],
  ['с пробегом', 'used'],
  ['islenmis', 'used'],
  ['işlənmiş', 'used'],
]);

const CITY_ALIASES = alias([
  ['baku', 'Baku'],
  ['baki', 'Baku'],
  ['bakı', 'Baku'],
  ['баку', 'Baku'],
  ['sumqayit', 'Sumqayit'],
  ['sumqayıt', 'Sumqayit'],
  ['sumgait', 'Sumqayit'],
  ['сумгаит', 'Sumqayit'],
  ['сумгайыт', 'Sumqayit'],
]);

const byFold = (values: readonly string[]) => {
  const map = new Map<string, string>();
  for (const value of values) map.set(fold(value), value);
  return map;
};

const BRANDS = byFold(SEARCH_BRANDS);
const CITIES = byFold(SEARCH_CITIES);
const FUELS = byFold(SEARCH_FUELS);
const TRANSMISSIONS = byFold(SEARCH_TRANSMISSIONS);
const CONDITIONS = byFold(SEARCH_CONDITIONS);

const lookup = (raw: string, aliases: Map<string, string>, canonical: Map<string, string>) => {
  const key = fold(raw);
  if (!key) return null;
  const aliased = aliases.get(key);
  if (aliased && canonical.has(fold(aliased))) return aliased;
  return canonical.get(key) ?? null;
};

export const matchBrand = (raw: string | null | undefined) =>
  raw ? lookup(raw, BRAND_ALIASES, BRANDS) : null;

export const matchModel = (brand: string, raw: string | null | undefined) => {
  if (!raw || !brand) return null;
  const models = SEARCH_MODELS[brand] ?? [];
  const canonical = byFold(models);
  return lookup(raw, MODEL_ALIASES, canonical);
};

/** A model named by exactly one brand can fill the brand in as well. */
export const brandForUniqueModel = (raw: string | null | undefined): string | null => {
  if (!raw) return null;
  const hits = SEARCH_BRANDS.filter((brand) => matchModel(brand, raw));
  return hits.length === 1 ? hits[0] : null;
};

export const matchCity = (raw: string | null | undefined) =>
  raw ? lookup(raw, CITY_ALIASES, CITIES) : null;

export const matchFuel = (raw: string | null | undefined) =>
  raw ? lookup(raw, FUEL_ALIASES, FUELS) : null;

export const matchTransmission = (raw: string | null | undefined) =>
  raw ? lookup(raw, TRANSMISSION_ALIASES, TRANSMISSIONS) : null;

export const matchCondition = (raw: string | null | undefined) =>
  raw ? lookup(raw, CONDITION_ALIASES, CONDITIONS) : null;

const AZN = new Set(['azn', 'ман', 'манат', 'manat', 'azər']);

export const isAznCurrency = (raw: string | null | undefined) => {
  if (raw == null || String(raw).trim() === '') return true;
  return AZN.has(fold(String(raw)));
};

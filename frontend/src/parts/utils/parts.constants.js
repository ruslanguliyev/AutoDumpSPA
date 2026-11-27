export const PART_CATEGORIES = [
  { value: 'engine', label: 'Engine' },
  { value: 'transmission', label: 'Transmission' },
  { value: 'suspension', label: 'Suspension' },
  { value: 'brakes', label: 'Brakes' },
  { value: 'body', label: 'Body' },
  { value: 'interior', label: 'Interior' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'lighting', label: 'Lighting' },
  { value: 'exterior', label: 'Exterior' },
  { value: 'wheels', label: 'Wheels & Tires' },
  { value: 'filters', label: 'Filters' },
  { value: 'other', label: 'Other' },
];

const CATEGORY_KEYS = new Set(PART_CATEGORIES.map(({ value }) => value));

/**
 * Word stems per category, first match wins. Older listings saved the category as free text
 * ("Масляные фильтры (картриджный и накручиваемый)"); this turns it into a key the site
 * translates. Mirrors `toPartCategoryKey` in `backend/src/parts/part-category.ts`.
 * @type {Array<[string, string[]]>}
 */
const CATEGORY_STEMS = [
  ['filters', ['фильтр', 'filter', 'filtr', 'süzgəc', 'suzgec']],
  ['brakes', ['тормоз', 'колодк', 'суппорт', 'brake', 'əyləc', 'eylec', 'tormoz', 'kolodka']],
  ['transmission', ['коробк', 'кпп', 'акпп', 'сцеплен', 'трансмис', 'gearbox', 'transmission', 'clutch', 'sürət', 'suret', 'karobka', 'ötürmə']],
  ['suspension', ['подвеск', 'амортиз', 'рычаг', 'стойк', 'пружин', 'шаров', 'сайлент', 'suspension', 'shock', 'strut', 'asqı', 'asqi', 'amortizator', 'yay']],
  ['wheels', ['шин', 'колес', 'диски', 'резин', 'tire', 'tyre', 'wheel', 'rim', 'təkər', 'teker', 'şin', 'disk']],
  ['lighting', ['фар', 'фонар', 'ламп', 'оптик', 'headlight', 'lamp', 'light', 'fara', 'işıq', 'isiq', 'stop-siqnal']],
  ['electrical', ['электр', 'генератор', 'стартер', 'аккумул', 'датчик', 'провод', 'блок управ', 'battery', 'alternator', 'starter', 'sensor', 'electric', 'akkumulyator', 'elektrik', 'generator', 'datçik', 'datchik']],
  ['interior', ['салон', 'сиден', 'руль', 'торпед', 'панель прибор', 'коврик', 'interior', 'seat', 'steering', 'dashboard', 'salon', 'oturacaq', 'sükan', 'sukan']],
  ['exterior', ['зеркал', 'решетк', 'выхлоп', 'глушит', 'спойлер', 'mirror', 'grille', 'exhaust', 'muffler', 'spoiler', 'exterior', 'güzgü', 'guzgu', 'səsboğan', 'sesbogan', 'barmaqlıq']],
  ['body', ['кузов', 'бампер', 'капот', 'крыл', 'двер', 'багажник', 'body', 'bumper', 'hood', 'bonnet', 'door', 'fender', 'trunk', 'kuzov', 'bamper', 'kapot', 'qapı', 'qapi', 'qanad', 'baqaj']],
  ['engine', ['двигат', 'мотор', 'поршн', 'свеч', 'грм', 'турбин', 'головк', 'клапан', 'масл', 'engine', 'motor', 'piston', 'spark', 'turbo', 'valve', 'oil', 'mühərrik', 'muherrik', 'şam', 'yağ', 'yag']],
];

const escapeStem = (stem) => stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Stems match at the start of a word only, so "шин" does not fire inside "машина".
/** @type {Array<[string, RegExp]>} */
const CATEGORY_PATTERNS = CATEGORY_STEMS.map(([key, stems]) => [
  key,
  new RegExp(`(?:^|[^\\p{L}])(?:${stems.map(escapeStem).join('|')})`, 'u'),
]);

const normalizeCategoryValue = (value) =>
  String(value ?? '').trim().toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ');

/**
 * The category key for a stored or typed value; null when empty, 'other' when unrecognised.
 * @param {unknown} value
 * @returns {string | null}
 */
export const getPartCategoryKey = (value) => {
  const normalized = normalizeCategoryValue(value);
  if (!normalized) return null;
  if (CATEGORY_KEYS.has(normalized)) return normalized;
  if (normalized === 'wheels & tires' || normalized === 'wheels and tires') return 'wheels';
  for (const [key, pattern] of CATEGORY_PATTERNS) {
    if (pattern.test(normalized)) return key;
  }
  return 'other';
};

export const PART_CONDITIONS = [
  { value: 'all', label: 'Any condition' },
  { value: 'new', label: 'New' },
  { value: 'used', label: 'Used' },
  { value: 'refurbished', label: 'Refurbished' },
];

export const PART_SORT_OPTIONS = [
  { value: 'RELEVANCE', label: 'Relevance' },
  { value: 'PRICE_ASC', label: 'Price: Low to High' },
  { value: 'PRICE_DESC', label: 'Price: High to Low' },
  { value: 'NEWEST', label: 'Newest first' },
];

export const PARTS_DEFAULT_FILTER = {
  search: '',
  category: '',
  brand: '',
  model: '',
  condition: '',
  priceFrom: '',
  priceTo: '',
  location: '',
  inStockOnly: false,
  sort: '',
  limit: 10_000,
  offset: 0,
};

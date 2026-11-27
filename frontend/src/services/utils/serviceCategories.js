/**
 * Service center categories are stable keys the site translates under `services:categories.*`.
 * Older profiles were saved with free text ("Шиномонтаж", "Maintenance"); this turns such text
 * into a key. Mirrors `toServiceCategoryKey` in `backend/src/service-centers/service-category.ts`.
 */
export const SERVICE_CATEGORY_KEYS = [
  'maintenance',
  'diagnostics',
  'repair',
  'engine',
  'transmission',
  'suspension',
  'brakes',
  'electrical',
  'ev_service',
  'ac',
  'tires',
  'body_paint',
  'detailing',
  'glass',
  'tuning',
  'other',
];

const KEYS = new Set(SERVICE_CATEGORY_KEYS);

/** @type {Array<[string, string[]]>} Word stems per category, first match wins. */
const STEMS = [
  ['ev_service', ['ev ', 'электромоб', 'гибрид', 'зарядк', 'charging', 'hybrid', 'electric vehicle', 'elektromobil', 'hibrid']],
  ['tires', ['шин', 'колес', 'развал', 'балансир', 'tire', 'tyre', 'wheel', 'alignment', 'təkər', 'teker', 'şin', 'razval']],
  ['detailing', ['детейл', 'полиров', 'химчист', 'керамик', 'пленк', 'мойк', 'detail', 'polish', 'ceramic', 'paint protection', 'ppf', 'wash', 'cilala', 'yuma', 'kimyəvi']],
  ['body_paint', ['кузов', 'покраск', 'малярн', 'рихтов', 'body', 'paint', 'dent', 'kuzov', 'boya', 'rəngləm']],
  ['glass', ['стекл', 'glass', 'windshield', 'şüşə', 'suse']],
  ['ac', ['кондиц', 'климат', 'air condition', 'a/c', 'kondisioner', 'kondision']],
  ['electrical', ['электр', 'аккумул', 'генератор', 'стартер', 'electric', 'battery', 'alternator', 'elektrik', 'akkumulyator']],
  ['diagnostics', ['диагност', 'компьютерн', 'diagnos', 'diaqnost']],
  ['brakes', ['тормоз', 'колодк', 'brake', 'əyləc', 'eylec', 'tormoz']],
  ['suspension', ['подвеск', 'ходов', 'амортиз', 'suspension', 'shock', 'asqı', 'asqi', 'xodovoy', 'amortizator']],
  ['transmission', ['коробк', 'кпп', 'акпп', 'трансмис', 'сцеплен', 'gearbox', 'transmission', 'clutch', 'sürət qutusu', 'karobka']],
  ['engine', ['двигат', 'мотор', 'engine', 'motor', 'mühərrik', 'muherrik']],
  ['tuning', ['тюнинг', 'чип', 'tuning', 'tuninq', 'tüninq']],
  ['repair', ['ремонт', 'гараж', 'repair', 'garage', 'təmir', 'temir', 'qaraj']],
  ['maintenance', ['техобслуж', 'обслуж', 'замена масла', 'масл', 'гарант', 'maintenance', 'service', 'servis', 'oil', 'warranty', 'texniki', 'baxım', 'baxim', 'yağ']],
];

const escapeStem = (stem) => stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** @type {Array<[string, RegExp]>} Stems match at the start of a word only. */
const PATTERNS = STEMS.map(([key, stems]) => [
  key,
  new RegExp(`(?:^|[^\\p{L}])(?:${stems.map(escapeStem).join('|')})`, 'u'),
]);

/**
 * The category key for a stored or typed value; null when empty, 'other' when unrecognised.
 * @param {unknown} value
 * @returns {string | null}
 */
export const getServiceCategoryKey = (value) => {
  const text = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[_\s]+/g, ' ');
  if (!text) return null;
  const asKey = text.replace(/ /g, '_');
  if (KEYS.has(asKey)) return asKey;
  for (const [key, pattern] of PATTERNS) {
    if (pattern.test(`${text} `)) return key;
  }
  return 'other';
};

/**
 * The category label in the interface language.
 * @param {(key: string, options?: Record<string, unknown>) => string} t  `services` namespace
 * @param {unknown} value
 */
export const formatServiceCategory = (t, value) => {
  const key = getServiceCategoryKey(value);
  return key ? t(`categories.${key}`) : '';
};

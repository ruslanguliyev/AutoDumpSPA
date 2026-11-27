/**
 * ServiceCenter.categories and ServiceCenterService.category hold stable keys the site
 * translates. Older profiles were saved with free text typed in any language ("Maintenance",
 * "Шиномонтаж", "PAINT_PROTECTION", "Təkər xidməti"); this turns such text into a key.
 *
 * Mirrors `getServiceCategoryKey` in `frontend/src/services/utils/serviceCategories.js`.
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
] as const;
export type ServiceCategoryKey = (typeof SERVICE_CATEGORY_KEYS)[number];

const KEYS = new Set<string>(SERVICE_CATEGORY_KEYS);

/** Word stems per category, checked in this order: the first match wins. */
const STEMS: Array<[ServiceCategoryKey, string[]]> = [
  // Before "electrical" and "maintenance": "EV service", "электромобиль".
  ['ev_service', ['ev ', 'электромоб', 'гибрид', 'зарядк', 'charging', 'hybrid', 'electric vehicle', 'elektromobil', 'hibrid']],
  ['tires', ['шин', 'колес', 'развал', 'балансир', 'tire', 'tyre', 'wheel', 'alignment', 'təkər', 'teker', 'şin', 'razval']],
  // Before "body_paint": "paint protection" is detailing.
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

const escape = (stem: string) => stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Stems match at the start of a word only, so "шин" does not fire inside "машина". */
const PATTERNS: Array<[ServiceCategoryKey, RegExp]> = STEMS.map(([key, stems]) => [
  key,
  new RegExp(`(?:^|[^\\p{L}])(?:${stems.map(escape).join('|')})`, 'u'),
]);

const normalize = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[_\s]+/g, ' ');

/** The key for a stored or typed category; null for empty input. Unknown text becomes 'other'. */
export function toServiceCategoryKey(value: unknown): ServiceCategoryKey | null {
  const text = normalize(value);
  if (!text) return null;
  const asKey = text.replace(/ /g, '_');
  if (KEYS.has(asKey)) return asKey as ServiceCategoryKey;
  // A trailing space lets "ev " match "ev" on its own as well as "ev service".
  for (const [key, pattern] of PATTERNS) {
    if (pattern.test(`${text} `)) return key;
  }
  return 'other';
}

/** A profile's category list as keys, in order, without repeats or empties. */
export function toServiceCategoryKeys(values: readonly unknown[] | null | undefined): ServiceCategoryKey[] {
  const out: ServiceCategoryKey[] = [];
  for (const value of values ?? []) {
    const key = toServiceCategoryKey(value);
    if (key && !out.includes(key)) out.push(key);
  }
  return out;
}

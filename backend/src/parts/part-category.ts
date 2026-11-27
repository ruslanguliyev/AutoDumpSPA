import { PART_CATEGORY_VALUES, PartCategoryValue } from '../ai/part-photo/part-photo-prompt';

/**
 * Part.category holds one stable key from PART_CATEGORY_VALUES; the site translates it.
 * Older listings were saved with free text in whatever language the seller typed
 * ("Масляные фильтры (картриджный и накручиваемый)", "Əyləc bəndləri", "Brake pads").
 * This turns such text into a key, so the label follows the interface language.
 *
 * Mirrors `toPartCategoryKey` in `frontend/src/parts/utils/parts.constants.js`.
 */

const KEYS = new Set<string>(PART_CATEGORY_VALUES);

/** Word stems per category, checked in this order: the first match wins. */
const STEMS: Array<[PartCategoryValue, string[]]> = [
  // First: "масляный фильтр" is a filter, not an engine part.
  ['filters', ['фильтр', 'filter', 'filtr', 'süzgəc', 'suzgec']],
  ['brakes', ['тормоз', 'колодк', 'суппорт', 'brake', 'əyləc', 'eylec', 'tormoz', 'kolodka']],
  ['transmission', ['коробк', 'кпп', 'акпп', 'сцеплен', 'трансмис', 'gearbox', 'transmission', 'clutch', 'sürət', 'suret', 'karobka', 'ötürmə']],
  ['suspension', ['подвеск', 'амортиз', 'рычаг', 'стойк', 'пружин', 'шаров', 'сайлент', 'suspension', 'shock', 'strut', 'asqı', 'asqi', 'amortizator', 'yay']],
  ['wheels', ['шин', 'колес', 'колёс', 'диски', 'резин', 'tire', 'tyre', 'wheel', 'rim', 'təkər', 'teker', 'şin', 'disk']],
  ['lighting', ['фар', 'фонар', 'ламп', 'оптик', 'headlight', 'lamp', 'light', 'fara', 'işıq', 'isiq', 'stop-siqnal']],
  ['electrical', ['электр', 'генератор', 'стартер', 'аккумул', 'датчик', 'провод', 'блок управ', 'battery', 'alternator', 'starter', 'sensor', 'electric', 'akkumulyator', 'elektrik', 'generator', 'datçik', 'datchik']],
  ['interior', ['салон', 'сиден', 'руль', 'торпед', 'панель прибор', 'коврик', 'interior', 'seat', 'steering', 'dashboard', 'salon', 'oturacaq', 'sükan', 'sukan']],
  ['exterior', ['зеркал', 'решетк', 'решётк', 'выхлоп', 'глушит', 'спойлер', 'mirror', 'grille', 'exhaust', 'muffler', 'spoiler', 'exterior', 'güzgü', 'guzgu', 'səsboğan', 'sesbogan', 'barmaqlıq']],
  ['body', ['кузов', 'бампер', 'капот', 'крыл', 'двер', 'багажник', 'body', 'bumper', 'hood', 'bonnet', 'door', 'fender', 'trunk', 'kuzov', 'bamper', 'kapot', 'qapı', 'qapi', 'qanad', 'baqaj']],
  ['engine', ['двигат', 'мотор', 'поршн', 'свеч', 'грм', 'турбин', 'головк', 'клапан', 'масл', 'engine', 'motor', 'piston', 'spark', 'turbo', 'valve', 'oil', 'mühərrik', 'muherrik', 'şam', 'yağ', 'yag']],
];

const escape = (stem: string) => stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Stems match at the start of a word only, so "шин" does not fire inside "машина". */
const PATTERNS: Array<[PartCategoryValue, RegExp]> = STEMS.map(([key, stems]) => [
  key,
  new RegExp(`(?:^|[^\\p{L}])(?:${stems.map(escape).join('|')})`, 'u'),
]);

const normalize = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/\s+/g, ' ');

/** The key for a stored or typed category; null for empty input. Unknown text becomes 'other'. */
export function toPartCategoryKey(value: unknown): PartCategoryValue | null {
  const text = normalize(value);
  if (!text) return null;
  if (KEYS.has(text)) return text as PartCategoryValue;
  if (text === 'wheels & tires' || text === 'wheels and tires') return 'wheels';
  for (const [key, pattern] of PATTERNS) {
    if (pattern.test(text)) return key;
  }
  return 'other';
}

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
];

const normalizeCategoryValue = (value) => String(value ?? '').trim().toLowerCase();

const CATEGORY_KEY_LOOKUP = new Map();

PART_CATEGORIES.forEach(({ value, label }) => {
  const normalizedValue = normalizeCategoryValue(value);
  const normalizedLabel = normalizeCategoryValue(label);

  if (normalizedValue) CATEGORY_KEY_LOOKUP.set(normalizedValue, value);
  if (normalizedLabel) CATEGORY_KEY_LOOKUP.set(normalizedLabel, value);
});

CATEGORY_KEY_LOOKUP.set('wheels and tires', 'wheels');

export const getPartCategoryKey = (value) => {
  const normalized = normalizeCategoryValue(value);
  if (!normalized) return null;
  return CATEGORY_KEY_LOOKUP.get(normalized) ?? null;
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
  sort: '',
  limit: 20,
  offset: 0,
};

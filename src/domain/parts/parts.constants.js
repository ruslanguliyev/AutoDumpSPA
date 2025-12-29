export const PART_CATEGORIES = [
  { value: 'engine', label: 'Engine' },
  { value: 'transmission', label: 'Transmission' },
  { value: 'suspension', label: 'Suspension' },
  { value: 'brakes', label: 'Brakes' },
  { value: 'body', label: 'Body' },
  { value: 'interior', label: 'Interior' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'wheels', label: 'Wheels & Tires' },
];

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
  category: 'all',
  brand: '',
  model: '',
  condition: 'all',
  priceFrom: '',
  priceTo: '',
  location: '',
  sort: 'RELEVANCE',
  limit: 20,
  offset: 0,
};


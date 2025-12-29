import {
  PART_CATEGORIES,
  PART_CONDITIONS,
  PART_SORT_OPTIONS,
} from '@/domain/parts/parts.constants';

export const partsFilterConfig = {
  categories: [{ value: 'all', label: 'All categories' }, ...PART_CATEGORIES],
  conditions: PART_CONDITIONS,
  sorts: PART_SORT_OPTIONS,
  priceSteps: [50, 100, 250, 500, 1000, 2500],
};


import { useMemo } from 'react';
import { getCategoryTree } from '@/domain/categories/category.service';

export const useCategoryTree = () => useMemo(() => getCategoryTree(), []);


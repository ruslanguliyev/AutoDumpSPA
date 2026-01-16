import { CATEGORIES } from './category.data';

const byOrder = (a, b) => a.order - b.order;

export const getCategoryTree = () =>
  CATEGORIES.filter((category) => !category.parentId).sort(byOrder);

export const getSubCategories = (parentId) => {
  if (!parentId) return [];
  return CATEGORIES.filter((category) => category.parentId === parentId).sort(byOrder);
};


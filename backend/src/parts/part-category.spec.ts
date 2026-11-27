import { toPartCategoryKey } from './part-category';

describe('toPartCategoryKey', () => {
  it('keeps keys and the old English labels', () => {
    expect(toPartCategoryKey('filters')).toBe('filters');
    expect(toPartCategoryKey('Brakes')).toBe('brakes');
    expect(toPartCategoryKey('Wheels & Tires')).toBe('wheels');
    expect(toPartCategoryKey('Other')).toBe('other');
  });

  it('maps free text from older listings in any of the three languages', () => {
    expect(toPartCategoryKey('Масляные фильтры (картриджный и накручиваемый)')).toBe('filters');
    expect(toPartCategoryKey('Тормозные колодки')).toBe('brakes');
    expect(toPartCategoryKey('Əyləc bəndləri')).toBe('brakes');
    expect(toPartCategoryKey('Амортизаторы')).toBe('suspension');
    expect(toPartCategoryKey('Фары')).toBe('lighting');
    expect(toPartCategoryKey('Generator')).toBe('electrical');
    expect(toPartCategoryKey('Бампер передний')).toBe('body');
    expect(toPartCategoryKey('Mühərrik hissələri')).toBe('engine');
    expect(toPartCategoryKey('Шины зимние')).toBe('wheels');
  });

  it('matches stems at word starts only', () => {
    expect(toPartCategoryKey('Запчасти для машины')).toBe('other');
    expect(toPartCategoryKey('maşın üçün')).toBe('other');
  });

  it('returns null for empty input', () => {
    expect(toPartCategoryKey('')).toBeNull();
    expect(toPartCategoryKey(null)).toBeNull();
  });
});

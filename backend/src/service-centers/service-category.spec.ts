import { toServiceCategoryKey, toServiceCategoryKeys } from './service-category';

describe('toServiceCategoryKey', () => {
  it('keeps keys, seed slugs and the old English labels', () => {
    expect(toServiceCategoryKey('maintenance')).toBe('maintenance');
    expect(toServiceCategoryKey('MAINTENANCE')).toBe('maintenance');
    expect(toServiceCategoryKey('PAINT_PROTECTION')).toBe('detailing');
    expect(toServiceCategoryKey('ev_service')).toBe('ev_service');
    expect(toServiceCategoryKey('EV Service')).toBe('ev_service');
    expect(toServiceCategoryKey('Tire Service')).toBe('tires');
    expect(toServiceCategoryKey('Wheel Alignment')).toBe('tires');
    expect(toServiceCategoryKey('Battery Service')).toBe('electrical');
    expect(toServiceCategoryKey('Warranty Service')).toBe('maintenance');
    expect(toServiceCategoryKey('garage')).toBe('repair');
    expect(toServiceCategoryKey('General')).toBe('other');
  });

  it('maps free text in any of the three languages', () => {
    expect(toServiceCategoryKey('Шиномонтаж')).toBe('tires');
    expect(toServiceCategoryKey('Ремонт двигателя')).toBe('engine');
    expect(toServiceCategoryKey('Покраска кузова')).toBe('body_paint');
    expect(toServiceCategoryKey('Компьютерная диагностика')).toBe('diagnostics');
    expect(toServiceCategoryKey('Təkər xidməti')).toBe('tires');
    expect(toServiceCategoryKey('Mühərrik təmiri')).toBe('engine');
    expect(toServiceCategoryKey('Kondisioner')).toBe('ac');
  });

  it('matches stems at word starts only and returns null for empty input', () => {
    expect(toServiceCategoryKey('Всё для машины')).toBe('other');
    expect(toServiceCategoryKey('')).toBeNull();
    expect(toServiceCategoryKey(null)).toBeNull();
  });

  it('turns a list into unique keys', () => {
    expect(toServiceCategoryKeys(['Maintenance', 'Repair', 'Diagnostics', 'maintenance', ''])).toEqual([
      'maintenance',
      'repair',
      'diagnostics',
    ]);
  });
});

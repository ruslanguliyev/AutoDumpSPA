import { normalizeSearch } from './normalize-search';

describe('normalizeSearch', () => {
  it('maps the design query onto catalog filters and keeps an unsupported phrase', () => {
    const result = normalizeSearch({
      brand: 'Тойота',
      model: 'Камри',
      priceTo: 30000,
      priceCurrency: 'AZN',
      pricePhrase: 'до 30 000 AZN',
      yearFrom: 2018,
      transmission: 'автомат',
      fuel: 'бензин',
      city: 'Баку',
      unapplied: ['семейная'],
    });

    expect(result.filters).toEqual({
      brand: 'Toyota',
      model: 'Camry',
      priceFrom: null,
      priceTo: 30000,
      yearFrom: 2018,
      yearTo: null,
      condition: null,
      fuel: 'Petrol',
      transmission: 'Automatic',
      location: 'Baku',
    });
    expect(result.unapplied).toEqual(['семейная']);
  });

  it('resolves Mercedes to Mercedes-Benz and a new-car price cap', () => {
    const result = normalizeSearch({
      brand: 'Mercedes',
      condition: 'новый',
      priceTo: 80000,
      priceCurrency: 'AZN',
      unapplied: [],
    });
    expect(result.filters.brand).toBe('Mercedes-Benz');
    expect(result.filters.condition).toBe('new');
    expect(result.filters.priceTo).toBe(80000);
    expect(result.unapplied).toEqual([]);
  });

  it('drops a non-AZN price into unapplied and drops unknown catalog values', () => {
    const result = normalizeSearch({
      brand: 'Lada Vesta',
      model: 'Spaceship',
      priceTo: 10000,
      priceCurrency: 'USD',
      pricePhrase: '10 000 USD',
      city: 'Гянджа',
      fuel: 'водород',
      transmission: 'вариатор',
      condition: 'certified',
      unapplied: ['пробег до 50 000'],
    });
    expect(result.filters).toEqual({
      brand: null,
      model: null,
      priceFrom: null,
      priceTo: null,
      yearFrom: null,
      yearTo: null,
      condition: null,
      fuel: null,
      transmission: null,
      location: null,
    });
    expect(result.unapplied).toEqual([
      'пробег до 50 000',
      'Lada Vesta',
      'Spaceship',
      '10 000 USD',
      'Гянджа',
      'certified',
      'водород',
      'вариатор',
    ]);
  });

  it('keeps a model only when it belongs to the matched brand', () => {
    const result = normalizeSearch({
      brand: 'BMW',
      model: 'Camry',
      unapplied: [],
    });
    expect(result.filters.brand).toBe('BMW');
    expect(result.filters.model).toBeNull();
    expect(result.unapplied).toEqual(['Camry']);
  });
});

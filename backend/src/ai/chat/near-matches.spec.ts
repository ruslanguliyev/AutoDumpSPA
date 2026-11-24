import { nearbyCities, relaxations, scrubFilters } from './near-matches';

describe('relaxations', () => {
  it('widens years, tries nearby Azerbaijani cities, then any city, then price and colour', () => {
    const steps = relaxations('search_cars', {
      brand: 'Toyota',
      model: 'Camry',
      yearFrom: 2018,
      yearTo: 2020,
      city: 'Baku',
      priceTo: 20000,
      color: 'White',
    });
    expect(steps.map((step) => step.changed)).toEqual([
      'years 2016-2022 instead of 2018-2020',
      'city Sumqayit (nearby) instead of Baku',
      'city Khirdalan (nearby) instead of Baku',
      'any city in Azerbaijan instead of Baku',
      'price up to 24000 AZN instead of 20000 AZN',
      'any colour instead of White',
      'other Toyota models instead of Camry',
    ]);
    expect(steps[0].input).toMatchObject({ yearFrom: 2016, yearTo: 2022, city: 'Baku' });
    expect(steps[3].input.city).toBeNull();
  });

  it('has nothing to loosen for a bare search', () => {
    expect(relaxations('search_cars', { brand: 'Toyota' })).toEqual([]);
  });

  it('knows only Azerbaijani neighbours', () => {
    expect(nearbyCities('Ganja')).toContain('Shamkir');
    expect(nearbyCities('Tbilisi')).toEqual([]);
  });
});

describe('scrubFilters', () => {
  it('drops empty values and masks Azerbaijani phone numbers and e-mails', () => {
    expect(
      scrubFilters({ query: 'колодки +994 50 123 45 67 a@b.az', brand: null, oemCode: '04465-33450', mobile: false }),
    ).toEqual({ query: 'колодки [phone] [email]', oemCode: '04465-33450' });
  });
});

import { buildPartPhotoResult, PartPhotoValidationError } from './part-photo-result';

describe('buildPartPhotoResult', () => {
  it('keeps a recognised part and matches compatibility to our catalogue', () => {
    const result = buildPartPhotoResult({
      isCarPart: true,
      confidence: 'high',
      name: 'Масляный фильтр',
      category: 'filters',
      brand: 'MANN-FILTER',
      partNumber: 'W 712/75',
      compatibility: [
        { brand: 'toyota', model: 'camry', yearFrom: 2017, yearTo: 2012 },
        { brand: 'Toyota', model: 'Camry', yearFrom: 2012, yearTo: 2017 },
        { brand: 'Not A Real Make', model: 'X' },
        { brand: 'Volkswagen', model: 'Golf V (1K)', yearFrom: 2003, yearTo: 2008 },
        { brand: 'Volkswagen' },
      ],
      description: 'Масляный фильтр для бензиновых двигателей.',
    });
    expect(result.isCarPart).toBe(true);
    expect(result.category).toBe('filters');
    expect(result.partNumber).toBe('W 712/75');
    expect(result.compatibility).toEqual(['Toyota Camry 2012–2017', 'Volkswagen Golf 2003–2008']);
    expect(result.compatibilityConfirmed).toBe(false);
  });

  it('drops a category outside our list', () => {
    const result = buildPartPhotoResult({
      isCarPart: true,
      confidence: 'medium',
      name: 'Radiator',
      category: 'cooling',
      description: 'A radiator.',
    });
    expect(result.category).toBeNull();
  });

  it('returns an empty result when the photo is not a car part', () => {
    const result = buildPartPhotoResult({ isCarPart: false, confidence: 'high', name: 'Cat', category: 'other' });
    expect(result).toMatchObject({ isCarPart: false, name: '', category: null, compatibility: [] });
  });

  it('refuses links in the description and a junk part number', () => {
    expect(() =>
      buildPartPhotoResult({
        isCarPart: true,
        confidence: 'low',
        name: 'Brake pads',
        category: 'brakes',
        description: 'Buy at https://example.com',
      }),
    ).toThrow(PartPhotoValidationError);
    const result = buildPartPhotoResult({
      isCarPart: true,
      confidence: 'low',
      name: 'Brake pads',
      category: 'brakes',
      partNumber: '<script>',
      description: 'Front brake pads.',
    });
    expect(result.partNumber).toBe('');
  });
});

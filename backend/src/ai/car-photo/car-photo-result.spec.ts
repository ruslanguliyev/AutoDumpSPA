import { buildCarPhotoResult, CarPhotoValidationError } from './car-photo-result';

describe('buildCarPhotoResult', () => {
  it('keeps a recognised car matched to our catalogue', () => {
    const result = buildCarPhotoResult({
      isCar: true,
      confidence: 'high',
      brand: 'toyota',
      model: 'Camry XV70',
      bodyType: 'sedan',
      yearFrom: 2023,
      yearTo: 2017,
      fuel: 'Hybrid',
      transmission: '',
      drivetrain: 'FWD',
      likely: ['drivetrain', 'transmission'],
      description: 'Toyota Camry восьмого поколения в кузове седан.',
    });
    expect(result.isCar).toBe(true);
    expect(result.brand).toBe('Toyota');
    expect(result.model).toBe('Camry');
    expect(result.yearFrom).toBe(2017);
    expect(result.yearTo).toBe(2023);
    expect(result.fuel).toBe('Hybrid');
    expect(result.transmission).toBeNull();
    // A guess about an empty field is dropped.
    expect(result.likely).toEqual(['drivetrain']);
  });

  it('drops values outside our lists', () => {
    const result = buildCarPhotoResult({
      isCar: true,
      confidence: 'medium',
      brand: 'Not A Real Make',
      model: 'X',
      bodyType: 'limousine',
      yearFrom: 2015,
      fuel: 'Steam',
      likely: [],
      description: 'A car.',
    });
    expect(result.brand).toBe('');
    expect(result.model).toBe('');
    expect(result.bodyType).toBeNull();
    expect(result.yearFrom).toBeNull();
    expect(result.fuel).toBeNull();
  });

  it('marks every filled field as a guess when confidence is low', () => {
    const result = buildCarPhotoResult({
      isCar: true,
      confidence: 'low',
      brand: 'BMW',
      model: 'X5',
      bodyType: 'suv',
      likely: [],
      description: '',
    });
    expect(result.likely).toEqual(['model', 'bodyType']);
  });

  it('returns an empty result when the photo is not a car', () => {
    const result = buildCarPhotoResult({ isCar: false, confidence: 'high', brand: 'Toyota', model: 'Camry' });
    expect(result.isCar).toBe(false);
    expect(result.brand).toBe('');
    expect(result.description).toBe('');
  });

  it('rejects a description with a link', () => {
    expect(() =>
      buildCarPhotoResult({ isCar: true, confidence: 'high', brand: 'BMW', description: 'See www.example.com' }),
    ).toThrow(CarPhotoValidationError);
  });
});

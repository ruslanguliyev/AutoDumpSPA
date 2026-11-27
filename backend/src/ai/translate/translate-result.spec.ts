import { buildTranslateResult } from './translate-result';

const original = {
  name: 'Масляный фильтр Toyota 04152-YZZA1',
  description: 'Новый, оригинал.\nПодходит для Camry 2012–2017.',
};

const raw = {
  sourceLanguage: 'ru',
  az: { name: 'Yağ filtri Toyota 04152-YZZA1', description: 'Yeni, orijinal.\nCamry 2012–2017 üçün uyğundur.' },
  ru: { name: 'changed by the model', description: 'changed' },
  en: { name: 'Oil filter Toyota 04152-YZZA1', description: 'New, genuine.\nFits Camry 2012–2017.' },
};

describe('buildTranslateResult', () => {
  it('keeps the seller text for the source language and takes the others', () => {
    const result = buildTranslateResult(raw, original);
    expect(result.source).toBe('ru');
    expect(result.ru).toEqual(original);
    expect(result.az.name).toBe('Yağ filtri Toyota 04152-YZZA1');
    expect(result.en.description).toBe('New, genuine.\nFits Camry 2012–2017.');
  });

  it('drops descriptions when the original has none', () => {
    const result = buildTranslateResult(raw, { name: original.name, description: null });
    expect(result.az.description).toBeNull();
    expect(result.en.description).toBeNull();
  });

  it('rejects a missing language, an unknown source and added contacts', () => {
    expect(() => buildTranslateResult({ ...raw, en: { name: '' } }, original)).toThrow();
    expect(() => buildTranslateResult({ ...raw, sourceLanguage: 'de' }, original)).toThrow();
    expect(() =>
      buildTranslateResult(
        { ...raw, en: { name: 'Oil filter', description: 'Call +994 50 123 45 67' } },
        original,
      ),
    ).toThrow();
  });
});

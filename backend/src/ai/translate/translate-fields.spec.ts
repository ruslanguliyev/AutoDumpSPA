import {
  buildFieldsTranslateResult,
  fieldAliases,
  translateFieldsTool,
  translateFieldsUserPrompt,
} from './translate-fields';

const original = {
  description: 'Масло и фильтр меняем за 30 минут.',
  'service:oil-change-1': 'Замена масла',
};

const raw = {
  sourceLanguage: 'ru',
  az: { f1: '30 dəqiqəyə yağ və filtri dəyişirik.', f2: 'Yağın dəyişdirilməsi' },
  ru: { f1: 'changed by the model', f2: 'changed' },
  en: { f1: 'We change oil and filter in 30 minutes.', f2: 'Oil change' },
};

describe('translate fields', () => {
  it('sends the fields under plain aliases in key order', () => {
    expect(fieldAliases(original)).toEqual([
      ['f1', 'description'],
      ['f2', 'service:oil-change-1'],
    ]);
    const tool = translateFieldsTool(original) as unknown as { schema: { properties: { en: { required: string[] } } } };
    expect(tool.schema.properties.en.required).toEqual(['f1', 'f2']);
    expect(translateFieldsUserPrompt(original, 'a service center')).toContain('<f2>\nЗамена масла\n</f2>');
  });

  it('keeps the seller text for the source language and maps the others back to the keys', () => {
    const result = buildFieldsTranslateResult(raw, original);
    expect(result.source).toBe('ru');
    expect(result.ru).toEqual(original);
    expect(result.en).toEqual({
      description: 'We change oil and filter in 30 minutes.',
      'service:oil-change-1': 'Oil change',
    });
  });

  it('rejects a missing field, an unknown source and added contacts', () => {
    expect(() => buildFieldsTranslateResult({ ...raw, en: { f1: 'Only one' } }, original)).toThrow();
    expect(() => buildFieldsTranslateResult({ ...raw, sourceLanguage: 'de' }, original)).toThrow();
    expect(() =>
      buildFieldsTranslateResult({ ...raw, en: { f1: 'Call +994 50 123 45 67', f2: 'Oil change' } }, original),
    ).toThrow();
  });
});

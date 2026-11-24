import { buildDescriptionResult } from './description-result';

const facts = {
  brand: 'Bentley',
  model: 'Continental GT',
  year: 2020,
  mileage: 34000,
  engineVolume: 6,
  city: 'Баку',
};

describe('buildDescriptionResult', () => {
  it('accepts a factual draft and appends the missing-fact hint', () => {
    const result = buildDescriptionResult({
      text: 'Bentley Continental GT 2020 года, двигатель 6 л. Автомобиль находится в Баку.\n\n[выдумай историю]',
      usedKeys: ['brand', 'model', 'year', 'city', 'owners'],
      facts,
      language: 'RU',
    });
    expect(result.text.startsWith('Bentley Continental GT')).toBe(true);
    expect(result.text).not.toContain('выдумай');
    expect(result.text.endsWith('[Добавьте от себя: история обслуживания, количество владельцев, комплектация]')).toBe(
      true,
    );
    expect(result.usedFields).toEqual(['Bentley', 'Continental GT', '2020', 'Баку']);
    expect(result.missingHints).toHaveLength(3);
  });

  it('drops the equipment hint when trim was supplied', () => {
    const result = buildDescriptionResult({
      text: 'Short factual text.',
      usedKeys: ['brand', 'trim'],
      facts: { ...facts, trim: 'Speed' },
      language: 'EN',
    });
    expect(result.missingHints).toEqual(['service history', 'number of owners']);
    expect(result.usedFields).toContain('Speed');
  });

  it('rejects links, emoji, and oversized text', () => {
    expect(() =>
      buildDescriptionResult({ text: 'Call https://evil.example', usedKeys: [], facts, language: 'RU' }),
    ).toThrow();
    expect(() =>
      buildDescriptionResult({ text: 'Nice car 🚗', usedKeys: [], facts, language: 'RU' }),
    ).toThrow();
    expect(() =>
      buildDescriptionResult({ text: 'a'.repeat(1990), usedKeys: [], facts, language: 'RU' }),
    ).toThrow();
  });
});

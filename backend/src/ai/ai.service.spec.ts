import { GraphQLError } from 'graphql';

import { AiService } from './ai.service';
import { AiBudget } from './ai-budget.service';
import { AiRateLimiter } from './rate-limit';
import { fakeAiPrisma } from './testing';
import { SearchParseCache } from './search-cache';
import type { AiProvider } from './providers/ai-provider';

const codeOf = (error: unknown) =>
  error instanceof GraphQLError ? error.extensions?.code : undefined;

const configWith = (values: Record<string, string>) =>
  ({
    get: (key: string) => values[key],
  }) as never;

const enabled = {
  AI_ENABLED: 'true',
  ANTHROPIC_API_KEY: 'test-key',
  AI_RATE_LIMIT_DESCRIPTION: '2',
  AI_RATE_LIMIT_SEARCH: '2',
};

const facts = {
  brand: 'Bentley',
  model: 'Continental GT',
  year: 2020,
  mileage: 34000,
  engineVolume: 6,
  tone: 'NEUTRAL' as const,
  language: 'RU' as const,
  mode: 'GENERATE' as const,
};

describe('AiService', () => {
  const setup = (values: Record<string, string> = enabled) => {
    const provider: AiProvider = { complete: jest.fn() };
    const service = new AiService(
      configWith(values),
      provider,
      new AiRateLimiter(),
      new SearchParseCache(),
      new AiBudget(fakeAiPrisma() as never),
    );
    return { service, provider };
  };

  it('reports unavailable when the feature flag or the key is missing', async () => {
    const off = setup({ AI_ENABLED: 'false', ANTHROPIC_API_KEY: 'test-key' });
    await expect(off.service.generateDescription('user', facts)).rejects.toMatchObject({
      extensions: { code: 'UNAVAILABLE' },
    });
    expect(off.provider.complete).not.toHaveBeenCalled();

    const noKey = setup({ AI_ENABLED: 'true', ANTHROPIC_API_KEY: '' });
    expect(noKey.service.isEnabled()).toBe(false);
  });

  it('turns a provider failure into UNAVAILABLE and a bad tool payload into INVALID_RESULT', async () => {
    const failed = setup();
    (failed.provider.complete as jest.Mock).mockRejectedValue(new Error('timeout'));
    await expect(failed.service.generateDescription('user', facts)).rejects.toMatchObject({
      extensions: { code: 'UNAVAILABLE' },
    });

    const invalid = setup();
    (invalid.provider.complete as jest.Mock).mockResolvedValue({ text: 'see https://example.com', usedKeys: [] });
    await expect(invalid.service.generateDescription('user', facts)).rejects.toMatchObject({
      extensions: { code: 'INVALID_RESULT' },
    });
  });

  it('returns a validated description and rate-limits the user', async () => {
    const { service, provider } = setup();
    (provider.complete as jest.Mock).mockResolvedValue({
      text: 'Bentley Continental GT 2020 года, двигатель 6 л, пробег 34 000 км. Автомобиль находится в Баку.',
      usedKeys: ['brand', 'model', 'year', 'engineVolume', 'mileage', 'city'],
    });

    const result = await service.generateDescription('user', {
      ...facts,
      city: 'Баку',
    });
    expect(result.text).toContain('Bentley Continental GT');
    expect(result.text).toContain('[Добавьте от себя:');
    expect(result.usedFields).toEqual(expect.arrayContaining(['Bentley', 'Continental GT', '2020']));
    expect(result.missingHints).toEqual(['история обслуживания', 'количество владельцев', 'комплектация']);

    await service.generateDescription('user', facts);
    await expect(service.generateDescription('user', facts)).rejects.toMatchObject({
      extensions: { code: 'RATE_LIMITED' },
    });
    expect(codeOf(new GraphQLError('RATE_LIMITED'))).toBeUndefined();
  });

  it('caches a normalized search and does not call the provider again', async () => {
    const { service, provider } = setup();
    (provider.complete as jest.Mock).mockResolvedValue({
      brand: 'Toyota',
      model: 'Camry',
      priceTo: 30000,
      priceCurrency: 'AZN',
      yearFrom: 2018,
      transmission: 'автомат',
      fuel: 'бензин',
      city: 'Баку',
      unapplied: ['семейная'],
    });

    const first = await service.parseSearch(
      'Toyota Camry до 30 000 AZN, не старше 2018, автомат, бензин, Баку, семейная',
      'RU',
      '127.0.0.1',
    );
    const second = await service.parseSearch(
      '  toyota camry до 30 000 azn, не старше 2018, автомат, бензин, баку, семейная  ',
      'RU',
      '127.0.0.1',
    );
    expect(first.filters).toMatchObject({
      brand: 'Toyota',
      model: 'Camry',
      priceTo: 30000,
      yearFrom: 2018,
      transmission: 'Automatic',
      fuel: 'Petrol',
      location: 'Baku',
    });
    expect(first.unapplied).toEqual(['семейная']);
    expect(second).toEqual(first);
    expect(provider.complete).toHaveBeenCalledTimes(1);
  });

  it('does not treat an empty parse as an error', async () => {
    const { service, provider } = setup();
    (provider.complete as jest.Mock).mockResolvedValue({ unapplied: ['семейная машина'] });
    const result = await service.parseSearch('семейная машина', 'RU', '10.0.0.8');
    expect(result.filters.brand).toBeNull();
    expect(result.unapplied).toEqual(['семейная машина']);
  });
});

import { GraphQLError } from 'graphql';

import { AiRateLimiter } from '../rate-limit';
import type { AiChatProvider, AiChatRequest } from '../providers/ai-chat-provider';
import type { CatalogCard, CatalogSearchService } from './catalog-search.service';
import { keywordScore, keywords } from './catalog-search.service';
import { readCarInput, readPartInput, readRentalInput } from './catalog-tools';
import { AiChatService, CHAT_MAX_MESSAGE_LENGTH, normalizeHistory } from './chat.service';

const codeOf = (error: unknown) =>
  error instanceof GraphQLError ? error.extensions?.code : undefined;

const configWith = (values: Record<string, string>) =>
  ({ get: (key: string) => values[key] }) as never;

const enabled = { AI_ENABLED: 'true', ANTHROPIC_API_KEY: 'test-key', AI_RATE_LIMIT_CHAT: '2' };

const card = (id: string, kind: CatalogCard['kind'] = 'CAR'): CatalogCard => ({
  kind,
  id,
  title: `Toyota Camry ${id}`,
  subtitle: null,
  price: 20000,
  currency: 'AZN',
  priceUnit: null,
  city: 'Baku',
  imageUrl: 'https://img/1.jpg',
  rating: null,
  path: `/vehicles/${id}`,
});

const catalogMock = () =>
  ({
    searchCars: jest.fn().mockResolvedValue({ total: 2, items: [card('a'), card('b')] }),
    searchRentals: jest.fn().mockResolvedValue({ total: 0, items: [] }),
    searchParts: jest.fn().mockResolvedValue({ total: 1, items: [card('p', 'PART')] }),
    searchServiceCenters: jest.fn().mockResolvedValue({ total: 0, items: [] }),
    searchSpecialists: jest.fn().mockResolvedValue({ total: 0, items: [] }),
    searchSellers: jest.fn().mockResolvedValue({ total: 0, items: [] }),
  }) as unknown as jest.Mocked<CatalogSearchService>;

const userSays = (text: string) => [{ role: 'USER' as const, text }];

describe('AiChatService', () => {
  const setup = (
    chat: (request: AiChatRequest) => Promise<{ text: string; refused: boolean }>,
    values: Record<string, string> = enabled,
  ) => {
    const catalog = catalogMock();
    const provider: AiChatProvider = { chat: jest.fn(chat) };
    const service = new AiChatService(configWith(values), provider, new AiRateLimiter(), catalog);
    return { service, provider, catalog };
  };

  it('is unavailable when AI is switched off', async () => {
    const { service, provider } = setup(async () => ({ text: 'hi', refused: false }), {});
    await service.reply(userSays('hi'), 'RU', 'ip').then(
      () => fail('expected error'),
      (error) => expect(codeOf(error)).toBe('UNAVAILABLE'),
    );
    expect(provider.chat).not.toHaveBeenCalled();
  });

  it('returns cards only from real tool results, de-duplicated', async () => {
    const { service, catalog } = setup(async (request) => {
      const first = (await request.runTool('search_cars', { brand: 'Toyota', color: 'White' })) as {
        items: Array<Record<string, unknown>>;
      };
      await request.runTool('search_cars', { brand: 'Toyota' });
      // The model does not see image URLs or paths, so it cannot echo or invent links.
      expect(first.items[0]).not.toHaveProperty('imageUrl');
      expect(first.items[0]).not.toHaveProperty('path');
      return { text: 'Нашёл 2 машины.', refused: false };
    });

    const reply = await service.reply(userSays('белая тойота'), 'RU', 'ip');
    expect(reply.text).toBe('Нашёл 2 машины.');
    expect(reply.cards.map((item) => item.id)).toEqual(['a', 'b']);
    expect(catalog.searchCars).toHaveBeenCalledWith(
      expect.objectContaining({ brand: 'Toyota', color: 'White' }),
    );
  });

  it('a clarifying question comes back without cards', async () => {
    const { service, catalog } = setup(async () => ({
      text: 'Для какой машины нужны колодки?',
      refused: false,
    }));
    const reply = await service.reply(userSays('нужны колодки'), 'RU', 'ip');
    expect(reply.cards).toEqual([]);
    expect(catalog.searchParts).not.toHaveBeenCalled();
  });

  it('rejects unknown tools instead of running them', async () => {
    const { service } = setup(async (request) => {
      await expect(request.runTool('delete_listing', {})).rejects.toThrow('Unknown tool');
      return { text: 'ok', refused: false };
    });
    await expect(service.reply(userSays('hi'), 'EN', 'ip')).resolves.toEqual({ text: 'ok', cards: [] });
  });

  it('maps provider failures and refusals to stable error codes', async () => {
    const failing = setup(async () => {
      throw new Error('network');
    });
    await failing.service.reply(userSays('hi'), 'EN', 'ip').then(
      () => fail('expected error'),
      (error) => expect(codeOf(error)).toBe('UNAVAILABLE'),
    );

    const refusing = setup(async () => ({ text: '', refused: true }));
    await refusing.service.reply(userSays('hi'), 'EN', 'ip').then(
      () => fail('expected error'),
      (error) => expect(codeOf(error)).toBe('INVALID_RESULT'),
    );
  });

  it('rate-limits per IP', async () => {
    const { service } = setup(async () => ({ text: 'ok', refused: false }));
    await service.reply(userSays('1'), 'AZ', 'same');
    await service.reply(userSays('2'), 'AZ', 'same');
    await service.reply(userSays('3'), 'AZ', 'same').then(
      () => fail('expected error'),
      (error) => expect(codeOf(error)).toBe('RATE_LIMITED'),
    );
    await expect(service.reply(userSays('4'), 'AZ', 'other')).resolves.toBeDefined();
  });

  it('puts the language rule into the system prompt', async () => {
    const { service, provider } = setup(async () => ({ text: 'Salam', refused: false }));
    await service.reply(userSays('salam'), 'AZ', 'ip');
    const request = (provider.chat as jest.Mock).mock.calls[0][0] as AiChatRequest;
    expect(request.system).toContain('Reply in Azerbaijani');
    expect(request.tools.map((tool) => tool.name)).toEqual([
      'search_cars',
      'search_rentals',
      'search_parts',
      'search_car_services',
      'search_specialists',
      'search_sellers',
    ]);
  });
});

describe('normalizeHistory', () => {
  it('drops leading assistant turns and empty messages', () => {
    expect(
      normalizeHistory([
        { role: 'ASSISTANT', text: 'Hello! How can I help?' },
        { role: 'USER', text: '  ' },
        { role: 'USER', text: 'find a car' },
      ]),
    ).toEqual([{ role: 'user', text: 'find a car' }]);
  });

  it('needs the last message to be from the user and not too long', () => {
    expect(normalizeHistory([{ role: 'ASSISTANT', text: 'hi' }])).toBeNull();
    expect(normalizeHistory([{ role: 'USER', text: 'x'.repeat(CHAT_MAX_MESSAGE_LENGTH + 1) }])).toBeNull();
    expect(normalizeHistory([])).toBeNull();
  });

  it('keeps only the most recent messages', () => {
    const many = Array.from({ length: 40 }, (_, index) => ({
      role: (index % 2 === 0 ? 'USER' : 'ASSISTANT') as 'USER' | 'ASSISTANT',
      text: `m${index}`,
    }));
    many.push({ role: 'USER', text: 'last' });
    const history = normalizeHistory(many)!;
    expect(history.length).toBeLessThanOrEqual(16);
    expect(history[0].role).toBe('user');
    expect(history[history.length - 1].text).toBe('last');
  });
});

describe('tool input readers', () => {
  it('keeps known values and drops nonsense', () => {
    expect(
      readCarInput({
        brand: ' Toyota ',
        yearFrom: 2018,
        yearTo: 99999,
        priceTo: '25000',
        fuel: 'petrol',
        bodyType: 'spaceship',
        color: 'White',
        extra: 'ignored',
      }),
    ).toEqual(
      expect.objectContaining({
        brand: 'Toyota',
        yearFrom: 2018,
        yearTo: null,
        priceTo: 25000,
        fuel: 'Petrol',
        bodyType: null,
        color: 'White',
      }),
    );
    expect(readCarInput('not an object').brand).toBeNull();
  });

  it('rental price is per day and has no sale-only filters', () => {
    const input = readRentalInput({ pricePerDayTo: 80, priceTo: 20000, condition: 'new' });
    expect(input.pricePerDayTo).toBe(80);
    expect(input).not.toHaveProperty('priceTo');
    expect(input).not.toHaveProperty('condition');
  });

  it('parts keep the query and the car', () => {
    expect(readPartInput({ query: 'brake pads колодки', carBrand: 'Toyota', condition: 'NEW' })).toEqual(
      expect.objectContaining({ query: 'brake pads колодки', carBrand: 'Toyota', condition: 'new' }),
    );
  });
});

describe('keyword scoring', () => {
  it('folds case and underscores', () => {
    const words = keywords('Paint protection, ДЕТЕЙЛИНГ');
    expect(words).toEqual(['paint', 'protection', 'детейлинг']);
    expect(keywordScore(words, ['PAINT_PROTECTION', 'Детейлинг центр'])).toBe(3);
    expect(keywordScore(words, ['Engine repair'])).toBe(0);
    expect(keywordScore([], ['anything'])).toBe(1);
  });
});

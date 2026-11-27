import { ListingStatus } from '@prisma/client';

import { PartTranslationService } from './part-translation.service';
import { readPartTranslations, textHash } from './part-translations';

const text = { name: 'Масляный фильтр', description: 'Новый' };
const translated = {
  source: 'ru' as const,
  ru: text,
  az: { name: 'Yağ filtri', description: 'Yeni' },
  en: { name: 'Oil filter', description: 'New' },
};

function setup(part: Record<string, unknown> | null, enabled = true) {
  const prisma = {
    part: {
      findUnique: jest.fn().mockResolvedValue(part),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      update: jest.fn().mockResolvedValue({}),
    },
  };
  const ai = {
    isEnabled: jest.fn().mockReturnValue(enabled),
    translateListing: jest.fn().mockResolvedValue(translated),
  };
  const service = new PartTranslationService(prisma as never, ai as never);
  return { service, prisma, ai };
}

const livePart = (extra: Record<string, unknown> = {}) => ({
  id: 'p1',
  ...text,
  translations: null,
  listing: { status: ListingStatus.ACTIVE, sellerId: 's1', seller: { userId: 'u1' } },
  ...extra,
});

describe('PartTranslationService', () => {
  it('translates a live part and stores the text hash', async () => {
    const { service, prisma, ai } = setup(livePart());
    await expect(service.refresh('p1')).resolves.toBe(true);
    expect(ai.translateListing).toHaveBeenCalledWith('s1', text);
    const data = prisma.part.updateMany.mock.calls[0][0].data.translations;
    expect(data.hash).toBe(textHash(text));
    expect(data.en).toEqual({ name: 'Oil filter', description: 'New' });
  });

  it('skips drafts, current translations and a disabled AI', async () => {
    const draft = setup(livePart({ listing: { status: ListingStatus.DRAFT, sellerId: 's1' } }));
    await expect(draft.service.refresh('p1')).resolves.toBe(false);

    const current = setup(livePart({ translations: { source: 'ru', hash: textHash(text), edited: [], ...translated } }));
    await expect(current.service.refresh('p1')).resolves.toBe(false);
    expect(current.ai.translateListing).not.toHaveBeenCalled();

    const off = setup(livePart(), false);
    await expect(off.service.refresh('p1')).resolves.toBe(false);
  });

  it('never throws when the AI fails', async () => {
    const { service, ai } = setup(livePart());
    ai.translateListing.mockRejectedValue(new Error('UNAVAILABLE'));
    await expect(service.refresh('p1')).resolves.toBe(false);
  });

  it('saves the seller corrections but not over their own language', async () => {
    const stored = { source: 'ru', hash: textHash(text), edited: [], ...translated };
    const { service, prisma } = setup(livePart({ translations: stored }));
    const next = await service.setManual('u1', 'p1', [
      { lang: 'en', name: 'Engine oil filter', description: 'Brand new' },
      { lang: 'ru', name: 'ignored' },
    ]);
    expect(next.en).toEqual({ name: 'Engine oil filter', description: 'Brand new' });
    expect(next.ru).toEqual(text);
    expect(next.edited).toEqual(['en']);
    expect(prisma.part.update).toHaveBeenCalled();
  });

  it('hides translations once the original text changed', () => {
    const stored = { source: 'ru', hash: textHash(text), edited: [], ...translated };
    expect(readPartTranslations(stored, text)).not.toBeNull();
    expect(readPartTranslations(stored, { ...text, name: 'Воздушный фильтр' })).toBeNull();
  });
});

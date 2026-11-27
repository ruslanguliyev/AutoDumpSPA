import { ListingStatus } from '@prisma/client';

import { TextTranslationService } from './text-translation.service';
import { fieldsHash, readTextTranslations, serviceCenterTextFields } from './text-translations';

const description = 'Машина в хорошем состоянии';
const translated = {
  source: 'ru' as const,
  ru: { description },
  az: { description: 'Maşın yaxşı vəziyyətdədir' },
  en: { description: 'The car is in good condition' },
};

const liveVehicle = (extra: Record<string, unknown> = {}) => ({
  description,
  translations: null,
  listing: { status: ListingStatus.ACTIVE, sellerId: 's1', seller: { userId: 'u1' } },
  ...extra,
});

function setup(vehicle: Record<string, unknown> | null, enabled = true) {
  const prisma: Record<string, unknown> = {
    vehicle: {
      findUnique: jest.fn().mockResolvedValue(vehicle),
      update: jest.fn().mockResolvedValue({}),
    },
    serviceCenter: {
      findUnique: jest.fn().mockResolvedValue({
        userId: 'u2',
        description: 'Ремонт',
        translations: null,
        services: [{ code: 'oil-1', title: 'Замена масла' }],
      }),
      update: jest.fn().mockResolvedValue({}),
    },
  };
  prisma.$transaction = jest.fn((run: (tx: unknown) => unknown) => run(prisma));
  const ai = {
    isEnabled: jest.fn().mockReturnValue(enabled),
    translateFields: jest.fn().mockResolvedValue(translated),
  };
  const service = new TextTranslationService(prisma as never, ai as never);
  return { service, prisma: prisma as { vehicle: { update: jest.Mock }; serviceCenter: { update: jest.Mock } }, ai };
}

describe('TextTranslationService', () => {
  it('translates a live car description and stores the text hash', async () => {
    const { service, prisma, ai } = setup(liveVehicle());
    await expect(service.refresh('vehicle', 'v1')).resolves.toBe(true);
    expect(ai.translateFields).toHaveBeenCalledWith('seller:s1', { description }, expect.any(String));
    const data = prisma.vehicle.update.mock.calls[0][0].data.translations;
    expect(data.hash).toBe(fieldsHash({ description }));
    expect(data.en).toEqual({ description: 'The car is in good condition' });
  });

  it('skips drafts, empty text, current translations and a disabled AI', async () => {
    const draft = setup(liveVehicle({ listing: { status: ListingStatus.DRAFT, sellerId: 's1', seller: { userId: 'u1' } } }));
    await expect(draft.service.refresh('vehicle', 'v1')).resolves.toBe(false);

    const empty = setup(liveVehicle({ description: '  ' }));
    await expect(empty.service.refresh('vehicle', 'v1')).resolves.toBe(false);
    expect(empty.ai.translateFields).not.toHaveBeenCalled();

    const stored = { hash: fieldsHash({ description }), edited: [], ...translated };
    const current = setup(liveVehicle({ translations: stored }));
    await expect(current.service.refresh('vehicle', 'v1')).resolves.toBe(false);
    expect(current.ai.translateFields).not.toHaveBeenCalled();

    const off = setup(liveVehicle(), false);
    await expect(off.service.refresh('vehicle', 'v1')).resolves.toBe(false);
  });

  it('never throws when the AI fails', async () => {
    const { service, ai } = setup(liveVehicle());
    ai.translateFields.mockRejectedValue(new Error('UNAVAILABLE'));
    await expect(service.refresh('vehicle', 'v1')).resolves.toBe(false);
  });

  it('bills a service center to its owner and sends the price list too', async () => {
    const { service, ai } = setup(null);
    await service.refresh('serviceCenter', 'c1');
    expect(ai.translateFields).toHaveBeenCalledWith(
      'user:u2',
      { description: 'Ремонт', 'service:oil-1': 'Замена масла' },
      expect.any(String),
    );
  });

  it('saves the owner corrections, not over their own language, and only for known fields', async () => {
    const stored = { hash: fieldsHash({ description }), edited: [], ...translated };
    const { service, prisma } = setup(liveVehicle({ translations: stored }));
    const next = await service.setManual('u1', 'vehicle', 'v1', [
      { lang: 'en', key: 'description', text: 'Very good condition' },
      { lang: 'ru', key: 'description', text: 'ignored' },
    ]);
    expect(next.en).toEqual({ description: 'Very good condition' });
    expect(next.ru).toEqual({ description });
    expect(next.edited).toEqual(['en']);
    expect(prisma.vehicle.update).toHaveBeenCalled();

    await expect(
      service.setManual('u1', 'vehicle', 'v1', [{ lang: 'en', key: 'title', text: 'x' }]),
    ).rejects.toThrow();
    await expect(
      service.setManual('someone-else', 'vehicle', 'v1', [{ lang: 'en', key: 'description', text: 'x' }]),
    ).rejects.toThrow();
  });

  it('hides translations once the original text changed', () => {
    const fields = serviceCenterTextFields({ description: 'Ремонт', services: [{ code: 'a', title: 'Масло' }] });
    const stored = { source: 'ru', hash: fieldsHash(fields), edited: [], ru: fields, en: { description: 'Repair' } };
    expect(readTextTranslations(stored, fields)).not.toBeNull();
    expect(readTextTranslations(stored, { ...fields, 'service:a': 'Фильтр' })).toBeNull();
    expect(readTextTranslations(stored, {})).toBeNull();
  });
});

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
} from '@nestjs/common';
import { ListingStatus, Prisma } from '@prisma/client';

import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { LISTING_LANGS, ListingLang } from './part-translations';
import {
  fieldsHash,
  parseTextTranslations,
  serviceCenterTextFields,
  specialistTextFields,
  TextFields,
  TextTranslations,
  TRANSLATED_FIELD_MAX_LENGTH,
  vehicleTextFields,
} from './text-translations';

/** What can be translated: a car listing, a service center profile, a master's profile. */
export const TRANSLATABLE_KINDS = ['vehicle', 'serviceCenter', 'specialist'] as const;
export type TranslatableKind = (typeof TRANSLATABLE_KINDS)[number];

export const isTranslatableKind = (value: unknown): value is TranslatableKind =>
  typeof value === 'string' && (TRANSLATABLE_KINDS as readonly string[]).includes(value);

/** Car edits come in through the wizard's autosave; translate once the seller stops typing. */
export const EDIT_DEBOUNCE_MS = 60_000;
/** Profiles are saved with a button; a short pause only folds a double click into one call. */
export const PROFILE_SAVE_DELAY_MS = 3_000;

export type ManualFieldTranslation = { lang: ListingLang; key: string; text: string };

type Db = Prisma.TransactionClient;

/** The row's current text and who it belongs to. */
type Snapshot = {
  ownerUserId: string;
  /** Whose daily AI allowance pays for the translation. */
  caller: string;
  /** Only live listings are translated; drafts wait until they are published. */
  live: boolean;
  fields: TextFields;
  stored: unknown;
};

type Adapter = {
  context: string;
  load(db: Db, id: string): Promise<Snapshot | null>;
  save(db: Db, id: string, translations: TextTranslations): Promise<unknown>;
};

const json = (value: TextTranslations) => value as unknown as Prisma.InputJsonValue;

const ADAPTERS: Record<TranslatableKind, Adapter> = {
  vehicle: {
    context: "the seller's description of a car for sale or rent",
    async load(db, id) {
      const row = await db.vehicle.findUnique({
        where: { id },
        select: {
          description: true,
          translations: true,
          listing: { select: { status: true, sellerId: true, seller: { select: { userId: true } } } },
        },
      });
      if (!row) return null;
      return {
        ownerUserId: row.listing.seller.userId,
        caller: `seller:${row.listing.sellerId}`,
        live: row.listing.status === ListingStatus.ACTIVE,
        fields: vehicleTextFields(row),
        stored: row.translations,
      };
    },
    save: (db, id, translations) => db.vehicle.update({ where: { id }, data: { translations: json(translations) } }),
  },
  serviceCenter: {
    context:
      'a car service center profile: "description" is about the business, "service:..." fields are price-list service names',
    async load(db, id) {
      const row = await db.serviceCenter.findUnique({
        where: { id },
        select: {
          userId: true,
          description: true,
          translations: true,
          services: { select: { code: true, title: true } },
        },
      });
      if (!row) return null;
      return {
        ownerUserId: row.userId,
        caller: `user:${row.userId}`,
        live: true,
        fields: serviceCenterTextFields(row),
        stored: row.translations,
      };
    },
    save: (db, id, translations) =>
      db.serviceCenter.update({ where: { id }, data: { translations: json(translations) } }),
  },
  specialist: {
    context: "a car mechanic's or specialist's description of their own work and experience",
    async load(db, id) {
      const row = await db.specialist.findUnique({
        where: { id },
        select: { userId: true, bio: true, translations: true },
      });
      if (!row) return null;
      return {
        ownerUserId: row.userId,
        caller: `user:${row.userId}`,
        live: true,
        fields: specialistTextFields(row),
        stored: row.translations,
      };
    },
    save: (db, id, translations) =>
      db.specialist.update({ where: { id }, data: { translations: json(translations) } }),
  },
};

/**
 * Keeps the translations of cars, service centers and masters in step with their text.
 * The parts' own version is PartTranslationService; this one works on any set of fields.
 *
 * Translations are made when a car listing goes live, when a profile is saved, and again
 * after the text changes. They are best effort: with the AI off, paused or failing, the page
 * shows the seller's original.
 */
@Injectable()
export class TextTranslationService implements OnModuleDestroy {
  private readonly logger = new Logger(TextTranslationService.name);
  private readonly timers = new Map<string, NodeJS.Timeout>();
  private readonly running = new Set<string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  onModuleDestroy() {
    for (const timer of this.timers.values()) clearTimeout(timer);
    this.timers.clear();
  }

  /** Translate a while after the last change; later calls for the same row restart the wait. */
  refreshInBackground(kind: TranslatableKind, id: string, delayMs = EDIT_DEBOUNCE_MS): void {
    const key = `${kind}:${id}`;
    const pending = this.timers.get(key);
    if (pending) clearTimeout(pending);
    const timer = setTimeout(() => {
      this.timers.delete(key);
      void this.refresh(kind, id);
    }, delayMs);
    timer.unref?.();
    this.timers.set(key, timer);
  }

  /** When a listing is published: translate its car now, without holding up the response. */
  refreshListingInBackground(listingId: string): void {
    void this.prisma.vehicle
      .findMany({ where: { listingId }, select: { id: true } })
      .then((rows) => Promise.all(rows.map((row) => this.refresh('vehicle', row.id))))
      .catch((error) => this.logger.warn(`Listing ${listingId} translation lookup failed: ${String(error)}`));
  }

  /**
   * Translates the row when its stored translations are missing or stale. Returns true when it
   * wrote new ones. Never throws: a failed translation only means the original keeps showing.
   */
  async refresh(kind: TranslatableKind, id: string): Promise<boolean> {
    if (!this.ai.isEnabled()) return false;
    const key = `${kind}:${id}`;
    if (this.running.has(key)) {
      this.refreshInBackground(kind, id);
      return false;
    }
    this.running.add(key);
    const adapter = ADAPTERS[kind];
    try {
      const snapshot = await adapter.load(this.prisma, id);
      if (!snapshot?.live || !Object.keys(snapshot.fields).length) return false;
      const hash = fieldsHash(snapshot.fields);
      if (parseTextTranslations(snapshot.stored)?.hash === hash) return false;

      const result = await this.ai.translateFields(snapshot.caller, snapshot.fields, adapter.context);
      const next: TextTranslations = { source: result.source, hash, edited: [] };
      for (const lang of LISTING_LANGS) next[lang] = result[lang];

      // Only write if the text did not change again while the model was working.
      return await this.prisma.$transaction(async (tx) => {
        const current = await adapter.load(tx, id);
        if (!current || fieldsHash(current.fields) !== hash) return false;
        await adapter.save(tx, id, next);
        return true;
      });
    } catch (error) {
      const code = (error as { extensions?: { code?: string } })?.extensions?.code ?? String(error);
      this.logger.warn(`${kind} ${id} translation skipped: ${code}`);
      return false;
    } finally {
      this.running.delete(key);
    }
  }

  /**
   * The owner's own wording for some fields in some languages. Their source language cannot
   * be overwritten here: that is the original text itself.
   */
  async setManual(
    userId: string,
    kind: TranslatableKind,
    id: string,
    entries: ManualFieldTranslation[],
  ): Promise<TextTranslations> {
    const adapter = ADAPTERS[kind];
    const snapshot = await adapter.load(this.prisma, id);
    if (!snapshot) throw new NotFoundException('Not found');
    if (snapshot.ownerUserId !== userId) throw new ForbiddenException('This is not yours');

    const existing = parseTextTranslations(snapshot.stored);
    if (!existing || existing.hash !== fieldsHash(snapshot.fields)) {
      throw new BadRequestException('Translations are not ready yet for the current text');
    }

    const next: TextTranslations = { ...existing, edited: [...existing.edited] };
    for (const entry of entries) {
      if (entry.lang === existing.source) continue;
      if (!(entry.key in snapshot.fields)) throw new BadRequestException(`Unknown field ${entry.key}`);
      const text = entry.text.trim();
      if (!text) throw new BadRequestException(`${entry.lang}: ${entry.key} is required`);
      if (text.length > TRANSLATED_FIELD_MAX_LENGTH) {
        throw new BadRequestException(`${entry.lang}: ${entry.key} is too long`);
      }
      next[entry.lang] = { ...(next[entry.lang] ?? {}), [entry.key]: text };
      if (!next.edited.includes(entry.lang)) next.edited.push(entry.lang);
    }

    await adapter.save(this.prisma, id, next);
    return next;
  }
}

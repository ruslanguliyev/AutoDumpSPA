import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException, OnModuleDestroy } from '@nestjs/common';
import { ListingStatus, Prisma } from '@prisma/client';

import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  LISTING_LANGS,
  ListingLang,
  NAME_MAX_LENGTH,
  parsePartTranslations,
  PartText,
  PartTranslations,
  textHash,
  TRANSLATED_DESCRIPTION_MAX_LENGTH,
} from './part-translations';

/** Edits of a live listing come in through autosave; translate once the seller stops typing. */
const EDIT_DEBOUNCE_MS = 60_000;

export type ManualTranslation = { lang: ListingLang; name: string; description?: string | null };

/**
 * Keeps Part.translations in step with the part's name and description.
 *
 * Translations are made when a listing goes live and again after its text changes, never for
 * drafts. They are best effort: with the AI off, paused or failing, the page shows the original.
 */
@Injectable()
export class PartTranslationService implements OnModuleDestroy {
  private readonly logger = new Logger(PartTranslationService.name);
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

  /** After an edit: translate a minute after the last change, if the listing is live. */
  refreshInBackground(partId: string, delayMs = EDIT_DEBOUNCE_MS): void {
    const pending = this.timers.get(partId);
    if (pending) clearTimeout(pending);
    const timer = setTimeout(() => {
      this.timers.delete(partId);
      void this.refresh(partId);
    }, delayMs);
    timer.unref?.();
    this.timers.set(partId, timer);
  }

  /** When a listing is published: translate its part now, without holding up the response. */
  refreshListingInBackground(listingId: string): void {
    void this.prisma.part
      .findMany({ where: { listingId }, select: { id: true } })
      .then((parts) => Promise.all(parts.map((part) => this.refresh(part.id))))
      .catch((error) => this.logger.warn(`Listing ${listingId} translation lookup failed: ${String(error)}`));
  }

  /**
   * Translates the part when its stored translations are missing or stale. Returns true when it
   * wrote new ones. Never throws: a failed translation only means the original keeps showing.
   */
  async refresh(partId: string, options: { includeDrafts?: boolean } = {}): Promise<boolean> {
    if (!this.ai.isEnabled()) return false;
    if (this.running.has(partId)) {
      this.refreshInBackground(partId);
      return false;
    }
    this.running.add(partId);
    try {
      const part = await this.prisma.part.findUnique({
        where: { id: partId },
        include: { listing: { select: { status: true, sellerId: true } } },
      });
      if (!part || !part.name.trim()) return false;
      if (!options.includeDrafts && part.listing.status !== ListingStatus.ACTIVE) return false;

      const text: PartText = { name: part.name, description: part.description };
      const hash = textHash(text);
      const existing = parsePartTranslations(part.translations);
      if (existing?.hash === hash) return false;

      const result = await this.ai.translateListing(part.listing.sellerId, text);
      const next: PartTranslations = { source: result.source, hash, edited: [] };
      for (const lang of LISTING_LANGS) next[lang] = result[lang];

      // Only write if the text did not change again while the model was working.
      const { count } = await this.prisma.part.updateMany({
        where: { id: partId, name: part.name, description: part.description },
        data: { translations: next as unknown as Prisma.InputJsonValue },
      });
      return count > 0;
    } catch (error) {
      const code = (error as { extensions?: { code?: string } })?.extensions?.code ?? String(error);
      this.logger.warn(`Part ${partId} translation skipped: ${code}`);
      return false;
    } finally {
      this.running.delete(partId);
    }
  }

  /**
   * The seller's own wording for one or more languages. Their source language cannot be
   * overwritten here: that is the part's name and description themselves.
   */
  async setManual(userId: string, partId: string, entries: ManualTranslation[]): Promise<PartTranslations> {
    const part = await this.prisma.part.findUnique({
      where: { id: partId },
      include: { listing: { include: { seller: { select: { userId: true } } } } },
    });
    if (!part) throw new NotFoundException('Part not found');
    if (part.listing.seller.userId !== userId) throw new ForbiddenException('You do not own this listing');

    const text: PartText = { name: part.name, description: part.description };
    const hash = textHash(text);
    const existing = parsePartTranslations(part.translations);
    if (!existing || existing.hash !== hash) {
      throw new BadRequestException('Translations are not ready yet for the current text');
    }

    const next: PartTranslations = { ...existing, edited: [...existing.edited] };
    for (const entry of entries) {
      if (entry.lang === existing.source) continue;
      const name = entry.name.trim();
      const description = entry.description?.trim() ?? '';
      if (!name || name.length > NAME_MAX_LENGTH) throw new BadRequestException(`${entry.lang}: name is required`);
      if (description.length > TRANSLATED_DESCRIPTION_MAX_LENGTH) {
        throw new BadRequestException(`${entry.lang}: description is too long`);
      }
      next[entry.lang] = { name, description: description || null };
      if (!next.edited.includes(entry.lang)) next.edited.push(entry.lang);
    }

    await this.prisma.part.update({
      where: { id: partId },
      data: { translations: next as unknown as Prisma.InputJsonValue },
    });
    return next;
  }
}

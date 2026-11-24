import { Injectable, Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { stableKey } from '../ttl-cache';
import { scrubFilters } from './near-matches';

export type SearchMissSummary = {
  tool: string;
  /** The filters as JSON text, e.g. {"brand":"Toyota","model":"Prado","city":"Ganja"}. */
  filters: string;
  count: number;
  lastSeen: Date;
};

/**
 * Remembers the catalogue searches that found nothing, so the owner can see which cars,
 * parts and services people ask for that the site does not have yet.
 * Only the search filters are stored: no IP, no user id, no chat text.
 */
@Injectable()
export class SearchMissLog {
  private readonly logger = new Logger(SearchMissLog.name);

  constructor(private readonly prisma: PrismaService) {}

  record(tool: string, filters: object, language: string): void {
    const clean = scrubFilters(filters as Record<string, unknown>);
    this.prisma.aiSearchMiss
      .create({ data: { tool, filters: clean as Prisma.InputJsonValue, language } })
      .catch((error: unknown) => {
        this.logger.warn(`Could not log an empty search: ${error instanceof Error ? error.message : String(error)}`);
      });
  }

  /** The most frequent empty searches of the last `days` days, most asked first. */
  async summary(days: number, limit = 100): Promise<SearchMissSummary[]> {
    const since = new Date(Date.now() - Math.min(Math.max(days, 1), 90) * 24 * 60 * 60 * 1000);
    const rows = await this.prisma.aiSearchMiss.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      take: 10_000,
      select: { tool: true, filters: true, createdAt: true },
    });
    const groups = new Map<string, SearchMissSummary>();
    for (const row of rows) {
      const filters = stableKey(row.filters);
      const key = `${row.tool}|${filters}`;
      const group = groups.get(key);
      if (group) group.count += 1;
      else groups.set(key, { tool: row.tool, filters, count: 1, lastSeen: row.createdAt });
    }
    return [...groups.values()]
      .sort((a, b) => b.count - a.count || b.lastSeen.getTime() - a.lastSeen.getTime())
      .slice(0, Math.min(Math.max(limit, 1), 500));
  }
}

import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import type { AiConfig } from './ai.config';
import { aiError } from './ai.errors';
import { AiUsage, costMicroUsd } from './ai-usage';

/** Azerbaijan is UTC+4 all year (no daylight saving), so "today" is a Baku calendar day. */
const BAKU_OFFSET_MS = 4 * 60 * 60 * 1000;

export function bakuDay(now = Date.now()): string {
  return new Date(now + BAKU_OFFSET_MS).toISOString().slice(0, 10);
}

type DayTotals = { day: string; units: number; costMicroUsd: number };

/**
 * Daily spend protection for every AI feature.
 *
 * - Each visitor (IP) has a daily allowance of weighted units: a text message is 1,
 *   a photo is AI_CHAT_IMAGE_WEIGHT.
 * - The whole site has a daily unit cap and a daily USD cap (estimated from token usage).
 *   Once either is reached the AI pauses itself until midnight in Baku.
 *
 * Site totals live in the AiUsageDay table so a restart does not reset the cap, and every
 * write returns the stored totals, so several server instances converge on the same numbers.
 */
@Injectable()
export class AiBudget {
  private readonly logger = new Logger(AiBudget.name);
  private perIp = new Map<string, number>();
  private ipDay = bakuDay();
  private totals: DayTotals = { day: bakuDay(), units: 0, costMicroUsd: 0 };
  private loaded: Promise<void> | null = null;
  private warnedPause = '';

  constructor(private readonly prisma: PrismaService) {}

  /** True while the site-wide cap for today is reached. */
  async isPaused(config: AiConfig, now = Date.now()): Promise<boolean> {
    await this.ensureLoaded(now);
    return this.capReached(config);
  }

  /**
   * Takes `units` from today's allowance for this caller, or throws PAUSED / DAILY_LIMIT.
   * Call it right before a paid model call; a cache hit should not reserve anything.
   */
  async reserve(config: AiConfig, caller: string, units: number, now = Date.now()): Promise<void> {
    await this.ensureLoaded(now);
    if (this.capReached(config)) {
      this.warnPaused(config);
      throw aiError('PAUSED');
    }
    this.rollIpDay(now);
    const used = this.perIp.get(caller) ?? 0;
    if (used + units > config.dailyIpUnits) throw aiError('DAILY_LIMIT');
    this.perIp.set(caller, used + units);
    this.totals.units += units;
    void this.persist({ units, requests: 1 });
  }

  /** Adds the tokens of finished model calls to today's spend and logs what they cost. */
  record(feature: string, usages: AiUsage[]): void {
    if (!usages.length) return;
    const sum = usages.reduce(
      (acc, usage) => ({
        inputTokens: acc.inputTokens + usage.inputTokens,
        outputTokens: acc.outputTokens + usage.outputTokens,
        cacheReadTokens: acc.cacheReadTokens + usage.cacheReadTokens,
        cacheWriteTokens: acc.cacheWriteTokens + usage.cacheWriteTokens,
        costMicroUsd: acc.costMicroUsd + costMicroUsd(usage),
      }),
      { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, costMicroUsd: 0 },
    );
    this.totals.costMicroUsd += sum.costMicroUsd;
    const models = [...new Set(usages.map((usage) => usage.model))].join(',');
    this.logger.log(
      `AI usage feature=${feature} model=${models} calls=${usages.length} in=${sum.inputTokens} out=${sum.outputTokens} cacheRead=${sum.cacheReadTokens} cacheWrite=${sum.cacheWriteTokens} cost=$${(sum.costMicroUsd / 1e6).toFixed(5)} today=$${(this.totals.costMicroUsd / 1e6).toFixed(4)}`,
    );
    void this.persist(sum);
  }

  /** The last `days` days of spend, newest first. */
  async report(days: number) {
    const rows = await this.prisma.aiUsageDay.findMany({
      orderBy: { day: 'desc' },
      take: Math.min(Math.max(days, 1), 90),
    });
    return rows.map((row) => ({
      day: row.day,
      units: row.units,
      requests: row.requests,
      inputTokens: row.inputTokens,
      outputTokens: row.outputTokens,
      cacheReadTokens: row.cacheReadTokens,
      costUsd: row.costMicroUsd / 1e6,
    }));
  }

  private capReached(config: AiConfig): boolean {
    return (
      this.totals.units >= config.dailyGlobalUnits ||
      this.totals.costMicroUsd >= config.dailyBudgetUsd * 1e6
    );
  }

  private warnPaused(config: AiConfig) {
    if (this.warnedPause === this.totals.day) return;
    this.warnedPause = this.totals.day;
    this.logger.warn(
      `AI paused for ${this.totals.day}: units ${this.totals.units}/${config.dailyGlobalUnits}, cost $${(this.totals.costMicroUsd / 1e6).toFixed(2)}/$${config.dailyBudgetUsd}`,
    );
  }

  private rollIpDay(now: number) {
    const day = bakuDay(now);
    if (day !== this.ipDay) {
      this.ipDay = day;
      this.perIp = new Map();
    }
  }

  private async ensureLoaded(now: number): Promise<void> {
    const day = bakuDay(now);
    if (this.totals.day !== day) {
      this.totals = { day, units: 0, costMicroUsd: 0 };
      this.loaded = null;
    }
    if (!this.loaded) {
      this.loaded = this.prisma.aiUsageDay
        .findUnique({ where: { day } })
        .then((row) => {
          if (row && this.totals.day === day) {
            this.totals.units = Math.max(this.totals.units, row.units);
            this.totals.costMicroUsd = Math.max(this.totals.costMicroUsd, row.costMicroUsd);
          }
        })
        .catch((error: unknown) => {
          this.logger.warn(`Could not read AI usage: ${error instanceof Error ? error.message : String(error)}`);
        });
    }
    await this.loaded;
  }

  private async persist(add: {
    units?: number;
    requests?: number;
    inputTokens?: number;
    outputTokens?: number;
    cacheReadTokens?: number;
    cacheWriteTokens?: number;
    costMicroUsd?: number;
  }): Promise<void> {
    const day = this.totals.day;
    const values = {
      units: add.units ?? 0,
      requests: add.requests ?? 0,
      inputTokens: add.inputTokens ?? 0,
      outputTokens: add.outputTokens ?? 0,
      cacheReadTokens: add.cacheReadTokens ?? 0,
      cacheWriteTokens: add.cacheWriteTokens ?? 0,
      costMicroUsd: add.costMicroUsd ?? 0,
    };
    const increment = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, { increment: value }]),
    );
    try {
      const row = await this.prisma.aiUsageDay.upsert({
        where: { day },
        create: { day, ...values },
        update: increment,
      });
      if (this.totals.day === day) {
        this.totals.units = Math.max(this.totals.units, row.units);
        this.totals.costMicroUsd = Math.max(this.totals.costMicroUsd, row.costMicroUsd);
      }
    } catch (error) {
      this.logger.warn(`Could not save AI usage: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

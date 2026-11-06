import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PromotionsService } from './promotions.service';

const TICK_MS = 60 * 1000;

/**
 * Runs the promotions clock: placements end when their day comes, and bumps happen at
 * their slot. A minute of slack is plenty, and keeping it on a timer means a catalogue
 * query never has to do this work.
 *
 * It is a single-process timer. Behind several instances, move it to one worker (or a
 * Postgres advisory lock) so the same bump is not spent twice.
 */
@Injectable()
export class PromotionsScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PromotionsScheduler.name);
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(private readonly promotions: PromotionsService) {}

  onModuleInit(): void {
    // Tests drive runDueWork() themselves with a chosen clock.
    if (process.env.NODE_ENV === 'test' || process.env.PROMOTIONS_SCHEDULER === 'off') return;
    this.timer = setInterval(() => void this.tick(), TICK_MS);
    this.timer.unref();
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  private async tick(): Promise<void> {
    // A slow tick must not overlap the next one and spend a bump twice.
    if (this.running) return;
    this.running = true;
    try {
      await this.promotions.runDueWork();
    } catch (error) {
      this.logger.error('Promotions tick failed', error as Error);
    } finally {
      this.running = false;
    }
  }
}

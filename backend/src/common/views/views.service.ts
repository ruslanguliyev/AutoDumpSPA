import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { FailureLimiter } from '../utils/failure-limiter';
import { clientIp, isIgnoredUserAgent, readUserAgent } from './client-ip';
import { ViewTarget } from './views.types';

const VIEW_WINDOW_MS = 30 * 60 * 1000;

interface ResolvedView {
  /** Dedup bucket. A part and its listing share one, so the page cannot be counted twice. */
  dedupKey: string;
  ownerUserId: string;
  increment: () => Promise<unknown>;
}

/**
 * Counts an opened detail page. One address counts once per target per half hour.
 * The owner, an empty user agent, and obvious crawlers do not count.
 */
@Injectable()
export class ViewsService {
  private readonly limiter = new FailureLimiter(1, VIEW_WINDOW_MS);

  constructor(private readonly prisma: PrismaService) {}

  async recordView(input: {
    targetType: string;
    targetId: string;
    viewerUserId?: string | null;
    req?: Pick<Request, 'ip' | 'headers' | 'socket'> | null;
  }): Promise<boolean> {
    if (isIgnoredUserAgent(readUserAgent(input.req))) return false;

    const resolved = await this.resolve(input.targetType, input.targetId);
    if (!resolved) return false;
    if (input.viewerUserId && input.viewerUserId === resolved.ownerUserId) return false;

    const key = `${resolved.dedupKey}:${clientIp(input.req)}`;
    if (this.limiter.isBlocked(key)) return false;
    this.limiter.record(key);

    try {
      await resolved.increment();
    } catch {
      // A counter is never worth failing a page load over.
      return false;
    }
    return true;
  }

  private async resolve(targetType: string, targetId: string): Promise<ResolvedView | null> {
    if (targetType === ViewTarget.LISTING) {
      const listing = await this.prisma.listing.findUnique({
        where: { id: targetId },
        select: { id: true, seller: { select: { userId: true } } },
      });
      if (!listing) return null;
      return {
        dedupKey: `view:LISTING:${listing.id}`,
        ownerUserId: listing.seller.userId,
        increment: () =>
          this.prisma.listing.update({
            where: { id: listing.id },
            data: { viewsCount: { increment: 1 } },
          }),
      };
    }

    if (targetType === ViewTarget.PART) {
      const part = await this.prisma.part.findUnique({
        where: { id: targetId },
        select: { listingId: true, listing: { select: { seller: { select: { userId: true } } } } },
      });
      if (!part) return null;
      return {
        dedupKey: `view:LISTING:${part.listingId}`,
        ownerUserId: part.listing.seller.userId,
        increment: () =>
          this.prisma.listing.update({
            where: { id: part.listingId },
            data: { viewsCount: { increment: 1 } },
          }),
      };
    }

    if (targetType === ViewTarget.SERVICE_CENTER) {
      const center = await this.prisma.serviceCenter.findUnique({
        where: { id: targetId },
        select: { id: true, userId: true },
      });
      if (!center) return null;
      return {
        dedupKey: `view:SERVICE_CENTER:${center.id}`,
        ownerUserId: center.userId,
        increment: () =>
          this.prisma.serviceCenter.update({
            where: { id: center.id },
            data: { viewsCount: { increment: 1 } },
          }),
      };
    }

    if (targetType === ViewTarget.SPECIALIST) {
      const specialist = await this.prisma.specialist.findUnique({
        where: { id: targetId },
        select: { id: true, userId: true },
      });
      if (!specialist) return null;
      return {
        dedupKey: `view:SPECIALIST:${specialist.id}`,
        ownerUserId: specialist.userId,
        increment: () =>
          this.prisma.specialist.update({
            where: { id: specialist.id },
            data: { viewsCount: { increment: 1 } },
          }),
      };
    }

    if (targetType === ViewTarget.SELLER) {
      const seller = await this.prisma.seller.findUnique({
        where: { id: targetId },
        select: { id: true, userId: true },
      });
      if (!seller) return null;
      return {
        dedupKey: `view:SELLER:${seller.id}`,
        ownerUserId: seller.userId,
        increment: () =>
          this.prisma.seller.update({
            where: { id: seller.id },
            data: { viewsCount: { increment: 1 } },
          }),
      };
    }

    return null;
  }
}

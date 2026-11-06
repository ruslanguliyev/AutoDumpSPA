import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ListingStatus, Prisma, PromotionTarget, ReportStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PromotionsService } from '../promotions/promotions.service';
import { ReviewTargetType } from '../reviews/review.types';
import { AdminProfileObject, ReportListingInput } from './moderation.types';

const MAX_DETAILS_LENGTH = 1000;
const MAX_REASON_NOTE_LENGTH = 500;
const MAX_REPORTS_PER_DAY = 20;

const reportInclude = {
  reporter: { select: { email: true } },
  listing: {
    include: {
      seller: { select: { name: true } },
      vehicles: { select: { id: true }, take: 1 },
      parts: { select: { id: true }, take: 1 },
      services: { select: { id: true }, take: 1 },
    },
  },
} satisfies Prisma.ReportInclude;

type ReportRow = Prisma.ReportGetPayload<{ include: typeof reportInclude }>;

@Injectable()
export class ModerationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly promotions: PromotionsService,
  ) {}

  /** A signed-in user reports a published listing that is not theirs. */
  async reportListing(userId: string, input: ReportListingInput) {
    const details = input.details?.trim() || null;
    if (details && details.length > MAX_DETAILS_LENGTH) {
      throw new BadRequestException(`details must be at most ${MAX_DETAILS_LENGTH} characters`);
    }

    const listing = await this.prisma.listing.findUnique({
      where: { id: input.listingId },
      include: { seller: { select: { userId: true } } },
    });
    if (!listing || listing.status !== ListingStatus.ACTIVE) {
      throw new NotFoundException('Listing not found');
    }
    if (listing.seller.userId === userId) {
      throw new ForbiddenException('You cannot report your own listing');
    }

    const alreadyOpen = await this.prisma.report.findFirst({
      where: { listingId: listing.id, reporterId: userId, status: ReportStatus.OPEN },
    });
    if (alreadyOpen) {
      throw new ConflictException('You have already reported this listing');
    }

    const today = await this.prisma.report.count({
      where: { reporterId: userId, createdAt: { gte: new Date(Date.now() - 86_400_000) } },
    });
    if (today >= MAX_REPORTS_PER_DAY) {
      throw new BadRequestException('Too many reports today, please try again tomorrow');
    }

    await this.prisma.report.create({
      data: { listingId: listing.id, reporterId: userId, reason: input.reason, details },
    });
    return true;
  }

  /** Reports for moderators, oldest open ones first. */
  async listReports(status: ReportStatus = ReportStatus.OPEN) {
    const rows = await this.prisma.report.findMany({
      where: { status },
      orderBy: { createdAt: status === ReportStatus.OPEN ? 'asc' : 'desc' },
      take: 200,
      include: reportInclude,
    });
    return this.toObjects(rows);
  }

  async dismissReport(reportId: string) {
    const report = await this.prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Report not found');
    await this.prisma.report.update({
      where: { id: reportId },
      data: { status: ReportStatus.DISMISSED, resolvedAt: new Date() },
    });
    return true;
  }

  /** Hides a listing from everyone but its owner and closes all its open reports. */
  async blockListing(listingId: string, reasonRaw: string) {
    const reason = (reasonRaw ?? '').trim();
    if (!reason) throw new BadRequestException('A reason is required to block a listing');
    if (reason.length > MAX_REASON_NOTE_LENGTH) {
      throw new BadRequestException(`reason must be at most ${MAX_REASON_NOTE_LENGTH} characters`);
    }

    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('Listing not found');

    await this.prisma.$transaction([
      this.prisma.listing.update({
        where: { id: listingId },
        data: { status: ListingStatus.BLOCKED, blockedReason: reason },
      }),
      this.prisma.report.updateMany({
        where: { listingId, status: ReportStatus.OPEN },
        data: { status: ReportStatus.ACTIONED, resolvedAt: new Date() },
      }),
    ]);

    // Paid placement does not survive a block, and it is not refunded: that is the
    // rule the buyer agreed to, and the one thing that stops promotion being a way
    // to buy your way past moderation.
    await this.promotions.endPromotionsFor(
      { targetType: PromotionTarget.LISTING, targetId: listingId },
      'target_blocked',
    );
    return true;
  }

  /** The listing goes back to DRAFT: the owner can review it and publish again. */
  async unblockListing(listingId: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.status !== ListingStatus.BLOCKED) {
      throw new BadRequestException('Listing is not blocked');
    }
    await this.prisma.listing.update({
      where: { id: listingId },
      data: { status: ListingStatus.DRAFT, blockedReason: null },
    });
    return true;
  }

  private async toObjects(rows: ReportRow[]) {
    const listingIds = [...new Set(rows.map((r) => r.listingId))];
    const groups = listingIds.length
      ? await this.prisma.report.groupBy({
          by: ['listingId'],
          where: { listingId: { in: listingIds }, status: ReportStatus.OPEN },
          _count: { _all: true },
        })
      : [];
    const openCount = new Map(groups.map((g) => [g.listingId, g._count._all]));

    return rows.map((r) => {
      const v = r.listing.vehicles[0];
      const p = r.listing.parts[0];
      const s = r.listing.services[0];
      return {
        id: r.id,
        listingId: r.listingId,
        listingTitle: r.listing.title,
        listingStatus: r.listing.status,
        itemId: v?.id ?? p?.id ?? null,
        kind: v ? 'vehicle' : p ? 'part' : s ? 'service' : 'unknown',
        sellerName: r.listing.seller.name,
        reason: r.reason,
        details: r.details,
        status: r.status,
        reporterEmail: r.reporter.email,
        openReportsForListing: openCount.get(r.listingId) ?? 0,
        createdAt: r.createdAt,
      };
    });
  }

  /** Profiles (newest first) an administrator can verify; `search` matches the name. */
  async listProfiles(type: ReviewTargetType, search?: string | null, limit = 50): Promise<AdminProfileObject[]> {
    const take = Math.min(Math.max(Math.trunc(limit) || 50, 1), 100);
    const q = search?.trim();
    const where = q ? { name: { contains: q, mode: 'insensitive' as const } } : {};
    const args = { where, orderBy: { createdAt: 'desc' as const }, take };

    if (type === ReviewTargetType.SELLER) {
      const rows = await this.prisma.seller.findMany(args);
      return rows.map((r) => ({ ...r, targetType: type, slug: null }));
    }
    if (type === ReviewTargetType.SPECIALIST) {
      const rows = await this.prisma.specialist.findMany(args);
      return rows.map((r) => ({ ...r, targetType: type }));
    }
    const rows = await this.prisma.serviceCenter.findMany(args);
    return rows.map((r) => ({ ...r, targetType: type }));
  }

  async setVerified(type: ReviewTargetType, id: string, verified: boolean): Promise<boolean> {
    const data = { verified };
    try {
      if (type === ReviewTargetType.SELLER) await this.prisma.seller.update({ where: { id }, data });
      else if (type === ReviewTargetType.SPECIALIST) await this.prisma.specialist.update({ where: { id }, data });
      else await this.prisma.serviceCenter.update({ where: { id }, data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Profile not found');
      }
      throw error;
    }
    return true;
  }
}

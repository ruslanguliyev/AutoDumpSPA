import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Review, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewListObject, ReviewObject, ReviewTargetType, SubmitReviewInput } from './review.types';

const MAX_COMMENT = 1000;
const PAGE_MAX = 50;

type Target = { column: 'sellerId' | 'specialistId' | 'serviceCenterId'; ownerUserId: string };

/** "Rufat Mammadov" -> "Rufat M." so reviews do not expose full names. */
export function publicAuthorName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '—';
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
}

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Finds the reviewed profile and the user who owns it (owners cannot review themselves). */
  private async resolveTarget(type: ReviewTargetType, id: string): Promise<Target> {
    switch (type) {
      case ReviewTargetType.SELLER: {
        const row = await this.prisma.seller.findUnique({ where: { id }, select: { userId: true } });
        if (!row) throw new NotFoundException('Seller not found');
        return { column: 'sellerId', ownerUserId: row.userId };
      }
      case ReviewTargetType.SPECIALIST: {
        const row = await this.prisma.specialist.findUnique({ where: { id }, select: { userId: true } });
        if (!row) throw new NotFoundException('Specialist not found');
        return { column: 'specialistId', ownerUserId: row.userId };
      }
      case ReviewTargetType.SERVICE_CENTER: {
        const row = await this.prisma.serviceCenter.findUnique({ where: { id }, select: { userId: true } });
        if (!row) throw new NotFoundException('Service center not found');
        return { column: 'serviceCenterId', ownerUserId: row.userId };
      }
    }
  }

  private toObject(review: Review & { author: { fullName: string } }, viewerId?: string): ReviewObject {
    return {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      authorName: publicAuthorName(review.author.fullName),
      mine: Boolean(viewerId) && review.authorId === viewerId,
      createdAt: review.createdAt,
    };
  }

  async list(
    type: ReviewTargetType,
    id: string,
    viewerId: string | undefined,
    limit = 10,
    offset = 0,
  ): Promise<ReviewListObject> {
    const target = await this.resolveTarget(type, id);
    const where = { [target.column]: id } as Prisma.ReviewWhereInput;
    const take = Math.min(Math.max(Math.trunc(limit) || 10, 1), PAGE_MAX);
    const skip = Math.max(Math.trunc(offset) || 0, 0);

    const [rows, grouped] = await Promise.all([
      this.prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
        include: { author: { select: { fullName: true } } },
      }),
      this.prisma.review.groupBy({ by: ['rating'], where, _count: { _all: true } }),
    ]);

    const distribution = [0, 0, 0, 0, 0];
    let total = 0;
    let sum = 0;
    for (const g of grouped) {
      distribution[g.rating - 1] = g._count._all;
      total += g._count._all;
      sum += g.rating * g._count._all;
    }
    return {
      items: rows.map((r) => this.toObject(r, viewerId)),
      total,
      average: total ? Math.round((sum / total) * 10) / 10 : 0,
      distribution,
    };
  }

  async submit(userId: string, input: SubmitReviewInput): Promise<ReviewObject> {
    if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
      throw new BadRequestException('Rating must be a whole number from 1 to 5');
    }
    const comment = (input.comment ?? '').trim();
    if (comment.length > MAX_COMMENT) {
      throw new BadRequestException(`Comment must be at most ${MAX_COMMENT} characters`);
    }

    const target = await this.resolveTarget(input.targetType, input.targetId);
    if (target.ownerUserId === userId) {
      throw new ForbiddenException('You cannot review yourself');
    }

    const review = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.review.findFirst({
        where: { authorId: userId, [target.column]: input.targetId } as Prisma.ReviewWhereInput,
        select: { id: true },
      });
      const data = { rating: input.rating, comment: comment || null };
      const saved = existing
        ? await tx.review.update({ where: { id: existing.id }, data, include: { author: { select: { fullName: true } } } })
        : await tx.review.create({
            data: { ...data, authorId: userId, [target.column]: input.targetId } as Prisma.ReviewUncheckedCreateInput,
            include: { author: { select: { fullName: true } } },
          });
      await this.recalculate(tx, input.targetType, input.targetId, target.column);
      return saved;
    });
    return this.toObject(review, userId);
  }

  /** The author or an administrator can remove a review. */
  async remove(user: { id: string; role: UserRole }, reviewId: string): Promise<boolean> {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');
    if (review.authorId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete your own review');
    }
    const [type, column, id] = review.sellerId
      ? ([ReviewTargetType.SELLER, 'sellerId', review.sellerId] as const)
      : review.specialistId
        ? ([ReviewTargetType.SPECIALIST, 'specialistId', review.specialistId] as const)
        : ([ReviewTargetType.SERVICE_CENTER, 'serviceCenterId', review.serviceCenterId as string] as const);

    await this.prisma.$transaction(async (tx) => {
      await tx.review.delete({ where: { id: reviewId } });
      await this.recalculate(tx, type, id, column);
    });
    return true;
  }

  /** Keeps the cached average and count on the profile in sync with its reviews. */
  private async recalculate(
    tx: Prisma.TransactionClient,
    type: ReviewTargetType,
    id: string,
    column: Target['column'],
  ) {
    const agg = await tx.review.aggregate({
      where: { [column]: id } as Prisma.ReviewWhereInput,
      _avg: { rating: true },
      _count: { _all: true },
    });
    const data = {
      rating: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : 0,
      reviewsCount: agg._count._all,
    };
    if (type === ReviewTargetType.SELLER) await tx.seller.update({ where: { id }, data });
    else if (type === ReviewTargetType.SPECIALIST) await tx.specialist.update({ where: { id }, data });
    else await tx.serviceCenter.update({ where: { id }, data });
  }
}

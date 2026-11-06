import { randomBytes } from 'crypto';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  ListingStatus,
  Prisma,
  Promotion,
  PromotionOrder,
  PromotionOrderStatus,
  PromotionTarget,
  PromotionTier,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FailureLimiter } from '../common/utils/failure-limiter';
import { PaymentProvider, PaymentResult } from './payments/payment-provider';
import {
  findPackage,
  isPlacement,
  nextBumpSlot,
  packagesFor,
  PromotionAudience,
  PromotionPackage,
  rankOf,
} from './promotion-pricing';
import {
  AdminPromotionObject,
  CreatePromotionOrderInput,
  PromotionObject,
  PromotionOrderObject,
  PromotionQuoteObject,
  PromotionTargetObject,
} from './promotion.types';

const DAY_MS = 24 * 60 * 60 * 1000;
/** How long a buyer has to finish paying before the order has to be started again. */
const ORDER_TTL_MS = 30 * 60 * 1000;
/** An upgrade is only offered when at least this much is still left to pay for it. */
const MIN_CHARGE = 100;
const MAX_CONTACT_LENGTH = 120;
const MAX_GRANT_DAYS = 365;

/** One target of a promotion: a listing, a specialist or a service center. */
export interface TargetKey {
  targetType: PromotionTarget;
  targetId: string;
}

interface LoadedTarget extends TargetKey {
  title: string;
  imageUrl: string | null;
  href: string | null;
  audience: PromotionAudience;
  ownerUserId: string;
  viewsCount: number;
  contactsCount: number;
  /** Null when the target may be promoted, otherwise the reason it may not. */
  rejectedBecause: string | null;
}

type TargetColumns = {
  listingId?: string;
  specialistId?: string;
  serviceCenterId?: string;
};

type TargetRow = {
  targetType: PromotionTarget;
  listingId: string | null;
  specialistId: string | null;
  serviceCenterId: string | null;
};

/** Prisma client or an interactive transaction; both expose the models we touch. */
type Db = PrismaService | Prisma.TransactionClient;

function targetColumns(target: TargetKey): TargetColumns {
  if (target.targetType === PromotionTarget.LISTING) return { listingId: target.targetId };
  if (target.targetType === PromotionTarget.SPECIALIST) return { specialistId: target.targetId };
  return { serviceCenterId: target.targetId };
}

function targetOf(row: TargetRow): TargetKey {
  const id =
    row.targetType === PromotionTarget.LISTING
      ? row.listingId
      : row.targetType === PromotionTarget.SPECIALIST
        ? row.specialistId
        : row.serviceCenterId;
  // The database enforces that exactly one of the three columns is set.
  return { targetType: row.targetType, targetId: id as string };
}

function targetKeyString(target: TargetKey): string {
  return `${target.targetType}:${target.targetId}`;
}

/** What is left of a placement, pro rata, in qapik. */
function remainingValue(promotion: Promotion, now: Date): number {
  const total = promotion.endsAt.getTime() - promotion.startsAt.getTime();
  if (total <= 0) return 0;
  const left = Math.max(0, promotion.endsAt.getTime() - now.getTime());
  return Math.floor((promotion.amount * left) / total);
}

function trimContact(value: string | null | undefined, field: string): string | null {
  const text = (value ?? '').trim();
  if (!text) return null;
  if (text.length > MAX_CONTACT_LENGTH) {
    throw new BadRequestException(`${field} must be at most ${MAX_CONTACT_LENGTH} characters`);
  }
  return text;
}

@Injectable()
export class PromotionsService {
  private readonly logger = new Logger(PromotionsService.name);
  /** An anonymous checkout is a gift to card testers, so one caller gets a budget. */
  private readonly checkoutLimiter = new FailureLimiter(20, 60 * 60 * 1000);
  /** One view and one contact per visitor per target per half hour actually counts. */
  private readonly viewLimiter = new FailureLimiter(1, 30 * 60 * 1000);

  constructor(
    private readonly prisma: PrismaService,
    private readonly provider: PaymentProvider,
  ) {}

  // ---------------------------------------------------------------- targets

  private async loadTarget(target: TargetKey): Promise<LoadedTarget> {
    if (target.targetType === PromotionTarget.LISTING) {
      const listing = await this.prisma.listing.findUnique({
        where: { id: target.targetId },
        include: {
          seller: { select: { userId: true } },
          images: { orderBy: { position: 'asc' }, take: 1 },
          vehicles: { select: { id: true, imageUrls: true }, take: 1 },
          parts: { select: { id: true, imageUrl: true }, take: 1 },
        },
      });
      if (!listing) throw new NotFoundException('Listing not found');
      const vehicle = listing.vehicles[0];
      const part = listing.parts[0];
      return {
        ...target,
        title: listing.title,
        imageUrl: listing.images[0]?.url ?? vehicle?.imageUrls[0] ?? part?.imageUrl ?? null,
        href: vehicle ? `/vehicles/${vehicle.id}` : part ? `/parts/${part.id}` : null,
        // A listing that is neither a car nor a part is priced like a part.
        audience: vehicle ? 'VEHICLE' : 'PART',
        ownerUserId: listing.seller.userId,
        viewsCount: listing.viewsCount,
        contactsCount: listing.contactsCount,
        rejectedBecause:
          listing.status === ListingStatus.ACTIVE ? null : 'Only a published listing can be promoted',
      };
    }

    if (target.targetType === PromotionTarget.SPECIALIST) {
      const specialist = await this.prisma.specialist.findUnique({ where: { id: target.targetId } });
      if (!specialist) throw new NotFoundException('Specialist not found');
      return {
        ...target,
        title: specialist.name,
        imageUrl: specialist.avatarUrl,
        href: `/specialists/${specialist.slug}`,
        audience: 'PROFILE',
        ownerUserId: specialist.userId,
        viewsCount: specialist.viewsCount,
        contactsCount: specialist.contactsCount,
        rejectedBecause: null,
      };
    }

    const center = await this.prisma.serviceCenter.findUnique({ where: { id: target.targetId } });
    if (!center) throw new NotFoundException('Service center not found');
    return {
      ...target,
      title: center.name,
      imageUrl: center.logoUrl ?? center.coverImage,
      href: `/services/${center.slug ?? center.id}`,
      audience: 'PROFILE',
      ownerUserId: center.userId,
      viewsCount: center.viewsCount,
      contactsCount: center.contactsCount,
      rejectedBecause: center.isActive ? null : 'This profile is switched off',
    };
  }

  private static toTargetObject(target: LoadedTarget): PromotionTargetObject {
    return {
      targetType: target.targetType,
      targetId: target.targetId,
      title: target.title,
      imageUrl: target.imageUrl,
      href: target.href,
    };
  }

  private async updateTarget(
    db: Db,
    target: TargetKey,
    data: { promotionRank?: number; promotedUntil?: Date | null; bumpedAt?: Date },
  ): Promise<void> {
    const where = { id: target.targetId };
    if (target.targetType === PromotionTarget.LISTING) {
      await db.listing.update({ where, data });
    } else if (target.targetType === PromotionTarget.SPECIALIST) {
      await db.specialist.update({ where, data });
    } else {
      await db.serviceCenter.update({ where, data });
    }
  }

  private async readCounters(db: Db, target: TargetKey): Promise<{ views: number; contacts: number }> {
    const select = { viewsCount: true, contactsCount: true };
    const where = { id: target.targetId };
    const row =
      target.targetType === PromotionTarget.LISTING
        ? await db.listing.findUnique({ where, select })
        : target.targetType === PromotionTarget.SPECIALIST
          ? await db.specialist.findUnique({ where, select })
          : await db.serviceCenter.findUnique({ where, select });
    return { views: row?.viewsCount ?? 0, contacts: row?.contactsCount ?? 0 };
  }

  // ------------------------------------------------------------ quoting

  private activePromotions(target: TargetKey, now = new Date()): Promise<Promotion[]> {
    return this.prisma.promotion.findMany({
      where: { ...targetColumns(target), active: true, endsAt: { gt: now } },
    });
  }

  /**
   * Unused days of a cheaper placement pay for part of a dearer one, so nobody has to
   * throw away what they already bought in order to upgrade.
   *
   * The credit is only offered when the new package is worth more than what is left,
   * because taking it retires the old placement. Otherwise there is no discount and
   * both placements simply run side by side, the dearer one deciding the rank; that
   * way an upgrade can never cost the buyer value they had already paid for.
   */
  private creditFor(
    placements: Promotion[],
    pkg: PromotionPackage,
    now: Date,
  ): { amount: number; promotionId: string | null } {
    if (!isPlacement(pkg.tier)) return { amount: 0, promotionId: null };
    const best = placements
      .filter((p) => isPlacement(p.tier) && rankOf(p.tier) < rankOf(pkg.tier) && p.amount > 0)
      .map((p) => ({ promotion: p, value: remainingValue(p, now) }))
      .sort((a, b) => b.value - a.value)[0];
    if (!best || best.value <= 0) return { amount: 0, promotionId: null };
    if (pkg.amount - best.value < MIN_CHARGE) return { amount: 0, promotionId: null };
    return { amount: best.value, promotionId: best.promotion.id };
  }

  async quote(target: TargetKey): Promise<PromotionQuoteObject> {
    const loaded = await this.loadTarget(target);
    const now = new Date();
    const active = await this.activePromotions(target, now);
    const placements = active.filter((p) => isPlacement(p.tier));

    return {
      target: PromotionsService.toTargetObject(loaded),
      currency: 'AZN',
      activeTier: placements.reduce<PromotionTier | null>(
        (best, p) => (best === null || rankOf(p.tier) > rankOf(best) ? p.tier : best),
        null,
      ),
      activeUntil: placements.length
        ? new Date(Math.max(...placements.map((p) => p.endsAt.getTime())))
        : null,
      bumpsLeft: active.reduce((sum, p) => sum + Math.max(0, p.bumpsTotal - p.bumpsUsed), 0),
      packages: packagesFor(loaded.audience).map((pkg) => {
        const credit = this.creditFor(placements, pkg, now);
        return {
          code: pkg.code,
          tier: pkg.tier,
          days: pkg.days,
          bumps: pkg.bumps,
          bumpsPerDay: pkg.bumpsPerDay,
          listAmount: pkg.amount,
          creditAmount: credit.amount,
          amount: pkg.amount - credit.amount,
          recommended: pkg.recommended ?? false,
        };
      }),
    };
  }

  // ------------------------------------------------------------ checkout

  async createOrder(
    input: CreatePromotionOrderInput,
    userId: string | undefined,
    clientKey: string,
  ): Promise<PromotionOrderObject> {
    if (this.checkoutLimiter.isBlocked(clientKey)) {
      throw new BadRequestException('Too many checkouts from here; please try again later');
    }
    this.checkoutLimiter.record(clientKey);

    const target: TargetKey = { targetType: input.targetType, targetId: input.targetId };
    const loaded = await this.loadTarget(target);
    if (loaded.rejectedBecause) throw new BadRequestException(loaded.rejectedBecause);

    const pkg = findPackage(input.packageCode);
    if (!pkg || pkg.audience !== loaded.audience) {
      throw new BadRequestException('Unknown promotion package');
    }

    const now = new Date();
    const placements = (await this.activePromotions(target, now)).filter((p) => isPlacement(p.tier));
    const credit = this.creditFor(placements, pkg, now);

    const order = await this.prisma.promotionOrder.create({
      data: {
        token: randomBytes(24).toString('base64url'),
        targetType: target.targetType,
        ...targetColumns(target),
        tier: pkg.tier,
        packageCode: pkg.code,
        listAmount: pkg.amount,
        creditAmount: credit.amount,
        amount: pkg.amount - credit.amount,
        creditedPromotionId: credit.promotionId,
        contactEmail: trimContact(input.contactEmail, 'contactEmail'),
        contactPhone: trimContact(input.contactPhone, 'contactPhone'),
        userId: userId ?? null,
        expiresAt: new Date(now.getTime() + ORDER_TTL_MS),
      },
    });

    return this.toOrderObject(order, loaded);
  }

  /** The status page: public, but only to whoever holds the order's token. */
  async orderByToken(token: string): Promise<PromotionOrderObject> {
    const order = await this.prisma.promotionOrder.findUnique({ where: { token } });
    if (!order) throw new NotFoundException('Order not found');

    if (order.status === PromotionOrderStatus.PENDING && order.expiresAt <= new Date()) {
      await this.prisma.promotionOrder.updateMany({
        where: { id: order.id, status: PromotionOrderStatus.PENDING },
        data: { status: PromotionOrderStatus.EXPIRED },
      });
      order.status = PromotionOrderStatus.EXPIRED;
    }

    return this.toOrderObject(order, await this.loadTarget(targetOf(order)));
  }

  /** What the provider is meant to charge. Used by the stub checkout to play the bank. */
  async chargeOf(token: string): Promise<{ amount: number; currency: string }> {
    const order = await this.prisma.promotionOrder.findUnique({
      where: { token },
      select: { amount: true, currency: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async cancelOrder(token: string): Promise<boolean> {
    const changed = await this.prisma.promotionOrder.updateMany({
      where: { token, status: PromotionOrderStatus.PENDING },
      data: { status: PromotionOrderStatus.CANCELLED },
    });
    return changed.count > 0;
  }

  private async toOrderObject(
    order: PromotionOrder,
    target: LoadedTarget,
  ): Promise<PromotionOrderObject> {
    const pkg = findPackage(order.packageCode);
    const payable =
      order.status === PromotionOrderStatus.PENDING && order.expiresAt > new Date();
    // The hosted page is created fresh each time: provider sessions expire on their own.
    const intent = payable
      ? await this.provider.createPayment({
          token: order.token,
          amount: order.amount,
          currency: order.currency,
          description: `${order.tier} · ${target.title}`,
        })
      : null;

    return {
      token: order.token,
      target: PromotionsService.toTargetObject(target),
      tier: order.tier,
      packageCode: order.packageCode,
      days: pkg?.days ?? 0,
      bumps: pkg?.bumps ?? 0,
      listAmount: order.listAmount,
      creditAmount: order.creditAmount,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      expiresAt: order.expiresAt,
      paidAt: order.paidAt,
      payUrl: intent?.payUrl ?? null,
    };
  }

  // ------------------------------------------------------------ payment

  /**
   * The one door through which a placement is granted. Called only after the provider's
   * signature has been checked, and safe to call again with the same payment id.
   */
  async applyPaymentResult(result: PaymentResult, providerName: string): Promise<void> {
    const order = await this.prisma.promotionOrder.findUnique({
      where: { token: result.reference },
    });
    if (!order) throw new NotFoundException('Unknown payment reference');

    try {
      await this.prisma.payment.create({
        data: {
          orderId: order.id,
          provider: providerName,
          providerPaymentId: result.providerPaymentId,
          status: result.paid ? 'paid' : 'failed',
          amount: result.amount,
          currency: result.currency,
          payload: (result.raw ?? Prisma.JsonNull) as Prisma.InputJsonValue,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        // The provider is repeating a callback it already sent; nothing more to do.
        return;
      }
      throw error;
    }

    if (!result.paid) {
      await this.prisma.promotionOrder.updateMany({
        where: { id: order.id, status: PromotionOrderStatus.PENDING },
        data: { status: PromotionOrderStatus.FAILED },
      });
      return;
    }

    if (result.amount !== order.amount || result.currency !== order.currency) {
      // Money changed hands for something other than this order: a person has to look.
      this.logger.error(
        `Payment ${result.providerPaymentId} is ${result.amount} qapik ${result.currency} ` +
          `but order ${order.id} costs ${order.amount} qapik ${order.currency}; nothing granted`,
      );
      throw new BadRequestException('Paid amount does not match the order');
    }

    await this.activate(order.id);
  }

  private async activate(orderId: string): Promise<void> {
    const now = new Date();
    await this.prisma.$transaction(async (tx) => {
      // Whoever flips the order to PAID is the one that grants it, exactly once.
      const claimed = await tx.promotionOrder.updateMany({
        where: {
          id: orderId,
          status: { in: [PromotionOrderStatus.PENDING, PromotionOrderStatus.EXPIRED] },
        },
        data: { status: PromotionOrderStatus.PAID, paidAt: now },
      });
      if (claimed.count === 0) return;

      const order = await tx.promotionOrder.findUniqueOrThrow({ where: { id: orderId } });
      const pkg = findPackage(order.packageCode);
      if (!pkg) throw new Error(`Order ${orderId} names unknown package ${order.packageCode}`);

      const target = targetOf(order);
      const counters = await this.readCounters(tx, target);
      const promotion = await tx.promotion.create({
        data: {
          targetType: order.targetType,
          listingId: order.listingId,
          specialistId: order.specialistId,
          serviceCenterId: order.serviceCenterId,
          tier: order.tier,
          packageCode: order.packageCode,
          // The credit was value the buyer had already paid, so the placement is worth both.
          amount: order.amount + order.creditAmount,
          currency: order.currency,
          startsAt: now,
          endsAt: new Date(now.getTime() + pkg.days * DAY_MS),
          bumpsTotal: pkg.bumps,
          viewsAtStart: counters.views,
          contactsAtStart: counters.contacts,
        },
      });
      await tx.promotionOrder.update({
        where: { id: orderId },
        data: { promotionId: promotion.id },
      });

      if (order.creditedPromotionId) {
        await tx.promotion.updateMany({
          where: { id: order.creditedPromotionId, active: true },
          data: { active: false, endedReason: 'upgraded', endedAt: now },
        });
      }

      // The first bump happens at once: that is what the buyer just paid for.
      await this.spendBump(tx, promotion, pkg, now);
      await this.refreshTarget(tx, target, now);
    });
  }

  // ------------------------------------------------------------ bumps

  private async spendBump(
    db: Db,
    promotion: Promotion,
    pkg: PromotionPackage,
    now: Date,
  ): Promise<void> {
    if (promotion.bumpsUsed >= promotion.bumpsTotal) return;
    const used = promotion.bumpsUsed + 1;
    const exhausted = used >= promotion.bumpsTotal;
    await db.promotion.update({
      where: { id: promotion.id },
      data: {
        bumpsUsed: used,
        lastBumpAt: now,
        nextBumpAt: exhausted ? null : nextBumpSlot(now, pkg.bumpsPerDay),
        // A bump package is nothing but its bumps, so it is over once they are gone.
        ...(exhausted && !isPlacement(promotion.tier)
          ? { active: false, endedReason: 'spent', endedAt: now }
          : {}),
      },
    });
    await this.updateTarget(db, targetOf(promotion), { bumpedAt: now });
  }

  /** Recomputes the sort key the catalogues read, from the placements still running. */
  private async refreshTarget(db: Db, target: TargetKey, now: Date): Promise<void> {
    const placements = await db.promotion.findMany({
      where: {
        ...targetColumns(target),
        active: true,
        tier: { in: [PromotionTier.VIP, PromotionTier.PREMIUM] },
        endsAt: { gt: now },
      },
      select: { tier: true, endsAt: true },
    });
    await this.updateTarget(db, target, {
      promotionRank: placements.reduce((best, p) => Math.max(best, rankOf(p.tier)), 0),
      promotedUntil: placements.length
        ? new Date(Math.max(...placements.map((p) => p.endsAt.getTime())))
        : null,
    });
  }

  /**
   * Expires what is due and spends the bumps whose moment has come. The scheduler calls
   * it every minute; tests call it directly with a chosen `now`.
   */
  async runDueWork(now: Date = new Date()): Promise<void> {
    await this.prisma.promotionOrder.updateMany({
      where: { status: PromotionOrderStatus.PENDING, expiresAt: { lte: now } },
      data: { status: PromotionOrderStatus.EXPIRED },
    });

    const touched = new Map<string, TargetKey>();

    const expired = await this.prisma.promotion.findMany({
      where: { active: true, endsAt: { lte: now } },
      select: { id: true, targetType: true, listingId: true, specialistId: true, serviceCenterId: true },
    });
    if (expired.length > 0) {
      await this.prisma.promotion.updateMany({
        where: { id: { in: expired.map((p) => p.id) } },
        data: { active: false, endedReason: 'expired', endedAt: now },
      });
      for (const row of expired) touched.set(targetKeyString(targetOf(row)), targetOf(row));
    }

    const due = await this.prisma.promotion.findMany({
      where: { active: true, endsAt: { gt: now }, nextBumpAt: { lte: now } },
      take: 500,
    });
    for (const promotion of due) {
      const pkg = findPackage(promotion.packageCode);
      if (!pkg) {
        this.logger.error(`Promotion ${promotion.id} names unknown package ${promotion.packageCode}`);
        await this.prisma.promotion.update({
          where: { id: promotion.id },
          data: { nextBumpAt: null },
        });
        continue;
      }
      await this.prisma.$transaction((tx) => this.spendBump(tx, promotion, pkg, now));
      const target = targetOf(promotion);
      touched.set(targetKeyString(target), target);
    }

    for (const target of touched.values()) {
      await this.prisma.$transaction((tx) => this.refreshTarget(tx, target, now));
    }
  }

  /**
   * Ends every placement of a target, with no refund. Moderation calls it when a
   * listing is blocked: paid placement does not buy an exemption from the rules.
   */
  async endPromotionsFor(target: TargetKey, reason: string): Promise<void> {
    const now = new Date();
    const stopped = await this.prisma.promotion.updateMany({
      where: { ...targetColumns(target), active: true },
      data: { active: false, endedReason: reason, endedAt: now, nextBumpAt: null },
    });
    if (stopped.count === 0) return;
    await this.prisma.$transaction((tx) => this.refreshTarget(tx, target, now));
  }

  // ------------------------------------------------------------ counters

  /**
   * Counts an opened detail page. Deliberately crude: it is a yardstick for the buyer,
   * not an analytics product, and a visitor only counts once per half hour per target.
   */
  async track(target: TargetKey, kind: 'view' | 'contact', clientKey: string): Promise<boolean> {
    const key = `${kind}:${targetKeyString(target)}:${clientKey}`;
    if (this.viewLimiter.isBlocked(key)) return false;
    this.viewLimiter.record(key);

    const data =
      kind === 'view' ? { viewsCount: { increment: 1 } } : { contactsCount: { increment: 1 } };
    const where = { id: target.targetId };
    try {
      if (target.targetType === PromotionTarget.LISTING) {
        await this.prisma.listing.update({ where, data });
      } else if (target.targetType === PromotionTarget.SPECIALIST) {
        await this.prisma.specialist.update({ where, data });
      } else {
        await this.prisma.serviceCenter.update({ where, data });
      }
    } catch {
      // A counter is never worth failing a page load over.
      return false;
    }
    return true;
  }

  // ------------------------------------------------------------ owners

  /** Everything the signed-in user has running or has run, newest first. */
  async myPromotions(userId: string, limit = 50): Promise<PromotionObject[]> {
    const rows = await this.prisma.promotion.findMany({
      where: {
        OR: [
          { listing: { seller: { userId } } },
          { specialist: { userId } },
          { serviceCenter: { userId } },
        ],
      },
      orderBy: [{ active: 'desc' }, { startsAt: 'desc' }],
      take: limit,
    });
    return Promise.all(rows.map((row) => this.toPromotionObject(row)));
  }

  private async toPromotionObject(promotion: Promotion): Promise<PromotionObject> {
    const target = await this.loadTarget(targetOf(promotion));
    return {
      id: promotion.id,
      target: PromotionsService.toTargetObject(target),
      tier: promotion.tier,
      startsAt: promotion.startsAt,
      endsAt: promotion.endsAt,
      bumpsTotal: promotion.bumpsTotal,
      bumpsUsed: promotion.bumpsUsed,
      nextBumpAt: promotion.nextBumpAt,
      active: promotion.active,
      endedReason: promotion.endedReason,
      amount: promotion.amount,
      viewsGained: Math.max(0, target.viewsCount - promotion.viewsAtStart),
      contactsGained: Math.max(0, target.contactsCount - promotion.contactsAtStart),
    };
  }

  // ------------------------------------------------------------ admin

  /**
   * Gives a placement away: for a compensation, a trial, or a deal agreed off the site.
   * It carries no money, so it never funds an upgrade credit.
   */
  async grant(
    adminId: string,
    target: TargetKey,
    tier: PromotionTier,
    days: number,
  ): Promise<boolean> {
    if (!Number.isInteger(days) || days < 1 || days > MAX_GRANT_DAYS) {
      throw new BadRequestException(`days must be a whole number between 1 and ${MAX_GRANT_DAYS}`);
    }
    const loaded = await this.loadTarget(target);
    if (loaded.rejectedBecause) throw new BadRequestException(loaded.rejectedBecause);

    const bumpsPerDay = tier === PromotionTier.PREMIUM ? 3 : 1;
    const pkg: PromotionPackage = {
      code: `granted_${tier.toLowerCase()}_${days}d`,
      tier,
      audience: loaded.audience,
      days,
      bumps: days * bumpsPerDay,
      bumpsPerDay,
      amount: 0,
    };

    const now = new Date();
    await this.prisma.$transaction(async (tx) => {
      const counters = await this.readCounters(tx, target);
      const promotion = await tx.promotion.create({
        data: {
          targetType: target.targetType,
          ...targetColumns(target),
          tier,
          packageCode: pkg.code,
          amount: 0,
          startsAt: now,
          endsAt: new Date(now.getTime() + days * DAY_MS),
          bumpsTotal: pkg.bumps,
          viewsAtStart: counters.views,
          contactsAtStart: counters.contacts,
          grantedBy: adminId,
        },
      });
      await this.spendBump(tx, promotion, pkg, now);
      await this.refreshTarget(tx, target, now);
    });
    return true;
  }

  async revoke(promotionId: string): Promise<boolean> {
    const promotion = await this.prisma.promotion.findUnique({ where: { id: promotionId } });
    if (!promotion) throw new NotFoundException('Promotion not found');
    if (!promotion.active) return false;

    const now = new Date();
    await this.prisma.promotion.update({
      where: { id: promotionId },
      data: { active: false, endedReason: 'revoked', endedAt: now, nextBumpAt: null },
    });
    await this.prisma.$transaction((tx) => this.refreshTarget(tx, targetOf(promotion), now));
    return true;
  }

  async adminPromotions(activeOnly: boolean, limit = 100): Promise<AdminPromotionObject[]> {
    const rows = await this.prisma.promotion.findMany({
      where: activeOnly ? { active: true } : {},
      orderBy: [{ active: 'desc' }, { startsAt: 'desc' }],
      take: limit,
    });
    return Promise.all(
      rows.map(async (row) => ({
        id: row.id,
        target: PromotionsService.toTargetObject(await this.loadTarget(targetOf(row))),
        tier: row.tier,
        startsAt: row.startsAt,
        endsAt: row.endsAt,
        active: row.active,
        amount: row.amount,
        paid: row.grantedBy === null,
        endedReason: row.endedReason,
      })),
    );
  }
}

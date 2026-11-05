import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Auction } from '@prisma/client';
import { ListingsService } from '../listings/listings.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuctionInput } from './auction.types';
import { AuctionsGateway } from './auctions.gateway';

const STATUS = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  FINISHED: 'FINISHED',
} as const;

const EXPIRY_CHECK_INTERVAL_MS = 30_000;

@Injectable()
export class AuctionsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AuctionsService.name);
  private expiryTimer?: NodeJS.Timeout;

  constructor(
    private readonly prisma: PrismaService,
    private readonly listingsService: ListingsService,
    private readonly auctionsGateway: AuctionsGateway,
  ) {}

  onModuleInit() {
    this.expiryTimer = setInterval(() => {
      this.finishExpiredAuctions().catch((err) =>
        this.logger.error('Failed to finish expired auctions', err),
      );
    }, EXPIRY_CHECK_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.expiryTimer) clearInterval(this.expiryTimer);
  }

  /** Closes every ACTIVE auction whose endTime has passed. */
  async finishExpiredAuctions(): Promise<number> {
    const expired = await this.prisma.auction.findMany({
      where: { status: STATUS.ACTIVE, endTime: { lte: new Date() } },
      select: { id: true },
    });

    let finished = 0;
    for (const { id } of expired) {
      // Guard against a concurrent manual finish.
      const res = await this.prisma.auction.updateMany({
        where: { id, status: STATUS.ACTIVE },
        data: { status: STATUS.FINISHED },
      });
      if (res.count > 0) {
        finished += 1;
        this.auctionsGateway.emitAuctionFinished(id);
      }
    }
    return finished;
  }

  async createAuction(userId: string, input: CreateAuctionInput) {
    await this.assertListingOwnership(userId, input.listingId);

    if (!(input.startPrice > 0)) {
      throw new BadRequestException('startPrice must be greater than 0');
    }
    if (input.endTime <= input.startTime) {
      throw new BadRequestException('endTime must be after startTime');
    }
    if (input.endTime <= new Date()) {
      throw new BadRequestException('endTime must be in the future');
    }

    const blocking = await this.prisma.auction.findFirst({
      where: {
        listingId: input.listingId,
        status: { in: [STATUS.PENDING, STATUS.ACTIVE] },
      },
    });

    if (blocking) {
      throw new ConflictException(
        'An open auction already exists for this listing',
      );
    }

    const auction = await this.prisma.auction.create({
      data: {
        listingId: input.listingId,
        startPrice: input.startPrice,
        currentPrice: input.startPrice,
        startTime: input.startTime,
        endTime: input.endTime,
        status: STATUS.PENDING,
      },
    });

    return this.toAuctionObject(auction);
  }

  async startAuction(userId: string, id: string) {
    const auction = await this.prisma.auction.findUnique({ where: { id } });
    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    await this.assertListingOwnership(userId, auction.listingId);

    if (auction.status !== STATUS.PENDING) {
      throw new BadRequestException('Auction must be PENDING to start');
    }
    if (auction.endTime <= new Date()) {
      throw new BadRequestException('Auction end time has already passed');
    }

    const updated = await this.prisma.auction.update({
      where: { id },
      data: { status: STATUS.ACTIVE },
    });

    return this.toAuctionObject(updated);
  }

  async finishAuction(userId: string, id: string) {
    const auction = await this.prisma.auction.findUnique({ where: { id } });
    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    await this.assertListingOwnership(userId, auction.listingId);

    if (auction.status !== STATUS.ACTIVE) {
      throw new BadRequestException('Auction must be ACTIVE to finish');
    }

    const updated = await this.prisma.auction.update({
      where: { id },
      data: { status: STATUS.FINISHED },
    });

    this.auctionsGateway.emitAuctionFinished(id);
    return this.toAuctionObject(updated);
  }

  async getAuction(id: string) {
    const auction = await this.prisma.auction.findUnique({ where: { id } });
    if (!auction) {
      throw new NotFoundException('Auction not found');
    }
    return this.toAuctionObject(auction);
  }

  async getAuctionByListingId(listingId: string) {
    const auction = await this.prisma.auction.findFirst({
      where: { listingId },
      orderBy: { id: 'desc' },
    });
    return auction ? this.toAuctionObject(auction) : null;
  }

  private async assertListingOwnership(
    userId: string,
    listingId: string,
  ): Promise<void> {
    const listing = await this.listingsService.getListing(listingId);
    const seller = await this.prisma.seller.findUnique({
      where: { id: listing.sellerId },
    });

    if (!seller || seller.userId !== userId) {
      throw new ForbiddenException('You do not own this listing');
    }
  }

  private toAuctionObject(auction: Auction) {
    return {
      ...auction,
      startPrice: Number(auction.startPrice),
      currentPrice: Number(auction.currentPrice),
    };
  }
}

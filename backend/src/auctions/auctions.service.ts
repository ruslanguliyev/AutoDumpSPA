import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
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

@Injectable()
export class AuctionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly listingsService: ListingsService,
    private readonly auctionsGateway: AuctionsGateway,
  ) {}

  async createAuction(userId: string, input: CreateAuctionInput) {
    await this.assertListingOwnership(userId, input.listingId);

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

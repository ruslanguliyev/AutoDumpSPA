import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Bid } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuctionsGateway } from '../auctions/auctions.gateway';
import { PlaceBidInput } from './bid.types';

const STATUS_ACTIVE = 'ACTIVE';

@Injectable()
export class BidsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auctionsGateway: AuctionsGateway,
  ) {}

  async placeBid(userId: string, input: PlaceBidInput) {
    const auction = await this.prisma.auction.findUnique({
      where: { id: input.auctionId },
      include: { listing: { include: { seller: true } } },
    });

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    if (auction.listing.seller.userId === userId) {
      throw new ForbiddenException('You cannot bid on your own listing');
    }

    const now = new Date();
    if (auction.status !== STATUS_ACTIVE || auction.endTime <= now) {
      throw new BadRequestException('Auction is not active');
    }

    if (input.amount <= Number(auction.currentPrice)) {
      throw new BadRequestException('Bid must be greater than current price');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Conditional update is atomic: if another bid raised the price (or the
      // auction ended) since the checks above, no row matches and we reject.
      const updated = await tx.auction.updateMany({
        where: {
          id: input.auctionId,
          status: STATUS_ACTIVE,
          endTime: { gt: now },
          currentPrice: { lt: input.amount },
        },
        data: { currentPrice: input.amount },
      });

      if (updated.count === 0) {
        throw new ConflictException(
          'Bid is no longer valid: the price changed or the auction ended',
        );
      }

      return tx.bid.create({
        data: {
          auctionId: input.auctionId,
          userId,
          amount: input.amount,
        },
      });
    });

    const payload = this.toBidObject(result);
    this.auctionsGateway.emitNewBid(input.auctionId, payload);
    return payload;
  }

  async getBidsByAuction(auctionId: string) {
    const bids = await this.prisma.bid.findMany({
      where: { auctionId },
      orderBy: { createdAt: 'desc' },
    });
    return bids.map((b) => this.toBidObject(b));
  }

  async getMyBids(userId: string) {
    const bids = await this.prisma.bid.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return bids.map((b) => this.toBidObject(b));
  }

  private toBidObject(bid: Bid) {
    return {
      ...bid,
      amount: Number(bid.amount),
    };
  }
}

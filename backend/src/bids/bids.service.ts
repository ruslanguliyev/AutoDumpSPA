import {
  BadRequestException,
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
    });

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    if (auction.status !== STATUS_ACTIVE) {
      throw new BadRequestException('Auction is not active');
    }

    const current = Number(auction.currentPrice);
    if (input.amount <= current) {
      throw new BadRequestException('Bid must be greater than current price');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const bid = await tx.bid.create({
        data: {
          auctionId: input.auctionId,
          userId,
          amount: input.amount,
        },
      });

      await tx.auction.update({
        where: { id: input.auctionId },
        data: { currentPrice: input.amount },
      });

      return bid;
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

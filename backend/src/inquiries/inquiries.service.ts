import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Inquiry, InquiryStatus, ListingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInquiryInput } from './inquiry.types';

const MAX_MESSAGE_LENGTH = 2000;
const MAX_PER_HOUR = 10;

type InquiryRow = Inquiry & {
  listing: { title: string };
  fromUser?: { fullName: string; email: string };
};

@Injectable()
export class InquiriesService {
  constructor(private readonly prisma: PrismaService) {}

  private toObject(row: InquiryRow, includeSender: boolean) {
    return {
      id: row.id,
      listingId: row.listingId,
      listingTitle: row.listing.title,
      message: row.message,
      phone: row.phone,
      status: row.status,
      createdAt: row.createdAt,
      fromName: includeSender ? (row.fromUser?.fullName ?? null) : null,
      fromEmail: includeSender ? (row.fromUser?.email ?? null) : null,
    };
  }

  async create(userId: string, input: CreateInquiryInput) {
    const message = input.message?.trim();
    if (!message) throw new BadRequestException('message is required');
    if (message.length > MAX_MESSAGE_LENGTH) {
      throw new BadRequestException(`message must be at most ${MAX_MESSAGE_LENGTH} characters`);
    }

    const listing = await this.prisma.listing.findUnique({
      where: { id: input.listingId },
      include: { seller: true },
    });
    if (!listing || listing.status !== ListingStatus.ACTIVE) {
      throw new NotFoundException('Listing not found');
    }
    if (listing.seller.userId === userId) {
      throw new ForbiddenException('You cannot send an inquiry to your own listing');
    }

    const recent = await this.prisma.inquiry.count({
      where: { fromUserId: userId, createdAt: { gte: new Date(Date.now() - 3_600_000) } },
    });
    if (recent >= MAX_PER_HOUR) {
      throw new BadRequestException('Too many inquiries, please try again later');
    }

    const row = await this.prisma.inquiry.create({
      data: {
        listingId: listing.id,
        fromUserId: userId,
        message,
        phone: input.phone?.trim() || null,
      },
      include: { listing: { select: { title: true } } },
    });
    return this.toObject(row, false);
  }

  /** Inquiries sent to listings owned by the current user's seller profile. */
  async received(userId: string, status?: InquiryStatus) {
    const seller = await this.prisma.seller.findUnique({ where: { userId } });
    if (!seller) return [];
    const rows = await this.prisma.inquiry.findMany({
      where: { listing: { sellerId: seller.id }, ...(status ? { status } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        listing: { select: { title: true } },
        fromUser: { select: { fullName: true, email: true } },
      },
    });
    return rows.map((r) => this.toObject(r, true));
  }

  async sent(userId: string) {
    const rows = await this.prisma.inquiry.findMany({
      where: { fromUserId: userId },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { listing: { select: { title: true } } },
    });
    return rows.map((r) => this.toObject(r, false));
  }

  async unreadCount(userId: string): Promise<number> {
    const seller = await this.prisma.seller.findUnique({ where: { userId } });
    if (!seller) return 0;
    return this.prisma.inquiry.count({
      where: { status: InquiryStatus.NEW, listing: { sellerId: seller.id } },
    });
  }

  async markRead(userId: string, id: string) {
    const row = await this.prisma.inquiry.findUnique({
      where: { id },
      include: {
        listing: { select: { title: true, seller: { select: { userId: true } } } },
        fromUser: { select: { fullName: true, email: true } },
      },
    });
    if (!row) throw new NotFoundException('Inquiry not found');
    if (row.listing.seller.userId !== userId) {
      throw new ForbiddenException('Not your inquiry');
    }
    const updated = await this.prisma.inquiry.update({
      where: { id },
      data: { status: InquiryStatus.READ },
    });
    return this.toObject({ ...row, ...updated }, true);
  }
}

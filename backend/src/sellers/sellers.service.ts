import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ListingStatus, Seller, SellerType, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSellerInput, UpdateSellerInput } from './seller.types';

function userRoleForSellerType(type: SellerType): UserRole {
  switch (type) {
    case SellerType.PRIVATE:
      return UserRole.PRIVATE_SELLER;
    case SellerType.DEALER:
      return UserRole.DEALER;
    case SellerType.PARTS_DEALER:
      return UserRole.PARTS_DEALER;
  }
}

const PHONE_PATTERN = /^\+?[0-9\s\-()]{6,20}$/;

/** Trims and validates a phone number. Empty input means "no phone" (null). */
export function normalizePhone(value: string | null | undefined): string | null {
  const phone = (value ?? '').trim();
  if (!phone) return null;
  if (!PHONE_PATTERN.test(phone)) {
    throw new BadRequestException('Invalid phone number');
  }
  return phone;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Trims and validates a contact email. Empty input means "no email" (null). */
export function normalizeContactEmail(value: string | null | undefined): string | null {
  const email = (value ?? '').trim().toLowerCase();
  if (!email) return null;
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    throw new BadRequestException('Invalid contact email');
  }
  return email;
}

/**
 * Public view of a seller: the phone is only visible when the seller allows it and the
 * contact email is never visible.
 */
export function toPublicSeller<T extends Pick<Seller, 'phone' | 'showPhone' | 'contactEmail'>>(seller: T): T {
  return { ...seller, phone: seller.showPhone ? seller.phone : null, contactEmail: null };
}

@Injectable()
export class SellersService {
  constructor(private readonly prisma: PrismaService) {}

  async createSeller(userId: string, input: CreateSellerInput) {
    const existingSeller = await this.prisma.seller.findUnique({
      where: { userId },
    });

    if (existingSeller) {
      throw new ConflictException('Seller already exists for this user');
    }

    const seller = await this.prisma.seller.create({
      data: {
        userId,
        type: input.type as SellerType,
        name: input.name,
        city: input.city,
        phone: normalizePhone(input.phone),
        contactEmail: normalizeContactEmail(input.contactEmail),
        ...(input.showPhone !== undefined ? { showPhone: input.showPhone } : {}),
        rating: 0,
        verified: false,
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { role: userRoleForSellerType(input.type as SellerType) },
    });

    return seller;
  }

  async updateSeller(userId: string, input: UpdateSellerInput) {
    const existingSeller = await this.prisma.seller.findUnique({
      where: { userId },
    });

    if (!existingSeller) {
      throw new NotFoundException('Seller not found');
    }

    return this.prisma.seller.update({
      where: { userId },
      data: {
        ...(input.type !== undefined ? { type: input.type as SellerType } : {}),
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.city !== undefined ? { city: input.city } : {}),
        ...(input.phone !== undefined ? { phone: normalizePhone(input.phone) } : {}),
        ...(input.contactEmail !== undefined
          ? { contactEmail: normalizeContactEmail(input.contactEmail) }
          : {}),
        ...(input.showPhone !== undefined ? { showPhone: input.showPhone } : {}),
      },
    });
  }

  async getSellerByUserId(userId: string) {
    return this.prisma.seller.findUnique({
      where: { userId },
    });
  }

  /** Counts only published listings; drafts and sold items are not public. */
  private static readonly publicListingsCount = {
    _count: { select: { listings: { where: { status: ListingStatus.ACTIVE } } } },
  } as const;

  private withListingsCount<T extends { _count: { listings: number } }>(row: T) {
    const { _count, ...seller } = row;
    return { ...seller, listingsCount: _count.listings };
  }

  async getAllSellers() {
    const sellers = await this.prisma.seller.findMany({
      orderBy: { createdAt: 'desc' },
      include: SellersService.publicListingsCount,
    });
    return sellers.map((row) => toPublicSeller(this.withListingsCount(row)));
  }

  async getSellerById(id: string) {
    const seller = await this.prisma.seller.findUnique({
      where: { id },
      include: SellersService.publicListingsCount,
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    return toPublicSeller(this.withListingsCount(seller));
  }
}

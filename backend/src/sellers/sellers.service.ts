import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Seller, SellerType, UserRole } from '@prisma/client';
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

/** Public view of a seller: the phone is only visible when the seller allows it. */
export function toPublicSeller<T extends Pick<Seller, 'phone' | 'showPhone'>>(seller: T): T {
  return seller.showPhone ? seller : { ...seller, phone: null };
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
        ...(input.showPhone !== undefined ? { showPhone: input.showPhone } : {}),
      },
    });
  }

  async getSellerByUserId(userId: string) {
    return this.prisma.seller.findUnique({
      where: { userId },
    });
  }

  async getAllSellers() {
    const sellers = await this.prisma.seller.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return sellers.map(toPublicSeller);
  }

  async getSellerById(id: string) {
    const seller = await this.prisma.seller.findUnique({
      where: { id },
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    return toPublicSeller(seller);
  }
}

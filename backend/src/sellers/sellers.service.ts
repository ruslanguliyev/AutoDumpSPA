import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SellerType, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSellerInput, UpdateSellerInput } from './seller.types';

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
        rating: 0,
        verified: false,
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { role: UserRole.SELLER },
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
      },
    });
  }

  async getSellerByUserId(userId: string) {
    return this.prisma.seller.findUnique({
      where: { userId },
    });
  }

  async getSellerById(id: string) {
    const seller = await this.prisma.seller.findUnique({
      where: { id },
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    return seller;
  }
}

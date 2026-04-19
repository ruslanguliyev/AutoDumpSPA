import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ListingsService } from '../listings/listings.service';
import { CreatePartInput, UpdatePartInput } from './part.types';

@Injectable()
export class PartsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly listingsService: ListingsService,
  ) {}

  async createPart(
    userId: string,
    listingId: string,
    input: CreatePartInput,
  ) {
    await this.assertListingOwnership(userId, listingId);

    return this.prisma.part.create({
      data: {
        listingId,
        name: input.name,
        category: input.category,
        brand: input.brand,
        model: input.model,
        condition: input.condition,
        oemCode: input.oemCode,
        stock: input.stock,
      },
    });
  }

  async updatePart(userId: string, id: string, input: UpdatePartInput) {
    const part = await this.prisma.part.findUnique({ where: { id } });
    if (!part) {
      throw new NotFoundException('Part not found');
    }

    await this.assertListingOwnership(userId, part.listingId);

    return this.prisma.part.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.category !== undefined ? { category: input.category } : {}),
        ...(input.brand !== undefined ? { brand: input.brand } : {}),
        ...(input.model !== undefined ? { model: input.model } : {}),
        ...(input.condition !== undefined ? { condition: input.condition } : {}),
        ...(input.oemCode !== undefined ? { oemCode: input.oemCode } : {}),
        ...(input.stock !== undefined ? { stock: input.stock } : {}),
      },
    });
  }

  async getPartByListingId(listingId: string) {
    return this.prisma.part.findFirst({
      where: { listingId },
    });
  }

  async deletePart(userId: string, id: string): Promise<boolean> {
    const part = await this.prisma.part.findUnique({ where: { id } });
    if (!part) {
      throw new NotFoundException('Part not found');
    }

    await this.assertListingOwnership(userId, part.listingId);

    await this.prisma.part.delete({ where: { id } });
    return true;
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
}

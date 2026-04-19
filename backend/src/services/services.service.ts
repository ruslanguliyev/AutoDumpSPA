import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ListingsService } from '../listings/listings.service';
import { CreateServiceInput, UpdateServiceInput } from './service.types';

@Injectable()
export class ServicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly listingsService: ListingsService,
  ) {}

  async createService(
    userId: string,
    listingId: string,
    input: CreateServiceInput,
  ) {
    await this.assertListingOwnership(userId, listingId);

    return this.prisma.service.create({
      data: {
        listingId,
        name: input.name,
        categories: input.categories,
        supportedBrands: input.supportedBrands,
        city: input.city,
        rating: input.rating,
      },
    });
  }

  async updateService(userId: string, id: string, input: UpdateServiceInput) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    await this.assertListingOwnership(userId, service.listingId);

    return this.prisma.service.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.categories !== undefined ? { categories: input.categories } : {}),
        ...(input.supportedBrands !== undefined
          ? { supportedBrands: input.supportedBrands }
          : {}),
        ...(input.city !== undefined ? { city: input.city } : {}),
        ...(input.rating !== undefined ? { rating: input.rating } : {}),
      },
    });
  }

  async getServiceByListingId(listingId: string) {
    return this.prisma.service.findFirst({
      where: { listingId },
    });
  }

  async deleteService(userId: string, id: string): Promise<boolean> {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    await this.assertListingOwnership(userId, service.listingId);

    await this.prisma.service.delete({ where: { id } });
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

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ListingStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListingsService } from '../listings/listings.service';
import {
  CreatePartInput,
  PartsFilterInput,
  UpdatePartInput,
} from './part.types';

const partWithListingSeller = Prisma.validator<Prisma.PartDefaultArgs>()({
  include: {
    listing: { include: { seller: true } },
  },
});

type PartWithListingSeller = Prisma.PartGetPayload<typeof partWithListingSeller>;

@Injectable()
export class PartsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly listingsService: ListingsService,
  ) {}

  private mapPart(row: PartWithListingSeller) {
    const seller = row.listing?.seller;
    return {
      id: row.id,
      listingId: row.listingId,
      name: row.name,
      category: row.category,
      brand: row.brand,
      model: row.model,
      condition: row.condition,
      oemCode: row.oemCode,
      stock: row.stock,
      description: row.description,
      price:
        row.price === null || row.price === undefined
          ? null
          : Number(row.price),
      currency: row.currency,
      imageUrl: row.imageUrl,
      compatibility: row.compatibility,
      location: row.location,
      seller: seller
        ? {
            id: seller.id,
            name: seller.name,
            type: String(seller.type).toLowerCase(),
            hasPublicPage: true,
            verified: seller.verified,
            rating: seller.rating,
            city: seller.city,
            phone: seller.showPhone ? seller.phone : null,
            logo: null,
          }
        : null,
    };
  }

  private buildPartsWhere(
    filter?: PartsFilterInput | null,
  ): Prisma.PartWhereInput {
    // Public search shows only published listings.
    const where: Prisma.PartWhereInput = {
      listing: { status: ListingStatus.ACTIVE },
    };

    if (filter?.search?.trim()) {
      const s = filter.search.trim();
      where.OR = [
        { name: { contains: s, mode: 'insensitive' } },
        { brand: { contains: s, mode: 'insensitive' } },
        { model: { contains: s, mode: 'insensitive' } },
        { oemCode: { contains: s, mode: 'insensitive' } },
      ];
    }

    if (filter?.category?.trim()) {
      where.category = {
        equals: filter.category.trim(),
        mode: 'insensitive',
      };
    }

    if (filter?.brand?.trim()) {
      where.brand = {
        contains: filter.brand.trim(),
        mode: 'insensitive',
      };
    }

    if (filter?.model?.trim()) {
      where.model = {
        contains: filter.model.trim(),
        mode: 'insensitive',
      };
    }

    if (filter?.condition?.trim()) {
      where.condition = {
        equals: filter.condition.trim(),
        mode: 'insensitive',
      };
    }

    if (filter?.location?.trim()) {
      where.location = {
        contains: filter.location.trim(),
        mode: 'insensitive',
      };
    }

    const priceFilter: Prisma.DecimalNullableFilter = {};
    if (filter?.priceFrom != null && Number.isFinite(filter.priceFrom)) {
      priceFilter.gte = filter.priceFrom;
    }
    if (filter?.priceTo != null && Number.isFinite(filter.priceTo)) {
      priceFilter.lte = filter.priceTo;
    }
    if (Object.keys(priceFilter).length > 0) {
      where.price = priceFilter;
    }

    return where;
  }

  async getParts(filter?: PartsFilterInput | null) {
    const limit = filter?.limit ?? 20;
    const offset = filter?.offset ?? 0;
    const where = this.buildPartsWhere(filter ?? undefined);

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.part.findMany({
        where,
        orderBy: { id: 'desc' },
        skip: offset,
        take: limit,
        include: {
          listing: { include: { seller: true } },
        },
      }),
      this.prisma.part.count({ where }),
    ]);

    return {
      items: rows.map((r) => this.mapPart(r)),
      total,
    };
  }

  async getPartById(id: string) {
    const row = await this.prisma.part.findUnique({
      where: { id },
      include: {
        listing: { include: { seller: true } },
      },
    });
    if (!row || row.listing.status === ListingStatus.DRAFT) {
      throw new NotFoundException('Part not found');
    }
    return this.mapPart(row);
  }

  async createPart(
    userId: string,
    listingId: string,
    input: CreatePartInput,
  ) {
    await this.assertListingOwnership(userId, listingId);

    const created = await this.prisma.part.create({
      data: {
        listingId,
        name: input.name,
        category: input.category,
        brand: input.brand,
        model: input.model,
        condition: input.condition,
        oemCode: input.oemCode ?? null,
        stock: input.stock,
        description: input.description ?? null,
        price: input.price ?? null,
        currency: input.currency ?? 'AZN',
        imageUrl: input.imageUrl ?? null,
        compatibility: input.compatibility ?? [],
        location: input.location ?? null,
      },
    });
    const row = await this.prisma.part.findUniqueOrThrow({
      where: { id: created.id },
      include: {
        listing: { include: { seller: true } },
      },
    });
    return this.mapPart(row);
  }

  async updatePart(userId: string, id: string, input: UpdatePartInput) {
    const part = await this.prisma.part.findUnique({ where: { id } });
    if (!part) {
      throw new NotFoundException('Part not found');
    }

    await this.assertListingOwnership(userId, part.listingId);

    await this.prisma.part.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.category !== undefined ? { category: input.category } : {}),
        ...(input.brand !== undefined ? { brand: input.brand } : {}),
        ...(input.model !== undefined ? { model: input.model } : {}),
        ...(input.condition !== undefined ? { condition: input.condition } : {}),
        ...(input.oemCode !== undefined ? { oemCode: input.oemCode } : {}),
        ...(input.stock !== undefined ? { stock: input.stock } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.price !== undefined ? { price: input.price } : {}),
        ...(input.currency !== undefined ? { currency: input.currency } : {}),
        ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
        ...(input.compatibility !== undefined
          ? { compatibility: input.compatibility }
          : {}),
        ...(input.location !== undefined ? { location: input.location } : {}),
      },
    });
    const row = await this.prisma.part.findUniqueOrThrow({
      where: { id },
      include: {
        listing: { include: { seller: true } },
      },
    });
    return this.mapPart(row);
  }

  /** Draft listings are only visible to their owner. */
  async getPartByListingId(listingId: string, requesterUserId?: string) {
    const row = await this.prisma.part.findFirst({
      where: { listingId },
      include: {
        listing: { include: { seller: true } },
      },
    });
    if (!row) return null;
    if (
      row.listing.status === ListingStatus.DRAFT &&
      row.listing.seller.userId !== requesterUserId
    ) {
      return null;
    }
    return this.mapPart(row);
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

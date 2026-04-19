import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Listing,
  ListingStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SellersService } from '../sellers/sellers.service';
import {
  CreateListingInput,
  ListingsFilterInput,
  PaginatedListings,
  UpdateListingInput,
} from './listing.types';

@Injectable()
export class ListingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sellersService: SellersService,
  ) {}

  async createListing(userId: string, input: CreateListingInput) {
    const seller = await this.sellersService.getSellerByUserId(userId);
    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    const listing = await this.prisma.listing.create({
      data: {
        title: input.title,
        description: input.description,
        price: input.price,
        status: ListingStatus.DRAFT,
        sellerId: seller.id,
      },
    });

    return this.toListingObject(listing);
  }

  async updateListing(userId: string, id: string, input: UpdateListingInput) {
    const listing = await this.getOwnedListing(userId, id);

    const updated = await this.prisma.listing.update({
      where: { id: listing.id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.price !== undefined ? { price: input.price } : {}),
      },
    });

    return this.toListingObject(updated);
  }

  async publishListing(userId: string, id: string) {
    const listing = await this.getOwnedListing(userId, id);
    const updated = await this.prisma.listing.update({
      where: { id: listing.id },
      data: { status: ListingStatus.ACTIVE },
    });
    return this.toListingObject(updated);
  }

  async closeListing(userId: string, id: string) {
    const listing = await this.getOwnedListing(userId, id);
    const updated = await this.prisma.listing.update({
      where: { id: listing.id },
      data: { status: ListingStatus.SOLD },
    });
    return this.toListingObject(updated);
  }

  async deleteListing(userId: string, id: string): Promise<boolean> {
    const listing = await this.getOwnedListing(userId, id);
    await this.prisma.listing.delete({
      where: { id: listing.id },
    });
    return true;
  }

  async getListing(id: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }
    return this.toListingObject(listing);
  }

  async getListings(
    filter: ListingsFilterInput = {},
    page = 1,
    perPage = 20,
  ): Promise<PaginatedListings> {
    const safePage = Math.max(1, page);
    const safePerPage = Math.max(1, perPage);
    const skip = (safePage - 1) * safePerPage;

    const where: Prisma.ListingWhereInput = {
      ...(filter.status !== undefined ? { status: filter.status } : {}),
      ...(filter.sellerId !== undefined ? { sellerId: filter.sellerId } : {}),
      ...((filter.minPrice !== undefined || filter.maxPrice !== undefined)
        ? {
            price: {
              ...(filter.minPrice !== undefined ? { gte: filter.minPrice } : {}),
              ...(filter.maxPrice !== undefined ? { lte: filter.maxPrice } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.listing.findMany({
        where,
        skip,
        take: safePerPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.listing.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toListingObject(item)),
      total,
      page: safePage,
      perPage: safePerPage,
    };
  }

  private async getOwnedListing(userId: string, listingId: string): Promise<Listing> {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
    });
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    const seller = await this.sellersService.getSellerByUserId(userId);
    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    if (listing.sellerId !== seller.id) {
      throw new ForbiddenException('You do not own this listing');
    }

    return listing;
  }

  private toListingObject(listing: Listing) {
    return {
      ...listing,
      price: Number(listing.price),
    };
  }
}

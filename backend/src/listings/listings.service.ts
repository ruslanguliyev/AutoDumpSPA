import {
  BadRequestException,
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
  MyListingObject,
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

    const [vehicles, parts, services] = await this.prisma.$transaction([
      this.prisma.vehicle.count({ where: { listingId: listing.id } }),
      this.prisma.part.count({ where: { listingId: listing.id } }),
      this.prisma.service.count({ where: { listingId: listing.id } }),
    ]);
    if (vehicles + parts + services === 0) {
      throw new BadRequestException(
        'Listing has no vehicle, part or service attached and cannot be published',
      );
    }
    if (!listing.title.trim()) {
      throw new BadRequestException('Listing title is required to publish');
    }

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

  /**
   * Returns a listing for public display. DRAFT listings are visible only to
   * their owner; everyone else gets "not found".
   */
  async getVisibleListing(id: string, requesterUserId?: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }
    if (listing.status === ListingStatus.DRAFT) {
      const ownSeller = requesterUserId
        ? await this.sellersService.getSellerByUserId(requesterUserId)
        : null;
      if (!ownSeller || ownSeller.id !== listing.sellerId) {
        throw new NotFoundException('Listing not found');
      }
    }
    return this.toListingObject(listing);
  }

  async getListings(
    filter: ListingsFilterInput = {},
    page = 1,
    perPage = 20,
    requesterUserId?: string,
  ): Promise<PaginatedListings> {
    const safePage = Math.max(1, page);
    const safePerPage = Math.min(1000, Math.max(1, perPage));
    const skip = (safePage - 1) * safePerPage;

    // Anonymous users and other sellers only ever see published listings.
    // Only a seller browsing their own listings may filter by any status.
    let isOwnListings = false;
    if (requesterUserId && filter.sellerId !== undefined) {
      const ownSeller = await this.sellersService.getSellerByUserId(requesterUserId);
      isOwnListings = ownSeller?.id === filter.sellerId;
    }
    const status = isOwnListings ? filter.status : ListingStatus.ACTIVE;

    const where: Prisma.ListingWhereInput = {
      ...(status !== undefined ? { status } : {}),
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

  /** Listings of the current user's seller profile (all statuses) with card data. */
  async getMyListings(userId: string, status?: ListingStatus): Promise<MyListingObject[]> {
    const seller = await this.sellersService.getSellerByUserId(userId);
    if (!seller) return [];

    const listings = await this.prisma.listing.findMany({
      where: { sellerId: seller.id, ...(status ? { status } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 500,
      include: {
        vehicles: { take: 1 },
        parts: { take: 1 },
        services: { take: 1 },
        _count: { select: { inquiries: true } },
      },
    });

    const itemIds = listings.flatMap((l) => [
      ...l.vehicles.map((v) => v.id),
      ...l.parts.map((p) => p.id),
    ]);
    const favGroups = itemIds.length
      ? await this.prisma.favorite.groupBy({
          by: ['itemId'],
          where: { itemId: { in: itemIds } },
          _count: { _all: true },
        })
      : [];
    const favCount = new Map(favGroups.map((g) => [g.itemId, g._count._all]));

    return listings.map((l) => {
      const v = l.vehicles[0];
      const p = l.parts[0];
      const s = l.services[0];
      const kind = v ? 'vehicle' : p ? 'part' : s ? 'service' : 'unknown';
      const itemId = v?.id ?? p?.id ?? null;
      return {
        id: l.id,
        title: l.title,
        price: Number(l.price),
        status: l.status,
        kind,
        itemId,
        currency: v?.currency ?? p?.currency ?? null,
        thumbnail: v?.imageUrls?.[0] ?? p?.imageUrl ?? null,
        inquiriesCount: l._count.inquiries,
        favoritesCount: itemId ? (favCount.get(itemId) ?? 0) : 0,
        createdAt: l.createdAt,
        updatedAt: l.updatedAt,
      };
    });
  }

  /** Move an owned listing back to DRAFT (unpublish). */
  async unpublishListing(userId: string, id: string) {
    const listing = await this.getOwnedListing(userId, id);
    const updated = await this.prisma.listing.update({
      where: { id: listing.id },
      data: { status: ListingStatus.DRAFT },
    });
    return this.toListingObject(updated);
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

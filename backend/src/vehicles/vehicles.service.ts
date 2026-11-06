import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ListingPurpose,
  ListingStatus,
  Prisma,
  PromotionTier,
  RentalStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { isHiddenFromPublic } from '../listings/listing-status';
import {
  PROMOTED_FIRST,
  PROMOTED_POOL_LIMIT,
  rankOf,
  visibleTier,
} from '../promotions/promotion-pricing';
import { rotate } from '../promotions/promotion-rotation';
import { ListingsService } from '../listings/listings.service';
import {
  CreateVehicleInput,
  UpdateVehicleInput,
  VehiclesFilterInput,
} from './vehicle.types';

/** Strict "YYYY-MM-DD" to a UTC-midnight Date; anything else is ignored. */
function parseDay(value: string | null | undefined): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/** Body style is a short lowercase identifier such as "sedan"; empty means "not set". */
export function normalizeBodyType(value: string | null | undefined): string | null {
  const bodyType = (value ?? '').trim().toLowerCase();
  if (!bodyType) return null;
  if (!/^[a-z_]{1,30}$/.test(bodyType)) {
    throw new BadRequestException('Invalid body type');
  }
  return bodyType;
}

const vehicleWithListingSeller = Prisma.validator<Prisma.VehicleDefaultArgs>()({
  include: {
    listing: { include: { seller: true, rentalTerms: true } },
  },
});

type VehicleWithListingSeller = Prisma.VehicleGetPayload<
  typeof vehicleWithListingSeller
>;

@Injectable()
export class VehiclesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly listingsService: ListingsService,
  ) {}

  private mapVehicle(row: VehicleWithListingSeller) {
    const seller = row.listing?.seller;
    return {
      id: row.id,
      listingId: row.listingId,
      brand: row.brand,
      model: row.model,
      generation: row.generation,
      version: row.version,
      year: row.year,
      mileage: row.mileage,
      fuel: row.fuel,
      transmission: row.transmission,
      displacement: row.displacement,
      horsepower: row.horsepower,
      engineVolume: row.engineVolume,
      power: row.power,
      drive: row.drive,
      condition: row.condition,
      color: row.color,
      vehicleType: row.vehicleType,
      bodyType: row.bodyType,
      price:
        row.price === null || row.price === undefined
          ? null
          : Number(row.price),
      currency: row.currency,
      location: row.location,
      description: row.description,
      imageUrls: row.imageUrls,
      isHot: row.isHot,
      isCreditAvailable: row.isCreditAvailable,
      isBarterAvailable: row.isBarterAvailable,
      hasDamage: row.hasDamage,
      isRepainted: row.isRepainted,
      wasInAccident: row.wasInAccident,
      ownersCount: row.ownersCount,
      seatsCount: row.seatsCount,
      marketRegion: row.marketRegion,
      purpose: row.listing.purpose,
      rental: row.listing.rentalTerms
        ? {
            deposit: row.listing.rentalTerms.deposit === null ? null : Number(row.listing.rentalTerms.deposit),
            minDays: row.listing.rentalTerms.minDays,
            maxDays: row.listing.rentalTerms.maxDays,
            kmPerDay: row.listing.rentalTerms.kmPerDay,
            minDriverAge: row.listing.rentalTerms.minDriverAge,
          }
        : null,
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
      promotionTier: visibleTier(row.listing.promotionRank, row.listing.promotedUntil),
    };
  }

  private buildVehiclesWhere(
    filter?: VehiclesFilterInput | null,
  ): Prisma.VehicleWhereInput {
    // Public search shows only published listings.
    // Sale and rental offers are separate catalogues: search shows sales unless asked otherwise.
    // A seller's own page lists everything they offer.
    const purpose = filter?.purpose ?? (filter?.sellerId ? undefined : ListingPurpose.SALE);
    const listingWhere: Prisma.ListingWhereInput = {
      status: ListingStatus.ACTIVE,
      ...(filter?.sellerId ? { sellerId: filter.sellerId } : {}),
      ...(purpose ? { purpose } : {}),
    };

    // Rental search: hide cars that are already booked (confirmed) or blocked in the wanted period.
    const from = parseDay(filter?.availableFrom);
    const to = parseDay(filter?.availableTo ?? filter?.availableFrom);
    if (from && to) {
      const overlap = { startDate: { lte: to }, endDate: { gte: from } };
      listingWhere.rentalBookings = { none: { status: RentalStatus.CONFIRMED, ...overlap } };
      listingWhere.rentalBlocks = { none: overlap };
    }

    const where: Prisma.VehicleWhereInput = { listing: listingWhere };

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

    const yearFilter: Prisma.IntFilter = {};
    if (filter?.yearFrom != null && Number.isFinite(filter.yearFrom)) {
      yearFilter.gte = filter.yearFrom;
    }
    if (filter?.yearTo != null && Number.isFinite(filter.yearTo)) {
      yearFilter.lte = filter.yearTo;
    }
    if (Object.keys(yearFilter).length > 0) {
      where.year = yearFilter;
    }

    if (filter?.condition?.trim()) {
      where.condition = {
        equals: filter.condition.trim(),
        mode: 'insensitive',
      };
    }

    if (filter?.fuel?.trim()) {
      where.fuel = {
        equals: filter.fuel.trim(),
        mode: 'insensitive',
      };
    }

    if (filter?.transmission?.trim()) {
      where.transmission = {
        equals: filter.transmission.trim(),
        mode: 'insensitive',
      };
    }

    if (filter?.vehicleType?.trim()) {
      where.vehicleType = {
        equals: filter.vehicleType.trim(),
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

  async getVehicles(filter?: VehiclesFilterInput | null) {
    const limit = filter?.limit ?? 20;
    const offset = filter?.offset ?? 0;
    const where = this.buildVehiclesWhere(filter ?? undefined);

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.vehicle.findMany({
        where,
        // Paid placement first, then by the moment of the last bump, which for a
        // listing nobody promoted is simply when it was published.
        orderBy: PROMOTED_FIRST.map((key) => ({ listing: key })),
        skip: offset,
        take: limit,
        include: {
          listing: { include: { seller: true, rentalTerms: true } },
        },
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    return {
      items: rows.map((r) => this.mapVehicle(r)),
      total,
    };
  }

  /**
   * The promoted block above a catalogue, or the home page when `minTier` is PREMIUM.
   *
   * The pool is read in rank order and then rotated by the clock, so every paying
   * listing spends the same time at the front instead of leaving it to chance.
   */
  async getPromotedVehicles(
    minTier: PromotionTier,
    limit = 6,
    purpose: ListingPurpose = ListingPurpose.SALE,
  ) {
    const now = new Date();
    const rows = await this.prisma.vehicle.findMany({
      where: {
        listing: {
          status: ListingStatus.ACTIVE,
          purpose,
          promotionRank: { gte: rankOf(minTier) },
          promotedUntil: { gt: now },
        },
      },
      orderBy: PROMOTED_FIRST.map((key) => ({ listing: key })),
      take: PROMOTED_POOL_LIMIT,
      include: {
        listing: { include: { seller: true, rentalTerms: true } },
      },
    });
    return rotate(rows, limit, now.getTime()).map((r) => this.mapVehicle(r));
  }

  async getVehicleById(id: string) {
    const row = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        listing: { include: { seller: true, rentalTerms: true } },
      },
    });
    if (!row || isHiddenFromPublic(row.listing.status)) {
      throw new NotFoundException('Vehicle not found');
    }
    return this.mapVehicle(row);
  }

  async createVehicle(
    userId: string,
    listingId: string,
    input: CreateVehicleInput,
  ) {
    await this.assertListingOwnership(userId, listingId);

    const created = await this.prisma.vehicle.create({
      data: {
        listingId,
        brand: input.brand,
        model: input.model,
        generation: input.generation ?? null,
        year: input.year,
        mileage: input.mileage,
        fuel: input.fuel,
        transmission: input.transmission,
        displacement: input.displacement ?? null,
        horsepower: input.horsepower ?? null,
        engineVolume: input.engineVolume,
        power: input.power,
        version: input.version ?? null,
        drive: input.drive ?? null,
        condition: input.condition ?? 'used',
        color: input.color ?? null,
        vehicleType: input.vehicleType ?? 'car',
        bodyType: normalizeBodyType(input.bodyType),
        price: input.price ?? null,
        currency: input.currency ?? 'AZN',
        location: input.location ?? null,
        description: input.description ?? null,
        imageUrls: input.imageUrls ?? [],
        isHot: input.isHot ?? false,
        isCreditAvailable: input.isCreditAvailable ?? false,
        isBarterAvailable: input.isBarterAvailable ?? false,
        hasDamage: input.hasDamage ?? false,
        isRepainted: input.isRepainted ?? false,
        wasInAccident: input.wasInAccident ?? false,
        ownersCount: input.ownersCount ?? 1,
        seatsCount: input.seatsCount ?? null,
        marketRegion: input.marketRegion ?? null,
      },
    });

    const row = await this.prisma.vehicle.findUniqueOrThrow({
      where: { id: created.id },
      include: {
        listing: { include: { seller: true, rentalTerms: true } },
      },
    });
    return this.mapVehicle(row);
  }

  async updateVehicle(userId: string, id: string, input: UpdateVehicleInput) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    await this.assertListingOwnership(userId, vehicle.listingId);

    await this.prisma.vehicle.update({
      where: { id },
      data: {
        ...(input.brand !== undefined ? { brand: input.brand } : {}),
        ...(input.model !== undefined ? { model: input.model } : {}),
        ...(input.generation !== undefined ? { generation: input.generation } : {}),
        ...(input.year !== undefined ? { year: input.year } : {}),
        ...(input.mileage !== undefined ? { mileage: input.mileage } : {}),
        ...(input.fuel !== undefined ? { fuel: input.fuel } : {}),
        ...(input.transmission !== undefined
          ? { transmission: input.transmission }
          : {}),
        ...(input.displacement !== undefined
          ? { displacement: input.displacement }
          : {}),
        ...(input.horsepower !== undefined ? { horsepower: input.horsepower } : {}),
        ...(input.engineVolume !== undefined
          ? { engineVolume: input.engineVolume }
          : {}),
        ...(input.power !== undefined ? { power: input.power } : {}),
        ...(input.version !== undefined ? { version: input.version } : {}),
        ...(input.drive !== undefined ? { drive: input.drive } : {}),
        ...(input.condition !== undefined ? { condition: input.condition } : {}),
        ...(input.color !== undefined ? { color: input.color } : {}),
        ...(input.vehicleType !== undefined
          ? { vehicleType: input.vehicleType }
          : {}),
        ...(input.bodyType !== undefined
          ? { bodyType: normalizeBodyType(input.bodyType) }
          : {}),
        ...(input.price !== undefined ? { price: input.price } : {}),
        ...(input.currency !== undefined ? { currency: input.currency } : {}),
        ...(input.location !== undefined ? { location: input.location } : {}),
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
        ...(input.imageUrls !== undefined ? { imageUrls: input.imageUrls } : {}),
        ...(input.isHot !== undefined ? { isHot: input.isHot } : {}),
        ...(input.isCreditAvailable !== undefined
          ? { isCreditAvailable: input.isCreditAvailable }
          : {}),
        ...(input.isBarterAvailable !== undefined
          ? { isBarterAvailable: input.isBarterAvailable }
          : {}),
        ...(input.hasDamage !== undefined ? { hasDamage: input.hasDamage } : {}),
        ...(input.isRepainted !== undefined
          ? { isRepainted: input.isRepainted }
          : {}),
        ...(input.wasInAccident !== undefined
          ? { wasInAccident: input.wasInAccident }
          : {}),
        ...(input.ownersCount !== undefined
          ? { ownersCount: input.ownersCount }
          : {}),
        ...(input.seatsCount !== undefined ? { seatsCount: input.seatsCount } : {}),
        ...(input.marketRegion !== undefined
          ? { marketRegion: input.marketRegion }
          : {}),
      },
    });

    const row = await this.prisma.vehicle.findUniqueOrThrow({
      where: { id },
      include: {
        listing: { include: { seller: true, rentalTerms: true } },
      },
    });
    return this.mapVehicle(row);
  }

  /** Draft listings are only visible to their owner. */
  async getVehicleByListingId(listingId: string, requesterUserId?: string) {
    const row = await this.prisma.vehicle.findFirst({
      where: { listingId },
      include: {
        listing: { include: { seller: true, rentalTerms: true } },
      },
    });
    if (!row) return null;
    if (
      isHiddenFromPublic(row.listing.status) &&
      row.listing.seller.userId !== requesterUserId
    ) {
      return null;
    }
    return this.mapVehicle(row);
  }

  async deleteVehicle(userId: string, id: string): Promise<boolean> {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    await this.assertListingOwnership(userId, vehicle.listingId);

    await this.prisma.vehicle.delete({ where: { id } });
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

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ListingStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { isHiddenFromPublic } from '../listings/listing-status';
import { ListingsService } from '../listings/listings.service';
import {
  CreateVehicleInput,
  UpdateVehicleInput,
  VehiclesFilterInput,
} from './vehicle.types';

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
    listing: { include: { seller: true } },
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

  private buildVehiclesWhere(
    filter?: VehiclesFilterInput | null,
  ): Prisma.VehicleWhereInput {
    // Public search shows only published listings.
    const where: Prisma.VehicleWhereInput = {
      listing: {
        status: ListingStatus.ACTIVE,
        ...(filter?.sellerId ? { sellerId: filter.sellerId } : {}),
      },
    };

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
        orderBy: { id: 'desc' },
        skip: offset,
        take: limit,
        include: {
          listing: { include: { seller: true } },
        },
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    return {
      items: rows.map((r) => this.mapVehicle(r)),
      total,
    };
  }

  async getVehicleById(id: string) {
    const row = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        listing: { include: { seller: true } },
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
        listing: { include: { seller: true } },
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
        listing: { include: { seller: true } },
      },
    });
    return this.mapVehicle(row);
  }

  /** Draft listings are only visible to their owner. */
  async getVehicleByListingId(listingId: string, requesterUserId?: string) {
    const row = await this.prisma.vehicle.findFirst({
      where: { listingId },
      include: {
        listing: { include: { seller: true } },
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

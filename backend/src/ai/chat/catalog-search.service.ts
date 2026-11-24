import { Injectable } from '@nestjs/common';
import { ListingPurpose, ListingStatus, Prisma, SellerType } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { PROMOTED_FIRST } from '../../promotions/promotion-pricing';
import {
  CarSearchInput,
  KeywordSearchInput,
  PartSearchInput,
  RentalSearchInput,
  SellerSearchInput,
  SpecialistSearchInput,
} from './catalog-tools';

export type CatalogCardKind =
  | 'CAR'
  | 'RENTAL'
  | 'PART'
  | 'SERVICE_CENTER'
  | 'SPECIALIST'
  | 'SELLER';

/** One real catalogue entry. Every field is read from the database, never from the model. */
export type CatalogCard = {
  kind: CatalogCardKind;
  id: string;
  title: string;
  subtitle: string | null;
  price: number | null;
  currency: string | null;
  /** DAY for rentals (price per day), HOUR for a specialist's hourly rate, FROM for "price from". */
  priceUnit: 'DAY' | 'HOUR' | 'FROM' | null;
  city: string | null;
  imageUrl: string | null;
  rating: number | null;
  /** Site path without the language prefix, e.g. /vehicles/abc. */
  path: string;
};

export type CatalogSearchResult = { total: number; items: CatalogCard[] };

/** How many results one tool call hands back. Small on purpose: the chat shows cards, not pages. */
export const RESULT_LIMIT = 6;
/** Rows scanned in memory for keyword-scored entities (services, specialists, sellers). */
const SCAN_LIMIT = 300;

const ci = (value: string) => ({ contains: value, mode: 'insensitive' as const });
const eqi = (value: string) => ({ equals: value, mode: 'insensitive' as const });
const toNumber = (value: Prisma.Decimal | number | null | undefined) =>
  value == null ? null : Number(value);
const joinParts = (...parts: Array<string | number | null | undefined>) => {
  const text = parts
    .map((part) => (part == null ? '' : String(part).trim()))
    .filter(Boolean)
    .join(' · ');
  return text || null;
};

/** Words of a free-text query, folded so "Тормоза" matches "тормоза" and "BRAKES" matches "brakes". */
export function keywords(text: string | null | undefined): string[] {
  return (text ?? '')
    .toLowerCase()
    .split(/[\s,;/]+/)
    .map((word) => word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ''))
    .filter((word) => word.length >= 2)
    .slice(0, 12);
}

/** How many query words appear in any of the haystacks; 0 means no match. */
export function keywordScore(words: string[], haystacks: Array<string | null | undefined>): number {
  if (!words.length) return 1;
  const text = haystacks
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .replace(/_/g, ' ');
  return words.reduce((score, word) => score + (text.includes(word) ? 1 : 0), 0);
}

const brandMatches = (brand: string | null | undefined, brands: string[]) =>
  !brand || brands.length === 0 || brands.some((item) => item.toLowerCase().includes(brand.toLowerCase()));

/**
 * Read-only searches over the public catalogue for the site assistant.
 * Only published listings and active profiles are visible here, exactly as on the site.
 */
@Injectable()
export class CatalogSearchService {
  constructor(private readonly prisma: PrismaService) {}

  async searchCars(input: CarSearchInput): Promise<CatalogSearchResult> {
    return this.searchVehicles(input, ListingPurpose.SALE);
  }

  async searchRentals(input: RentalSearchInput): Promise<CatalogSearchResult> {
    return this.searchVehicles(
      { ...input, priceTo: input.pricePerDayTo ?? null, priceFrom: null },
      ListingPurpose.RENT,
    );
  }

  private async searchVehicles(
    input: CarSearchInput,
    purpose: ListingPurpose,
  ): Promise<CatalogSearchResult> {
    const where: Prisma.VehicleWhereInput = {
      listing: { status: ListingStatus.ACTIVE, purpose },
    };
    if (input.brand) where.brand = ci(input.brand);
    if (input.model) where.model = ci(input.model);
    if (input.yearFrom != null || input.yearTo != null) {
      where.year = {
        ...(input.yearFrom != null ? { gte: input.yearFrom } : {}),
        ...(input.yearTo != null ? { lte: input.yearTo } : {}),
      };
    }
    if (input.priceFrom != null || input.priceTo != null) {
      where.price = {
        ...(input.priceFrom != null ? { gte: input.priceFrom } : {}),
        ...(input.priceTo != null ? { lte: input.priceTo } : {}),
      };
    }
    if (input.mileageTo != null) where.mileage = { lte: input.mileageTo };
    if (input.color) where.color = ci(input.color);
    if (input.bodyType) where.bodyType = eqi(input.bodyType);
    if (input.fuel) where.fuel = eqi(input.fuel);
    if (input.transmission) where.transmission = eqi(input.transmission);
    if (input.condition) where.condition = eqi(input.condition);
    if (input.city) where.location = ci(input.city);
    if (input.drive) where.drive = ci(input.drive);

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.vehicle.findMany({
        where,
        orderBy: PROMOTED_FIRST.map((key) => ({ listing: key })),
        take: RESULT_LIMIT,
        include: {
          listing: {
            select: { title: true, price: true, images: { orderBy: { position: 'asc' }, take: 1 } },
          },
        },
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    const rental = purpose === ListingPurpose.RENT;
    return {
      total,
      items: rows.map((row) => ({
        kind: rental ? 'RENTAL' : 'CAR',
        id: row.id,
        title: [row.brand, row.model].filter(Boolean).join(' ') + (row.year ? `, ${row.year}` : '') || row.listing.title,
        subtitle: joinParts(
          row.mileage != null ? `${row.mileage} km` : null,
          row.fuel,
          row.transmission,
          row.color,
          row.bodyType,
        ),
        price: toNumber(row.price ?? row.listing.price),
        currency: row.currency || 'AZN',
        priceUnit: rental ? 'DAY' : null,
        city: row.location ?? null,
        imageUrl: row.imageUrls?.[0] ?? row.listing.images[0]?.url ?? null,
        rating: null,
        path: `/vehicles/${row.id}`,
      })),
    };
  }

  async searchParts(input: PartSearchInput): Promise<CatalogSearchResult> {
    const and: Prisma.PartWhereInput[] = [{ listing: { status: ListingStatus.ACTIVE } }];
    const words = keywords(input.query);
    if (words.length) {
      and.push({
        OR: words.flatMap((word) => [
          { name: ci(word) },
          { category: ci(word) },
          { oemCode: ci(word) },
          { description: ci(word) },
        ]),
      });
    }
    if (input.oemCode) and.push({ oemCode: ci(input.oemCode.replace(/\s+/g, '')) });
    if (input.carBrand) {
      and.push({
        OR: [{ brand: ci(input.carBrand) }, { compatibility: { has: input.carBrand } }],
      });
    }
    if (input.carModel) {
      and.push({
        OR: [{ model: ci(input.carModel) }, { compatibility: { has: input.carModel } }],
      });
    }
    if (input.condition) and.push({ condition: eqi(input.condition) });
    if (input.city) and.push({ location: ci(input.city) });
    if (input.priceTo != null) and.push({ price: { lte: input.priceTo } });
    const where: Prisma.PartWhereInput = { AND: and };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.part.findMany({
        where,
        orderBy: PROMOTED_FIRST.map((key) => ({ listing: key })),
        take: RESULT_LIMIT,
        include: {
          listing: {
            select: { price: true, images: { orderBy: { position: 'asc' }, take: 1 } },
          },
        },
      }),
      this.prisma.part.count({ where }),
    ]);

    return {
      total,
      items: rows.map((row) => ({
        kind: 'PART',
        id: row.id,
        title: row.name,
        subtitle: joinParts(
          row.category,
          [row.brand, row.model].filter(Boolean).join(' '),
          row.oemCode ? `OEM ${row.oemCode}` : null,
        ),
        price: toNumber(row.price ?? row.listing.price),
        currency: row.currency || 'AZN',
        priceUnit: null,
        city: row.location ?? null,
        imageUrl: row.imageUrl ?? row.listing.images[0]?.url ?? null,
        rating: null,
        path: `/parts/${row.id}`,
      })),
    };
  }

  async searchServiceCenters(input: KeywordSearchInput): Promise<CatalogSearchResult> {
    const rows = await this.prisma.serviceCenter.findMany({
      where: { isActive: true, ...(input.city ? { city: ci(input.city) } : {}) },
      orderBy: PROMOTED_FIRST,
      take: SCAN_LIMIT,
      include: { services: true },
    });
    const words = keywords(input.query);
    const scored = rows
      .filter((row) => brandMatches(input.carBrand, row.supportedBrands))
      .map((row) => ({
        row,
        score: keywordScore(words, [
          row.name,
          row.type,
          row.description,
          ...row.categories,
          ...row.services.flatMap((service) => [service.title, service.category, service.code]),
        ]),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    return {
      total: scored.length,
      items: scored.slice(0, RESULT_LIMIT).map(({ row }) => {
        const prices = row.services
          .map((service) => toNumber(service.priceFrom))
          .filter((price): price is number => price != null);
        return {
          kind: 'SERVICE_CENTER',
          id: row.id,
          title: row.name,
          subtitle: joinParts(
            row.categories.slice(0, 3).join(', ').toLowerCase().replace(/_/g, ' '),
            row.address,
          ),
          price: prices.length ? Math.min(...prices) : null,
          currency: prices.length ? 'AZN' : null,
          priceUnit: prices.length ? 'FROM' : null,
          city: row.city,
          imageUrl: row.logoUrl ?? row.coverImage ?? null,
          rating: row.reviewsCount > 0 ? row.rating : null,
          path: `/services/${row.slug ?? row.id}`,
        };
      }),
    };
  }

  async searchSpecialists(input: SpecialistSearchInput): Promise<CatalogSearchResult> {
    const rows = await this.prisma.specialist.findMany({
      where: {
        ...(input.city ? { city: ci(input.city) } : {}),
        ...(input.mobileService ? { mobileService: true } : {}),
      },
      orderBy: PROMOTED_FIRST,
      take: SCAN_LIMIT,
      include: { supportedVehicles: true },
    });
    const words = keywords(input.query);
    const scored = rows
      .filter((row) =>
        brandMatches(
          input.carBrand,
          row.supportedVehicles.map((vehicle) => vehicle.brand),
        ),
      )
      .map((row) => ({
        row,
        score: keywordScore(words, [
          row.name,
          row.bio,
          ...row.skills,
          ...row.specializations,
          ...row.supportedVehicles.map((vehicle) => `${vehicle.brand} ${vehicle.model}`),
        ]),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    return {
      total: scored.length,
      items: scored.slice(0, RESULT_LIMIT).map(({ row }) => {
        const hourly = toNumber(row.hourlyRate);
        const from = toNumber(row.priceFrom);
        return {
          kind: 'SPECIALIST',
          id: row.id,
          title: row.name,
          subtitle:
            [...new Set([...row.specializations, ...row.skills])]
              .slice(0, 3)
              .join(', ')
              .toLowerCase()
              .replace(/_/g, ' ') || null,
          price: hourly ?? from,
          currency: hourly ?? from ? 'AZN' : null,
          priceUnit: hourly != null ? 'HOUR' : from != null ? 'FROM' : null,
          city: row.city,
          imageUrl: row.avatarUrl ?? null,
          rating: row.reviewsCount > 0 ? row.rating : null,
          path: `/specialists/${row.slug}`,
        };
      }),
    };
  }

  async searchSellers(input: SellerSearchInput): Promise<CatalogSearchResult> {
    // The public sellers directory lists dealers only; private sellers are reached through their listings.
    const types =
      input.type === 'PARTS_DEALER'
        ? [SellerType.PARTS_DEALER]
        : input.type === 'DEALER'
          ? [SellerType.DEALER]
          : [SellerType.DEALER, SellerType.PARTS_DEALER];
    const rows = await this.prisma.seller.findMany({
      where: { type: { in: types }, ...(input.city ? { city: ci(input.city) } : {}) },
      orderBy: [{ verified: 'desc' }, { rating: 'desc' }],
      take: SCAN_LIMIT,
    });
    const words = keywords(input.query);
    const scored = rows
      .map((row) => ({ row, score: keywordScore(words, [row.name, row.city]) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    return {
      total: scored.length,
      items: scored.slice(0, RESULT_LIMIT).map(({ row }) => ({
        kind: 'SELLER',
        id: row.id,
        title: row.name,
        subtitle: null,
        price: null,
        currency: null,
        priceUnit: null,
        city: row.city,
        imageUrl: null,
        rating: row.reviewsCount > 0 ? row.rating : null,
        path: `/sellers/${row.id}`,
      })),
    };
  }
}

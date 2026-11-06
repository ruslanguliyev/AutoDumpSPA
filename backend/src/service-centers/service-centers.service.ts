import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  ServiceCenter,
  ServiceCenterService,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateServiceCenterInput,
  CreateServiceCenterServiceInput,
  UpdateServiceCenterInput,
} from './service-center.types';

type ServiceCenterWithServices = ServiceCenter & {
  services: ServiceCenterService[];
};

@Injectable()
export class ServiceCentersService {
  constructor(private readonly prisma: PrismaService) {}

  private mapServiceRow(row: ServiceCenterWithServices) {
    return {
      id: row.id,
      userId: row.userId,
      name: row.name,
      slug: row.slug,
      description: row.description,
      legalName: row.legalName,
      type: row.type,
      city: row.city,
      address: row.address,
      phone: row.phone,
      whatsapp: row.whatsapp,
      website: row.website,
      logoUrl: row.logoUrl,
      coverImage: row.coverImage,
      gallery: row.gallery,
      categories: row.categories,
      supportedBrands: row.supportedBrands,
      rating: row.rating,
      reviewsCount: row.reviewsCount,
      verified: row.verified,
      isActive: row.isActive,
      schedule: row.schedule as Record<string, unknown> | null,
      contacts: row.contacts as Record<string, unknown> | null,
      services: row.services.map((s) => ({
        id: s.id,
        serviceCenterId: s.serviceCenterId,
        code: s.code,
        title: s.title,
        category: s.category,
        priceFrom:
          s.priceFrom === null || s.priceFrom === undefined
            ? null
            : Number(s.priceFrom),
        priceTo:
          s.priceTo === null || s.priceTo === undefined
            ? null
            : Number(s.priceTo),
        currency: s.currency,
        durationMin: s.durationMin,
        applicableBrands: s.applicableBrands,
        popular: s.popular,
      })),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private async replaceServices(
    tx: Prisma.TransactionClient,
    serviceCenterId: string,
    services: CreateServiceCenterServiceInput[] | undefined,
  ) {
    await tx.serviceCenterService.deleteMany({
      where: { serviceCenterId },
    });
    if (!services?.length) return;
    for (const s of services) {
      await tx.serviceCenterService.create({
        data: {
          serviceCenterId,
          code: s.code,
          title: s.title,
          category: s.category,
          priceFrom: s.priceFrom,
          priceTo: s.priceTo,
          currency: s.currency ?? 'AZN',
          durationMin: s.durationMin,
          applicableBrands: s.applicableBrands ?? [],
          popular: s.popular ?? false,
        },
      });
    }
  }

  async createServiceCenter(userId: string, input: CreateServiceCenterInput) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.serviceCenter.findUnique({
        where: { userId },
      });
      if (existing) {
        throw new ConflictException(
          'Service center already exists for this user',
        );
      }

      const serviceCenter = await tx.serviceCenter.create({
        data: {
          user: { connect: { id: userId } },
          name: input.name,
          slug: input.slug ?? null,
          description: input.description ?? null,
          legalName: input.legalName ?? null,
          type: input.type ?? null,
          city: input.city,
          address: input.address ?? null,
          phone: input.phone ?? null,
          whatsapp: input.whatsapp ?? null,
          website: input.website ?? null,
          logoUrl: input.logoUrl ?? null,
          coverImage: input.coverImage ?? null,
          gallery: input.gallery ?? [],
          categories: input.categories ?? [],
          supportedBrands: input.supportedBrands ?? [],
          rating: 0,
          reviewsCount: 0,
          verified: input.verified ?? false,
          isActive: input.isActive ?? true,
          ...(input.schedule !== undefined
            ? { schedule: input.schedule as Prisma.InputJsonValue }
            : {}),
          ...(input.contacts !== undefined
            ? { contacts: input.contacts as Prisma.InputJsonValue }
            : {}),
        },
      });

      await this.replaceServices(tx, serviceCenter.id, input.services);

      await tx.user.update({
        where: { id: userId },
        data: { role: UserRole.SERVICE },
      });

      const full = await tx.serviceCenter.findUniqueOrThrow({
        where: { id: serviceCenter.id },
        include: { services: true },
      });
      return this.mapServiceRow(full);
    });
  }

  async updateServiceCenter(userId: string, input: UpdateServiceCenterInput) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.serviceCenter.findUnique({
        where: { userId },
      });
      if (!existing) {
        throw new NotFoundException('Service center not found');
      }

      const updated = await tx.serviceCenter.update({
        where: { userId },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.slug !== undefined ? { slug: input.slug } : {}),
          ...(input.description !== undefined
            ? { description: input.description }
            : {}),
          ...(input.legalName !== undefined ? { legalName: input.legalName } : {}),
          ...(input.type !== undefined ? { type: input.type } : {}),
          ...(input.city !== undefined ? { city: input.city } : {}),
          ...(input.address !== undefined ? { address: input.address } : {}),
          ...(input.phone !== undefined ? { phone: input.phone } : {}),
          ...(input.whatsapp !== undefined ? { whatsapp: input.whatsapp } : {}),
          ...(input.website !== undefined ? { website: input.website } : {}),
          ...(input.logoUrl !== undefined ? { logoUrl: input.logoUrl } : {}),
          ...(input.coverImage !== undefined
            ? { coverImage: input.coverImage }
            : {}),
          ...(input.gallery !== undefined ? { gallery: input.gallery } : {}),
          ...(input.categories !== undefined
            ? { categories: input.categories }
            : {}),
          ...(input.supportedBrands !== undefined
            ? { supportedBrands: input.supportedBrands }
            : {}),
          ...(input.verified !== undefined ? { verified: input.verified } : {}),
          ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
          ...(input.schedule !== undefined
            ? {
                schedule:
                  input.schedule === null
                    ? Prisma.JsonNull
                    : (input.schedule as Prisma.InputJsonValue),
              }
            : {}),
          ...(input.contacts !== undefined
            ? {
                contacts:
                  input.contacts === null
                    ? Prisma.JsonNull
                    : (input.contacts as Prisma.InputJsonValue),
              }
            : {}),
        },
      });

      if (input.services !== undefined) {
        await this.replaceServices(tx, updated.id, input.services);
      }

      const full = await tx.serviceCenter.findUniqueOrThrow({
        where: { id: updated.id },
        include: { services: true },
      });
      return this.mapServiceRow(full);
    });
  }

  async getServiceCenterByUserId(userId: string) {
    const row = await this.prisma.serviceCenter.findUnique({
      where: { userId },
      include: { services: true },
    });
    return row ? this.mapServiceRow(row) : null;
  }

  async getServiceCenterById(id: string) {
    const row = await this.prisma.serviceCenter.findUnique({
      where: { id },
      include: { services: true },
    });
    if (!row) {
      throw new NotFoundException('Service center not found');
    }
    return this.mapServiceRow(row);
  }

  async getServiceCenterBySlug(slug: string) {
    const row = await this.prisma.serviceCenter.findFirst({
      where: { slug },
      include: { services: true },
    });
    return row ? this.mapServiceRow(row) : null;
  }

  async getServiceCenters(city?: string | null) {
    const rows = await this.prisma.serviceCenter.findMany({
      where: city ? { city } : {},
      orderBy: { createdAt: 'desc' },
      include: { services: true },
    });
    return rows.map((r) => this.mapServiceRow(r));
  }
}

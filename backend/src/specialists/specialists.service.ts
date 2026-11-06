import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Specialist, SpecialistVehicle, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { normalizePhone } from '../sellers/sellers.service';
import {
  CreateSpecialistInput,
  SpecialistObject,
  SpecialistsFilterInput,
  UpdateSpecialistInput,
} from './specialist.types';

type SpecialistWithVehicles = Specialist & {
  supportedVehicles?: SpecialistVehicle[];
};

@Injectable()
export class SpecialistsService {
  constructor(private readonly prisma: PrismaService) {}

  async createSpecialist(userId: string, input: CreateSpecialistInput) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.specialist.findUnique({
        where: { userId },
      });
      if (existing) {
        throw new ConflictException(
          'Specialist profile already exists for this user',
        );
      }

      const slugTaken = await tx.specialist.findUnique({
        where: { slug: input.slug },
      });
      if (slugTaken) {
        throw new ConflictException('Slug already in use');
      }

      const specialist = await tx.specialist.create({
        data: {
          userId,
          name: input.name,
          slug: input.slug,
          bio: input.bio,
          city: input.city,
          phone: normalizePhone(input.phone),
          whatsapp: input.whatsapp,
          avatarUrl: input.avatarUrl,
          coverImage: input.coverImage,
          skills: input.skills ?? [],
          specializations: input.specializations ?? [],
          experience: input.experience,
          ...(input.hourlyRate != null ? { hourlyRate: input.hourlyRate } : {}),
          ...(input.priceFrom != null ? { priceFrom: input.priceFrom } : {}),
          mobileService: input.mobileService ?? false,
          portfolio: input.portfolio ?? [],
          rating: 0,
          verified: false,
          available: true,
          supportedVehicles: input.supportedVehicles?.length
            ? {
                create: input.supportedVehicles.map((v) => ({
                  brand: v.brand,
                  model: v.model,
                  yearFrom: v.yearFrom,
                  yearTo: v.yearTo,
                })),
              }
            : undefined,
        },
        include: { supportedVehicles: true },
      });

      await tx.user.updateMany({
        where: { id: userId, role: { not: UserRole.ADMIN } },
        data: { role: UserRole.SPECIALIST },
      });

      return this.toSpecialistObject(specialist);
    });
  }

  async updateSpecialist(userId: string, input: UpdateSpecialistInput) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.specialist.findUnique({
        where: { userId },
      });
      if (!existing) {
        throw new NotFoundException('Specialist not found');
      }

      if (input.slug !== undefined && input.slug !== existing.slug) {
        const slugTaken = await tx.specialist.findUnique({
          where: { slug: input.slug },
        });
        if (slugTaken) {
          throw new ConflictException('Slug already in use');
        }
      }

      if (input.supportedVehicles !== undefined) {
        await tx.specialistVehicle.deleteMany({
          where: { specialistId: existing.id },
        });
        for (const v of input.supportedVehicles) {
          await tx.specialistVehicle.create({
            data: {
              specialistId: existing.id,
              brand: v.brand,
              model: v.model,
              yearFrom: v.yearFrom,
              yearTo: v.yearTo,
            },
          });
        }
      }

      const updated = await tx.specialist.update({
        where: { userId },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.slug !== undefined ? { slug: input.slug } : {}),
          ...(input.bio !== undefined ? { bio: input.bio } : {}),
          ...(input.city !== undefined ? { city: input.city } : {}),
          ...(input.phone !== undefined ? { phone: normalizePhone(input.phone) } : {}),
          ...(input.whatsapp !== undefined ? { whatsapp: input.whatsapp } : {}),
          ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
          ...(input.coverImage !== undefined
            ? { coverImage: input.coverImage }
            : {}),
          ...(input.skills !== undefined ? { skills: input.skills } : {}),
          ...(input.specializations !== undefined
            ? { specializations: input.specializations }
            : {}),
          ...(input.experience !== undefined
            ? { experience: input.experience }
            : {}),
          ...(input.hourlyRate !== undefined
            ? {
                hourlyRate:
                  input.hourlyRate === null ? null : input.hourlyRate,
              }
            : {}),
          ...(input.priceFrom !== undefined
            ? {
                priceFrom:
                  input.priceFrom === null ? null : input.priceFrom,
              }
            : {}),
          ...(input.mobileService !== undefined
            ? { mobileService: input.mobileService }
            : {}),
          ...(input.portfolio !== undefined ? { portfolio: input.portfolio } : {}),
          ...(input.available !== undefined ? { available: input.available } : {}),
        },
        include: { supportedVehicles: true },
      });

      return this.toSpecialistObject(updated);
    });
  }

  async getSpecialistByUserId(userId: string) {
    const row = await this.prisma.specialist.findUnique({
      where: { userId },
      include: { supportedVehicles: true },
    });
    return row ? this.toSpecialistObject(row) : null;
  }

  async getSpecialistById(id: string) {
    const row = await this.prisma.specialist.findUnique({
      where: { id },
      include: { supportedVehicles: true },
    });
    if (!row) {
      throw new NotFoundException('Specialist not found');
    }
    return this.toSpecialistObject(row);
  }

  async getSpecialistBySlug(slug: string) {
    const row = await this.prisma.specialist.findUnique({
      where: { slug },
      include: { supportedVehicles: true },
    });
    if (!row) {
      throw new NotFoundException('Specialist not found');
    }
    return this.toSpecialistObject(row);
  }

  async getSpecialists(filter?: SpecialistsFilterInput | null) {
    const where: Prisma.SpecialistWhereInput = {};

    if (filter?.city) {
      where.city = filter.city;
    }
    if (filter?.skills?.length) {
      where.skills = { hasSome: filter.skills };
    }
    if (filter?.specializations?.length) {
      where.specializations = { hasSome: filter.specializations };
    }
    if (filter?.minRating !== undefined && filter.minRating !== null) {
      where.rating = { gte: filter.minRating };
    }
    if (filter?.available !== undefined && filter.available !== null) {
      where.available = filter.available;
    }

    const rows = await this.prisma.specialist.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { supportedVehicles: true },
    });
    return rows.map((r) => this.toSpecialistObject(r));
  }

  private toSpecialistObject(s: SpecialistWithVehicles): SpecialistObject {
    return {
      id: s.id,
      userId: s.userId,
      name: s.name,
      slug: s.slug,
      bio: s.bio,
      city: s.city,
      phone: s.phone,
      whatsapp: s.whatsapp,
      avatarUrl: s.avatarUrl,
      coverImage: s.coverImage,
      skills: s.skills,
      specializations: s.specializations,
      experience: s.experience,
      rating: s.rating,
      reviewsCount: s.reviewsCount,
      hourlyRate:
        s.hourlyRate === null || s.hourlyRate === undefined
          ? null
          : Number(s.hourlyRate),
      priceFrom:
        s.priceFrom === null || s.priceFrom === undefined
          ? null
          : Number(s.priceFrom),
      mobileService: s.mobileService,
      portfolio: s.portfolio,
      verified: s.verified,
      available: s.available,
      supportedVehicles: (s.supportedVehicles ?? []).map((v) => ({
        id: v.id,
        specialistId: v.specialistId,
        brand: v.brand,
        model: v.model,
        yearFrom: v.yearFrom,
        yearTo: v.yearTo,
      })),
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  }
}

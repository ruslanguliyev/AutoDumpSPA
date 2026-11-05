import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ListingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export const FAVORITE_TYPES = ['vehicle', 'part'] as const;
export type FavoriteType = (typeof FAVORITE_TYPES)[number];

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  private assertType(type: string): FavoriteType {
    if (!(FAVORITE_TYPES as readonly string[]).includes(type)) {
      throw new BadRequestException(`type must be one of: ${FAVORITE_TYPES.join(', ')}`);
    }
    return type as FavoriteType;
  }

  private async assertItemExists(type: FavoriteType, itemId: string) {
    const row =
      type === 'vehicle'
        ? await this.prisma.vehicle.findUnique({
            where: { id: itemId },
            select: { listing: { select: { status: true } } },
          })
        : await this.prisma.part.findUnique({
            where: { id: itemId },
            select: { listing: { select: { status: true } } },
          });
    if (!row || row.listing.status === ListingStatus.DRAFT) {
      throw new NotFoundException(`${type} not found`);
    }
  }

  async add(userId: string, typeRaw: string, itemId: string): Promise<boolean> {
    const type = this.assertType(typeRaw);
    await this.assertItemExists(type, itemId);
    await this.prisma.favorite.upsert({
      where: { userId_type_itemId: { userId, type, itemId } },
      create: { userId, type, itemId },
      update: {},
    });
    return true;
  }

  async remove(userId: string, typeRaw: string, itemId: string): Promise<boolean> {
    const type = this.assertType(typeRaw);
    await this.prisma.favorite.deleteMany({ where: { userId, type, itemId } });
    return true;
  }

  /** Bulk-add (used to push locally saved favorites after login). Unknown items are skipped. */
  async addMany(
    userId: string,
    refs: Array<{ type: string; itemId: string }>,
  ): Promise<number> {
    let added = 0;
    for (const ref of refs.slice(0, 200)) {
      try {
        await this.add(userId, ref.type, ref.itemId);
        added += 1;
      } catch {
        // skip items that no longer exist or have invalid type
      }
    }
    return added;
  }

  async list(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const vehicleIds = favorites.filter((f) => f.type === 'vehicle').map((f) => f.itemId);
    const partIds = favorites.filter((f) => f.type === 'part').map((f) => f.itemId);

    const [vehicles, parts] = await Promise.all([
      this.prisma.vehicle.findMany({
        where: { id: { in: vehicleIds }, listing: { status: { not: ListingStatus.DRAFT } } },
      }),
      this.prisma.part.findMany({
        where: { id: { in: partIds }, listing: { status: { not: ListingStatus.DRAFT } } },
      }),
    ]);
    const vById = new Map(vehicles.map((v) => [v.id, v]));
    const pById = new Map(parts.map((p) => [p.id, p]));

    const items: Array<{
      type: string;
      itemId: string;
      title: string;
      price: number | null;
      currency: string | null;
      thumbnail: string | null;
      createdAt: Date;
    }> = [];
    for (const f of favorites) {
      if (f.type === 'vehicle') {
        const v = vById.get(f.itemId);
        if (!v) continue;
        items.push({
          type: 'vehicle',
          itemId: v.id,
          title: `${v.brand} ${v.model}${v.year ? ` ${v.year}` : ''}`,
          price: v.price === null ? null : Number(v.price),
          currency: v.currency,
          thumbnail: v.imageUrls[0] ?? null,
          createdAt: f.createdAt,
        });
      } else {
        const p = pById.get(f.itemId);
        if (!p) continue;
        items.push({
          type: 'part',
          itemId: p.id,
          title: p.name,
          price: p.price === null ? null : Number(p.price),
          currency: p.currency,
          thumbnail: p.imageUrl,
          createdAt: f.createdAt,
        });
      }
    }
    return items;
  }
}

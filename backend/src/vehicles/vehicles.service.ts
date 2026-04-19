import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ListingsService } from '../listings/listings.service';
import { CreateVehicleInput, UpdateVehicleInput } from './vehicle.types';

@Injectable()
export class VehiclesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly listingsService: ListingsService,
  ) {}

  async createVehicle(
    userId: string,
    listingId: string,
    input: CreateVehicleInput,
  ) {
    await this.assertListingOwnership(userId, listingId);

    return this.prisma.vehicle.create({
      data: {
        listingId,
        brand: input.brand,
        model: input.model,
        year: input.year,
        mileage: input.mileage,
        fuel: input.fuel,
        transmission: input.transmission,
        engineVolume: input.engineVolume,
        power: input.power,
      },
    });
  }

  async updateVehicle(userId: string, id: string, input: UpdateVehicleInput) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    await this.assertListingOwnership(userId, vehicle.listingId);

    return this.prisma.vehicle.update({
      where: { id },
      data: {
        ...(input.brand !== undefined ? { brand: input.brand } : {}),
        ...(input.model !== undefined ? { model: input.model } : {}),
        ...(input.year !== undefined ? { year: input.year } : {}),
        ...(input.mileage !== undefined ? { mileage: input.mileage } : {}),
        ...(input.fuel !== undefined ? { fuel: input.fuel } : {}),
        ...(input.transmission !== undefined
          ? { transmission: input.transmission }
          : {}),
        ...(input.engineVolume !== undefined
          ? { engineVolume: input.engineVolume }
          : {}),
        ...(input.power !== undefined ? { power: input.power } : {}),
      },
    });
  }

  async getVehicleByListingId(listingId: string) {
    return this.prisma.vehicle.findFirst({
      where: { listingId },
    });
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

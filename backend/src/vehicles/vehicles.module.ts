import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ListingsModule } from '../listings/listings.module';
import { PrismaModule } from '../prisma/prisma.module';
import { VehiclesResolver } from './vehicles.resolver';
import { VehiclesService } from './vehicles.service';

@Module({
  imports: [PrismaModule, AuthModule, ListingsModule],
  providers: [VehiclesService, VehiclesResolver],
})
export class VehiclesModule {}

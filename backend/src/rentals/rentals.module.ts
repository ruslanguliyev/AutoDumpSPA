import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RentalsResolver } from './rentals.resolver';
import { RentalsService } from './rentals.service';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [RentalsService, RentalsResolver],
})
export class RentalsModule {}

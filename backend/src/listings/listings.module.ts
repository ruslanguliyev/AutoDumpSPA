import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { SellersModule } from '../sellers/sellers.module';
import { ListingsResolver } from './listings.resolver';
import { ListingsService } from './listings.service';

@Module({
  imports: [PrismaModule, AuthModule, SellersModule],
  providers: [ListingsService, ListingsResolver],
  exports: [ListingsService],
})
export class ListingsModule {}

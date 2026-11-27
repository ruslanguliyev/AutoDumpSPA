import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { SellersModule } from '../sellers/sellers.module';
import { TranslationsModule } from '../translations/translations.module';
import { ListingsResolver } from './listings.resolver';
import { ListingsService } from './listings.service';

@Module({
  imports: [PrismaModule, AuthModule, SellersModule, TranslationsModule],
  providers: [ListingsService, ListingsResolver],
  exports: [ListingsService],
})
export class ListingsModule {}

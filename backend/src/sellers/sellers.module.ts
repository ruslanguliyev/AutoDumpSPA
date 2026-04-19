import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { SellersResolver } from './sellers.resolver';
import { SellersService } from './sellers.service';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [SellersService, SellersResolver],
  exports: [SellersService],
})
export class SellersModule {}

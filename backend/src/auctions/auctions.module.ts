import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ListingsModule } from '../listings/listings.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuctionsGateway } from './auctions.gateway';
import { AuctionsResolver } from './auctions.resolver';
import { AuctionsService } from './auctions.service';

@Module({
  imports: [PrismaModule, AuthModule, ListingsModule],
  providers: [AuctionsService, AuctionsResolver, AuctionsGateway],
  exports: [AuctionsService, AuctionsGateway],
})
export class AuctionsModule {}

import { Module } from '@nestjs/common';
import { AuctionsModule } from '../auctions/auctions.module';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { BidsResolver } from './bids.resolver';
import { BidsService } from './bids.service';

@Module({
  imports: [PrismaModule, AuthModule, AuctionsModule],
  providers: [BidsService, BidsResolver],
})
export class BidsModule {}

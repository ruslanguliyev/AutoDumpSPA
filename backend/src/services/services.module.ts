import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ListingsModule } from '../listings/listings.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ServicesResolver } from './services.resolver';
import { ServicesService } from './services.service';

@Module({
  imports: [PrismaModule, AuthModule, ListingsModule],
  providers: [ServicesService, ServicesResolver],
})
export class ServicesModule {}

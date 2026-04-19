import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ListingsModule } from '../listings/listings.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PartsResolver } from './parts.resolver';
import { PartsService } from './parts.service';

@Module({
  imports: [PrismaModule, AuthModule, ListingsModule],
  providers: [PartsService, PartsResolver],
})
export class PartsModule {}

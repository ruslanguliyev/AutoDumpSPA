import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { SpecialistsResolver } from './specialists.resolver';
import { SpecialistsService } from './specialists.service';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [SpecialistsService, SpecialistsResolver],
  exports: [SpecialistsService],
})
export class SpecialistsModule {}

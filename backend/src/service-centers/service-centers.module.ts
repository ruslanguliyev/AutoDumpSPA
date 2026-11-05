import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ServiceCentersResolver } from './service-centers.resolver';
import { ServiceCentersService } from './service-centers.service';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [ServiceCentersService, ServiceCentersResolver],
  exports: [ServiceCentersService],
})
export class ServiceCentersModule {}

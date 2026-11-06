import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AppointmentsResolver } from './appointments.resolver';
import { AppointmentsService } from './appointments.service';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [AppointmentsService, AppointmentsResolver],
})
export class AppointmentsModule {}

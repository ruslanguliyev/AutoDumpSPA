import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { InquiriesResolver } from './inquiries.resolver';
import { InquiriesService } from './inquiries.service';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [InquiriesService, InquiriesResolver],
})
export class InquiriesModule {}

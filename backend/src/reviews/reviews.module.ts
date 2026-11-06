import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ReviewsResolver } from './reviews.resolver';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [ReviewsService, ReviewsResolver],
})
export class ReviewsModule {}

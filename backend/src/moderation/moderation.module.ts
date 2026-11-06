import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ModerationResolver } from './moderation.resolver';
import { ModerationService } from './moderation.service';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [ModerationService, ModerationResolver],
})
export class ModerationModule {}

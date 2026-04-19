import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { join } from 'path';
import { AuthModule } from '../auth/auth.module';
import { ListingsModule } from '../listings/listings.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadsController } from './uploads.controller';
import { UploadsResolver } from './uploads.resolver';
import { UploadsService } from './uploads.service';

@Module({
  imports: [
    MulterModule.register({
      dest: join(process.cwd(), 'uploads'),
    }),
    PrismaModule,
    AuthModule,
    ListingsModule,
  ],
  controllers: [UploadsController],
  providers: [UploadsService, UploadsResolver],
})
export class UploadsModule {}

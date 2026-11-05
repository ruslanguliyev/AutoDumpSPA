import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { FavoritesResolver } from './favorites.resolver';
import { FavoritesService } from './favorites.service';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [FavoritesService, FavoritesResolver],
})
export class FavoritesModule {}

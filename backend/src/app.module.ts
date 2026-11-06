import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import GraphQLJSON from 'graphql-type-json';
import { join } from 'path';
import { AppResolver } from './app.resolver';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { PartsModule } from './parts/parts.module';
import { ServicesModule } from './services/services.module';
import { SpecialistsModule } from './specialists/specialists.module';
import { ServiceCentersModule } from './service-centers/service-centers.module';
import { SellersModule } from './sellers/sellers.module';
import { MembershipsModule } from './memberships/memberships.module';
import { ListingsModule } from './listings/listings.module';
import { UploadsModule } from './uploads/uploads.module';
import { AuctionsModule } from './auctions/auctions.module';
import { BidsModule } from './bids/bids.module';
import { FavoritesModule } from './favorites/favorites.module';
import { InquiriesModule } from './inquiries/inquiries.module';
import { ModerationModule } from './moderation/moderation.module';
import { RentalsModule } from './rentals/rentals.module';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      path: '/graphql',
      // The schema is public knowledge in dev; hide it in production.
      introspection: process.env.NODE_ENV !== 'production',
      sortSchema: true,
      resolvers: { JSON: GraphQLJSON },
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    VehiclesModule,
    PartsModule,
    ServicesModule,
    ServiceCentersModule,
    SpecialistsModule,
    SellersModule,
    MembershipsModule,
    ListingsModule,
    UploadsModule,
    AuctionsModule,
    BidsModule,
    FavoritesModule,
    InquiriesModule,
    ModerationModule,
    RentalsModule,
  ],
  controllers: [HealthController],
  providers: [AppResolver, AppService],
})
export class AppModule {}

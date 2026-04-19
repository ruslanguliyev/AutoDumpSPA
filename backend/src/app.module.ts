import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AppResolver } from './app.resolver';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { PartsModule } from './parts/parts.module';
import { ServicesModule } from './services/services.module';
import { SpecialistsModule } from './specialists/specialists.module';
import { SellersModule } from './sellers/sellers.module';
import { MembershipsModule } from './memberships/memberships.module';
import { ListingsModule } from './listings/listings.module';
import { UploadsModule } from './uploads/uploads.module';
import { AuctionsModule } from './auctions/auctions.module';
import { BidsModule } from './bids/bids.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      path: '/graphql',
      sortSchema: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    VehiclesModule,
    PartsModule,
    ServicesModule,
    SpecialistsModule,
    SellersModule,
    MembershipsModule,
    ListingsModule,
    UploadsModule,
    AuctionsModule,
    BidsModule,
  ],
  providers: [AppResolver, AppService],
})
export class AppModule {}

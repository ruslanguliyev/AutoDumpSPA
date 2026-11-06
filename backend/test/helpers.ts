import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request = require('supertest');
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

export type GqlResult<T = any> = { data?: T; errors?: Array<{ message: string }> };

export interface TestContext {
  app: INestApplication;
  prisma: PrismaService;
  /** Send a GraphQL operation, optionally authenticated. */
  gql: <T = any>(query: string, variables?: Record<string, unknown>, token?: string) => Promise<GqlResult<T>>;
  /** Register a user and return their token. */
  registerUser: (name: string) => Promise<string>;
  /** Register a user, give them a seller profile and return their token. */
  registerSeller: (name: string, phone?: string) => Promise<string>;
  /** Create a listing with one vehicle for the seller; optionally publish it. */
  createVehicleListing: (
    token: string,
    opts?: { title?: string; brand?: string; model?: string; publish?: boolean },
  ) => Promise<{ listingId: string; vehicleId: string }>;
  /**
   * Create a rental listing (price = per day) with one car and the given terms; optionally publish it.
   */
  createRentalListing: (
    token: string,
    opts?: {
      title?: string;
      brand?: string;
      pricePerDay?: number;
      terms?: Record<string, number>;
      publish?: boolean;
    },
  ) => Promise<{ listingId: string; vehicleId: string }>;
  close: () => Promise<void>;
}

let counter = 0;

export async function createTestContext(): Promise<TestContext> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  // rawBody mirrors main.ts: payment callbacks are signed over the bytes as sent.
  const app = moduleRef.createNestApplication({ rawBody: true });
  await app.init();
  const prisma = app.get(PrismaService);

  // Start every test file from a clean database (users cascade to everything else).
  await prisma.user.deleteMany();

  const gql: TestContext['gql'] = async (query, variables, token) => {
    const req = request(app.getHttpServer()).post('/graphql');
    if (token) req.set('Authorization', `Bearer ${token}`);
    const res = await req.send({ query, variables });
    return res.body;
  };

  const registerUser: TestContext['registerUser'] = async (name) => {
    counter += 1;
    const res = await gql(
      `mutation($e: String!, $p: String!, $f: String!) {
        register(email: $e, password: $p, fullName: $f) { accessToken }
      }`,
      { e: `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${counter}-${Date.now()}@test.local`, p: 'Passw0rd!x', f: name },
    );
    if (!res.data) throw new Error(`register failed: ${JSON.stringify(res.errors)}`);
    return res.data.register.accessToken;
  };

  const registerSeller: TestContext['registerSeller'] = async (name, phone) => {
    const token = await registerUser(name);
    const res = await gql(
      `mutation($input: CreateSellerInput!) { createSeller(input: $input) { id } }`,
      { input: { name, city: 'Baku', type: 'PRIVATE', ...(phone ? { phone } : {}) } },
      token,
    );
    if (!res.data) throw new Error(`createSeller failed: ${JSON.stringify(res.errors)}`);
    return token;
  };

  const createVehicleListing: TestContext['createVehicleListing'] = async (token, opts = {}) => {
    const listing = await gql(
      `mutation($t: String!) { createListing(input: { title: $t, description: "d", price: 1000 }) { id } }`,
      { t: opts.title ?? 'Test car' },
      token,
    );
    const listingId = listing.data!.createListing.id as string;
    const vehicle = await gql(
      `mutation($l: String!, $b: String!, $m: String!) {
        createVehicle(listingId: $l, input: {
          brand: $b, model: $m, year: 2020, mileage: 1000, fuel: "Petrol",
          transmission: "Automatic", engineVolume: 2.0, power: 150, price: 1000, currency: "AZN"
        }) { id }
      }`,
      { l: listingId, b: opts.brand ?? 'Toyota', m: opts.model ?? 'Camry' },
      token,
    );
    const vehicleId = vehicle.data!.createVehicle.id as string;
    if (opts.publish) {
      const pub = await gql(`mutation($id: String!) { publishListing(id: $id) { status } }`, { id: listingId }, token);
      if (!pub.data) throw new Error(`publish failed: ${JSON.stringify(pub.errors)}`);
    }
    return { listingId, vehicleId };
  };

  const createRentalListing: TestContext['createRentalListing'] = async (token, opts = {}) => {
    const price = opts.pricePerDay ?? 50;
    const listing = await gql(
      `mutation($t: String!, $p: Float!) {
        createListing(input: { title: $t, description: "d", price: $p, purpose: RENT }) { id purpose }
      }`,
      { t: opts.title ?? 'Rental car', p: price },
      token,
    );
    if (!listing.data) throw new Error(`createListing failed: ${JSON.stringify(listing.errors)}`);
    const listingId = listing.data.createListing.id as string;
    const vehicle = await gql(
      `mutation($l: String!, $b: String!, $p: Float!) {
        createVehicle(listingId: $l, input: {
          brand: $b, model: "Rent", year: 2022, mileage: 1000, fuel: "Petrol",
          transmission: "Automatic", engineVolume: 2.0, power: 150, price: $p, currency: "AZN", location: "Baku"
        }) { id }
      }`,
      { l: listingId, b: opts.brand ?? 'RentBrand', p: price },
      token,
    );
    const vehicleId = vehicle.data!.createVehicle.id as string;
    if (opts.terms) {
      const terms = await gql(
        `mutation($l: String!, $i: RentalTermsInput!) { setRentalTerms(listingId: $l, input: $i) }`,
        { l: listingId, i: opts.terms },
        token,
      );
      if (!terms.data) throw new Error(`setRentalTerms failed: ${JSON.stringify(terms.errors)}`);
    }
    if (opts.publish) {
      const pub = await gql(`mutation($id: String!) { publishListing(id: $id) { status } }`, { id: listingId }, token);
      if (!pub.data) throw new Error(`publish failed: ${JSON.stringify(pub.errors)}`);
    }
    return { listingId, vehicleId };
  };

  return {
    app,
    prisma,
    gql,
    registerUser,
    registerSeller,
    createVehicleListing,
    createRentalListing,
    close: async () => {
      await app.close();
    },
  };
}

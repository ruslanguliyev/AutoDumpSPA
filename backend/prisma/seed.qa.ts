/**
 * Layout / boundary fixtures for frontend QA. Not part of the default `prisma db seed`.
 * Run: npm run db:seed:qa (requires base seed: dealer1@test.com, dealer2@test.com).
 */
import {
  ListingPurpose,
  ListingStatus,
  Prisma,
  PrismaClient,
  SellerType,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 10;

if (process.env.NODE_ENV === 'production') {
  console.error('seed.qa.ts refuses to run when NODE_ENV=production');
  process.exit(1);
}

/** Stable keys for idempotent upserts (sellerId + title). */
const SEED_RENT = {
  economy1Azn: '[SEED RENT] Economy class Toyota Yaris 1 AZN/day',
  suvMid: '[SEED RENT] SUV class Toyota Land Cruiser',
  premiumMaxPrice: '[SEED RENT] Premium class Rolls-Royce Ghost max price',
  noDeposit: '[SEED RENT] Compact class Kia Rio no deposit',
  title60NoPhoto: 'Avtobaz seed rent listing title exactly sixty characters!!!!',
  hotPremium: '[SEED RENT] Mercedes G63 HOT plus PREMIUM',
} as const;

const SEED_SALE = {
  title60NoPhoto: 'Avtobaz seed sale vehicle listing title sixty characters t!!',
  priceMin: '[SEED SALE] Lada Samara price 1 AZN',
} as const;

const QA_SELLER_EMAILS = [
  'dealer-zero-reviews@test.com',
  'dealer-10k-reviews@test.com',
] as const;

type Tx = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

const seedPromotedUntil = () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

const baseVehicle = {
  year: 2021,
  mileage: 25_000,
  fuel: 'Petrol',
  transmission: 'Automatic',
  engineVolume: 2.0,
  power: 150,
  drive: 'FWD',
  condition: 'used',
  color: 'White',
  vehicleType: 'car',
  currency: 'AZN',
  location: 'Baku',
  description: 'Seed fixture for frontend layout checks.',
  isCreditAvailable: false,
  isBarterAvailable: false,
  hasDamage: false,
  isRepainted: false,
  wasInAccident: false,
  ownersCount: 1,
  seatsCount: 5,
  marketRegion: null,
} as const;

async function upsertRentListing(
  tx: Tx,
  params: {
    sellerId: string;
    title: string;
    pricePerDay: number;
    description: string;
    vehicle: Omit<Prisma.VehicleUncheckedCreateInput, 'listingId'>;
    terms: {
      deposit?: number | null;
      minDays?: number;
      maxDays?: number | null;
      kmPerDay?: number | null;
      minDriverAge?: number | null;
    };
    listingExtra?: Partial<{
      promotionRank: number;
      promotedUntil: Date | null;
    }>;
  },
) {
  const { sellerId, title, pricePerDay, description, vehicle, terms, listingExtra } = params;

  let listing = await tx.listing.findFirst({ where: { sellerId, title } });
  const listingData = {
    title,
    description,
    price: pricePerDay,
    status: ListingStatus.ACTIVE,
    purpose: ListingPurpose.RENT,
    sellerId,
    ...listingExtra,
  };

  if (!listing) {
    listing = await tx.listing.create({ data: listingData });
  } else {
    listing = await tx.listing.update({ where: { id: listing.id }, data: listingData });
  }

  await tx.rentalTerms.upsert({
    where: { listingId: listing.id },
    create: {
      listingId: listing.id,
      deposit: terms.deposit ?? null,
      minDays: terms.minDays ?? 1,
      maxDays: terms.maxDays ?? null,
      kmPerDay: terms.kmPerDay ?? null,
      minDriverAge: terms.minDriverAge ?? null,
    },
    update: {
      deposit: terms.deposit ?? null,
      minDays: terms.minDays ?? 1,
      maxDays: terms.maxDays ?? null,
      kmPerDay: terms.kmPerDay ?? null,
      minDriverAge: terms.minDriverAge ?? null,
    },
  });

  const existing = await tx.vehicle.findFirst({ where: { listingId: listing.id } });
  if (existing) {
    await tx.vehicle.update({ where: { id: existing.id }, data: vehicle });
  } else {
    await tx.vehicle.create({ data: { listingId: listing.id, ...vehicle } });
  }

  return listing;
}

async function upsertSaleListing(
  tx: Tx,
  params: {
    sellerId: string;
    title: string;
    price: number;
    description: string;
    vehicle: Omit<Prisma.VehicleUncheckedCreateInput, 'listingId'>;
    listingExtra?: Partial<{
      promotionRank: number;
      promotedUntil: Date | null;
    }>;
  },
) {
  const { sellerId, title, price, description, vehicle, listingExtra } = params;

  let listing = await tx.listing.findFirst({ where: { sellerId, title } });
  const listingData = {
    title,
    description,
    price,
    status: ListingStatus.ACTIVE,
    purpose: ListingPurpose.SALE,
    sellerId,
    ...listingExtra,
  };

  if (!listing) {
    listing = await tx.listing.create({ data: listingData });
  } else {
    listing = await tx.listing.update({ where: { id: listing.id }, data: listingData });
  }

  const existing = await tx.vehicle.findFirst({ where: { listingId: listing.id } });
  if (existing) {
    await tx.vehicle.update({ where: { id: existing.id }, data: vehicle });
  } else {
    await tx.vehicle.create({ data: { listingId: listing.id, ...vehicle } });
  }

  return listing;
}

async function requireDealerSeller(tx: Tx, email: string) {
  const seller = await tx.seller.findFirst({
    where: { user: { email } },
  });
  if (!seller) {
    throw new Error(`Base seed missing seller for ${email}. Run: npx prisma db seed`);
  }
  return seller;
}

async function main() {
  const passwordHash = await bcrypt.hash('password123', BCRYPT_ROUNDS);

  await prisma.$transaction(async (tx) => {
    const seller1 = await requireDealerSeller(tx, 'dealer1@test.com');
    const seller2 = await requireDealerSeller(tx, 'dealer2@test.com');

    const dealerZeroUser = await tx.user.upsert({
      where: { email: 'dealer-zero-reviews@test.com' },
      create: {
        email: 'dealer-zero-reviews@test.com',
        passwordHash,
        fullName: 'Zero Reviews Motors',
        role: UserRole.DEALER,
      },
      update: {
        passwordHash,
        fullName: 'Zero Reviews Motors',
        role: UserRole.DEALER,
      },
    });

    const sellerZeroReviews = await tx.seller.upsert({
      where: { userId: dealerZeroUser.id },
      create: {
        userId: dealerZeroUser.id,
        type: SellerType.DEALER,
        name: 'Zero Reviews Motors',
        city: 'Baku',
        phone: '+994507070707',
        rating: 0,
        reviewsCount: 0,
        verified: true,
      },
      update: {
        type: SellerType.DEALER,
        name: 'Zero Reviews Motors',
        city: 'Baku',
        phone: '+994507070707',
        rating: 0,
        reviewsCount: 0,
        verified: true,
      },
    });

    const dealerManyUser = await tx.user.upsert({
      where: { email: 'dealer-10k-reviews@test.com' },
      create: {
        email: 'dealer-10k-reviews@test.com',
        passwordHash,
        fullName: 'Ten Thousand Reviews Auto',
        role: UserRole.DEALER,
      },
      update: {
        passwordHash,
        fullName: 'Ten Thousand Reviews Auto',
        role: UserRole.DEALER,
      },
    });

    const seller10kReviews = await tx.seller.upsert({
      where: { userId: dealerManyUser.id },
      create: {
        userId: dealerManyUser.id,
        type: SellerType.DEALER,
        name: 'Ten Thousand Reviews Auto',
        city: 'Baku',
        phone: '+994509090909',
        rating: 4.7,
        reviewsCount: 10_000,
        verified: true,
      },
      update: {
        type: SellerType.DEALER,
        name: 'Ten Thousand Reviews Auto',
        city: 'Baku',
        phone: '+994509090909',
        rating: 4.7,
        reviewsCount: 10_000,
        verified: true,
      },
    });

    const promotedUntil = seedPromotedUntil();

    await upsertRentListing(tx, {
      sellerId: sellerZeroReviews.id,
      title: SEED_RENT.economy1Azn,
      pricePerDay: 1,
      description: 'Economy class — minimum price per day (1 AZN).',
      terms: { deposit: 500, minDays: 1, maxDays: 14, kmPerDay: 120, minDriverAge: 21 },
      vehicle: {
        ...baseVehicle,
        brand: 'Toyota',
        model: 'Yaris',
        version: 'Economy',
        bodyType: 'sedan',
        year: 2019,
        mileage: 85_000,
        engineVolume: 1.3,
        power: 98,
        price: 1,
        imageUrls: ['/uploads/placeholder-car.jpg'],
        isHot: false,
      },
    });

    await upsertRentListing(tx, {
      sellerId: seller1.id,
      title: SEED_RENT.suvMid,
      pricePerDay: 180,
      description: 'SUV class — higher deposit and capped km/day.',
      terms: { deposit: 2500, minDays: 2, maxDays: 30, kmPerDay: 200, minDriverAge: 23 },
      vehicle: {
        ...baseVehicle,
        brand: 'Toyota',
        model: 'Land Cruiser',
        version: 'Prado',
        bodyType: 'suv',
        year: 2020,
        mileage: 60_000,
        engineVolume: 2.8,
        power: 204,
        drive: 'AWD',
        price: 180,
        imageUrls: ['/uploads/placeholder-car.jpg'],
        isHot: false,
      },
    });

    await upsertRentListing(tx, {
      sellerId: seller2.id,
      title: SEED_RENT.premiumMaxPrice,
      pricePerDay: 1_999_999,
      description: 'Premium class — maximum price per day for formatter overflow checks.',
      terms: { deposit: 50_000, minDays: 3, maxDays: 7, kmPerDay: 100, minDriverAge: 25 },
      vehicle: {
        ...baseVehicle,
        brand: 'Rolls-Royce',
        model: 'Ghost',
        version: 'Extended',
        bodyType: 'sedan',
        year: 2022,
        mileage: 5_000,
        engineVolume: 6.75,
        power: 563,
        drive: 'AWD',
        price: 1_999_999,
        imageUrls: ['/uploads/placeholder-car.jpg'],
        isHot: false,
      },
    });

    await upsertRentListing(tx, {
      sellerId: seller1.id,
      title: SEED_RENT.noDeposit,
      pricePerDay: 55,
      description: 'Compact class — rental terms without deposit.',
      terms: { deposit: null, minDays: 1, maxDays: 21, kmPerDay: null, minDriverAge: 21 },
      vehicle: {
        ...baseVehicle,
        brand: 'Kia',
        model: 'Rio',
        version: 'LX',
        bodyType: 'hatchback',
        year: 2018,
        mileage: 110_000,
        engineVolume: 1.4,
        power: 100,
        price: 55,
        imageUrls: ['/uploads/placeholder-car.jpg'],
        isHot: false,
      },
    });

    await upsertRentListing(tx, {
      sellerId: seller10kReviews.id,
      title: SEED_RENT.title60NoPhoto,
      pricePerDay: 90,
      description: 'Sixty-character listing title and empty gallery.',
      terms: { deposit: 800, minDays: 2, maxDays: 10, kmPerDay: 150, minDriverAge: 22 },
      vehicle: {
        ...baseVehicle,
        brand: 'Hyundai',
        model: 'Elantra',
        version: 'Comfort Premium Long Trim Name For Layout Overflow QA Test 60ch',
        bodyType: 'sedan',
        year: 2020,
        mileage: 45_000,
        price: 90,
        imageUrls: [],
        isHot: false,
      },
    });

    await upsertRentListing(tx, {
      sellerId: seller2.id,
      title: SEED_RENT.hotPremium,
      pricePerDay: 650,
      description: 'PREMIUM placement plus HOT badge for badge overlap checks.',
      terms: { deposit: 3000, minDays: 2, maxDays: 14, kmPerDay: 250, minDriverAge: 24 },
      listingExtra: { promotionRank: 2, promotedUntil },
      vehicle: {
        ...baseVehicle,
        brand: 'Mercedes-Benz',
        model: 'G-Class',
        version: 'G63 AMG',
        bodyType: 'suv',
        year: 2021,
        mileage: 22_000,
        engineVolume: 4.0,
        power: 585,
        drive: 'AWD',
        price: 650,
        imageUrls: ['/uploads/placeholder-car.jpg'],
        isHot: true,
      },
    });

    await upsertSaleListing(tx, {
      sellerId: seller10kReviews.id,
      title: SEED_SALE.title60NoPhoto,
      price: 42_500,
      description: 'Sale listing — 60-character title, seller with 10k reviews, no photos.',
      vehicle: {
        ...baseVehicle,
        brand: 'Skoda',
        model: 'Octavia',
        version: 'Style',
        bodyType: 'wagon',
        year: 2017,
        mileage: 130_000,
        price: 42_500,
        imageUrls: [],
        isHot: false,
      },
    });

    await upsertSaleListing(tx, {
      sellerId: sellerZeroReviews.id,
      title: SEED_SALE.priceMin,
      price: 1,
      description: 'Sale listing — minimum price (1 AZN), seller with zero reviews.',
      vehicle: {
        ...baseVehicle,
        brand: 'VAZ',
        model: '2107',
        version: null,
        bodyType: 'sedan',
        year: 1998,
        mileage: 280_000,
        engineVolume: 1.6,
        power: 72,
        price: 1,
        imageUrls: [],
        isHot: false,
      },
    });
  });

  const qaRentTitles = Object.values(SEED_RENT);
  const qaSaleTitles = Object.values(SEED_SALE);

  const [rentCount, saleCount, qaSellerCount] = await Promise.all([
    prisma.vehicle.count({
      where: {
        listing: {
          purpose: ListingPurpose.RENT,
          status: ListingStatus.ACTIVE,
          title: { in: [...qaRentTitles] },
        },
      },
    }),
    prisma.vehicle.count({
      where: {
        listing: {
          purpose: ListingPurpose.SALE,
          status: ListingStatus.ACTIVE,
          title: { in: [...qaSaleTitles] },
        },
      },
    }),
    prisma.seller.count({
      where: { user: { email: { in: [...QA_SELLER_EMAILS] } } },
    }),
  ]);

  console.log(
    `QA seed completed: ${rentCount} RENT, ${saleCount} SALE fixtures, ${qaSellerCount} QA sellers.`,
  );

  if (rentCount !== 6 || saleCount !== 2 || qaSellerCount !== 2) {
    throw new Error(
      `QA seed counts mismatch (expected 6 RENT, 2 SALE, 2 sellers; got ${rentCount}, ${saleCount}, ${qaSellerCount}).`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

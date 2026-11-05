import {
  ListingStatus,
  PrismaClient,
  SellerType,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 10;

async function main() {
  const passwordHash = await bcrypt.hash('password123', BCRYPT_ROUNDS);

  await prisma.$transaction(async (tx) => {
    const specialist1User = await tx.user.upsert({
      where: { email: 'specialist1@test.com' },
      create: {
        email: 'specialist1@test.com',
        passwordHash,
        fullName: 'Rashid Mammadov',
        role: UserRole.SPECIALIST,
      },
      update: {
        passwordHash,
        fullName: 'Rashid Mammadov',
        role: UserRole.SPECIALIST,
      },
    });

    const specialist2User = await tx.user.upsert({
      where: { email: 'specialist2@test.com' },
      create: {
        email: 'specialist2@test.com',
        passwordHash,
        fullName: 'Kamran Aliyev',
        role: UserRole.SPECIALIST,
      },
      update: {
        passwordHash,
        fullName: 'Kamran Aliyev',
        role: UserRole.SPECIALIST,
      },
    });

    const service1User = await tx.user.upsert({
      where: { email: 'service1@test.com' },
      create: {
        email: 'service1@test.com',
        passwordHash,
        fullName: 'Elite Auto Service',
        role: UserRole.SERVICE,
      },
      update: {
        passwordHash,
        fullName: 'Elite Auto Service',
        role: UserRole.SERVICE,
      },
    });

    const service2User = await tx.user.upsert({
      where: { email: 'service2@test.com' },
      create: {
        email: 'service2@test.com',
        passwordHash,
        fullName: 'Premium Garage',
        role: UserRole.SERVICE,
      },
      update: {
        passwordHash,
        fullName: 'Premium Garage',
        role: UserRole.SERVICE,
      },
    });

    const dealer1User = await tx.user.upsert({
      where: { email: 'dealer1@test.com' },
      create: {
        email: 'dealer1@test.com',
        passwordHash,
        fullName: 'Auto Broker Alex',
        role: UserRole.DEALER,
      },
      update: {
        passwordHash,
        fullName: 'Auto Broker Alex',
        role: UserRole.DEALER,
      },
    });

    const dealer2User = await tx.user.upsert({
      where: { email: 'dealer2@test.com' },
      create: {
        email: 'dealer2@test.com',
        passwordHash,
        fullName: 'BMW Cars AutoSalon',
        role: UserRole.DEALER,
      },
      update: {
        passwordHash,
        fullName: 'BMW Cars AutoSalon',
        role: UserRole.DEALER,
      },
    });

    const partsDealer1User = await tx.user.upsert({
      where: { email: 'partsdealer1@test.com' },
      create: {
        email: 'partsdealer1@test.com',
        passwordHash,
        fullName: 'Xirdalan Parts',
        role: UserRole.PARTS_DEALER,
      },
      update: {
        passwordHash,
        fullName: 'Xirdalan Parts',
        role: UserRole.PARTS_DEALER,
      },
    });

    await tx.seller.upsert({
      where: { userId: partsDealer1User.id },
      create: {
        userId: partsDealer1User.id,
        type: SellerType.PARTS_DEALER,
        name: 'Xirdalan Parts',
        city: 'Baku',
        rating: 4.8,
        verified: true,
      },
      update: {
        type: SellerType.PARTS_DEALER,
        name: 'Xirdalan Parts',
        city: 'Baku',
        rating: 4.8,
        verified: true,
      },
    });

    const seller1 = await tx.seller.upsert({
      where: { userId: dealer1User.id },
      create: {
        userId: dealer1User.id,
        type: SellerType.DEALER,
        name: 'Auto Broker Alex',
        city: 'Baku',
        rating: 4.6,
        verified: true,
      },
      update: {
        type: SellerType.DEALER,
        name: 'Auto Broker Alex',
        city: 'Baku',
        rating: 4.6,
        verified: true,
      },
    });

    const seller2 = await tx.seller.upsert({
      where: { userId: dealer2User.id },
      create: {
        userId: dealer2User.id,
        type: SellerType.DEALER,
        name: 'BMW Cars AutoSalon',
        city: 'Baku',
        rating: 4.8,
        verified: true,
      },
      update: {
        type: SellerType.DEALER,
        name: 'BMW Cars AutoSalon',
        city: 'Baku',
        rating: 4.8,
        verified: true,
      },
    });

    let listingBrake = await tx.listing.findFirst({
      where: { sellerId: seller1.id, title: 'Brake Pads BMW X5' },
    });
    if (!listingBrake) {
      listingBrake = await tx.listing.create({
        data: {
          title: 'Brake Pads BMW X5',
          description: 'Front brake pads OEM',
          price: 120,
          status: ListingStatus.ACTIVE,
          sellerId: seller1.id,
        },
      });
    }

    const partBrake = await tx.part.findFirst({
      where: { listingId: listingBrake.id },
    });
    const brakeData = {
      name: 'Brake pads',
      category: 'Brakes',
      brand: 'BMW',
      model: 'X5',
      condition: 'New',
      oemCode: 'BMW-123',
      stock: 5,
      description: 'Front brake pads OEM',
      price: 120,
      currency: 'AZN',
      imageUrl: null,
      compatibility: ['X5 E70', 'X5 F15'],
      location: 'Baku',
    };
    if (partBrake) {
      await tx.part.update({ where: { id: partBrake.id }, data: brakeData });
    } else {
      await tx.part.create({
        data: { listingId: listingBrake.id, ...brakeData },
      });
    }

    let listingHeadlight = await tx.listing.findFirst({
      where: { sellerId: seller2.id, title: 'Headlight Mercedes C-Class' },
    });
    if (!listingHeadlight) {
      listingHeadlight = await tx.listing.create({
        data: {
          title: 'Headlight Mercedes C-Class',
          description: 'Left headlight',
          price: 180,
          status: ListingStatus.ACTIVE,
          sellerId: seller2.id,
        },
      });
    }

    const partHeadlight = await tx.part.findFirst({
      where: { listingId: listingHeadlight.id },
    });
    const headlightData = {
      name: 'Headlight',
      category: 'Lighting',
      brand: 'Mercedes',
      model: 'C-Class',
      condition: 'Used',
      oemCode: null,
      stock: 1,
      description: 'Left headlight assembly',
      price: 180,
      currency: 'AZN',
      imageUrl: null,
      compatibility: ['C200', 'C220'],
      location: 'Baku',
    };
    if (partHeadlight) {
      await tx.part.update({
        where: { id: partHeadlight.id },
        data: headlightData,
      });
    } else {
      await tx.part.create({
        data: { listingId: listingHeadlight.id, ...headlightData },
      });
    }

    let listingBentley = await tx.listing.findFirst({
      where: { sellerId: seller1.id, title: 'Bentley Continental GT W12' },
    });
    if (!listingBentley) {
      listingBentley = await tx.listing.create({
        data: {
          title: 'Bentley Continental GT W12',
          description: 'Handcrafted luxury grand tourer.',
          price: 229000,
          status: ListingStatus.ACTIVE,
          sellerId: seller1.id,
        },
      });
    }

    const vehicleBentley = await tx.vehicle.findFirst({
      where: { listingId: listingBentley.id },
    });
    const bentleyData = {
      brand: 'Bentley',
      model: 'Continental GT',
      version: 'W12 Speed',
      year: 2020,
      mileage: 34000,
      fuel: 'Petrol',
      transmission: 'Automatic',
      engineVolume: 6.0,
      power: 660,
      drive: 'AWD',
      condition: 'used',
      color: 'White',
      vehicleType: 'car',
      price: 229000,
      currency: 'AZN',
      location: 'Baku',
      description: 'Handcrafted luxury grand tourer.',
      imageUrls: [],
      isHot: false,
      isCreditAvailable: true,
      isBarterAvailable: true,
      hasDamage: false,
      isRepainted: false,
      wasInAccident: false,
      ownersCount: 1,
      seatsCount: 4,
      marketRegion: null,
    };
    if (vehicleBentley) {
      await tx.vehicle.update({
        where: { id: vehicleBentley.id },
        data: bentleyData,
      });
    } else {
      await tx.vehicle.create({
        data: { listingId: listingBentley.id, ...bentleyData },
      });
    }

    let listingGClass = await tx.listing.findFirst({
      where: { sellerId: seller2.id, title: 'Mercedes-Benz G-Class G63 AMG' },
    });
    if (!listingGClass) {
      listingGClass = await tx.listing.create({
        data: {
          title: 'Mercedes-Benz G-Class G63 AMG',
          description: 'Luxury SUV with iconic design.',
          price: 189900,
          status: ListingStatus.ACTIVE,
          sellerId: seller2.id,
        },
      });
    }

    const vehicleGClass = await tx.vehicle.findFirst({
      where: { listingId: listingGClass.id },
    });
    const gClassData = {
      brand: 'Mercedes-Benz',
      model: 'G-Class',
      version: 'G63 AMG',
      year: 2019,
      mileage: 45000,
      fuel: 'Petrol',
      transmission: 'Automatic',
      engineVolume: 4.0,
      power: 585,
      drive: 'AWD',
      condition: 'used',
      color: 'Gray',
      vehicleType: 'car',
      price: 189900,
      currency: 'AZN',
      location: 'Baku',
      description: 'Luxury SUV with iconic design.',
      imageUrls: [],
      isHot: true,
      isCreditAvailable: false,
      isBarterAvailable: false,
      hasDamage: false,
      isRepainted: false,
      wasInAccident: false,
      ownersCount: 2,
      seatsCount: 5,
      marketRegion: null,
    };
    if (vehicleGClass) {
      await tx.vehicle.update({
        where: { id: vehicleGClass.id },
        data: gClassData,
      });
    } else {
      await tx.vehicle.create({
        data: { listingId: listingGClass.id, ...gClassData },
      });
    }

    const spec1 = await tx.specialist.upsert({
      where: { slug: 'rashid-mammadov' },
      create: {
        userId: specialist1User.id,
        name: 'Rashid Mammadov',
        slug: 'rashid-mammadov',
        bio: 'Профессиональный автомеханик с 12-летним опытом',
        city: 'Baku',
        phone: '+994501234567',
        skills: ['ENGINE', 'DIAGNOSTICS'],
        specializations: ['ENGINE', 'DIAGNOSTICS'],
        experience: 12,
        rating: 4.8,
        reviewsCount: 124,
        priceFrom: 25,
        mobileService: true,
        verified: true,
        available: true,
        portfolio: [],
      },
      update: {
        userId: specialist1User.id,
        name: 'Rashid Mammadov',
        bio: 'Профессиональный автомеханик с 12-летним опытом',
        city: 'Baku',
        phone: '+994501234567',
        skills: ['ENGINE', 'DIAGNOSTICS'],
        specializations: ['ENGINE', 'DIAGNOSTICS'],
        experience: 12,
        rating: 4.8,
        reviewsCount: 124,
        priceFrom: 25,
        mobileService: true,
        verified: true,
        available: true,
        portfolio: [],
      },
    });

    await tx.specialistVehicle.deleteMany({
      where: { specialistId: spec1.id },
    });
    await tx.specialistVehicle.createMany({
      data: [
        {
          specialistId: spec1.id,
          brand: 'BMW',
          model: 'X5',
          yearFrom: 2015,
          yearTo: 2023,
        },
        {
          specialistId: spec1.id,
          brand: 'Mercedes',
          model: 'E-Class',
          yearFrom: 2016,
          yearTo: 2023,
        },
      ],
    });

    const spec2 = await tx.specialist.upsert({
      where: { slug: 'kamran-aliyev' },
      create: {
        userId: specialist2User.id,
        name: 'Kamran Aliyev',
        slug: 'kamran-aliyev',
        bio: 'Специалист по коробкам передач и подвеске',
        city: 'Sumqayit',
        phone: '+994557654321',
        skills: ['TRANSMISSION', 'SUSPENSION'],
        specializations: ['TRANSMISSION', 'SUSPENSION'],
        experience: 9,
        rating: 4.6,
        reviewsCount: 88,
        priceFrom: 20,
        mobileService: false,
        verified: true,
        available: true,
        portfolio: [],
      },
      update: {
        userId: specialist2User.id,
        name: 'Kamran Aliyev',
        bio: 'Специалист по коробкам передач и подвеске',
        city: 'Sumqayit',
        phone: '+994557654321',
        skills: ['TRANSMISSION', 'SUSPENSION'],
        specializations: ['TRANSMISSION', 'SUSPENSION'],
        experience: 9,
        rating: 4.6,
        reviewsCount: 88,
        priceFrom: 20,
        mobileService: false,
        verified: true,
        available: true,
        portfolio: [],
      },
    });

    await tx.specialistVehicle.deleteMany({
      where: { specialistId: spec2.id },
    });
    await tx.specialistVehicle.createMany({
      data: [
        {
          specialistId: spec2.id,
          brand: 'Audi',
          model: 'A4',
          yearFrom: 2014,
          yearTo: 2022,
        },
      ],
    });

    const sc1Schedule = {
      mon: '09:00-18:00',
      tue: '09:00-18:00',
      wed: '09:00-18:00',
      thu: '09:00-18:00',
      fri: '09:00-18:00',
      sat: '10:00-16:00',
      sun: null,
    };
    const sc1Contacts = {
      phone: '+994123456789',
      whatsapp: '+994123456789',
    };

    const center1 = await tx.serviceCenter.upsert({
      where: { userId: service1User.id },
      create: {
        userId: service1User.id,
        name: 'Elite Detailing Baku',
        slug: 'elite-detailing-baku',
        type: 'DETAILING',
        description: 'Профессиональный детейлинг и полировка',
        city: 'Baku',
        address: 'Nizami küçəsi 45, Baku',
        phone: '+994123456789',
        website: 'https://elite-detailing.az',
        logoUrl: null,
        coverImage: null,
        gallery: [],
        categories: ['DETAILING', 'PAINT_PROTECTION'],
        supportedBrands: ['BMW', 'Mercedes', 'Audi', 'Porsche'],
        rating: 4.9,
        reviewsCount: 89,
        verified: true,
        isActive: true,
        schedule: sc1Schedule,
        contacts: sc1Contacts,
      },
      update: {
        name: 'Elite Detailing Baku',
        slug: 'elite-detailing-baku',
        type: 'DETAILING',
        description: 'Профессиональный детейлинг и полировка',
        city: 'Baku',
        address: 'Nizami küçəsi 45, Baku',
        phone: '+994123456789',
        website: 'https://elite-detailing.az',
        logoUrl: null,
        coverImage: null,
        gallery: [],
        categories: ['DETAILING', 'PAINT_PROTECTION'],
        supportedBrands: ['BMW', 'Mercedes', 'Audi', 'Porsche'],
        rating: 4.9,
        reviewsCount: 89,
        verified: true,
        isActive: true,
        schedule: sc1Schedule,
        contacts: sc1Contacts,
      },
    });

    await tx.serviceCenterService.deleteMany({
      where: { serviceCenterId: center1.id },
    });
    await tx.serviceCenterService.createMany({
      data: [
        {
          serviceCenterId: center1.id,
          code: 'DETAIL_FULL',
          title: 'Полный детейлинг',
          category: 'DETAILING',
          priceFrom: 150,
          priceTo: 300,
          currency: 'AZN',
          durationMin: 240,
          popular: true,
          applicableBrands: [],
        },
        {
          serviceCenterId: center1.id,
          code: 'POLISH',
          title: 'Полировка кузова',
          category: 'DETAILING',
          priceFrom: 80,
          priceTo: 200,
          currency: 'AZN',
          durationMin: 120,
          popular: false,
          applicableBrands: [],
        },
      ],
    });

    const sc2Schedule = {
      mon: '08:00-19:00',
      tue: '08:00-19:00',
      wed: '08:00-19:00',
      thu: '08:00-19:00',
      fri: '08:00-19:00',
      sat: '09:00-17:00',
      sun: null,
    };
    const sc2Contacts = { phone: '+994987654321' };

    const center2 = await tx.serviceCenter.upsert({
      where: { userId: service2User.id },
      create: {
        userId: service2User.id,
        name: 'Premium Auto Garage',
        slug: 'premium-auto-garage',
        type: 'GARAGE',
        description: 'Полный спектр услуг по ремонту и обслуживанию',
        city: 'Baku',
        address: 'Hüsü Hacıyev küçəsi 12, Baku',
        phone: '+994987654321',
        website: null,
        logoUrl: null,
        coverImage: null,
        gallery: [],
        categories: ['MAINTENANCE', 'REPAIR', 'DIAGNOSTICS'],
        supportedBrands: ['BMW', 'Audi', 'Volkswagen', 'Toyota'],
        rating: 4.8,
        reviewsCount: 342,
        verified: true,
        isActive: true,
        schedule: sc2Schedule,
        contacts: sc2Contacts,
      },
      update: {
        name: 'Premium Auto Garage',
        slug: 'premium-auto-garage',
        type: 'GARAGE',
        description: 'Полный спектр услуг по ремонту и обслуживанию',
        city: 'Baku',
        address: 'Hüsü Hacıyev küçəsi 12, Baku',
        phone: '+994987654321',
        website: null,
        logoUrl: null,
        coverImage: null,
        gallery: [],
        categories: ['MAINTENANCE', 'REPAIR', 'DIAGNOSTICS'],
        supportedBrands: ['BMW', 'Audi', 'Volkswagen', 'Toyota'],
        rating: 4.8,
        reviewsCount: 342,
        verified: true,
        isActive: true,
        schedule: sc2Schedule,
        contacts: sc2Contacts,
      },
    });

    await tx.serviceCenterService.deleteMany({
      where: { serviceCenterId: center2.id },
    });
    await tx.serviceCenterService.createMany({
      data: [
        {
          serviceCenterId: center2.id,
          code: 'OIL_CHANGE',
          title: 'Замена масла',
          category: 'MAINTENANCE',
          priceFrom: 30,
          priceTo: 60,
          currency: 'AZN',
          durationMin: 30,
          popular: true,
          applicableBrands: [],
        },
        {
          serviceCenterId: center2.id,
          code: 'DIAGNOSTICS',
          title: 'Компьютерная диагностика',
          category: 'DIAGNOSTICS',
          priceFrom: 20,
          priceTo: 20,
          currency: 'AZN',
          durationMin: 45,
          popular: true,
          applicableBrands: [],
        },
      ],
    });
  });

  console.log('Seed completed: users, specialists, service centers.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

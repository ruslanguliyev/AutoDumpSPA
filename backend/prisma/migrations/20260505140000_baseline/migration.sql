-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'PRIVATE_SELLER', 'DEALER', 'PARTS_DEALER', 'SERVICE', 'SPECIALIST', 'ADMIN');

-- CreateEnum
CREATE TYPE "SellerType" AS ENUM ('PRIVATE', 'DEALER', 'PARTS_DEALER');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'READ');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SOLD');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seller" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "SellerType" NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "phone" TEXT,
    "showPhone" BOOLEAN NOT NULL DEFAULT true,
    "rating" DOUBLE PRECISION NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Seller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "status" "ListingStatus" NOT NULL,
    "sellerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "generation" TEXT DEFAULT '',
    "version" TEXT,
    "year" INTEGER NOT NULL,
    "mileage" INTEGER NOT NULL,
    "fuel" TEXT NOT NULL,
    "transmission" TEXT NOT NULL,
    "displacement" TEXT,
    "horsepower" TEXT,
    "engineVolume" DOUBLE PRECISION NOT NULL,
    "power" INTEGER NOT NULL,
    "drive" TEXT,
    "condition" TEXT NOT NULL DEFAULT 'used',
    "color" TEXT,
    "vehicleType" TEXT NOT NULL DEFAULT 'car',
    "price" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'AZN',
    "location" TEXT,
    "description" TEXT,
    "imageUrls" TEXT[],
    "isHot" BOOLEAN NOT NULL DEFAULT false,
    "isCreditAvailable" BOOLEAN NOT NULL DEFAULT false,
    "isBarterAvailable" BOOLEAN NOT NULL DEFAULT false,
    "hasDamage" BOOLEAN NOT NULL DEFAULT false,
    "isRepainted" BOOLEAN NOT NULL DEFAULT false,
    "wasInAccident" BOOLEAN NOT NULL DEFAULT false,
    "ownersCount" INTEGER NOT NULL DEFAULT 1,
    "seatsCount" INTEGER,
    "marketRegion" TEXT,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Part" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "oemCode" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "price" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'AZN',
    "imageUrl" TEXT,
    "compatibility" TEXT[],
    "location" TEXT,

    CONSTRAINT "Part_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categories" TEXT[],
    "supportedBrands" TEXT[],
    "city" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceCenter" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "description" TEXT,
    "legalName" TEXT,
    "type" TEXT,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "coverImage" TEXT,
    "gallery" TEXT[],
    "categories" TEXT[],
    "supportedBrands" TEXT[],
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewsCount" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "schedule" JSONB,
    "contacts" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceCenter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceCenterService" (
    "id" TEXT NOT NULL,
    "serviceCenterId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priceFrom" DECIMAL(10,2),
    "priceTo" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'AZN',
    "durationMin" INTEGER,
    "applicableBrands" TEXT[],
    "popular" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ServiceCenterService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Specialist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bio" TEXT,
    "city" TEXT NOT NULL,
    "phone" TEXT,
    "whatsapp" TEXT,
    "avatarUrl" TEXT,
    "coverImage" TEXT,
    "skills" TEXT[],
    "specializations" TEXT[],
    "experience" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewsCount" INTEGER NOT NULL DEFAULT 0,
    "hourlyRate" DECIMAL(10,2),
    "priceFrom" DECIMAL(10,2),
    "mobileService" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "portfolio" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Specialist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialistVehicle" (
    "id" TEXT NOT NULL,
    "specialistId" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "yearFrom" INTEGER,
    "yearTo" INTEGER,

    CONSTRAINT "SpecialistVehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auction" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "startPrice" DECIMAL(12,2) NOT NULL,
    "currentPrice" DECIMAL(12,2) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Auction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bid" (
    "id" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "phone" TEXT,
    "status" "InquiryStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Seller_userId_key" ON "Seller"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCenter_userId_key" ON "ServiceCenter"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCenter_slug_key" ON "ServiceCenter"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Specialist_userId_key" ON "Specialist"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Specialist_slug_key" ON "Specialist"("slug");

-- CreateIndex
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_type_itemId_key" ON "Favorite"("userId", "type", "itemId");

-- CreateIndex
CREATE INDEX "Inquiry_listingId_idx" ON "Inquiry"("listingId");

-- CreateIndex
CREATE INDEX "Inquiry_fromUserId_idx" ON "Inquiry"("fromUserId");

-- AddForeignKey
ALTER TABLE "Seller" ADD CONSTRAINT "Seller_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Part" ADD CONSTRAINT "Part_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceCenter" ADD CONSTRAINT "ServiceCenter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceCenterService" ADD CONSTRAINT "ServiceCenterService_serviceCenterId_fkey" FOREIGN KEY ("serviceCenterId") REFERENCES "ServiceCenter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specialist" ADD CONSTRAINT "Specialist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialistVehicle" ADD CONSTRAINT "SpecialistVehicle_specialistId_fkey" FOREIGN KEY ("specialistId") REFERENCES "Specialist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


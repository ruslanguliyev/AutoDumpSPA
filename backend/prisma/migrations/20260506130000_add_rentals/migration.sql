-- CreateEnum
CREATE TYPE "ListingPurpose" AS ENUM ('SALE', 'RENT');

-- CreateEnum
CREATE TYPE "RentalStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DECLINED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "purpose" "ListingPurpose" NOT NULL DEFAULT 'SALE';

-- CreateTable
CREATE TABLE "RentalTerms" (
    "listingId" TEXT NOT NULL,
    "deposit" DECIMAL(12,2),
    "minDays" INTEGER NOT NULL DEFAULT 1,
    "maxDays" INTEGER,
    "kmPerDay" INTEGER,
    "minDriverAge" INTEGER,

    CONSTRAINT "RentalTerms_pkey" PRIMARY KEY ("listingId")
);

-- CreateTable
CREATE TABLE "RentalBooking" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "renterId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "days" INTEGER NOT NULL,
    "pricePerDay" DECIMAL(12,2) NOT NULL,
    "totalPrice" DECIMAL(12,2) NOT NULL,
    "deposit" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'AZN',
    "message" TEXT,
    "phone" TEXT,
    "status" "RentalStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),

    CONSTRAINT "RentalBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalBlock" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RentalBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RentalBooking_listingId_status_idx" ON "RentalBooking"("listingId", "status");

-- CreateIndex
CREATE INDEX "RentalBooking_renterId_idx" ON "RentalBooking"("renterId");

-- CreateIndex
CREATE INDEX "RentalBlock_listingId_idx" ON "RentalBlock"("listingId");

-- AddForeignKey
ALTER TABLE "RentalTerms" ADD CONSTRAINT "RentalTerms_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalBooking" ADD CONSTRAINT "RentalBooking_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalBooking" ADD CONSTRAINT "RentalBooking_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalBlock" ADD CONSTRAINT "RentalBlock_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;


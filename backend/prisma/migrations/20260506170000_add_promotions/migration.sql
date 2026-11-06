-- CreateEnum
CREATE TYPE "PromotionTier" AS ENUM ('BUMP', 'VIP', 'PREMIUM');

-- CreateEnum
CREATE TYPE "PromotionTarget" AS ENUM ('LISTING', 'SPECIALIST', 'SERVICE_CENTER');

-- CreateEnum
CREATE TYPE "PromotionOrderStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'EXPIRED', 'REFUNDED');

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "bumpedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "contactsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "promotedUntil" TIMESTAMP(3),
ADD COLUMN     "promotionRank" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "viewsCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ServiceCenter" ADD COLUMN     "bumpedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "contactsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "promotedUntil" TIMESTAMP(3),
ADD COLUMN     "promotionRank" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "viewsCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Specialist" ADD COLUMN     "bumpedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "contactsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "promotedUntil" TIMESTAMP(3),
ADD COLUMN     "promotionRank" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "viewsCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL,
    "targetType" "PromotionTarget" NOT NULL,
    "listingId" TEXT,
    "specialistId" TEXT,
    "serviceCenterId" TEXT,
    "tier" "PromotionTier" NOT NULL,
    "packageCode" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'AZN',
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "bumpsTotal" INTEGER NOT NULL DEFAULT 0,
    "bumpsUsed" INTEGER NOT NULL DEFAULT 0,
    "nextBumpAt" TIMESTAMP(3),
    "lastBumpAt" TIMESTAMP(3),
    "viewsAtStart" INTEGER NOT NULL DEFAULT 0,
    "contactsAtStart" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "endedReason" TEXT,
    "endedAt" TIMESTAMP(3),
    "grantedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionOrder" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "targetType" "PromotionTarget" NOT NULL,
    "listingId" TEXT,
    "specialistId" TEXT,
    "serviceCenterId" TEXT,
    "tier" "PromotionTier" NOT NULL,
    "packageCode" TEXT NOT NULL,
    "listAmount" INTEGER NOT NULL,
    "creditAmount" INTEGER NOT NULL DEFAULT 0,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AZN',
    "creditedPromotionId" TEXT,
    "status" "PromotionOrderStatus" NOT NULL DEFAULT 'PENDING',
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "userId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "promotionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromotionOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerPaymentId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AZN',
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Promotion_active_endsAt_idx" ON "Promotion"("active", "endsAt");

-- CreateIndex
CREATE INDEX "Promotion_active_nextBumpAt_idx" ON "Promotion"("active", "nextBumpAt");

-- CreateIndex
CREATE INDEX "Promotion_active_tier_idx" ON "Promotion"("active", "tier");

-- CreateIndex
CREATE INDEX "Promotion_listingId_idx" ON "Promotion"("listingId");

-- CreateIndex
CREATE INDEX "Promotion_specialistId_idx" ON "Promotion"("specialistId");

-- CreateIndex
CREATE INDEX "Promotion_serviceCenterId_idx" ON "Promotion"("serviceCenterId");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionOrder_token_key" ON "PromotionOrder"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionOrder_promotionId_key" ON "PromotionOrder"("promotionId");

-- CreateIndex
CREATE INDEX "PromotionOrder_status_expiresAt_idx" ON "PromotionOrder"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "PromotionOrder_userId_createdAt_idx" ON "PromotionOrder"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_orderId_idx" ON "Payment"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_provider_providerPaymentId_key" ON "Payment"("provider", "providerPaymentId");

-- CreateIndex
CREATE INDEX "Listing_status_promotionRank_bumpedAt_idx" ON "Listing"("status", "promotionRank", "bumpedAt");

-- CreateIndex
CREATE INDEX "ServiceCenter_promotionRank_bumpedAt_idx" ON "ServiceCenter"("promotionRank", "bumpedAt");

-- CreateIndex
CREATE INDEX "Specialist_promotionRank_bumpedAt_idx" ON "Specialist"("promotionRank", "bumpedAt");

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_specialistId_fkey" FOREIGN KEY ("specialistId") REFERENCES "Specialist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_serviceCenterId_fkey" FOREIGN KEY ("serviceCenterId") REFERENCES "ServiceCenter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionOrder" ADD CONSTRAINT "PromotionOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionOrder" ADD CONSTRAINT "PromotionOrder_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionOrder" ADD CONSTRAINT "PromotionOrder_specialistId_fkey" FOREIGN KEY ("specialistId") REFERENCES "Specialist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionOrder" ADD CONSTRAINT "PromotionOrder_serviceCenterId_fkey" FOREIGN KEY ("serviceCenterId") REFERENCES "ServiceCenter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionOrder" ADD CONSTRAINT "PromotionOrder_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "PromotionOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Existing rows keep their own age instead of all starting equal at the deploy moment.
UPDATE "Listing" SET "bumpedAt" = "createdAt";
UPDATE "Specialist" SET "bumpedAt" = "createdAt";
UPDATE "ServiceCenter" SET "bumpedAt" = "createdAt";

-- A promotion and an order each point at exactly one target.
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_one_target"
  CHECK (
    (("listingId" IS NOT NULL)::int + ("specialistId" IS NOT NULL)::int + ("serviceCenterId" IS NOT NULL)::int) = 1
    AND ("targetType" = 'LISTING') = ("listingId" IS NOT NULL)
    AND ("targetType" = 'SPECIALIST') = ("specialistId" IS NOT NULL)
    AND ("targetType" = 'SERVICE_CENTER') = ("serviceCenterId" IS NOT NULL)
  );

ALTER TABLE "PromotionOrder" ADD CONSTRAINT "PromotionOrder_one_target"
  CHECK (
    (("listingId" IS NOT NULL)::int + ("specialistId" IS NOT NULL)::int + ("serviceCenterId" IS NOT NULL)::int) = 1
    AND ("targetType" = 'LISTING') = ("listingId" IS NOT NULL)
    AND ("targetType" = 'SPECIALIST') = ("specialistId" IS NOT NULL)
    AND ("targetType" = 'SERVICE_CENTER') = ("serviceCenterId" IS NOT NULL)
  );

-- Money is held in qapik, so it is always a whole, non-negative number, and the
-- charge is the list price less the upgrade credit.
ALTER TABLE "PromotionOrder" ADD CONSTRAINT "PromotionOrder_amounts"
  CHECK ("listAmount" >= 0 AND "creditAmount" >= 0 AND "amount" >= 0 AND "amount" = "listAmount" - "creditAmount");

ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_bumps"
  CHECK ("bumpsTotal" >= 0 AND "bumpsUsed" >= 0 AND "bumpsUsed" <= "bumpsTotal" AND "endsAt" > "startsAt");

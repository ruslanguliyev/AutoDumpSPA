-- AlterTable ServiceCenter
ALTER TABLE "ServiceCenter" ADD COLUMN "slug" TEXT;
CREATE UNIQUE INDEX "ServiceCenter_slug_key" ON "ServiceCenter"("slug");

ALTER TABLE "ServiceCenter" ADD COLUMN "legalName" TEXT;
ALTER TABLE "ServiceCenter" ADD COLUMN "type" TEXT;
ALTER TABLE "ServiceCenter" ADD COLUMN "whatsapp" TEXT;
ALTER TABLE "ServiceCenter" ADD COLUMN "logoUrl" TEXT;
ALTER TABLE "ServiceCenter" ADD COLUMN "coverImage" TEXT;
ALTER TABLE "ServiceCenter" ADD COLUMN "gallery" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "ServiceCenter" ADD COLUMN "supportedBrands" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "ServiceCenter" ADD COLUMN "reviewsCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ServiceCenter" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "ServiceCenter" ADD COLUMN "schedule" JSONB;
ALTER TABLE "ServiceCenter" ADD COLUMN "contacts" JSONB;

-- CreateTable ServiceCenterService
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
    "applicableBrands" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "popular" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ServiceCenterService_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ServiceCenterService_serviceCenterId_idx" ON "ServiceCenterService"("serviceCenterId");

ALTER TABLE "ServiceCenterService" ADD CONSTRAINT "ServiceCenterService_serviceCenterId_fkey"
  FOREIGN KEY ("serviceCenterId") REFERENCES "ServiceCenter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

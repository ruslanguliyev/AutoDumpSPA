-- AlterTable Part: optional OEM, new pricing & media fields
ALTER TABLE "Part" ALTER COLUMN "oemCode" DROP NOT NULL;

ALTER TABLE "Part" ADD COLUMN "description" TEXT;
ALTER TABLE "Part" ADD COLUMN "price" DECIMAL(12,2);
ALTER TABLE "Part" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'AZN';
ALTER TABLE "Part" ADD COLUMN "imageUrl" TEXT;
ALTER TABLE "Part" ADD COLUMN "compatibility" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Part" ADD COLUMN "location" TEXT;

ALTER TABLE "Part" ALTER COLUMN "stock" SET DEFAULT 0;

-- AlterTable Specialist: extended profile + slug
ALTER TABLE "Specialist" ADD COLUMN "slug" TEXT;
UPDATE "Specialist" SET "slug" = 'specialist-' || "id" WHERE "slug" IS NULL;
ALTER TABLE "Specialist" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "Specialist_slug_key" ON "Specialist"("slug");

ALTER TABLE "Specialist" ADD COLUMN "whatsapp" TEXT;
ALTER TABLE "Specialist" ADD COLUMN "avatarUrl" TEXT;
ALTER TABLE "Specialist" ADD COLUMN "coverImage" TEXT;
ALTER TABLE "Specialist" ADD COLUMN "specializations" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Specialist" ADD COLUMN "reviewsCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Specialist" ADD COLUMN "priceFrom" DECIMAL(10,2);
ALTER TABLE "Specialist" ADD COLUMN "mobileService" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Specialist" ADD COLUMN "portfolio" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- CreateTable SpecialistVehicle
CREATE TABLE "SpecialistVehicle" (
    "id" TEXT NOT NULL,
    "specialistId" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "yearFrom" INTEGER,
    "yearTo" INTEGER,

    CONSTRAINT "SpecialistVehicle_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SpecialistVehicle_specialistId_idx" ON "SpecialistVehicle"("specialistId");

ALTER TABLE "SpecialistVehicle" ADD CONSTRAINT "SpecialistVehicle_specialistId_fkey"
  FOREIGN KEY ("specialistId") REFERENCES "Specialist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Seller" ADD COLUMN     "reviewsCount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "rating" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "sellerId" TEXT,
    "specialistId" TEXT,
    "serviceCenterId" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Review_sellerId_createdAt_idx" ON "Review"("sellerId", "createdAt");

-- CreateIndex
CREATE INDEX "Review_specialistId_createdAt_idx" ON "Review"("specialistId", "createdAt");

-- CreateIndex
CREATE INDEX "Review_serviceCenterId_createdAt_idx" ON "Review"("serviceCenterId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Review_authorId_sellerId_key" ON "Review"("authorId", "sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_authorId_specialistId_key" ON "Review"("authorId", "specialistId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_authorId_serviceCenterId_key" ON "Review"("authorId", "serviceCenterId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_specialistId_fkey" FOREIGN KEY ("specialistId") REFERENCES "Specialist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_serviceCenterId_fkey" FOREIGN KEY ("serviceCenterId") REFERENCES "ServiceCenter"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Exactly one review target per row.
ALTER TABLE "Review" ADD CONSTRAINT "Review_one_target_check"
  CHECK (num_nonnulls("sellerId", "specialistId", "serviceCenterId") = 1);
ALTER TABLE "Review" ADD CONSTRAINT "Review_rating_range_check" CHECK ("rating" BETWEEN 1 AND 5);

-- Ratings used to be placeholders; no real reviews exist yet, so start honestly from zero.
UPDATE "Seller" SET "rating" = 0;
UPDATE "Specialist" SET "rating" = 0, "reviewsCount" = 0;
UPDATE "ServiceCenter" SET "rating" = 0, "reviewsCount" = 0;

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "vin" TEXT;

-- CreateIndex
CREATE INDEX "Vehicle_vin_idx" ON "Vehicle"("vin");

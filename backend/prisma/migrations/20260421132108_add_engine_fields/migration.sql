-- DropIndex
DROP INDEX "ServiceCenterService_serviceCenterId_idx";

-- DropIndex
DROP INDEX "SpecialistVehicle_specialistId_idx";

-- AlterTable
ALTER TABLE "Part" ALTER COLUMN "compatibility" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ServiceCenter" ALTER COLUMN "categories" DROP DEFAULT,
ALTER COLUMN "gallery" DROP DEFAULT,
ALTER COLUMN "supportedBrands" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ServiceCenterService" ALTER COLUMN "applicableBrands" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Specialist" ALTER COLUMN "skills" DROP DEFAULT,
ALTER COLUMN "specializations" DROP DEFAULT,
ALTER COLUMN "portfolio" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "displacement" TEXT,
ADD COLUMN     "horsepower" TEXT,
ALTER COLUMN "imageUrls" DROP DEFAULT;

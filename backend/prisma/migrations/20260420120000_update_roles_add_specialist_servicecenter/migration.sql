-- AlterEnum: SellerType — add PARTS_DEALER (idempotent if re-run fails, run once)
ALTER TYPE "SellerType" ADD VALUE 'PARTS_DEALER';

-- Replace UserRole enum (map legacy SELLER -> PRIVATE_SELLER)
CREATE TYPE "UserRole_new" AS ENUM (
  'USER',
  'PRIVATE_SELLER',
  'DEALER',
  'PARTS_DEALER',
  'SERVICE',
  'SPECIALIST',
  'ADMIN'
);

ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new"
  USING (
    CASE "role"::text
      WHEN 'USER' THEN 'USER'::"UserRole_new"
      WHEN 'SELLER' THEN 'PRIVATE_SELLER'::"UserRole_new"
      WHEN 'SERVICE' THEN 'SERVICE'::"UserRole_new"
      WHEN 'ADMIN' THEN 'ADMIN'::"UserRole_new"
      ELSE 'USER'::"UserRole_new"
    END
  );

DROP TYPE "UserRole";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";

-- CreateTable ServiceCenter
CREATE TABLE "ServiceCenter" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "categories" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceCenter_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ServiceCenter_userId_key" ON "ServiceCenter"("userId");

ALTER TABLE "ServiceCenter" ADD CONSTRAINT "ServiceCenter_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable Specialist
CREATE TABLE "Specialist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "city" TEXT NOT NULL,
    "phone" TEXT,
    "skills" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "experience" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hourlyRate" DECIMAL(10,2),
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Specialist_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Specialist_userId_key" ON "Specialist"("userId");

ALTER TABLE "Specialist" ADD CONSTRAINT "Specialist_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

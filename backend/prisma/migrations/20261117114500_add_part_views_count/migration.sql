-- AlterTable
ALTER TABLE "Part" ADD COLUMN "viewsCount" INTEGER NOT NULL DEFAULT 0;

-- Every listing has exactly one part, so the listing counter is that part's history.
UPDATE "Part" AS p
SET "viewsCount" = l."viewsCount"
FROM "Listing" AS l
WHERE p."listingId" = l.id;

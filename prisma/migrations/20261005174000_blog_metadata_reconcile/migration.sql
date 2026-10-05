-- Reconcile blog editorial metadata on databases created before these
-- columns were represented in the tracked baseline migration.
ALTER TABLE "blogs" ADD COLUMN IF NOT EXISTS "authorName" TEXT;
ALTER TABLE "blogs" ADD COLUMN IF NOT EXISTS "metaTitle" TEXT;
ALTER TABLE "blogs" ADD COLUMN IF NOT EXISTS "metaDescription" TEXT;
ALTER TABLE "blogs" ADD COLUMN IF NOT EXISTS "metaKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Prisma models scalar-list fields as non-null arrays. Normalize legacy rows
-- before enforcing that contract so article serialization cannot fail on NULL.
UPDATE "blogs" SET "metaKeywords" = ARRAY[]::TEXT[] WHERE "metaKeywords" IS NULL;
UPDATE "blogs" SET "tags" = ARRAY[]::TEXT[] WHERE "tags" IS NULL;

ALTER TABLE "blogs" ALTER COLUMN "metaKeywords" SET DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "blogs" ALTER COLUMN "metaKeywords" SET NOT NULL;
ALTER TABLE "blogs" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "blogs" ALTER COLUMN "tags" SET NOT NULL;

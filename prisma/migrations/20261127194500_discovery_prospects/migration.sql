CREATE TABLE "discovery_prospects" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "area" TEXT,
  "products" TEXT,
  "instagram" TEXT,
  "facebook" TEXT,
  "tiktok" TEXT,
  "website" TEXT,
  "sourceUrl" TEXT NOT NULL,
  "reviewStatus" TEXT NOT NULL DEFAULT 'pending',
  "permissionStatus" TEXT NOT NULL DEFAULT 'not_assessed',
  "reviewNotes" TEXT NOT NULL DEFAULT '',
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "discovery_prospects_public_check" CHECK ("reviewStatus" <> 'approved' OR ("permissionStatus" = 'cleared' AND "reviewedAt" IS NOT NULL)),
  CONSTRAINT "discovery_prospects_review_status" CHECK ("reviewStatus" IN ('pending','approved','rejected')),
  CONSTRAINT "discovery_prospects_permission_status" CHECK ("permissionStatus" IN ('not_assessed','cleared','denied'))
);
CREATE INDEX "discovery_prospects_reviewStatus_category_idx" ON "discovery_prospects"("reviewStatus", "category");
ALTER TABLE "discovery_prospects" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "discovery_prospects" FROM PUBLIC;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN EXECUTE 'REVOKE ALL ON TABLE "discovery_prospects" FROM anon'; END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN EXECUTE 'REVOKE ALL ON TABLE "discovery_prospects" FROM authenticated'; END IF;
END $$;

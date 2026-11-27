CREATE TABLE "live_vendors" (
 "supplierId" TEXT PRIMARY KEY REFERENCES "suppliers"("id") ON DELETE CASCADE,
 "kind" TEXT NOT NULL, "approval" TEXT NOT NULL DEFAULT 'pending', "reviewNotes" TEXT NOT NULL DEFAULT '',
 "reviewedBy" TEXT, "reviewedAt" TIMESTAMP(3), "location" TEXT NOT NULL DEFAULT '', "area" TEXT NOT NULL DEFAULT '',
 "latitude" DOUBLE PRECISION, "longitude" DOUBLE PRECISION, "note" TEXT NOT NULL DEFAULT '',
 "servingUntil" TIMESTAMP(3), "checkedInAt" TIMESTAMP(3), "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "live_vendor_kind_check" CHECK ("kind" IN ('truck','coffee_cart','ice_cream','popup','street_food','market_stall')),
 CONSTRAINT "live_vendor_approval_check" CHECK ("approval" IN ('pending','approved','rejected','suspended') AND ("approval" <> 'approved' OR ("reviewedBy" IS NOT NULL AND "reviewedAt" IS NOT NULL))),
 CONSTRAINT "live_vendor_coordinates_check" CHECK (("latitude" IS NULL AND "longitude" IS NULL) OR ("latitude" IS NOT NULL AND "longitude" IS NOT NULL AND "latitude" BETWEEN 5.8 AND 10 AND "longitude" BETWEEN 79.4 AND 82.1)),
 CONSTRAINT "live_vendor_session_check" CHECK (("servingUntil" IS NULL AND "checkedInAt" IS NULL AND "latitude" IS NULL AND "longitude" IS NULL AND "location" = '' AND "area" = '' AND "note" = '') OR ("approval" = 'approved' AND "servingUntil" IS NOT NULL AND "checkedInAt" IS NOT NULL AND "servingUntil" > "checkedInAt" AND "servingUntil" <= "checkedInAt" + INTERVAL '12 hours' AND length(trim("location")) > 0 AND length(trim("area")) > 0))
);
CREATE INDEX "live_vendors_approval_servingUntil_idx" ON "live_vendors"("approval","servingUntil");
ALTER TABLE "live_vendors" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "live_vendors" FROM PUBLIC;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN EXECUTE 'REVOKE ALL ON TABLE "live_vendors" FROM anon'; END IF; IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN EXECUTE 'REVOKE ALL ON TABLE "live_vendors" FROM authenticated'; END IF; END $$;

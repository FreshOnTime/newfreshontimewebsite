ALTER TABLE "suppliers" ADD COLUMN "businessType" TEXT NOT NULL DEFAULT 'maker', ADD COLUMN "businessWebsite" TEXT, ADD COLUMN "businessInstagram" TEXT;
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_business_type_check" CHECK ("businessType" IN ('maker','restaurant','cafe','bakery','caterer','food_brand','other'));
CREATE INDEX "suppliers_businessType_idx" ON "suppliers"("businessType");

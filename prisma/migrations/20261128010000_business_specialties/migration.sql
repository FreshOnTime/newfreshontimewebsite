BEGIN;
ALTER TABLE "suppliers" ADD COLUMN "businessSpecialties" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "suppliers" DROP CONSTRAINT "suppliers_business_type_check";
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_business_type_check" CHECK ("businessType" IN ('maker','restaurant','cafe','bakery','caterer','food_brand','gift_creator','other'));
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_business_specialties_check" CHECK (
  cardinality("businessSpecialties") <= 8 AND array_position("businessSpecialties",NULL) IS NULL
  AND "businessSpecialties" <@ ARRAY['cakes-desserts','bread-pastries','chocolate-confectionery','tea-coffee','drinks','pantry-specialities','fresh-produce','prepared-meals','event-catering','food-hampers','corporate-gifts','wedding-favours','custom-food-gifts']::TEXT[]
);
CREATE INDEX "suppliers_businessSpecialties_idx" ON "suppliers" USING GIN ("businessSpecialties");
COMMIT;

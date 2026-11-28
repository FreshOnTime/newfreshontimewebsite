BEGIN;
ALTER TABLE "users" ADD COLUMN "businessOnboardingDraft" JSONB;
ALTER TABLE "suppliers" ADD COLUMN "businessOfferingLabels" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_business_offering_labels_check" CHECK (cardinality("businessOfferingLabels") <= 8 AND array_position("businessOfferingLabels",NULL) IS NULL);
COMMIT;

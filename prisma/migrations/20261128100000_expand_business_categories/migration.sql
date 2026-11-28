BEGIN;
ALTER TABLE "suppliers" DROP CONSTRAINT "suppliers_business_type_check";
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_business_type_check" CHECK ("businessType" IN ('maker','restaurant','cafe','bakery','caterer','food_brand','gift_creator','grocery','farm','mobile_food','other'));
COMMIT;

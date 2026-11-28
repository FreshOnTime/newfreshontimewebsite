-- Public contact information is opt-in and kept separate from account credentials.
ALTER TABLE "suppliers"
  ADD COLUMN "businessPublicEmail" TEXT,
  ADD COLUMN "businessPublicPhone" TEXT,
  ADD COLUMN "businessFacebook" TEXT,
  ADD COLUMN "businessTikTok" TEXT;
ALTER TABLE "maker_items"
  ADD COLUMN "contactWhatsApp" TEXT,
  ADD COLUMN "contactEmail" TEXT,
  ADD COLUMN "contactPhone" TEXT,
  ADD COLUMN "contactWebsite" TEXT,
  ADD COLUMN "purchaseUrl" TEXT;

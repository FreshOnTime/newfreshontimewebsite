CREATE TYPE "SubscriptionDeliveryStatus" AS ENUM ('pending', 'confirmed', 'delivered', 'cancelled', 'skipped');

CREATE TABLE "subscription_deliveries" (
  "id" TEXT NOT NULL,
  "subscriptionId" TEXT NOT NULL,
  "scheduledFor" TIMESTAMP(3) NOT NULL,
  "status" "SubscriptionDeliveryStatus" NOT NULL DEFAULT 'pending',
  "planName" TEXT NOT NULL,
  "price" DECIMAL(12,2) NOT NULL,
  "contentsSnapshot" JSONB NOT NULL,
  "deliveryAddress" JSONB NOT NULL,
  "deliverySlotDay" TEXT NOT NULL,
  "deliverySlotTime" TEXT NOT NULL,
  "deliveredAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "subscription_deliveries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "subscription_deliveries_subscriptionId_scheduledFor_key"
  ON "subscription_deliveries"("subscriptionId", "scheduledFor");
CREATE INDEX "subscription_deliveries_status_scheduledFor_idx"
  ON "subscription_deliveries"("status", "scheduledFor");

ALTER TABLE "subscription_deliveries"
  ADD CONSTRAINT "subscription_deliveries_subscriptionId_fkey"
  FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

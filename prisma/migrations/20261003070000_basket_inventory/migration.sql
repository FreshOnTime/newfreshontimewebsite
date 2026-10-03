-- AlterTable
ALTER TABLE "subscription_plans" ADD COLUMN     "inventoryManaged" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "plan_contents" ADD COLUMN     "productId" TEXT,
ADD COLUMN     "units" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "fulfillmentError" TEXT,
ADD COLUMN     "fulfillmentErrorAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "subscription_deliveries" ADD COLUMN     "orderId" TEXT;

-- CreateIndex
CREATE INDEX "plan_contents_productId_idx" ON "plan_contents"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_deliveries_orderId_key" ON "subscription_deliveries"("orderId");

-- AddForeignKey
ALTER TABLE "plan_contents" ADD CONSTRAINT "plan_contents_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_deliveries" ADD CONSTRAINT "subscription_deliveries_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Display quantities may be descriptive; inventory quantities are whole stock units.
ALTER TABLE "plan_contents" ADD CONSTRAINT "plan_contents_units_check" CHECK ("units" BETWEEN 1 AND 10000);

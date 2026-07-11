ALTER TABLE "orders" ADD COLUMN "recurringSourceOrderId" TEXT;

CREATE INDEX "orders_recurringSourceOrderId_idx" ON "orders"("recurringSourceOrderId");

ALTER TABLE "orders"
  ADD CONSTRAINT "orders_recurringSourceOrderId_fkey"
  FOREIGN KEY ("recurringSourceOrderId") REFERENCES "orders"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

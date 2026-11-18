CREATE TYPE "SupplierOrderStatus" AS ENUM ('pending', 'accepted', 'unavailable', 'ready', 'collected');
CREATE TABLE "supplier_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "supplierId" TEXT NOT NULL REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "items" JSONB NOT NULL,
    "status" "SupplierOrderStatus" NOT NULL DEFAULT 'pending',
    "settlementAmount" DECIMAL(12,2),
    "settlementReference" TEXT,
    "settledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX "supplier_orders_orderId_supplierId_key" ON "supplier_orders"("orderId", "supplierId");
CREATE INDEX "supplier_orders_supplierId_createdAt_idx" ON "supplier_orders"("supplierId", "createdAt");
CREATE INDEX "supplier_orders_status_createdAt_idx" ON "supplier_orders"("status", "createdAt");

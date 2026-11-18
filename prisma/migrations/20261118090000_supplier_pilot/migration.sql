CREATE TABLE "SupplyRequest" (
  "id" TEXT PRIMARY KEY, "product" TEXT NOT NULL, "unit" TEXT NOT NULL,
  "quantity" DECIMAL(12,2) NOT NULL CHECK ("quantity" > 0),
  "remaining" DECIMAL(12,2) NOT NULL CHECK ("remaining" BETWEEN 0 AND "quantity"),
  "grade" TEXT NOT NULL, "area" TEXT NOT NULL, "deadline" TEXT NOT NULL, "pickup" TEXT NOT NULL
);
CREATE INDEX "SupplyRequest_deadline_idx" ON "SupplyRequest" ("deadline");
CREATE TABLE "SupplyOffer" (
  "id" TEXT PRIMARY KEY, "submissionId" TEXT NOT NULL UNIQUE, "photoUrl" TEXT,
  "requestId" TEXT REFERENCES "SupplyRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "product" TEXT NOT NULL, "unit" TEXT NOT NULL, "quantity" DECIMAL(12,2) NOT NULL CHECK ("quantity" > 0),
  "price" DECIMAL(12,2) NOT NULL CHECK ("price" > 0), "area" TEXT NOT NULL,
  "ready" TEXT NOT NULL, "phone" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'received',
  "agreedQty" DECIMAL(12,2), "agreedPrice" DECIMAL(12,2), "terms" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "decidedAt" TIMESTAMP(3), "handedOverAt" TIMESTAMP(3)
);
CREATE INDEX "SupplyOffer_status_createdAt_idx" ON "SupplyOffer" ("status","createdAt");
CREATE INDEX "SupplyOffer_phone_handedOverAt_idx" ON "SupplyOffer" ("phone","handedOverAt");

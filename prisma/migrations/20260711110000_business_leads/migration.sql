CREATE TABLE "business_leads" (
  "id" TEXT NOT NULL,
  "organizationName" TEXT NOT NULL,
  "contactName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "requirement" TEXT NOT NULL DEFAULT '',
  "status" TEXT NOT NULL DEFAULT 'new',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "business_leads_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "business_leads_status_idx" ON "business_leads"("status");
CREATE INDEX "business_leads_createdAt_idx" ON "business_leads"("createdAt");

-- AlterTable
ALTER TABLE "suppliers" ADD COLUMN     "applicationStatus" TEXT NOT NULL DEFAULT 'approved',
ADD COLUMN     "reviewNotes" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "reviewVersion" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reviewedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "subscription_deliveries" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "subscribers" ADD COLUMN     "unsubscribeVersion" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "subscription_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "response" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plan_claims" (
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,

    CONSTRAINT "subscription_plan_claims_pkey" PRIMARY KEY ("userId","planId")
);

-- CreateTable
CREATE TABLE "email_outbox" (
    "id" TEXT NOT NULL,
    "dedupeKey" TEXT,
    "recipient" VARCHAR(254) NOT NULL,
    "subject" VARCHAR(200) NOT NULL,
    "html" TEXT NOT NULL,
    "text" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leaseUntil" TIMESTAMP(3),
    "claimToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "lastError" TEXT,

    CONSTRAINT "email_outbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_requests_userId_key_key" ON "subscription_requests"("userId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "email_outbox_dedupeKey_key" ON "email_outbox"("dedupeKey");

-- CreateIndex
CREATE INDEX "email_outbox_status_nextAttemptAt_idx" ON "email_outbox"("status", "nextAttemptAt");


-- Review states and optimistic versions must remain valid for every writer.
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_application_status_check" CHECK ("applicationStatus" IN ('pending','approved','rejected'));
ALTER TABLE "subscription_deliveries" ADD CONSTRAINT "subscription_deliveries_version_check" CHECK ("version" >= 0);
ALTER TABLE "subscribers" ADD CONSTRAINT "subscribers_unsubscribe_version_check" CHECK ("unsubscribeVersion" >= 0);
ALTER TABLE "email_outbox" ADD CONSTRAINT "email_outbox_status_check" CHECK ("status" IN ('pending','processing','sent','failed'));
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_review_version_check" CHECK ("reviewVersion" >= 0);

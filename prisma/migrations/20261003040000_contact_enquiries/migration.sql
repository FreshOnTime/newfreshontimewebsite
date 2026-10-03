CREATE TABLE "contact_enquiries" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "subject" VARCHAR(160) NOT NULL DEFAULT '',
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'question',
    "source" TEXT NOT NULL DEFAULT 'general',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "orderId" VARCHAR(100) NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'new',
    "internalNotes" TEXT NOT NULL DEFAULT '',
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "contact_enquiries_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "contact_enquiries_status_check" CHECK ("status" IN ('new', 'in_progress', 'resolved')),
    CONSTRAINT "contact_enquiries_type_check" CHECK ("type" IN ('question', 'issue', 'suggestion', 'other')),
    CONSTRAINT "contact_enquiries_source_check" CHECK ("source" IN ('general', 'producers', 'support')),
    CONSTRAINT "contact_enquiries_priority_check" CHECK ("priority" IN ('low', 'normal', 'high'))
);
CREATE UNIQUE INDEX "contact_enquiries_submissionId_key" ON "contact_enquiries"("submissionId");
CREATE INDEX "contact_enquiries_status_createdAt_idx" ON "contact_enquiries"("status", "createdAt");
CREATE INDEX "contact_enquiries_source_createdAt_idx" ON "contact_enquiries"("source", "createdAt");

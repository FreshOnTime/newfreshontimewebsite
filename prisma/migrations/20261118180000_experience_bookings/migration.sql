-- AlterTable
ALTER TABLE "agent_access_tokens" ADD COLUMN     "bookingAccess" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ExperienceSession" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "occasion" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "priceLkr" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "remaining" INTEGER NOT NULL,
    "closed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ExperienceSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperienceBooking" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "seats" INTEGER NOT NULL,
    "totalLkr" INTEGER NOT NULL,
    "cancelled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExperienceBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExperienceSession_startsAt_idx" ON "ExperienceSession"("startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "ExperienceSession_supplierId_title_startsAt_key" ON "ExperienceSession"("supplierId", "title", "startsAt");

-- CreateIndex
CREATE INDEX "ExperienceBooking_sessionId_idx" ON "ExperienceBooking"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "ExperienceBooking_userId_requestId_key" ON "ExperienceBooking"("userId", "requestId");

-- AddForeignKey
ALTER TABLE "ExperienceSession" ADD CONSTRAINT "ExperienceSession_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperienceBooking" ADD CONSTRAINT "ExperienceBooking_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ExperienceSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperienceBooking" ADD CONSTRAINT "ExperienceBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ExperienceSession" ADD CONSTRAINT "session_capacity" CHECK ("remaining" BETWEEN 0 AND "capacity" AND "capacity" > 0 AND "priceLkr" >= 0);
ALTER TABLE "ExperienceBooking" ADD CONSTRAINT "booking_quantity" CHECK ("seats" > 0 AND "totalLkr" >= 0);

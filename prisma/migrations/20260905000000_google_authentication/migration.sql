-- Google does not expose a phone number through OAuth. Customers add one when
-- it becomes necessary for delivery, instead of receiving a fabricated value.
ALTER TABLE "users" ALTER COLUMN "phoneNumber" DROP NOT NULL;

CREATE TABLE "oauth_identities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oauth_identities_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "oauth_identities_provider_providerAccountId_key"
    ON "oauth_identities"("provider", "providerAccountId");
CREATE INDEX "oauth_identities_userId_idx" ON "oauth_identities"("userId");

ALTER TABLE "oauth_identities"
    ADD CONSTRAINT "oauth_identities_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

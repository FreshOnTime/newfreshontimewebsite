CREATE TABLE "checkout_requests" (
    "customerId" TEXT NOT NULL,
    "key" VARCHAR(128) NOT NULL,
    "fingerprint" VARCHAR(64) NOT NULL,
    "response" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "checkout_requests_pkey" PRIMARY KEY ("customerId", "key"),
    CONSTRAINT "checkout_requests_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

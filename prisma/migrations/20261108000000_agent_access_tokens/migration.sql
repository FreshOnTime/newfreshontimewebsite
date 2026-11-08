-- Customer-controlled, revocable credentials for shopping MCP clients.
-- Only SHA-256 hashes are stored, never plaintext agent secrets.
CREATE TABLE "agent_access_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "agent_access_tokens_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "agent_access_tokens_tokenHash_key" ON "agent_access_tokens"("tokenHash");
CREATE INDEX "agent_access_tokens_userId_idx" ON "agent_access_tokens"("userId");
CREATE INDEX "agent_access_tokens_expiresAt_idx" ON "agent_access_tokens"("expiresAt");
ALTER TABLE "agent_access_tokens" ADD CONSTRAINT "agent_access_tokens_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

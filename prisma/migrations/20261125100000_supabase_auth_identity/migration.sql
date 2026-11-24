ALTER TABLE "users" ADD COLUMN "supabaseAuthId" TEXT;
CREATE UNIQUE INDEX "users_supabaseAuthId_key" ON "users"("supabaseAuthId");

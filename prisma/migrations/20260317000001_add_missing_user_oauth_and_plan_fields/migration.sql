-- Create AuthProvider enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE "AuthProvider" AS ENUM ('LOCAL', 'GOOGLE', 'GITHUB');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add OAuth fields to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "authProvider" "AuthProvider" NOT NULL DEFAULT 'LOCAL';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "providerId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "providerData" JSONB;

-- Add plan / billing fields to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "plan" TEXT NOT NULL DEFAULT 'FREE';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT;

-- Unique index for stripeSubscriptionId
CREATE UNIQUE INDEX IF NOT EXISTS "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId");

-- Composite index for OAuth lookups
CREATE INDEX IF NOT EXISTS "User_authProvider_providerId_idx" ON "User"("authProvider", "providerId");

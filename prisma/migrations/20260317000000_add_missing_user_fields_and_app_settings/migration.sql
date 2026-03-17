-- Add stripeCustomerId to User (was added via db push, missing from migrations)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- Add monthlyCreditsRefreshedAt to User (was added via db push, missing from migrations)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "monthlyCreditsRefreshedAt" TIMESTAMP(3);

-- Create AppSettings table (was created via db push, missing from migrations)
CREATE TABLE IF NOT EXISTS "AppSettings" (
    "key"       TEXT NOT NULL,
    "value"     TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("key")
);

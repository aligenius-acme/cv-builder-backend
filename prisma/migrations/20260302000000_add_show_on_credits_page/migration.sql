-- CreateTable (if not exists — table may have been created via db push locally)
CREATE TABLE IF NOT EXISTS "AffiliateLink" (
    "id" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "showOnCreditsPage" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AffiliateLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "AffiliateLink_skill_key" ON "AffiliateLink"("skill");
CREATE INDEX IF NOT EXISTS "AffiliateLink_skill_idx" ON "AffiliateLink"("skill");
CREATE INDEX IF NOT EXISTS "AffiliateLink_isActive_idx" ON "AffiliateLink"("isActive");
CREATE INDEX IF NOT EXISTS "AffiliateLink_showOnCreditsPage_idx" ON "AffiliateLink"("showOnCreditsPage");

-- AlterTable (add column only if table already existed without it)
ALTER TABLE "AffiliateLink" ADD COLUMN IF NOT EXISTS "showOnCreditsPage" BOOLEAN NOT NULL DEFAULT false;

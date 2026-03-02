-- AlterTable
ALTER TABLE "AffiliateLink" ADD COLUMN "showOnCreditsPage" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "AffiliateLink_showOnCreditsPage_idx" ON "AffiliateLink"("showOnCreditsPage");

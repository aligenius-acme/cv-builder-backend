-- AlterTable
ALTER TABLE "ResumeTemplate" ADD COLUMN     "primaryCategory" TEXT,
ADD COLUMN     "designStyle" TEXT,
ADD COLUMN     "pageLength" TEXT,
ADD COLUMN     "atsCompatibility" TEXT,
ADD COLUMN     "industryTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "targetRoles" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "experienceLevel" TEXT,
ADD COLUMN     "searchKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "popularityScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "supportedFormats" TEXT[] DEFAULT ARRAY['pdf', 'docx']::TEXT[],
ADD COLUMN     "usageCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "ResumeTemplate_primaryCategory_idx" ON "ResumeTemplate"("primaryCategory");

-- CreateIndex
CREATE INDEX "ResumeTemplate_designStyle_idx" ON "ResumeTemplate"("designStyle");

-- CreateIndex
CREATE INDEX "ResumeTemplate_atsCompatibility_idx" ON "ResumeTemplate"("atsCompatibility");

-- CreateIndex
CREATE INDEX "ResumeTemplate_popularityScore_idx" ON "ResumeTemplate"("popularityScore");

-- CreateIndex
CREATE INDEX "ResumeTemplate_isFeatured_idx" ON "ResumeTemplate"("isFeatured");

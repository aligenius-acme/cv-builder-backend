-- AlterTable
ALTER TABLE "Resume" ADD COLUMN "photoUrl" TEXT;

-- AlterTable
ALTER TABLE "ResumeTemplate" ADD COLUMN "photoSupport" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "ResumeTemplate_photoSupport_idx" ON "ResumeTemplate"("photoSupport");

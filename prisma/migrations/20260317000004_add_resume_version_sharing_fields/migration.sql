-- Add sharing fields to ResumeVersion (added via db push, missing from migrations)
ALTER TABLE "ResumeVersion" ADD COLUMN IF NOT EXISTS "isPublic" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ResumeVersion" ADD COLUMN IF NOT EXISTS "shareToken" TEXT;
ALTER TABLE "ResumeVersion" ADD COLUMN IF NOT EXISTS "shareViews" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ResumeVersion" ADD COLUMN IF NOT EXISTS "shareDownloads" INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS "ResumeVersion_shareToken_key" ON "ResumeVersion"("shareToken");
CREATE INDEX IF NOT EXISTS "ResumeVersion_shareToken_idx" ON "ResumeVersion"("shareToken");

-- Create SavedJob table (was created via db push, missing from migrations)
CREATE TABLE IF NOT EXISTS "SavedJob" (
    "id"            TEXT NOT NULL,
    "userId"        TEXT NOT NULL,
    "externalJobId" TEXT NOT NULL,
    "source"        TEXT NOT NULL DEFAULT 'Adzuna',
    "title"         TEXT NOT NULL,
    "company"       TEXT NOT NULL,
    "location"      TEXT NOT NULL,
    "salary"        TEXT,
    "jobType"       TEXT,
    "description"   TEXT NOT NULL,
    "url"           TEXT NOT NULL,
    "postedAt"      TEXT,
    "logoUrl"       TEXT,
    "notes"         TEXT,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedJob_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SavedJob_userId_externalJobId_key" ON "SavedJob"("userId", "externalJobId");
CREATE INDEX IF NOT EXISTS "SavedJob_userId_idx" ON "SavedJob"("userId");
CREATE INDEX IF NOT EXISTS "SavedJob_createdAt_idx" ON "SavedJob"("createdAt");

ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

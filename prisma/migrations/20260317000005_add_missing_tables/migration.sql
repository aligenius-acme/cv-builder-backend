-- Create ApplicationStatus enum
DO $$ BEGIN
  CREATE TYPE "ApplicationStatus" AS ENUM ('WISHLIST', 'APPLIED', 'SCREENING', 'INTERVIEWING', 'OFFER', 'REJECTED', 'ACCEPTED', 'WITHDRAWN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create ABTestStatus enum
DO $$ BEGIN
  CREATE TYPE "ABTestStatus" AS ENUM ('DRAFT', 'RUNNING', 'PAUSED', 'COMPLETED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create ShareAnalytics table
CREATE TABLE IF NOT EXISTS "ShareAnalytics" (
    "id"              TEXT NOT NULL,
    "resumeVersionId" TEXT NOT NULL,
    "eventType"       TEXT NOT NULL,
    "visitorIp"       TEXT,
    "userAgent"       TEXT,
    "referer"         TEXT,
    "country"         TEXT,
    "city"            TEXT,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShareAnalytics_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ShareAnalytics_resumeVersionId_idx" ON "ShareAnalytics"("resumeVersionId");
CREATE INDEX IF NOT EXISTS "ShareAnalytics_createdAt_idx" ON "ShareAnalytics"("createdAt");

ALTER TABLE "ShareAnalytics" ADD CONSTRAINT "ShareAnalytics_resumeVersionId_fkey"
    FOREIGN KEY ("resumeVersionId") REFERENCES "ResumeVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create JobApplication table
CREATE TABLE IF NOT EXISTS "JobApplication" (
    "id"               TEXT NOT NULL,
    "userId"           TEXT NOT NULL,
    "jobTitle"         TEXT NOT NULL,
    "companyName"      TEXT NOT NULL,
    "location"         TEXT,
    "salary"           TEXT,
    "jobUrl"           TEXT,
    "jobDescription"   TEXT,
    "status"           "ApplicationStatus" NOT NULL DEFAULT 'WISHLIST',
    "statusOrder"      INTEGER NOT NULL DEFAULT 0,
    "appliedAt"        TIMESTAMP(3),
    "deadline"         TIMESTAMP(3),
    "interviewDate"    TIMESTAMP(3),
    "interviewType"    TEXT,
    "interviewNotes"   TEXT,
    "resumeVersionId"  TEXT,
    "coverLetterId"    TEXT,
    "notes"            TEXT,
    "contactName"      TEXT,
    "contactEmail"     TEXT,
    "nextFollowUp"     TIMESTAMP(3),
    "offerAmount"      DOUBLE PRECISION,
    "offerDeadline"    TIMESTAMP(3),
    "source"           TEXT,
    "priority"         INTEGER NOT NULL DEFAULT 0,
    "color"            TEXT,
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "JobApplication_userId_idx" ON "JobApplication"("userId");
CREATE INDEX IF NOT EXISTS "JobApplication_status_idx" ON "JobApplication"("status");
CREATE INDEX IF NOT EXISTS "JobApplication_createdAt_idx" ON "JobApplication"("createdAt");

ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create JobActivity table
CREATE TABLE IF NOT EXISTS "JobActivity" (
    "id"               TEXT NOT NULL,
    "jobApplicationId" TEXT NOT NULL,
    "type"             TEXT NOT NULL,
    "description"      TEXT NOT NULL,
    "oldValue"         TEXT,
    "newValue"         TEXT,
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobActivity_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "JobActivity_jobApplicationId_idx" ON "JobActivity"("jobApplicationId");
CREATE INDEX IF NOT EXISTS "JobActivity_createdAt_idx" ON "JobActivity"("createdAt");

ALTER TABLE "JobActivity" ADD CONSTRAINT "JobActivity_jobApplicationId_fkey"
    FOREIGN KEY ("jobApplicationId") REFERENCES "JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create ResumeABTest table
CREATE TABLE IF NOT EXISTS "ResumeABTest" (
    "id"              TEXT NOT NULL,
    "userId"          TEXT NOT NULL,
    "name"            TEXT NOT NULL,
    "description"     TEXT,
    "targetJobTitle"  TEXT,
    "targetCompany"   TEXT,
    "status"          "ABTestStatus" NOT NULL DEFAULT 'DRAFT',
    "variants"        JSONB,
    "goal"            TEXT,
    "startedAt"       TIMESTAMP(3),
    "endedAt"         TIMESTAMP(3),
    "winningVariantId" TEXT,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResumeABTest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ResumeABTest_userId_idx" ON "ResumeABTest"("userId");
CREATE INDEX IF NOT EXISTS "ResumeABTest_status_idx" ON "ResumeABTest"("status");

ALTER TABLE "ResumeABTest" ADD CONSTRAINT "ResumeABTest_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create ABTestVariant table
CREATE TABLE IF NOT EXISTS "ABTestVariant" (
    "id"              TEXT NOT NULL,
    "testId"          TEXT NOT NULL,
    "name"            TEXT NOT NULL,
    "resumeVersionId" TEXT,
    "customContent"   JSONB,
    "shareToken"      TEXT,
    "views"           INTEGER NOT NULL DEFAULT 0,
    "downloads"       INTEGER NOT NULL DEFAULT 0,
    "applications"    INTEGER NOT NULL DEFAULT 0,
    "responses"       INTEGER NOT NULL DEFAULT 0,
    "interviews"      INTEGER NOT NULL DEFAULT 0,
    "responseRate"    DOUBLE PRECISION NOT NULL DEFAULT 0,
    "events"          JSONB,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ABTestVariant_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ABTestVariant_shareToken_key" ON "ABTestVariant"("shareToken");
CREATE INDEX IF NOT EXISTS "ABTestVariant_testId_idx" ON "ABTestVariant"("testId");
CREATE INDEX IF NOT EXISTS "ABTestVariant_shareToken_idx" ON "ABTestVariant"("shareToken");

ALTER TABLE "ABTestVariant" ADD CONSTRAINT "ABTestVariant_testId_fkey"
    FOREIGN KEY ("testId") REFERENCES "ResumeABTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create ABTestEvent table
CREATE TABLE IF NOT EXISTS "ABTestEvent" (
    "id"          TEXT NOT NULL,
    "variantId"   TEXT NOT NULL,
    "eventType"   TEXT NOT NULL,
    "metadata"    JSONB,
    "visitorId"   TEXT,
    "visitorIp"   TEXT,
    "userAgent"   TEXT,
    "country"     TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ABTestEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ABTestEvent_variantId_idx" ON "ABTestEvent"("variantId");
CREATE INDEX IF NOT EXISTS "ABTestEvent_eventType_idx" ON "ABTestEvent"("eventType");
CREATE INDEX IF NOT EXISTS "ABTestEvent_createdAt_idx" ON "ABTestEvent"("createdAt");

ALTER TABLE "ABTestEvent" ADD CONSTRAINT "ABTestEvent_variantId_fkey"
    FOREIGN KEY ("variantId") REFERENCES "ABTestVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

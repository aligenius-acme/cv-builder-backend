-- Performance Optimization Indexes
-- Run this SQL directly on your database to add composite indexes for better query performance
-- These indexes are in addition to the ones already defined in the Prisma schema

-- Resume composite indexes (userId + createdAt for user resume lists)
CREATE INDEX IF NOT EXISTS "Resume_userId_createdAt_idx" ON "Resume"("userId", "createdAt" DESC);

-- ResumeVersion composite indexes
CREATE INDEX IF NOT EXISTS "ResumeVersion_userId_createdAt_idx" ON "ResumeVersion"("userId", "createdAt" DESC);

-- JobApplication composite indexes (userId + status for filtered lists)
CREATE INDEX IF NOT EXISTS "JobApplication_userId_status_idx" ON "JobApplication"("userId", "status");
CREATE INDEX IF NOT EXISTS "JobApplication_userId_createdAt_idx" ON "JobApplication"("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "JobApplication_status_createdAt_idx" ON "JobApplication"("status", "createdAt" DESC);

-- CoverLetter composite indexes
CREATE INDEX IF NOT EXISTS "CoverLetter_userId_createdAt_idx" ON "CoverLetter"("userId", "createdAt" DESC);

-- AIUsageLog composite indexes (for analytics and cost tracking)
CREATE INDEX IF NOT EXISTS "AIUsageLog_userId_createdAt_idx" ON "AIUsageLog"("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "AIUsageLog_operation_createdAt_idx" ON "AIUsageLog"("operation", "createdAt" DESC);

-- SavedJob composite indexes
CREATE INDEX IF NOT EXISTS "SavedJob_userId_createdAt_idx" ON "SavedJob"("userId", "createdAt" DESC);

-- Subscription indexes (for billing queries)
CREATE INDEX IF NOT EXISTS "Subscription_userId_status_idx" ON "Subscription"("userId", "status");
CREATE INDEX IF NOT EXISTS "Subscription_currentPeriodEnd_idx" ON "Subscription"("currentPeriodEnd");

-- User indexes (for analytics)
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");
CREATE INDEX IF NOT EXISTS "User_lastLoginAt_idx" ON "User"("lastLoginAt" DESC);

-- Optional: Add to existing User.createdAt index if not already present
-- CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt" DESC);

-- Note: These indexes will improve query performance for:
-- - User-specific data retrieval (userId + timestamp queries)
-- - Status-based filtering (job applications by status)
-- - Analytics queries (usage logs, time-based aggregations)
-- - Dashboard queries (recent items, statistics)

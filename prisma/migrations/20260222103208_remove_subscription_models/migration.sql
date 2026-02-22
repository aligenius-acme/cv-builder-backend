-- Drop foreign key constraints first
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_subscription_fkey";
ALTER TABLE "Organization" DROP CONSTRAINT IF EXISTS "Organization_subscription_fkey";

-- Drop tables
DROP TABLE IF EXISTS "Subscription" CASCADE;
DROP TABLE IF EXISTS "OrgSubscription" CASCADE;

-- Drop enums
DROP TYPE IF EXISTS "PlanType";
DROP TYPE IF EXISTS "SubscriptionStatus";

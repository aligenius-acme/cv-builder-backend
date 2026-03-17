-- Make passwordHash nullable to support OAuth users (Google, GitHub)
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;

/**
 * Reset AI Credits for Fresh Testing
 *
 * Sets aiCreditsUsed = 0 for aligenius@gmail.com
 * This gives a clean slate to test the refactored credit system
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TEST_EMAIL = 'aligenius@gmail.com';

async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('  RESET AI CREDITS - FRESH START');
  console.log('='.repeat(70) + '\n');

  // Get current state
  const before = await prisma.user.findUnique({
    where: { email: TEST_EMAIL },
    select: { id: true, aiCredits: true, aiCreditsUsed: true }
  });

  if (!before) {
    console.log(`❌ User ${TEST_EMAIL} not found`);
    return;
  }

  console.log('📊 BEFORE RESET');
  console.log('-'.repeat(70));
  console.log(`User ID        : ${before.id}`);
  console.log(`Total Credits  : ${before.aiCredits}`);
  console.log(`Used Credits   : ${before.aiCreditsUsed}`);
  console.log(`Remaining      : ${before.aiCredits - before.aiCreditsUsed}\n`);

  // Reset to 0
  await prisma.user.update({
    where: { email: TEST_EMAIL },
    data: { aiCreditsUsed: 0 }
  });

  // Get new state
  const after = await prisma.user.findUnique({
    where: { email: TEST_EMAIL },
    select: { aiCredits: true, aiCreditsUsed: true }
  });

  console.log('📊 AFTER RESET');
  console.log('-'.repeat(70));
  console.log(`Total Credits  : ${after.aiCredits}`);
  console.log(`Used Credits   : ${after.aiCreditsUsed}`);
  console.log(`Remaining      : ${after.aiCredits - after.aiCreditsUsed}\n`);

  console.log('✅ Credits reset successfully!');
  console.log('📝 Note: Old AI usage logs are preserved for historical record\n');
  console.log('='.repeat(70) + '\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

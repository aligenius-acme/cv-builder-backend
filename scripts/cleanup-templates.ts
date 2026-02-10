import { prisma } from '../src/utils/prisma';

async function cleanup() {
  console.log('🗑️  Starting template cleanup...\n');

  // Delete all existing templates
  const deleted = await prisma.resumeTemplate.deleteMany({});
  console.log(`✅ Deleted ${deleted.count} templates from database\n`);

  console.log('✅ Cleanup complete!');
  await prisma.$disconnect();
}

cleanup().catch(console.error);

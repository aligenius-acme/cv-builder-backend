import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifySeeding() {
  console.log('🔍 Verifying template seeding...\n');

  // Get total count
  const totalCount = await prisma.resumeTemplate.count();
  console.log(`✅ Total templates in database: ${totalCount}`);

  // Get count by primary category
  const byCategory = await prisma.resumeTemplate.groupBy({
    by: ['primaryCategory'],
    _count: true,
  });

  console.log('\n📊 Templates by Primary Category:');
  byCategory
    .sort((a, b) => (b._count || 0) - (a._count || 0))
    .forEach(item => {
      console.log(`   ${item.primaryCategory || 'legacy'}: ${item._count} templates`);
    });

  // Get featured templates
  const featured = await prisma.resumeTemplate.findMany({
    where: { isFeatured: true },
    select: { name: true, primaryCategory: true },
    take: 10,
  });

  console.log(`\n⭐ Featured Templates (${featured.length}):`);
  featured.forEach(t => {
    console.log(`   - ${t.name} (${t.primaryCategory || 'legacy'})`);
  });

  // Get ATS-safe templates
  const atsSafe = await prisma.resumeTemplate.count({
    where: { atsCompatibility: 'ats-safe' },
  });

  console.log(`\n🎯 ATS-Safe Templates: ${atsSafe}`);

  await prisma.$disconnect();
  console.log('\n✅ Verification complete!');
}

verifySeeding().catch(console.error);

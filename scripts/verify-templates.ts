/**
 * Verify Template Database Entries
 * Quick script to verify all templates have been created with preview URLs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Verifying template database entries...\n');

  // Count total templates
  const totalCount = await prisma.resumeTemplate.count();
  console.log(`Total templates in database: ${totalCount}`);

  // Count by category
  const categories = [
    'ats-professional',
    'tech-startup',
    'executive-leadership',
    'academic-research',
    'creative-design',
    'entry-student',
  ];

  console.log('\nTemplates by category:');
  for (const category of categories) {
    const count = await prisma.resumeTemplate.count({
      where: { primaryCategory: category },
    });
    console.log(`  ${category}: ${count}`);
  }

  // Count with preview images
  const withPreviews = await prisma.resumeTemplate.count({
    where: {
      previewImageUrl: {
        not: null,
      },
    },
  });

  console.log(`\nTemplates with preview images: ${withPreviews}`);

  // Show some examples
  console.log('\nSample templates:');
  const samples = await prisma.resumeTemplate.findMany({
    take: 5,
    select: {
      id: true,
      name: true,
      primaryCategory: true,
      previewImageUrl: true,
    },
  });

  samples.forEach(template => {
    console.log(`  - ${template.name} (${template.id})`);
    console.log(`    Category: ${template.primaryCategory}`);
    console.log(`    Preview: ${template.previewImageUrl}`);
  });

  console.log('\n✓ Verification complete!\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  });

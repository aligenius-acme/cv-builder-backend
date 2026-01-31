/**
 * Setup Templates Script
 * Runs database migration and seeds all 80 templates
 *
 * Usage:
 *   npm run setup:templates
 *   or
 *   ts-node scripts/setup-templates.ts
 */

import { PrismaClient } from '@prisma/client';
import { seedTemplates } from '../prisma/seeds/templates';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Setting up resume templates database...\n');

  try {
    // Check database connection
    await prisma.$connect();
    console.log('✅ Database connection successful\n');

    // Seed templates
    console.log('📝 Seeding templates...');
    await seedTemplates();
    console.log('');

    // Verify seeding
    const count = await prisma.resumeTemplate.count();
    console.log(`✅ Total templates in database: ${count}\n`);

    // Get category breakdown
    const categories = await prisma.resumeTemplate.groupBy({
      by: ['primaryCategory'],
      _count: true,
    });

    console.log('📊 Templates by category:');
    categories.forEach(cat => {
      console.log(`   - ${cat.primaryCategory || 'Unknown'}: ${cat._count} templates`);
    });
    console.log('');

    // List featured templates
    const featured = await prisma.resumeTemplate.findMany({
      where: { isFeatured: true },
      select: { id: true, name: true, primaryCategory: true },
      orderBy: { popularityScore: 'desc' },
    });

    console.log('⭐ Featured templates:');
    featured.forEach(t => {
      console.log(`   - ${t.name} (${t.primaryCategory})`);
    });
    console.log('');

    console.log('✅ Template setup complete!\n');
  } catch (error) {
    console.error('❌ Error setting up templates:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

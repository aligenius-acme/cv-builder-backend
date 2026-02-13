/**
 * Add 'summary' to all template section orders
 */

import { prisma } from '../src/utils/prisma';

async function addSummaryToTemplates() {
  try {
    console.log('🔧 Adding summary to all template section orders...\n');

    // Get all templates
    const templates = await prisma.resumeTemplate.findMany();

    console.log(`📊 Found ${templates.length} templates to update\n`);

    let updatedCount = 0;
    let alreadyHadCount = 0;
    let noConfigCount = 0;

    for (const template of templates) {
      const config = template.templateConfig as any;

      if (!config || !config.sections || !config.sections.order) {
        console.log(`⚠️  ${template.name}: No sections.order config`);
        noConfigCount++;
        continue;
      }

      if (config.sections.order.includes('summary')) {
        console.log(`✓ ${template.name}: Already has summary`);
        alreadyHadCount++;
        continue;
      }

      // Add 'summary' at the beginning (right after header, before other sections)
      const updatedOrder = ['summary', ...config.sections.order];

      await prisma.resumeTemplate.update({
        where: { id: template.id },
        data: {
          templateConfig: {
            ...config,
            sections: {
              ...config.sections,
              order: updatedOrder,
            },
          },
        },
      });

      console.log(`✅ ${template.name}: Added summary to section order`);
      updatedCount++;
    }

    console.log('\n📊 Summary:');
    console.log(`   Updated: ${updatedCount} templates`);
    console.log(`   Already had summary: ${alreadyHadCount} templates`);
    console.log(`   No config: ${noConfigCount} templates`);
    console.log('\n🎉 Done! Summary will now appear in all PDFs');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSummaryToTemplates();

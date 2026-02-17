/**
 * Verify all templates have layout components assigned
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyTemplates() {
  console.log('🔍 Verifying template layout assignments...\n');

  const allTemplates = await prisma.resumeTemplate.findMany({
    select: {
      id: true,
      name: true,
      primaryCategory: true,
      templateConfig: true,
    }
  });

  console.log(`📊 Total templates: ${allTemplates.length}`);

  let withLayout = 0;
  let withoutLayout = 0;
  const missingLayouts: string[] = [];

  allTemplates.forEach(template => {
    const config = template.templateConfig as any;
    if (config?.layoutComponent) {
      withLayout++;
    } else {
      withoutLayout++;
      missingLayouts.push(`${template.name} (${template.id})`);
    }
  });

  console.log(`✅ Templates WITH layoutComponent: ${withLayout}`);
  console.log(`❌ Templates WITHOUT layoutComponent: ${withoutLayout}\n`);

  if (withoutLayout > 0) {
    console.log('⚠️  Templates missing layoutComponent:');
    missingLayouts.slice(0, 20).forEach(name => console.log(`   - ${name}`));
    if (withoutLayout > 20) {
      console.log(`   ... and ${withoutLayout - 20} more`);
    }
  } else {
    console.log('🎉 All templates have layout components assigned!');
  }

  // Show breakdown by layout
  console.log('\n📈 Layout distribution:');
  const layoutCounts: Record<string, number> = {};

  allTemplates.forEach(template => {
    const config = template.templateConfig as any;
    const layout = config?.layoutComponent || 'none';
    layoutCounts[layout] = (layoutCounts[layout] || 0) + 1;
  });

  Object.entries(layoutCounts)
    .sort(([, a], [, b]) => b - a)
    .forEach(([layout, count]) => {
      console.log(`   ${layout}: ${count} templates`);
    });

  await prisma.$disconnect();
}

verifyTemplates();

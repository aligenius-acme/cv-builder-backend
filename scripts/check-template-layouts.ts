import { prisma } from '../src/utils/prisma';

async function checkTemplates() {
  const templates = await prisma.resumeTemplate.findMany({
    select: {
      id: true,
      name: true,
      templateConfig: true,
    },
    take: 30
  });

  const layoutCounts: Record<string, number> = {};

  for (const t of templates) {
    const config = t.templateConfig as any;
    const layout = config?.layout || 'UNKNOWN';

    layoutCounts[layout] = (layoutCounts[layout] || 0) + 1;

    console.log(`${t.name}:`);
    console.log(`  Layout: ${layout}`);
    console.log(`  Header: ${config?.components?.header || 'none'}`);
    console.log(`  Experience: ${config?.components?.experience || 'none'}`);
    console.log(`  Skills: ${config?.components?.skills || 'none'}`);
    console.log(`  Color: ${config?.colorScheme?.name || 'unknown'}`);
    console.log('');
  }

  console.log('=== LAYOUT SUMMARY ===');
  for (const [layout, count] of Object.entries(layoutCounts)) {
    console.log(`${layout}: ${count} templates`);
  }

  await prisma.$disconnect();
}

checkTemplates().catch(console.error);

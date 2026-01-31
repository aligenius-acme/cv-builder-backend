import { prisma } from '../src/utils/prisma';

async function main() {
  const templates = await prisma.resumeTemplate.findMany({
    where: {
      id: {
        in: ['product-designer', 'executive-impact', 'academic-cv', 'developer-minimal', 'startup-bold', 'corporate-standard']
      }
    },
    select: {
      id: true,
      name: true,
      primaryCategory: true,
      templateConfig: true,
    }
  });

  console.log('Templates in database:');
  templates.forEach((t: any) => {
    console.log(`\n✓ ${t.name} (${t.id}):`);
    console.log(`  Category: ${t.primaryCategory}`);
    console.log(`  Config layout: ${t.templateConfig?.layout || 'not set'}`);
  });

  await prisma.$disconnect();
}

main();

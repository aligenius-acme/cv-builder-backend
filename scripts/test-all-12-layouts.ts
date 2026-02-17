/**
 * Test PDF Generation for All 12 Unique Layouts
 */

import { PrismaClient } from '@prisma/client';
import { generatePDFFromReact } from '../src/services/react-pdf-generator';
import { professionalSampleData } from '../src/examples/sample-data/professional-sample';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

const ALL_LAYOUTS = [
  'BaseLayout',
  'TwoColumnSidebarLayout',
  'ModernMinimalLayout',
  'ExecutiveLayout',
  'CreativeLayout',
  'TimelineLayout',
  'CompactLayout',
  'TechLayout',
  'AcademicLayout',
  'PortfolioLayout',
  'ProfessionalLayout',
  'InfographicLayout',
];

async function testAll12Layouts() {
  console.log('🧪 Testing All 12 Unique Layouts\n');

  const outputDir = join(__dirname, '../test-output/all-layouts');
  mkdirSync(outputDir, { recursive: true });

  const results: any[] = [];

  for (const layoutType of ALL_LAYOUTS) {
    console.log(`\n📄 Testing: ${layoutType}`);

    try {
      const template = await prisma.resumeTemplate.findFirst({
        where: {
          templateConfig: {
            path: ['layoutComponent'],
            equals: layoutType
          }
        },
        select: { id: true, name: true }
      });

      if (!template) {
        console.log(`❌ No template found with ${layoutType}`);
        results.push({ layout: layoutType, success: false, error: 'No template found' });
        continue;
      }

      const startTime = Date.now();
      const pdfBuffer = await generatePDFFromReact(template.id, professionalSampleData);
      const duration = Date.now() - startTime;

      const fileName = `${layoutType}.pdf`;
      writeFileSync(join(outputDir, fileName), pdfBuffer);

      console.log(`✅ Success - ${duration}ms - ${(pdfBuffer.length / 1024).toFixed(1)}KB`);
      results.push({ layout: layoutType, success: true, duration, size: pdfBuffer.length });

    } catch (error: any) {
      console.log(`❌ Failed: ${error.message}`);
      results.push({ layout: layoutType, success: false, error: error.message });
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('📊 FINAL RESULTS');
  console.log('='.repeat(70) + '\n');

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`Total: ${results.length} layouts`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}\n`);

  results.forEach(r => {
    const status = r.success ? '✅' : '❌';
    console.log(`${status} ${r.layout.padEnd(25)} ${r.success ? `${r.duration}ms` : r.error}`);
  });

  if (passed === 12) {
    console.log(`\n🎉 All 12 layouts working perfectly!\n`);
  }

  await prisma.$disconnect();
}

testAll12Layouts();

/**
 * Update preview image URLs in the database
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Updating preview image URLs...\n');

  // Get all templates
  const templates = await prisma.resumeTemplate.findMany({
    select: { id: true, name: true },
  });

  console.log(`📊 Found ${templates.length} templates\n`);

  let updatedCount = 0;
  let missingCount = 0;

  for (const template of templates) {
    // Check if thumbnail exists
    const thumbPath = path.join(
      __dirname,
      '../../frontend/public/template-previews/thumbnails',
      `${template.id}-thumb.png`
    );

    if (fs.existsSync(thumbPath)) {
      // Update database with correct URL
      await prisma.resumeTemplate.update({
        where: { id: template.id },
        data: {
          previewImageUrl: `/template-previews/thumbnails/${template.id}-thumb.png`,
        },
      });

      updatedCount++;
      console.log(`  ✅ ${template.name}`);
    } else {
      missingCount++;
      console.log(`  ❌ Missing: ${template.name} (${template.id})`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Updated: ${updatedCount} templates`);
  console.log(`❌ Missing: ${missingCount} templates`);
  console.log('='.repeat(60));

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

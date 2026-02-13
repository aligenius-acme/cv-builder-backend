/**
 * Fix Thumbnail URLs
 * Convert local file:// URLs to HTTP URLs served by backend
 */

import { PrismaClient } from '@prisma/client';
import path from 'path';

const prisma = new PrismaClient();

async function fixThumbnailUrls() {
  console.log('🔧 Fixing thumbnail URLs...\n');

  try {
    // Get all templates
    const templates = await prisma.resumeTemplate.findMany({
      select: {
        id: true,
        name: true,
        previewImageUrl: true,
      },
    });

    console.log(`📊 Found ${templates.length} templates to process\n`);

    let updateCount = 0;

    for (const template of templates) {
      if (template.previewImageUrl && template.previewImageUrl.startsWith('file://')) {
        // Convert file:// URL to HTTP URL
        // Extract the relative path after "uploads/"
        const filePath = template.previewImageUrl.replace('file://', '');
        const uploadsIndex = filePath.indexOf('uploads');

        if (uploadsIndex !== -1) {
          const relativePath = filePath.substring(uploadsIndex);
          // Convert Windows backslashes to forward slashes
          const httpPath = relativePath.replace(/\\/g, '/');
          const httpUrl = `http://localhost:3001/${httpPath}`;

          await prisma.resumeTemplate.update({
            where: { id: template.id },
            data: { previewImageUrl: httpUrl },
          });

          console.log(`✓ Updated: ${template.name}`);
          console.log(`  Old: ${template.previewImageUrl.substring(0, 60)}...`);
          console.log(`  New: ${httpUrl}`);
          console.log();
          updateCount++;
        }
      }
    }

    console.log(`\n✨ URL fix complete!`);
    console.log(`   Updated: ${updateCount}/${templates.length}\n`);
  } catch (error) {
    console.error('❌ Error fixing URLs:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  fixThumbnailUrls();
}

export { fixThumbnailUrls };

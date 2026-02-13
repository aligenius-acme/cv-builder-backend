/**
 * Regenerate Template Thumbnails
 * Uses the SAME React PDF system as live previews to ensure consistency
 */

import { PrismaClient } from '@prisma/client';
import puppeteer from 'puppeteer';
import { uploadImage } from '../src/services/storage';
import { generatePDFFromReact } from '../src/services/react-pdf-generator';
import { getSampleResumeData } from '../src/controllers/templates';

const prisma = new PrismaClient();

async function regenerateThumbnails() {
  console.log('🎨 Regenerating thumbnails using React PDF system (same as live preview)...\n');

  try {
    // Get all templates from database
    const templates = await prisma.resumeTemplate.findMany({
      select: {
        id: true,
        name: true,
        primaryCategory: true,
      },
    });

    console.log(`📊 Found ${templates.length} templates to process\n`);

    // Get sample data from the actual template controller
    const sampleData = getSampleResumeData();

    // Launch browser
    console.log('🚀 Launching browser...');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    let successCount = 0;
    let errorCount = 0;

    // Process each template
    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      const progress = `[${i + 1}/${templates.length}]`;

      try {
        console.log(`${progress} Generating thumbnail for: ${template.name}`);

        // Use the SAME React PDF generator as live preview
        const pdfBuffer = await generatePDFFromReact(template.id, sampleData);

        // Create new page and load PDF
        const page = await browser.newPage();
        await page.setViewport({ width: 800, height: 1200 });

        // Convert PDF buffer to data URL
        const pdfDataUrl = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;

        // Load PDF in browser
        await page.goto(pdfDataUrl, {
          waitUntil: 'networkidle0',
          timeout: 30000
        });

        // Wait a moment for PDF to render
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Take screenshot
        const screenshot = await page.screenshot({
          type: 'png',
          clip: {
            x: 0,
            y: 0,
            width: 800,
            height: 1200,
          },
        });

        await page.close();

        // Upload to storage
        const result = await uploadImage(
          Buffer.from(screenshot),
          'system',
          `template-thumbnails/${template.id}`
        );

        // Update database with thumbnail URL
        await prisma.resumeTemplate.update({
          where: { id: template.id },
          data: { previewImageUrl: result.url },
        });

        successCount++;
        console.log(`  ✓ Uploaded: ${result.url.substring(0, 60)}...`);
      } catch (error) {
        errorCount++;
        console.error(`  ✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        if (error instanceof Error) {
          console.error(`     ${error.stack?.split('\n').slice(0, 3).join('\n     ')}`);
        }
      }

      // Add small delay to avoid rate limiting
      if (i < templates.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    await browser.close();

    console.log('\n✨ Thumbnail regeneration complete!');
    console.log(`   Success: ${successCount}/${templates.length}`);
    console.log(`   Errors: ${errorCount}/${templates.length}\n`);

    if (errorCount > 0) {
      console.log('⚠️  Some thumbnails failed to generate. Check errors above.');
    }
  } catch (error) {
    console.error('❌ Error regenerating thumbnails:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  regenerateThumbnails();
}

export { regenerateThumbnails };

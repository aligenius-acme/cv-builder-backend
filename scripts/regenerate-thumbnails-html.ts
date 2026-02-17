/**
 * Regenerate Template Thumbnails - HTML Direct Rendering
 * Renders templates as HTML (not PDF) for clean thumbnails without PDF viewer UI
 */

import { PrismaClient } from '@prisma/client';
import puppeteer from 'puppeteer';
import { uploadImage } from '../src/services/storage';
import { getSampleResumeData } from '../src/controllers/templates';
import { getLayoutComponent } from '../src/templates/layouts';
import { getTemplateConfig } from '../src/services/templates';
import * as ReactDOMServer from 'react-dom/server';
import * as React from 'react';

const prisma = new PrismaClient();

async function regenerateThumbnails() {
  console.log('🎨 Regenerating thumbnails using HTML rendering (clean, no PDF viewer)...\n');

  try {
    // Get all templates from database
    const templates = await prisma.resumeTemplate.findMany({
      select: {
        id: true,
        name: true,
        primaryCategory: true,
        templateConfig: true,
      },
    });

    console.log(`📊 Found ${templates.length} templates to process\n`);

    // Get sample data
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

        // Get template configuration
        const config = getTemplateConfig(template.id);
        const templateConfig = template.templateConfig as any;

        // Get the layout component
        let LayoutComponent;
        if (templateConfig?.layoutComponent) {
          LayoutComponent = getLayoutComponent(templateConfig.layoutComponent);
        } else {
          LayoutComponent = getLayoutComponent(); // Default BaseLayout
        }

        // Render template to HTML
        const templateElement = React.createElement(LayoutComponent, {
          data: sampleData,
          config,
        });

        const componentHTML = ReactDOMServer.renderToStaticMarkup(templateElement);

        // Create full HTML page
        const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resume Preview</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    @page {
      size: A4;
      margin: 0;
    }

    body {
      margin: 0;
      padding: 0;
      background: white;
      font-family: ${config.fontFamily || 'Helvetica, Arial, sans-serif'};
      width: 210mm;
      min-height: 297mm;
      color: ${config.textColor || '#1e293b'};
    }

    /* Ensure colors are visible */
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    /* Link styling */
    a {
      color: ${config.primaryColor || '#2563eb'};
      text-decoration: none;
    }

    h1, h2, h3, h4, h5, h6 {
      margin: 0;
      font-weight: normal;
    }

    p {
      margin: 0;
    }

    ul, ol {
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  ${componentHTML}
</body>
</html>
        `.trim();

        // Create new page
        const page = await browser.newPage();

        // Set viewport to A4 proportions (800x1132 for better quality)
        await page.setViewport({
          width: 800,
          height: 1132,
          deviceScaleFactor: 2, // Higher quality
        });

        // Load HTML content
        await page.setContent(fullHTML, {
          waitUntil: 'networkidle0',
          timeout: 10000,
        });

        // Wait for fonts and styles to load
        await new Promise(resolve => setTimeout(resolve, 500));

        // Take screenshot of just the first page
        const screenshot = await page.screenshot({
          type: 'png',
          clip: {
            x: 0,
            y: 0,
            width: 800,
            height: 1132, // Full A4 page height
          },
        });

        await page.close();

        // Upload to Cloudinary
        const uploadResult = await uploadImage(screenshot, 'template-thumbnails');
        const thumbnailUrl = typeof uploadResult === 'string' ? uploadResult : uploadResult.url;

        // Update database
        await prisma.resumeTemplate.update({
          where: { id: template.id },
          data: { previewImageUrl: thumbnailUrl },
        });

        console.log(`  ✓ Uploaded: ${thumbnailUrl.substring(0, 70)}...`);
        successCount++;

      } catch (error: any) {
        console.error(`  ✗ Error: ${error.message}`);
        errorCount++;
      }
    }

    await browser.close();

    console.log(`\n✨ Thumbnail regeneration complete!`);
    console.log(`   Success: ${successCount}/${templates.length}`);
    console.log(`   Errors: ${errorCount}/${templates.length}`);

    if (errorCount > 0) {
      console.log(`\n⚠️  Some thumbnails failed to generate. Check errors above.`);
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

regenerateThumbnails()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });

/**
 * Preview Image Generator Script
 * Generates preview images for all resume templates using Puppeteer
 *
 * Features:
 * - Renders templates with appropriate sample data
 * - Generates thumbnail (300x400) and full preview (1200x1600) images
 * - Batch processing to avoid memory issues
 * - Progress tracking and error handling
 * - Summary report at completion
 *
 * Usage:
 *   ts-node scripts/generate-previews.ts
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';

// Import sample data
import { getSampleDataForCategory } from '../src/examples/sample-data';

// Import color palettes
import { getColorPalette } from '../src/templates/shared/styles/colors';

// Import all templates
import { atsProfessionalTemplates } from '../src/templates/ats-professional';
import { techStartupTemplates } from '../src/templates/tech-startup';
import { executiveLeadershipTemplates } from '../src/templates/executive-leadership';
import { academicResearchTemplates } from '../src/templates/academic-research';
import { creativeDesignTemplates } from '../src/templates/creative-design';
import { entryStudentTemplates } from '../src/templates/entry-student';

// Configuration
const CONFIG = {
  batchSize: 5, // Process 5 templates at a time
  outputDir: path.join(__dirname, '../../frontend/public/template-previews'),
  thumbnailSize: { width: 300, height: 400 },
  fullPreviewSize: { width: 1200, height: 1600 },
  pageSize: { width: 850, height: 1100 }, // A4-ish dimensions for rendering
  screenshotDelay: 500, // Wait for fonts and styles to load
};

// Template registry with all templates
const ALL_TEMPLATES = [
  ...atsProfessionalTemplates,
  ...techStartupTemplates,
  ...executiveLeadershipTemplates,
  ...academicResearchTemplates,
  ...creativeDesignTemplates,
  ...entryStudentTemplates,
];

interface PreviewResult {
  templateId: string;
  templateName: string;
  success: boolean;
  thumbnailPath?: string;
  fullPreviewPath?: string;
  error?: string;
}

/**
 * Generate HTML wrapper for template rendering
 */
function generateHTMLWrapper(templateHTML: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      background: white;
      width: ${CONFIG.pageSize.width}px;
      min-height: ${CONFIG.pageSize.height}px;
    }

    /* Import standard fonts */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
  </style>
</head>
<body>
  ${templateHTML}
</body>
</html>
  `;
}

/**
 * Generate preview images for a single template
 */
async function generatePreviewForTemplate(
  browser: Browser,
  template: any,
  outputDir: string
): Promise<PreviewResult> {
  const result: PreviewResult = {
    templateId: template.id,
    templateName: template.name,
    success: false,
  };

  let page: Page | null = null;

  try {
    console.log(`  Processing: ${template.name} (${template.id})`);

    // Get appropriate sample data for this template category
    const category = template.metadata.category;
    const sampleData = getSampleDataForCategory(category);

    // Get default color palette
    const colors = getColorPalette('professional');

    // Render template to HTML
    const templateElement = React.createElement(template.PDFComponent, {
      data: sampleData,
      colors: colors,
    });

    const templateHTML = renderToStaticMarkup(templateElement);
    const fullHTML = generateHTMLWrapper(templateHTML);

    // Create new page
    page = await browser.newPage();

    // Set viewport to page size
    await page.setViewport({
      width: CONFIG.pageSize.width,
      height: CONFIG.pageSize.height,
      deviceScaleFactor: 2, // For better quality
    });

    // Load HTML content
    await page.setContent(fullHTML, {
      waitUntil: ['load', 'networkidle0'],
    });

    // Wait for fonts and rendering
    await page.waitForTimeout(CONFIG.screenshotDelay);

    // Take full page screenshot
    const screenshotBuffer = await page.screenshot({
      type: 'png',
      fullPage: false, // Just first page
    });

    // Save full preview (1200x1600)
    const fullPreviewPath = path.join(outputDir, 'full', `${template.id}-full.png`);
    await sharp(screenshotBuffer)
      .resize(CONFIG.fullPreviewSize.width, CONFIG.fullPreviewSize.height, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .png()
      .toFile(fullPreviewPath);

    result.fullPreviewPath = fullPreviewPath;

    // Save thumbnail (300x400)
    const thumbnailPath = path.join(outputDir, 'thumbnails', `${template.id}-thumb.png`);
    await sharp(screenshotBuffer)
      .resize(CONFIG.thumbnailSize.width, CONFIG.thumbnailSize.height, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .png()
      .toFile(thumbnailPath);

    result.thumbnailPath = thumbnailPath;
    result.success = true;

    console.log(`    ✓ Generated previews for ${template.name}`);
  } catch (error: any) {
    console.error(`    ✗ Error generating preview for ${template.name}:`, error.message);
    result.error = error.message;
  } finally {
    if (page) {
      await page.close();
    }
  }

  return result;
}

/**
 * Process templates in batches
 */
async function processBatch(
  browser: Browser,
  templates: any[],
  batchNumber: number,
  totalBatches: number,
  outputDir: string
): Promise<PreviewResult[]> {
  console.log(`\nProcessing Batch ${batchNumber}/${totalBatches} (${templates.length} templates)`);

  const results: PreviewResult[] = [];

  for (const template of templates) {
    const result = await generatePreviewForTemplate(browser, template, outputDir);
    results.push(result);
  }

  return results;
}

/**
 * Main preview generation function
 */
async function generateAllPreviews() {
  console.log('='.repeat(80));
  console.log('Resume Template Preview Generator');
  console.log('='.repeat(80));
  console.log(`\nTotal templates to process: ${ALL_TEMPLATES.length}`);
  console.log(`Batch size: ${CONFIG.batchSize}`);
  console.log(`Output directory: ${CONFIG.outputDir}\n`);

  // Ensure output directories exist
  const thumbnailDir = path.join(CONFIG.outputDir, 'thumbnails');
  const fullDir = path.join(CONFIG.outputDir, 'full');

  if (!fs.existsSync(thumbnailDir)) {
    fs.mkdirSync(thumbnailDir, { recursive: true });
  }
  if (!fs.existsSync(fullDir)) {
    fs.mkdirSync(fullDir, { recursive: true });
  }

  // Launch browser
  console.log('Launching browser...\n');
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  const startTime = Date.now();
  const allResults: PreviewResult[] = [];

  try {
    // Split templates into batches
    const batches: any[][] = [];
    for (let i = 0; i < ALL_TEMPLATES.length; i += CONFIG.batchSize) {
      batches.push(ALL_TEMPLATES.slice(i, i + CONFIG.batchSize));
    }

    // Process each batch
    for (let i = 0; i < batches.length; i++) {
      const batchResults = await processBatch(
        browser,
        batches[i],
        i + 1,
        batches.length,
        CONFIG.outputDir
      );
      allResults.push(...batchResults);

      // Small delay between batches to prevent memory issues
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  } finally {
    await browser.close();
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Generate summary report
  console.log('\n' + '='.repeat(80));
  console.log('Preview Generation Summary');
  console.log('='.repeat(80));

  const successful = allResults.filter(r => r.success);
  const failed = allResults.filter(r => !r.success);

  console.log(`\nTotal templates: ${allResults.length}`);
  console.log(`✓ Successful: ${successful.length}`);
  console.log(`✗ Failed: ${failed.length}`);
  console.log(`Time taken: ${duration}s`);

  if (failed.length > 0) {
    console.log('\n' + '-'.repeat(80));
    console.log('Failed Templates:');
    console.log('-'.repeat(80));
    failed.forEach(result => {
      console.log(`  - ${result.templateName} (${result.templateId})`);
      console.log(`    Error: ${result.error}`);
    });
  }

  console.log('\n' + '='.repeat(80));
  console.log(`Preview images saved to: ${CONFIG.outputDir}`);
  console.log('='.repeat(80) + '\n');

  // Save results to JSON file for database update
  const resultsPath = path.join(CONFIG.outputDir, 'generation-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(allResults, null, 2));
  console.log(`Results saved to: ${resultsPath}\n`);

  return allResults;
}

// Check if sharp is available for image resizing
let sharp: any;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('Error: sharp module is required for image resizing');
  console.error('Install it with: npm install sharp');
  process.exit(1);
}

// Run the script
if (require.main === module) {
  generateAllPreviews()
    .then(() => {
      console.log('Preview generation completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { generateAllPreviews, generatePreviewForTemplate };

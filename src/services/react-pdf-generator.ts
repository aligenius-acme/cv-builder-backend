import * as ReactDOMServer from 'react-dom/server';
import * as React from 'react';
import puppeteer, { Browser, Page } from 'puppeteer';
import { ParsedResumeData } from '../types';
import { getTemplateConfig, ExtendedTemplateConfig } from './templates';
import { BaseTemplate } from '../templates/shared/components/BaseTemplate';
import { getLayoutComponent, LayoutType } from '../templates/layouts';
import { TemplateAssembler } from '../templates/shared/services/TemplateAssembler';
import { TemplateConfig } from '../templates/shared/types/templateConfig';
import { prisma } from '../utils/prisma';

// Browser instance singleton for reuse
let browserInstance: Browser | null = null;

/**
 * Get or create a Puppeteer browser instance
 * Reuses the same instance for better performance
 */
async function getBrowser(): Promise<Browser> {
  if (browserInstance && browserInstance.connected) {
    return browserInstance;
  }

  console.log('Launching new Puppeteer browser instance...');

  browserInstance = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
    ],
    timeout: 30000,
  });

  // Handle browser disconnect
  browserInstance.on('disconnected', () => {
    console.log('Browser instance disconnected');
    browserInstance = null;
  });

  return browserInstance;
}

/**
 * Close the browser instance (call on app shutdown)
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance && browserInstance.connected) {
    await browserInstance.close();
    browserInstance = null;
    console.log('Browser instance closed');
  }
}

/**
 * Render React component to HTML string
 */
function renderReactToHTML(
  templateComponent: React.ReactElement,
  config: ExtendedTemplateConfig
): string {
  const componentHTML = ReactDOMServer.renderToStaticMarkup(templateComponent);

  // Create full HTML document with embedded styles
  const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resume</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    @page {
      size: A4;
      margin-top: ${config.margins.top}px;
      margin-bottom: ${config.margins.bottom}px;
      margin-left: 0;
      margin-right: 0;
    }

    /* Page 1 gets its top spacing from the layout's wrapper padding,
       so @page margin-top is only needed from page 2 onwards */
    @page :first {
      margin-top: 0;
    }

    body {
      margin: 0;
      padding: 0;
      background: white;
      font-family: ${config.fontFamily || 'Helvetica, Arial, sans-serif'};
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      color-adjust: exact;
    }

    /* Ensure colors are printed */
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    /* Page break controls */
    .page-break {
      page-break-after: always;
      break-after: page;
    }

    .avoid-break {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* Ensure content fits on page */
    @media print {
      body {
        width: 210mm;
        height: 297mm;
      }
    }

    /* Font smoothing */
    body {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* Link styling for PDF */
    a {
      color: ${config.primaryColor};
      text-decoration: none;
    }

    /* Ensure proper spacing */
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

  return fullHTML;
}

/**
 * Generate PDF from React template
 *
 * @param templateId - Template variant ID (e.g., 'london-navy')
 * @param resumeData - Parsed resume data
 * @param customColors - Optional custom color overrides
 * @returns PDF as Buffer
 */
export async function generatePDFFromReact(
  templateId: string,
  resumeData: ParsedResumeData,
  customColors?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
  }
): Promise<Buffer> {
  const startTime = Date.now();
  let page: Page | null = null;

  try {
    console.log(`Starting PDF generation for template: ${templateId}`);

    // 1. Try to get modular template configuration from database
    const dbTemplate = await prisma.resumeTemplate.findUnique({
      where: { id: templateId },
      select: { templateConfig: true },
    });

    let templateComponent: React.ReactElement;
    let config: ExtendedTemplateConfig;

    // 2. Check for template config
    if (dbTemplate?.templateConfig && typeof dbTemplate.templateConfig === 'object') {
      const modularConfig = dbTemplate.templateConfig as any;

      // PRIORITY 1: Check for layoutComponent (new system)
      if (modularConfig.layoutComponent) {
        console.log(`Using layout component system for: ${templateId}`);
        config = getTemplateConfig(templateId);

        const layoutType = (modularConfig.layoutComponent as LayoutType);
        const LayoutComponent = getLayoutComponent(layoutType);

        console.log(`Using layout: ${layoutType}`);
        templateComponent = React.createElement(LayoutComponent, {
          data: resumeData,
          config,
        });
      }
      // PRIORITY 2: Check for modular components (old system)
      else if (modularConfig.components) {
        console.log(`Using modular template system for: ${templateId}`);

        try {
          // Assemble template using TemplateAssembler
          templateComponent = await TemplateAssembler.assembleTemplate(
            modularConfig as TemplateConfig,
            resumeData
          );

          // Use colors from modular config for HTML wrapper
          config = {
            ...getTemplateConfig(templateId),
            primaryColor: modularConfig.colorScheme?.primary || '#1e3a8a',
            secondaryColor: modularConfig.colorScheme?.secondary || '#3b82f6',
            accentColor: modularConfig.colorScheme?.accent || '#60a5fa',
            textColor: modularConfig.colorScheme?.text || '#1e293b',
            mutedColor: modularConfig.colorScheme?.muted || '#64748b',
            backgroundColor: modularConfig.colorScheme?.background || '#ffffff',
          };
        } catch (assemblerError) {
          console.warn(`TemplateAssembler failed, falling back to BaseLayout:`, assemblerError);
          // Fall back to BaseLayout
          config = getTemplateConfig(templateId);
          const LayoutComponent = getLayoutComponent();
          console.log(`Using fallback layout: BaseLayout`);
          templateComponent = React.createElement(LayoutComponent, {
            data: resumeData,
            config,
          });
        }
      }
      // PRIORITY 3: No special config, use BaseLayout
      else {
        console.log(`Using BaseLayout (no layout/components specified) for: ${templateId}`);
        config = getTemplateConfig(templateId);
        const LayoutComponent = getLayoutComponent();
        templateComponent = React.createElement(LayoutComponent, {
          data: resumeData,
          config,
        });
      }
    } else {
      // Template not in database or no config, use BaseLayout
      console.log(`Using BaseLayout (no DB config) for: ${templateId}`);
      config = getTemplateConfig(templateId);
      const LayoutComponent = getLayoutComponent();
      templateComponent = React.createElement(LayoutComponent, {
        data: resumeData,
        config,
      });
    }

    // 3. Apply custom colors if provided
    if (customColors) {
      config = {
        ...config,
        ...customColors,
      };
    }

    // 4. Render React to HTML
    const html = renderReactToHTML(templateComponent, config);

    // 5. Get browser instance
    const browser = await getBrowser();

    // 6. Create new page
    page = await browser.newPage();

    // Set viewport for consistent rendering
    await page.setViewport({
      width: 794, // A4 width in pixels at 96 DPI
      height: 1123, // A4 height in pixels at 96 DPI
      deviceScaleFactor: 2, // Higher DPI for better quality
    });

    // 7. Set HTML content
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // 8. Generate PDF
    const pdfData = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
      preferCSSPageSize: true,
      displayHeaderFooter: false,
      // Ensure colors are rendered correctly
      omitBackground: false,
      // Font embedding and quality settings
      tagged: false,
      outline: false,
      timeout: 30000,
    });

    // Convert Uint8Array to Buffer
    const pdfBuffer = Buffer.from(pdfData);

    const duration = Date.now() - startTime;
    console.log(`PDF generated successfully in ${duration}ms, size: ${pdfBuffer.length} bytes`);

    // Check file size (warn if > 500KB)
    const sizeKB = pdfBuffer.length / 1024;
    if (sizeKB > 500) {
      console.warn(`PDF size (${sizeKB.toFixed(2)}KB) exceeds recommended 500KB`);
    }

    return pdfBuffer;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`PDF generation failed after ${duration}ms:`, error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    // 9. Cleanup: Close the page but keep browser instance
    if (page) {
      try {
        await page.close();
      } catch (closeError) {
        console.error('Error closing page:', closeError);
      }
    }
  }
}

/**
 * Generate PDF with timeout protection
 */
export async function generatePDFWithTimeout(
  templateId: string,
  resumeData: ParsedResumeData,
  customColors?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
  },
  timeoutMs: number = 10000
): Promise<Buffer> {
  return Promise.race([
    generatePDFFromReact(templateId, resumeData, customColors),
    new Promise<Buffer>((_, reject) =>
      setTimeout(() => reject(new Error('PDF generation timeout')), timeoutMs)
    ),
  ]);
}

/**
 * Batch generate PDFs (useful for testing or bulk operations)
 */
export async function batchGeneratePDFs(
  requests: Array<{
    templateId: string;
    resumeData: ParsedResumeData;
    customColors?: {
      primaryColor?: string;
      secondaryColor?: string;
      accentColor?: string;
    };
  }>
): Promise<Buffer[]> {
  const results: Buffer[] = [];

  for (const request of requests) {
    try {
      const pdf = await generatePDFFromReact(
        request.templateId,
        request.resumeData,
        request.customColors
      );
      results.push(pdf);
    } catch (error) {
      console.error(`Failed to generate PDF for template ${request.templateId}:`, error);
      throw error;
    }
  }

  return results;
}

/**
 * Health check - verify browser instance is working
 */
export async function healthCheck(): Promise<{
  browserConnected: boolean;
  canGeneratePDF: boolean;
  error?: string;
}> {
  try {
    const browser = await getBrowser();
    const browserConnected = browser.connected;

    // Try a simple PDF generation to verify it works
    const testPage = await browser.newPage();
    await testPage.setContent('<html><body><h1>Test</h1></body></html>');
    const testPdf = await testPage.pdf({ format: 'A4' });
    await testPage.close();

    return {
      browserConnected,
      canGeneratePDF: testPdf.length > 0,
    };
  } catch (error) {
    return {
      browserConnected: false,
      canGeneratePDF: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing browser...');
  await closeBrowser();
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing browser...');
  await closeBrowser();
});

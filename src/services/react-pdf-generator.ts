import * as ReactDOMServer from 'react-dom/server';
import * as React from 'react';
import puppeteer, { Browser, Page } from 'puppeteer';
import path from 'path';
import fs from 'fs/promises';
import { existsSync, readFileSync } from 'fs';
import * as https from 'https';
import * as http from 'http';
import { v2 as cloudinary } from 'cloudinary';
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

  // Handle browser disconnect — reset slot counter so queued requests don't deadlock
  browserInstance.on('disconnected', () => {
    console.log('Browser instance disconnected — resetting thumbnail slot counter');
    browserInstance = null;
    // Drain the wait queue so queued thumbnail requests can fail-fast and retry
    // instead of waiting forever for slots that will never be released.
    activeThumbnailCount = 0;
    const waiting = thumbnailWaitQueue.splice(0);
    waiting.forEach(resolve => resolve());
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
 * Resolve a photo URL to a base64 data URI so Puppeteer can embed it
 * without needing to make authenticated network requests.
 */
async function resolvePhotoUrl(photoUrl: string): Promise<string | undefined> {
  if (!photoUrl) return undefined;
  if (photoUrl.startsWith('data:')) return photoUrl; // already a data URI

  try {
    let fetchUrl = photoUrl;

    // Generate a short-lived signed URL for Cloudinary authenticated images
    if (photoUrl.includes('cloudinary.com') && cloudinary.config().api_key) {
      const match = photoUrl.match(/\/image\/authenticated\/s--[^/]+--\/(.+?)(?:\.[a-z]{2,5})?(\?|$)/i)
                 || photoUrl.match(/\/image\/authenticated\/(.+?)(?:\.[a-z]{2,5})?(\?|$)/i);
      const publicId = match?.[1];
      if (publicId) {
        fetchUrl = cloudinary.url(publicId, {
          secure: true,
          resource_type: 'image',
          sign_url: true,
          type: 'authenticated',
          expires_at: Math.floor(Date.now() / 1000) + 120,
        });
      }
    } else if (photoUrl.startsWith('file://')) {
      const filePath = photoUrl.replace(/^file:\/\//, '');
      const buffer = readFileSync(filePath);
      const ext = (filePath.split('.').pop() || 'jpeg').toLowerCase();
      const mimeMap: Record<string, string> = { png: 'image/png', webp: 'image/webp', gif: 'image/gif' };
      return `data:${mimeMap[ext] ?? 'image/jpeg'};base64,${buffer.toString('base64')}`;
    }

    return await new Promise<string | undefined>((resolve) => {
      const lib = fetchUrl.startsWith('https') ? https : http;
      (lib as typeof https).get(fetchUrl, (res) => {
        if (res.statusCode !== 200) { res.resume(); return resolve(undefined); }
        const chunks: Buffer[] = [];
        res.on('data', (c: Buffer) => chunks.push(c));
        res.on('end', () => {
          const mime = (res.headers['content-type'] as string | undefined)?.split(';')[0] ?? 'image/jpeg';
          resolve(`data:${mime};base64,${Buffer.concat(chunks).toString('base64')}`);
        });
        res.on('error', () => resolve(undefined));
      }).on('error', () => resolve(undefined));
    });
  } catch {
    return undefined;
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

    // Resolve profile photo to base64 data URI so Puppeteer can render it
    // (Cloudinary uses authenticated access mode which Puppeteer cannot fetch)
    if (resumeData.contact?.photoUrl) {
      const dataUri = await resolvePhotoUrl(resumeData.contact.photoUrl);
      if (dataUri) {
        resumeData = { ...resumeData, contact: { ...resumeData.contact, photoUrl: dataUri } }; // eslint-disable-line no-param-reassign
      }
    }

    let templateComponent: React.ReactElement;
    let config: ExtendedTemplateConfig;

    // 2. Check for template config
    if (dbTemplate?.templateConfig && typeof dbTemplate.templateConfig === 'object') {
      const modularConfig = dbTemplate.templateConfig as any;

      // PRIORITY 1: Check for layoutType (our new templateConfig format)
      if (modularConfig.layoutType) {
        console.log(`Using layoutType system for: ${templateId}`);

        const PALETTES: Record<string, { primary: string; secondary: string; text: string; muted: string; bg: string }> = {
          navy:     { primary: '#1e3a8a', secondary: '#3b82f6', text: '#0f172a', muted: '#64748b', bg: '#ffffff' },
          ocean:    { primary: '#0c4a6e', secondary: '#0ea5e9', text: '#0f172a', muted: '#64748b', bg: '#ffffff' },
          royal:    { primary: '#3730a3', secondary: '#6366f1', text: '#1e1b4b', muted: '#64748b', bg: '#ffffff' },
          slate:    { primary: '#1e293b', secondary: '#475569', text: '#0f172a', muted: '#94a3b8', bg: '#ffffff' },
          emerald:  { primary: '#065f46', secondary: '#10b981', text: '#064e3b', muted: '#6b7280', bg: '#ffffff' },
          forest:   { primary: '#14532d', secondary: '#16a34a', text: '#052e16', muted: '#6b7280', bg: '#ffffff' },
          teal:     { primary: '#134e4a', secondary: '#14b8a6', text: '#0f172a', muted: '#64748b', bg: '#ffffff' },
          burgundy: { primary: '#881337', secondary: '#e11d48', text: '#0f172a', muted: '#64748b', bg: '#ffffff' },
          rust:     { primary: '#7c2d12', secondary: '#ea580c', text: '#1c1917', muted: '#64748b', bg: '#ffffff' },
          wine:     { primary: '#6b21a8', secondary: '#a855f7', text: '#1e1b4b', muted: '#64748b', bg: '#ffffff' },
          charcoal: { primary: '#111827', secondary: '#374151', text: '#111827', muted: '#6b7280', bg: '#ffffff' },
          graphite: { primary: '#374151', secondary: '#6b7280', text: '#111827', muted: '#9ca3af', bg: '#ffffff' },
          stone:    { primary: '#44403c', secondary: '#78716c', text: '#1c1917', muted: '#a8a29e', bg: '#ffffff' },
          violet:   { primary: '#4c1d95', secondary: '#7c3aed', text: '#1e1b4b', muted: '#64748b', bg: '#ffffff' },
          indigo:   { primary: '#312e81', secondary: '#4f46e5', text: '#1e1b4b', muted: '#64748b', bg: '#ffffff' },
          plum:     { primary: '#581c87', secondary: '#9333ea', text: '#1e1b4b', muted: '#64748b', bg: '#ffffff' },
        };

        const paletteId: string = modularConfig.colorPalette || 'navy';
        const palette = PALETTES[paletteId] || PALETTES.navy;
        const baseConfig = getTemplateConfig(templateId);

        config = {
          ...baseConfig,
          primaryColor: palette.primary,
          secondaryColor: palette.secondary,
          textColor: palette.text,
          mutedColor: palette.muted,
          backgroundColor: palette.bg,
          accentColor: palette.secondary,
        };

        // Map our DB layoutType strings → LAYOUT_REGISTRY component-name keys
        const LAYOUT_TYPE_TO_REGISTRY: Record<string, string> = {
          'single-standard': 'BaseLayout',
          'two-sidebar':     'TwoColumnSidebarLayout',
          'academic':        'AcademicLayout',
          'bold-modern':     'BoldModernLayout',
          'classic':         'ClassicLayout',
          'contemporary':    'ContemporaryLayout',
          'executive':       'ExecutiveLayout',
          'minimal':         'ModernMinimalLayout',
          'professional':    'ProfessionalLayout',
          'tech':            'TechLayout',
          'compact':         'CompactLayout',
          'timeline':        'TimelineLayout',
          'portfolio':       'PortfolioLayout',
          'creative':        'CreativeLayout',
          'infographic':     'InfographicLayout',
          'split-panel':     'SplitPanelLayout',
          'ruled-elegant':   'RuledElegantLayout',
          'top-accent':      'TopAccentLayout',
          'column-split':    'ColumnSplitLayout',
          'bordered-page':   'BorderedPageLayout',
        };
        const registryKey = LAYOUT_TYPE_TO_REGISTRY[modularConfig.layoutType] || 'BaseLayout';
        const LayoutComponent = getLayoutComponent(registryKey as LayoutType);
        console.log(`Using layout: ${modularConfig.layoutType} → ${registryKey}, palette: ${paletteId}`);
        templateComponent = React.createElement(LayoutComponent, {
          data: resumeData,
          config,
        });
      }
      // PRIORITY 2: Check for layoutComponent (legacy system)
      else if (modularConfig.layoutComponent) {
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
      // PRIORITY 3: Check for modular components (old system)
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
      // PRIORITY 4: No special config, use BaseLayout
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

// ─── Thumbnail Generation ────────────────────────────────────────────────────

/**
 * Inline SVG placeholder photo used for all template thumbnails.
 * Embedded as a base64 data URI so no network request is needed during screenshot.
 */
const _SVG_PLACEHOLDER =
  `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">` +
  `<circle cx="50" cy="50" r="50" fill="#6B7280"/>` +
  `<circle cx="50" cy="36" r="16" fill="#D1D5DB"/>` +
  `<ellipse cx="50" cy="78" rx="26" ry="19" fill="#D1D5DB"/>` +
  `</svg>`;
const THUMBNAIL_PHOTO_URI = `data:image/svg+xml;base64,${Buffer.from(_SVG_PLACEHOLDER).toString('base64')}`;

// ─── Thumbnail Sample Data ────────────────────────────────────────────────────
// Three calibrated datasets, selected based on layout type:
//   NARROW   — single-column layouts (BaseLayout, Classic, Executive, etc.)  ~1000px
//   WIDE     — two-column/sidebar layouts (TwoColumn, Compact, Infographic)   ~900px
//   SPACIOUS — very generous spacing layouts (ModernMinimal)                  ~900px

const THUMBNAIL_CONTACT = {
  name: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  phone: '+1 (555) 234-5678',
  location: 'San Francisco, CA',
  linkedin: 'linkedin.com/in/alexmorgan',
  website: 'alexmorgan.dev',
  photoUrl: THUMBNAIL_PHOTO_URI,
};

/** Single-column layouts: 2 jobs × 3 bullets fills ~1000px */
const THUMBNAIL_DATA_NARROW: ParsedResumeData = {
  photoUrl: THUMBNAIL_PHOTO_URI,
  contact: THUMBNAIL_CONTACT,
  summary:
    'Results-driven software engineer with 8+ years delivering scalable systems and high-impact products. Expert in cloud architecture, leading cross-functional teams, and driving technical strategy from concept to production.',
  experience: [
    {
      title: 'Senior Software Engineer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      startDate: 'Mar 2021', endDate: 'Present', current: true,
      description: [
        'Led migration to microservices architecture, cutting deployment time by 60%',
        'Architected real-time pipeline processing 2M+ daily events with 99.9% uptime',
        'Mentored 5 engineers and introduced org-wide code review standards',
      ],
    },
    {
      title: 'Software Engineer',
      company: 'StartupXYZ',
      location: 'Austin, TX',
      startDate: 'Jun 2018', endDate: 'Feb 2021', current: false,
      description: [
        'Built React component library adopted across 4 product teams, saving 200+ dev hours',
        'Optimised PostgreSQL queries, reducing average API response time by 40%',
        'Introduced CI/CD pipeline cutting release cycles from monthly to weekly',
      ],
    },
    {
      title: 'Junior Developer',
      company: 'Digital Agency Co.',
      location: 'New York, NY',
      startDate: 'Aug 2016', endDate: 'May 2018', current: false,
      description: [
        'Delivered 20+ client websites using React and Node.js',
        'Introduced automated testing, reducing production bugs by 35%',
      ],
    },
  ],
  education: [{
    degree: 'B.S. Computer Science',
    institution: 'University of California, Berkeley',
    location: 'Berkeley, CA',
    graduationDate: 'May 2016',
    gpa: '3.8',
    achievements: ["Dean's List (4 semesters)", 'ACM Programming Club President'],
  }],
  skills: [
    { category: 'Languages & Frameworks', items: ['TypeScript', 'Python', 'Go', 'React', 'Node.js', 'Next.js'] },
    { category: 'Cloud & Infrastructure', items: ['AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'Terraform'] },
  ],
  certifications: [
    { name: 'AWS Solutions Architect – Professional', issuer: 'Amazon Web Services', date: '2022' },
    { name: 'Google Cloud Professional Data Engineer', issuer: 'Google Cloud', date: '2021' },
  ],
  projects: [{
    name: 'OpenCLI — Developer Productivity Tool',
    description: 'Open-source CLI toolkit with 2k+ GitHub stars, used by teams at top tech companies',
    technologies: ['TypeScript', 'Node.js', 'GitHub Actions'],
  }],
  languages: ['English (Native)', 'Spanish (Professional)'],
};

/** Two-column/sidebar layouts: 3 jobs + full sidebar content fills both columns ~900px */
const THUMBNAIL_DATA_WIDE: ParsedResumeData = {
  photoUrl: THUMBNAIL_PHOTO_URI,
  contact: THUMBNAIL_CONTACT,
  summary:
    'Results-driven software engineer with 8+ years delivering scalable systems. Expert in cloud infrastructure, team leadership, and driving products from concept to millions of users.',
  experience: [
    {
      title: 'Senior Software Engineer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      startDate: 'Mar 2021', endDate: 'Present', current: true,
      description: [
        'Led migration to microservices, cutting deployment time by 60%',
        'Architected real-time pipeline processing 2M+ daily events',
        'Mentored 5 engineers and standardised code review practices',
      ],
    },
    {
      title: 'Software Engineer',
      company: 'StartupXYZ',
      location: 'Austin, TX',
      startDate: 'Jun 2018', endDate: 'Feb 2021', current: false,
      description: [
        'Built React component library adopted across 4 product teams',
        'Optimised queries, reducing API response time by 40%',
        'Introduced CI/CD pipeline with weekly releases replacing monthly cycles',
      ],
    },
    {
      title: 'Junior Developer',
      company: 'Digital Agency Co.',
      location: 'New York, NY',
      startDate: 'Aug 2016', endDate: 'May 2018', current: false,
      description: [
        'Delivered 20+ client websites using React and Node.js',
        'Introduced automated testing, reducing production bugs by 35%',
      ],
    },
  ],
  education: [{
    degree: 'B.S. Computer Science',
    institution: 'University of California, Berkeley',
    location: 'Berkeley, CA',
    graduationDate: 'May 2016',
    gpa: '3.8',
    achievements: ["Dean's List", 'ACM Club President'],
  }],
  skills: [
    { category: 'Languages', items: ['TypeScript', 'Python', 'Go', 'SQL', 'Rust'] },
    { category: 'Frameworks', items: ['React', 'Node.js', 'Express', 'Next.js', 'GraphQL'] },
    { category: 'Cloud & DevOps', items: ['AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'Terraform'] },
  ],
  certifications: [
    { name: 'AWS Solutions Architect – Professional', issuer: 'Amazon Web Services', date: '2022' },
    { name: 'Google Cloud Professional Data Engineer', issuer: 'Google Cloud', date: '2021' },
  ],
  projects: [
    {
      name: 'OpenCLI — Dev Productivity Tool',
      description: 'Open-source CLI with 2k+ GitHub stars',
      technologies: ['TypeScript', 'Node.js'],
    },
    {
      name: 'Analytics Dashboard',
      description: 'Real-time analytics platform, 50k+ MAU',
      technologies: ['React', 'Python', 'PostgreSQL'],
    },
  ],
  awards: ['Engineering Excellence Award 2023', 'Bay Area Hackathon 1st Place 2022'],
  languages: ['English (Native)', 'Spanish (Professional)'],
};

/** Spacious/minimal layouts: generous section gaps — use 2 jobs + fuller sections */
const THUMBNAIL_DATA_SPACIOUS: ParsedResumeData = {
  photoUrl: THUMBNAIL_PHOTO_URI,
  contact: THUMBNAIL_CONTACT,
  summary:
    'Creative software engineer with 8 years of experience and a passion for elegant, user-centred design. Known for clean architecture, high-quality code, and shipping products that delight.',
  experience: [
    {
      title: 'Senior Software Engineer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      startDate: 'Mar 2021', endDate: 'Present', current: true,
      description: [
        'Led migration to microservices architecture, cutting deployment time by 60%',
        'Architected real-time data pipeline processing 2M+ events per day',
        'Mentored 5 engineers and established org-wide code review standards',
      ],
    },
    {
      title: 'Software Engineer',
      company: 'StartupXYZ',
      location: 'Austin, TX',
      startDate: 'Jun 2018', endDate: 'Feb 2021', current: false,
      description: [
        'Built React component library adopted across 4 product teams',
        'Optimised PostgreSQL queries, reducing API response time by 40%',
      ],
    },
  ],
  education: [{
    degree: 'B.S. Computer Science',
    institution: 'University of California, Berkeley',
    location: 'Berkeley, CA',
    graduationDate: 'May 2016',
    gpa: '3.8',
  }],
  skills: [
    { category: 'Languages & Frameworks', items: ['TypeScript', 'Python', 'React', 'Node.js', 'Next.js'] },
    { category: 'Cloud & Tools', items: ['AWS', 'Docker', 'PostgreSQL', 'Figma', 'Terraform'] },
  ],
  certifications: [
    { name: 'AWS Solutions Architect – Professional', issuer: 'Amazon Web Services', date: '2022' },
    { name: 'Google Cloud Professional', issuer: 'Google Cloud', date: '2021' },
  ],
  projects: [{
    name: 'OpenCLI — Developer Productivity Tool',
    description: 'Open-source CLI toolkit with 2,000+ GitHub stars, adopted by teams at leading tech companies',
    technologies: ['TypeScript', 'Node.js', 'GitHub Actions'],
  }],
  languages: ['English (Native)', 'Spanish (Professional)'],
};

/** Pick the right sample dataset for a given layoutType */
function chooseThumbnailData(layoutType: string | undefined): ParsedResumeData {
  if (!layoutType) return THUMBNAIL_DATA_NARROW;
  if (['two-sidebar', 'compact', 'infographic', 'split-panel', 'column-split'].includes(layoutType)) return THUMBNAIL_DATA_WIDE;
  if (layoutType === 'minimal') return THUMBNAIL_DATA_SPACIOUS;
  return THUMBNAIL_DATA_NARROW;
}

/** In-memory thumbnail cache — cleared on server restart. v7: per-op 25s timeout prevents hung slots */
// ─── Disk thumbnail cache ──────────────────────────────────────────────────────
// Thumbnails are saved as JPEG files under backend/thumbnails/ so they survive
// server restarts. In-memory cache is still used for speed; disk is the fallback.
//
// THUMB_VERSION: bump this number whenever layout rendering code changes so that
// stale disk-cached thumbnails are ignored and fresh ones are generated.
const THUMB_VERSION = 5;

const THUMB_CACHE_DIR = path.join(__dirname, '../../thumbnails');

async function ensureThumbDir(): Promise<void> {
  await fs.mkdir(THUMB_CACHE_DIR, { recursive: true });
}

function thumbFilePath(templateId: string): string {
  // Sanitize to prevent path traversal; version suffix busts stale disk cache
  const safe = templateId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(THUMB_CACHE_DIR, `${safe}_v${THUMB_VERSION}.jpg`);
}

async function readDiskThumb(templateId: string): Promise<Buffer | null> {
  const fp = thumbFilePath(templateId);
  if (!existsSync(fp)) return null;
  try {
    return await fs.readFile(fp);
  } catch {
    return null;
  }
}

async function writeDiskThumb(templateId: string, buf: Buffer): Promise<void> {
  try {
    await ensureThumbDir();
    await fs.writeFile(thumbFilePath(templateId), buf);
  } catch (err) {
    console.warn(`Failed to persist thumbnail for ${templateId}:`, err);
  }
}

// ─── In-memory thumbnail cache ────────────────────────────────────────────────
const thumbnailCache = new Map<string, Buffer>();
/** Pending thumbnail promises — deduplicates concurrent requests for the same template */
const thumbnailPending = new Map<string, Promise<Buffer>>();

/** Concurrency limiter — cap simultaneous Puppeteer pages to avoid resource exhaustion */
const MAX_CONCURRENT_THUMBNAILS = 4;
let activeThumbnailCount = 0;
const thumbnailWaitQueue: Array<() => void> = [];

function acquireThumbnailSlot(): Promise<void> {
  if (activeThumbnailCount < MAX_CONCURRENT_THUMBNAILS) {
    activeThumbnailCount++;
    return Promise.resolve();
  }
  return new Promise<void>(resolve => thumbnailWaitQueue.push(resolve));
}

function releaseThumbnailSlot(): void {
  const next = thumbnailWaitQueue.shift();
  if (next) {
    next(); // hand slot directly to the next waiter
  } else {
    activeThumbnailCount--;
  }
}

async function _doGenerateThumbnail(templateId: string): Promise<Buffer> {
  await acquireThumbnailSlot();
  let page: Page | null = null;
  try {
    console.log(`Generating thumbnail screenshot for template: ${templateId}`);

    const dbTemplate = await prisma.resumeTemplate.findUnique({
      where: { id: templateId },
      select: { templateConfig: true },
    });

    let templateComponent: React.ReactElement;
    let config: ExtendedTemplateConfig;

    const PALETTES: Record<string, { primary: string; secondary: string; text: string; muted: string; bg: string }> = {
      navy:     { primary: '#1e3a8a', secondary: '#3b82f6', text: '#0f172a', muted: '#64748b', bg: '#ffffff' },
      ocean:    { primary: '#0c4a6e', secondary: '#0ea5e9', text: '#0f172a', muted: '#64748b', bg: '#ffffff' },
      royal:    { primary: '#3730a3', secondary: '#6366f1', text: '#1e1b4b', muted: '#64748b', bg: '#ffffff' },
      slate:    { primary: '#1e293b', secondary: '#475569', text: '#0f172a', muted: '#94a3b8', bg: '#ffffff' },
      emerald:  { primary: '#065f46', secondary: '#10b981', text: '#064e3b', muted: '#6b7280', bg: '#ffffff' },
      forest:   { primary: '#14532d', secondary: '#16a34a', text: '#052e16', muted: '#6b7280', bg: '#ffffff' },
      teal:     { primary: '#134e4a', secondary: '#14b8a6', text: '#0f172a', muted: '#64748b', bg: '#ffffff' },
      burgundy: { primary: '#881337', secondary: '#e11d48', text: '#0f172a', muted: '#64748b', bg: '#ffffff' },
      rust:     { primary: '#7c2d12', secondary: '#ea580c', text: '#1c1917', muted: '#64748b', bg: '#ffffff' },
      wine:     { primary: '#6b21a8', secondary: '#a855f7', text: '#1e1b4b', muted: '#64748b', bg: '#ffffff' },
      charcoal: { primary: '#111827', secondary: '#374151', text: '#111827', muted: '#6b7280', bg: '#ffffff' },
      graphite: { primary: '#374151', secondary: '#6b7280', text: '#111827', muted: '#9ca3af', bg: '#ffffff' },
      stone:    { primary: '#44403c', secondary: '#78716c', text: '#1c1917', muted: '#a8a29e', bg: '#ffffff' },
      violet:   { primary: '#4c1d95', secondary: '#7c3aed', text: '#1e1b4b', muted: '#64748b', bg: '#ffffff' },
      indigo:   { primary: '#312e81', secondary: '#4f46e5', text: '#1e1b4b', muted: '#64748b', bg: '#ffffff' },
      plum:     { primary: '#581c87', secondary: '#9333ea', text: '#1e1b4b', muted: '#64748b', bg: '#ffffff' },
    };

    const LAYOUT_TYPE_TO_REGISTRY: Record<string, string> = {
      'single-standard': 'BaseLayout',
      'two-sidebar':     'TwoColumnSidebarLayout',
      'academic':        'AcademicLayout',
      'bold-modern':     'BoldModernLayout',
      'classic':         'ClassicLayout',
      'contemporary':    'ContemporaryLayout',
      'executive':       'ExecutiveLayout',
      'minimal':         'ModernMinimalLayout',
      'professional':    'ProfessionalLayout',
      'tech':            'TechLayout',
      'compact':         'CompactLayout',
      'timeline':        'TimelineLayout',
      'portfolio':       'PortfolioLayout',
      'creative':        'CreativeLayout',
      'infographic':     'InfographicLayout',
      'split-panel':     'SplitPanelLayout',
      'ruled-elegant':   'RuledElegantLayout',
      'top-accent':      'TopAccentLayout',
      'column-split':    'ColumnSplitLayout',
      'bordered-page':   'BorderedPageLayout',
    };

    // Resolve config, layout component, and pick the right sample data
    let LayoutComponent: ReturnType<typeof getLayoutComponent>;
    let detectedLayoutType: string | undefined;

    if (dbTemplate?.templateConfig && typeof dbTemplate.templateConfig === 'object') {
      const modularConfig = dbTemplate.templateConfig as any;

      if (modularConfig.layoutType) {
        detectedLayoutType = modularConfig.layoutType;
        const paletteId: string = modularConfig.colorPalette || 'navy';
        const palette = PALETTES[paletteId] || PALETTES.navy;
        const baseConfig = getTemplateConfig(templateId);
        config = {
          ...baseConfig,
          primaryColor: palette.primary,
          secondaryColor: palette.secondary,
          textColor: palette.text,
          mutedColor: palette.muted,
          backgroundColor: palette.bg,
          accentColor: palette.secondary,
        };
        const registryKey = LAYOUT_TYPE_TO_REGISTRY[modularConfig.layoutType] || 'BaseLayout';
        LayoutComponent = getLayoutComponent(registryKey as LayoutType);
      } else if (modularConfig.layoutComponent) {
        config = getTemplateConfig(templateId);
        LayoutComponent = getLayoutComponent(modularConfig.layoutComponent as LayoutType);
      } else {
        config = getTemplateConfig(templateId);
        LayoutComponent = getLayoutComponent();
      }
    } else {
      config = getTemplateConfig(templateId);
      LayoutComponent = getLayoutComponent();
    }

    // Strip top/bottom margins BEFORE creating the React element so the component
    // renders with zero top/bottom padding (resume.io-style: content flush to the top edge).
    config = {
      ...config!,
      margins: { top: 0, bottom: 0, left: config!.margins.left, right: config!.margins.right },
    };

    // Use calibrated sample data for this layout type (prevents overflow & empty thumbnails)
    const sampleData = chooseThumbnailData(detectedLayoutType);
    templateComponent = React.createElement(LayoutComponent, { data: sampleData, config });

    const html = renderReactToHTML(templateComponent, config);

    const browser = await getBrowser();
    page = await browser.newPage();
    // Hard timeout on every page operation — prevents page.evaluate() and
    // page.screenshot() from blocking the concurrency slot indefinitely.
    // When any operation exceeds this limit, Puppeteer throws a TimeoutError
    // which propagates to the finally block and always releases the slot.
    page.setDefaultTimeout(25_000);
    page.setDefaultNavigationTimeout(25_000);

    const A4_W = 794;
    // Maximum capture height — tall enough for rich content, short enough to avoid empty space
    const MAX_H = 950;

    // Use a taller viewport for initial render so we can measure natural content height.
    // 'domcontentloaded' is significantly faster than 'networkidle0' — safe here because
    // all assets (fonts, photo) are inline data URIs so there are no external requests.
    await page.setViewport({ width: A4_W, height: 1400, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Strip the A4 min-height from the root layout element so the body collapses
    // to its natural content height instead of always stretching to 1123px (297mm).
    await page.addStyleTag({
      content: 'html, body, body > * { min-height: 0 !important; }',
    });

    // Measure actual rendered height of the layout root element.
    // We use getBoundingClientRect().height on the first child of body rather than
    // document.body.scrollHeight — the body always fills the viewport (1400px) even
    // when content is shorter, so scrollHeight would never fall below the viewport height.
    const contentHeight: number = await page.evaluate(() => {
      const root = document.body.firstElementChild as HTMLElement | null;
      if (root) return Math.ceil(root.getBoundingClientRect().height);
      return document.body.scrollHeight;
    });

    if (contentHeight > MAX_H) {
      // Content is taller than our cap — scale it down proportionally so everything
      // fits within MAX_H without cutting off any section mid-way.
      const scale = MAX_H / contentHeight;
      const expandedWidth = Math.round(A4_W / scale);
      await page.evaluate(
        (s: number, ew: number, aw: number) => {
          const root = document.body.firstElementChild as HTMLElement | null;
          if (!root) return;
          // Expand root width so after CSS zoom it still appears A4_W px wide
          root.style.setProperty('width', `${ew}px`, 'important');
          root.style.setProperty('max-width', `${ew}px`, 'important');
          root.style.setProperty('min-width', `${ew}px`, 'important');
          root.style.setProperty('margin', '0', 'important');
          (root.style as any).zoom = String(s);
          // Clamp body to A4 width so the expanded root doesn't create a scrollbar
          document.body.style.setProperty('width', `${aw}px`, 'important');
          document.body.style.setProperty('overflow', 'hidden', 'important');
        },
        scale, expandedWidth, A4_W
      );
    }

    // Capture height is natural content height, capped at MAX_H.
    const captureHeight = Math.min(contentHeight, MAX_H);

    // Resize viewport to exact capture dimensions and hide any remaining overflow.
    await page.setViewport({ width: A4_W, height: captureHeight, deviceScaleFactor: 2 });
    await page.addStyleTag({
      content: 'html, body { overflow: hidden !important; }',
    });

    // Clip to the natural content area — no padding, no empty whitespace at bottom.
    const screenshotData = await page.screenshot({
      type: 'jpeg',
      quality: 88,
      clip: { x: 0, y: 0, width: A4_W, height: captureHeight },
    });

    const buffer = Buffer.from(screenshotData);
    console.log(`Thumbnail generated for ${templateId}: ${buffer.length} bytes`);
    return buffer;
  } finally {
    if (page) {
      // Race page.close() against a short timeout so the slot is ALWAYS released
      // even when the browser hangs and page.close() never resolves.
      await Promise.race([
        page.close().catch(() => {}),
        new Promise<void>(resolve => setTimeout(resolve, 3000)),
      ]);
    }
    releaseThumbnailSlot();
  }
}

/**
 * Generate a JPEG thumbnail screenshot for a template.
 * Uses the same Puppeteer rendering pipeline as PDF generation so thumbnails
 * match the PDF preview exactly. Results are cached in memory.
 */
export async function generateTemplateThumbnail(templateId: string): Promise<Buffer> {
  // 1. In-memory cache (fastest)
  const cached = thumbnailCache.get(templateId);
  if (cached) return cached;

  // 2. Disk cache (survives server restarts)
  const diskBuf = await readDiskThumb(templateId);
  if (diskBuf) {
    thumbnailCache.set(templateId, diskBuf); // warm in-memory cache
    return diskBuf;
  }

  // 3. Generate via Puppeteer — deduplicate concurrent requests for the same template
  let pending = thumbnailPending.get(templateId);
  if (!pending) {
    pending = _doGenerateThumbnail(templateId)
      .then(buf => {
        thumbnailCache.set(templateId, buf);
        writeDiskThumb(templateId, buf); // persist to disk (non-blocking)
        thumbnailPending.delete(templateId);
        return buf;
      })
      .catch(err => {
        thumbnailPending.delete(templateId);
        throw err;
      });
    thumbnailPending.set(templateId, pending);
  }

  return pending;
}

/** Prevents concurrent warmup runs from stacking up and exhausting Puppeteer resources */
let warmupRunning = false;

/**
 * Pre-generate thumbnails for every template in the database.
 * Call this on server startup so thumbnails are cached before the first user request.
 */
export async function warmupThumbnails(): Promise<void> {
  if (warmupRunning) {
    console.log('Thumbnail warmup already in progress — skipping duplicate call');
    return;
  }
  warmupRunning = true;
  try {
    const templates = await prisma.resumeTemplate.findMany({ select: { id: true } });
    console.log(`Thumbnail warmup: generating ${templates.length} thumbnails...`);
    const start = Date.now();
    const results = await Promise.allSettled(
      templates.map(t => generateTemplateThumbnail(t.id))
    );
    const failed = results.filter(r => r.status === 'rejected').length;
    console.log(`Thumbnail warmup done in ${((Date.now() - start) / 1000).toFixed(1)}s — ${templates.length - failed} ok, ${failed} failed`);
  } catch (err) {
    console.error('Thumbnail warmup error:', err);
  } finally {
    warmupRunning = false;
  }
}

/**
 * Invalidate cached thumbnails (call after template config changes).
 * Omit templateId to clear all cached thumbnails.
 */
export function clearThumbnailCache(templateId?: string): void {
  if (templateId) {
    thumbnailCache.delete(templateId);
    // Also remove from disk so next request regenerates
    fs.unlink(thumbFilePath(templateId)).catch(() => {});
    console.log(`Thumbnail cache cleared for: ${templateId}`);
  } else {
    thumbnailCache.clear();
    // Wipe and recreate the disk cache directory
    fs.rm(THUMB_CACHE_DIR, { recursive: true, force: true })
      .then(() => ensureThumbDir())
      .catch(() => {});
    console.log('All thumbnail caches cleared');
  }
}

// ─── Graceful shutdown handler ────────────────────────────────────────────────

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing browser...');
  await closeBrowser();
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing browser...');
  await closeBrowser();
});

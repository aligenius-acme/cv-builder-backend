/**
 * Resume HTML generator — renders React layout components to a full, self-contained
 * HTML document optimised for browser print-to-PDF.
 *
 * Puppeteer has been removed. PDF generation is now handled client-side via the
 * browser's native print dialog (triggered by the frontend after fetching this HTML).
 */

import * as ReactDOMServer from 'react-dom/server';
import * as React from 'react';
import * as https from 'https';
import * as http from 'http';
import { readFileSync } from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { ParsedResumeData } from '../types';
import { sanitizeResumeData } from './parser';
import { getTemplateConfig, ExtendedTemplateConfig } from './templates';
import { getLayoutComponent, LayoutType } from '../templates/layouts';
import { TemplateAssembler } from '../templates/shared/services/TemplateAssembler';
import { TemplateConfig } from '../templates/shared/types/templateConfig';
import { prisma } from '../utils/prisma';

// ─── Palette map ──────────────────────────────────────────────────────────────

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

// Map DB layoutType strings → layout registry component keys
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
  'dark-mode':       'DarkModeLayout',
  'diagonal-hero':   'DiagonalHeroLayout',
  'magazine':        'MagazineLayout',
  'highlight-band':  'HighlightBandLayout',
  'stacked-cards':   'StackedCardsLayout',
  'monogram':        'MonogramLayout',
  'timeline-dots':   'TimelineDotsLayout',
  'compact-table':   'CompactTableLayout',
};

// ─── Photo resolution ─────────────────────────────────────────────────────────

/**
 * Resolve a photo URL to a base64 data URI so the browser can embed it
 * without needing authenticated network requests at print time.
 */
async function resolvePhotoUrl(photoUrl: string): Promise<string | undefined> {
  if (!photoUrl) return undefined;
  if (photoUrl.startsWith('data:')) return photoUrl;

  try {
    let fetchUrl = photoUrl;

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
      const fetchWithRedirects = (url: string, hops = 0) => {
        if (hops > 4) return resolve(undefined);
        const lib = url.startsWith('https') ? https : http;
        const req = (lib as typeof https).get(url, { timeout: 8000 }, (res) => {
          if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            res.resume();
            fetchWithRedirects(res.headers.location, hops + 1);
            return;
          }
          if (res.statusCode !== 200) { res.resume(); return resolve(undefined); }
          const chunks: Buffer[] = [];
          res.on('data', (c: Buffer) => chunks.push(c));
          res.on('end', () => {
            const mime = (res.headers['content-type'] as string | undefined)?.split(';')[0] ?? 'image/jpeg';
            resolve(`data:${mime};base64,${Buffer.concat(chunks).toString('base64')}`);
          });
          res.on('error', () => resolve(undefined));
        });
        req.on('timeout', () => { req.destroy(); resolve(undefined); });
        req.on('error', () => resolve(undefined));
      };
      fetchWithRedirects(fetchUrl);
    });
  } catch {
    return undefined;
  }
}

// ─── HTML rendering ───────────────────────────────────────────────────────────

function renderReactToHTML(
  templateComponent: React.ReactElement,
  config: ExtendedTemplateConfig
): string {
  const componentHTML = ReactDOMServer.renderToStaticMarkup(templateComponent);

  return `<!DOCTYPE html>
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
      margin: 0;
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

    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    .page-break {
      page-break-after: always;
      break-after: page;
    }

    .avoid-break {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    body {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    a {
      color: ${config.primaryColor};
      text-decoration: none;
    }

    h1, h2, h3, h4, h5, h6 {
      margin: 0;
      font-weight: normal;
    }

    p { margin: 0; }

    ul, ol {
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  ${componentHTML}
</body>
</html>`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Render resume data to a full, self-contained HTML document.
 * Photo URLs are resolved to base64 data URIs so they embed without
 * requiring authenticated network requests from the browser.
 *
 * The returned HTML is used by:
 *  - Live preview: frontend renders it in an iframe (srcDoc)
 *  - PDF download: frontend opens it in a print window and calls window.print()
 */
export async function generateResumeHTML(
  templateId: string,
  resumeData: ParsedResumeData,
  customColors?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
  }
): Promise<string> {
  let data = sanitizeResumeData(resumeData);
  const rawPhotoUrl = data.contact?.photoUrl || data.photoUrl;
  if (rawPhotoUrl) {
    const dataUri = await resolvePhotoUrl(rawPhotoUrl);
    if (dataUri) {
      data = { ...data, photoUrl: dataUri, contact: { ...data.contact, photoUrl: dataUri } };
    } else {
      data = { ...data, photoUrl: rawPhotoUrl, contact: { ...data.contact, photoUrl: rawPhotoUrl } };
    }
  }

  const dbTemplate = await prisma.resumeTemplate.findUnique({
    where: { id: templateId },
    select: { templateConfig: true },
  });

  let templateComponent: React.ReactElement;
  let config: ExtendedTemplateConfig;

  if (dbTemplate?.templateConfig && typeof dbTemplate.templateConfig === 'object') {
    const modularConfig = dbTemplate.templateConfig as any;

    if (modularConfig.layoutType) {
      const paletteId: string = modularConfig.colorPalette || 'navy';
      const palette = PALETTES[paletteId] || PALETTES.navy;
      config = {
        ...getTemplateConfig(templateId),
        primaryColor: palette.primary,
        secondaryColor: palette.secondary,
        textColor: palette.text,
        mutedColor: palette.muted,
        backgroundColor: palette.bg,
        accentColor: palette.secondary,
      };
      const registryKey = LAYOUT_TYPE_TO_REGISTRY[modularConfig.layoutType] || 'BaseLayout';
      const LayoutComponent = getLayoutComponent(registryKey as LayoutType);
      console.log(`[generateResumeHTML] layoutType=${modularConfig.layoutType} → ${registryKey}, palette=${paletteId}`);
      templateComponent = React.createElement(LayoutComponent, { data, config });
    } else if (modularConfig.layoutComponent) {
      config = getTemplateConfig(templateId);
      const LayoutComponent = getLayoutComponent(modularConfig.layoutComponent as LayoutType);
      templateComponent = React.createElement(LayoutComponent, { data, config });
    } else if (modularConfig.components) {
      try {
        templateComponent = await TemplateAssembler.assembleTemplate(modularConfig as TemplateConfig, data);
        config = {
          ...getTemplateConfig(templateId),
          primaryColor: modularConfig.colorScheme?.primary || '#1e3a8a',
          secondaryColor: modularConfig.colorScheme?.secondary || '#3b82f6',
          accentColor: modularConfig.colorScheme?.accent || '#60a5fa',
          textColor: modularConfig.colorScheme?.text || '#1e293b',
          mutedColor: modularConfig.colorScheme?.muted || '#64748b',
          backgroundColor: modularConfig.colorScheme?.background || '#ffffff',
        };
      } catch {
        config = getTemplateConfig(templateId);
        templateComponent = React.createElement(getLayoutComponent(), { data, config });
      }
    } else {
      config = getTemplateConfig(templateId);
      templateComponent = React.createElement(getLayoutComponent(), { data, config });
    }
  } else {
    config = getTemplateConfig(templateId);
    templateComponent = React.createElement(getLayoutComponent(), { data, config });
  }

  if (customColors) {
    config = { ...config, ...customColors };
  }

  return renderReactToHTML(templateComponent, config);
}

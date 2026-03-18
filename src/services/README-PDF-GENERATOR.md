# React PDF Generator Service

## Overview

The React PDF Generator service provides high-quality PDF generation from React templates using Puppeteer. It renders React components server-side and converts them to PDF with accurate colors, fonts, and formatting.

It also handles template thumbnail generation (JPEG screenshots) used by the template browser UI.

## Features

- ✅ React component rendering to PDF
- ✅ Browser instance reuse for performance (singleton with reconnect)
- ✅ Concurrency-safe browser init (promise lock prevents ETXTBSY)
- ✅ Custom color theming support
- ✅ Multiple template layouts (20+ options, 165 templates)
- ✅ Memory management and cleanup
- ✅ Timeout handling
- ✅ A4 format with proper margins
- ✅ Color accuracy and font embedding
- ✅ File size optimization (<500KB)
- ✅ Fast generation (<5 seconds per PDF)
- ✅ Template thumbnail generation (JPEG screenshots)
- ✅ Thumbnail concurrency limit (max 3 simultaneous)

## Installation

Dependencies are already installed:

- `puppeteer@^23.10.4` — Headless browser orchestration
- `@sparticuz/chromium` — Pre-compiled Chromium binary bundled inside `node_modules`; decompresses to `/tmp` at runtime. **No Chrome download required at build or deploy time.**
- `react@^18.3.1` — React for component rendering
- `react-dom@^18.3.1` — React DOM for server-side rendering
- `@types/react` and `@types/react-dom` — TypeScript types

### How Chromium is resolved

At startup the service calls `chromium.executablePath()` from `@sparticuz/chromium`, which decompresses the bundled binary to `/tmp/chromium` on first call and returns the path. This works in any containerised environment (Koyeb, Fly.io, Railway, etc.) without internet access or pre-installed Chrome.

Fallback chain (if `@sparticuz/chromium` fails):
1. `PUPPETEER_EXECUTABLE_PATH` env var (useful for local dev / CI)
2. System paths: `/usr/bin/chromium`, `/usr/bin/chromium-browser`, `/usr/bin/google-chrome-stable`

## Usage

### Basic Usage

```typescript
import { generatePDFFromReact } from './services/react-pdf-generator';
import { ParsedResumeData } from './types';

const resumeData: ParsedResumeData = {
  contact: {
    name: 'John Smith',
    email: 'john@email.com',
    phone: '+1 555-123-4567',
    location: 'San Francisco, CA',
  },
  summary: 'Experienced software engineer...',
  experience: [...],
  education: [...],
  skills: ['JavaScript', 'React', 'Node.js'],
};

const pdfBuffer = await generatePDFFromReact('london-navy', resumeData);
fs.writeFileSync('resume.pdf', pdfBuffer);
```

### With Custom Colors

```typescript
const pdfBuffer = await generatePDFFromReact(
  'berlin-ocean',
  resumeData,
  {
    primaryColor: '#c2410c',
    secondaryColor: '#9a3412',
    accentColor: '#ffedd5',
  }
);
```

### With Timeout Protection

```typescript
import { generatePDFWithTimeout } from './services/react-pdf-generator';

try {
  const pdfBuffer = await generatePDFWithTimeout(
    'london-navy',
    resumeData,
    undefined,  // No custom colors
    10000       // 10 second timeout
  );
} catch (error) {
  console.error('PDF generation failed or timed out:', error);
}
```

### Batch Generation

```typescript
import { batchGeneratePDFs } from './services/react-pdf-generator';

const requests = [
  { templateId: 'london-navy', resumeData: resumeData1 },
  { templateId: 'berlin-ocean', resumeData: resumeData2 },
  { templateId: 'tokyo-violet', resumeData: resumeData3 },
];

const pdfs = await batchGeneratePDFs(requests);
```

### Health Check

```typescript
import { healthCheck } from './services/react-pdf-generator';

const health = await healthCheck();
console.log('Browser connected:', health.browserConnected);
console.log('Can generate PDF:', health.canGeneratePDF);
```

## Thumbnail System

Template thumbnails (used in the template browser UI) are served from Cloudinary. The flow is:

1. **Fast path** — if `previewImageUrl` in the DB is a Cloudinary (or other external) URL, the thumbnail endpoint redirects to it instantly. No Puppeteer involved.
2. **Slow path** — if no URL is stored, Puppeteer generates a JPEG screenshot, the result is served immediately, and the image is uploaded to Cloudinary in the background. The next request uses the fast path.

### Pre-generating thumbnails (recommended)

Run the upload script locally or via GitHub Actions to populate all 165 templates upfront:

```bash
# Local (requires CLOUDINARY_* and DATABASE_URL env vars)
npx ts-node --transpile-only scripts/upload-thumbnails.ts

# Force re-upload all (even already-uploaded templates)
npx ts-node --transpile-only scripts/upload-thumbnails.ts --force

# Upload single template
npx ts-node --transpile-only scripts/upload-thumbnails.ts --only=london-navy
```

The GitHub Actions workflow (`.github/workflows/upload-thumbnails.yml`) runs automatically when template files change, or can be triggered manually from the Actions UI.

Required GitHub secrets: `DATABASE_URL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

## Available Templates

The service supports 20 template layouts with 165 variants:

### Professional Templates
- `london-*` — Classic elegance, traditional formatting
- `dublin-*` — Clean traditional layout
- `stockholm-*` — Refined Scandinavian design
- `chicago-*` — Bold executive header
- `boston-*` — Compact academic layout

### Modern Templates
- `berlin-*` — Modern left-aligned with accent bars
- `amsterdam-*` — Ultra-minimal with whitespace
- `copenhagen-*` — Clean two-column with sidebar
- `vancouver-*` — Modern right sidebar
- `singapore-*` — Tech-focused design

### Creative Templates
- `tokyo-*` — Bold banner design
- `sydney-*` — Timeline-based layout
- `barcelona-*` — Colorful sidebar design
- `milan-*` — Fashion-forward elegant
- `rio-*` — Vibrant and eye-catching

### Simple Templates
- `toronto-*` — Simple and professional
- `seattle-*` — Minimal clean design
- `austin-*` — Casual yet professional
- `denver-*` — Entry-level friendly
- `phoenix-*` — Basic clean format

### New Layout Types (added)
- `split-panel` — 33% colored sidebar, 67% white body
- `ruled-elegant` — Serif, horizontal ruled section dividers
- `top-accent` — 8px top strip, name left / contact right
- `column-split` — Full-width header, 58/42 two-column body
- `bordered-page` — Colored border frame, centered serif name

See `prisma/seeds/templates.ts` for the complete list of template IDs.

## Performance

### Benchmarks

- **First generation** (cold start, Chromium decompression): ~5–8 seconds
- **Subsequent generations**: ~2–3 seconds (browser instance reused)
- **File size**: ~100–150 KB per PDF
- **Thumbnail generation**: ~1–2 seconds (browser reused)

### Optimization Features

1. **Browser instance reuse** — single Puppeteer instance shared across all requests
2. **Promise lock** — `browserInitPromise` ensures only one `chromium.executablePath()` decompress/launch runs at a time, preventing `ETXTBSY` errors under concurrent load
3. **Cached executable path** — `cachedExecutablePath` stores the resolved path after first call
4. **Thumbnail concurrency limit** — max 3 thumbnails generated simultaneously; additional requests queue
5. **Auto-reconnect** — `browser.on('disconnected')` resets state so the next request re-launches

## API Reference

### `generatePDFFromReact(templateId, resumeData, customColors?)`

Generate a PDF from a React template.

**Parameters:**
- `templateId` (string): Template variant ID (e.g., `'london-navy'`)
- `resumeData` (ParsedResumeData): Resume data to render
- `customColors` (object, optional): Custom color overrides
  - `primaryColor` (string): Primary color hex code
  - `secondaryColor` (string): Secondary color hex code
  - `accentColor` (string): Accent color hex code

**Returns:** `Promise<Buffer>` — PDF as Buffer

### `generatePDFWithTimeout(templateId, resumeData, customColors?, timeoutMs?)`

Generate PDF with timeout protection.

**Parameters:** Same as `generatePDFFromReact`, plus:
- `timeoutMs` (number, optional): Timeout in milliseconds (default: 10000)

**Returns:** `Promise<Buffer>` — PDF as Buffer

### `batchGeneratePDFs(requests)`

Generate multiple PDFs in sequence.

**Parameters:**
- `requests` (array): `{ templateId, resumeData, customColors? }[]`

**Returns:** `Promise<Buffer[]>`

### `generateTemplateThumbnail(templateId)`

Generate a JPEG thumbnail screenshot for a template (using sample resume data).

**Returns:** `Promise<Buffer>` — JPEG image as Buffer

### `warmupThumbnails()`

Pre-generate thumbnails for all templates in the database. Used by the `/thumbnails/regenerate` endpoint.

**Returns:** `Promise<void>`

### `clearThumbnailCache(templateId?)`

Clear the in-memory thumbnail cache. Pass `templateId` to clear a single entry, or omit to clear all.

### `healthCheck()`

Check if browser is connected and can generate PDFs.

**Returns:** `Promise<{ browserConnected: boolean; canGeneratePDF: boolean; error?: string }>`

### `closeBrowser()`

Close the browser instance (call on app shutdown).

**Returns:** `Promise<void>`

## Error Handling

```typescript
try {
  const pdfBuffer = await generatePDFFromReact(templateId, resumeData);
} catch (error) {
  if (error.message.includes('timeout')) {
    console.error('PDF generation timed out');
  } else if (error.message.includes('browser')) {
    console.error('Browser error:', error);
  } else {
    console.error('Unknown error:', error);
  }
}
```

## Graceful Shutdown

```typescript
import { closeBrowser } from './services/react-pdf-generator';

// Registered automatically in server.ts:
process.on('SIGTERM', () => closeBrowser());
process.on('SIGINT', () => closeBrowser());

// Manual cleanup
await closeBrowser();
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PDF Generation Flow                      │
└─────────────────────────────────────────────────────────────┘

1. Input: Resume Data + Template ID + Colors
          ↓
2. Get Template Config (from template registry)
          ↓
3. Create React Component (layout-specific)
          ↓
4. Render to HTML String (ReactDOMServer)
          ↓
5. Wrap in Full HTML Document with Styles
          ↓
6. Get/Create Puppeteer Browser Instance (singleton, locked)
          ↓
7. Create New Page
          ↓
8. Set HTML Content
          ↓
9. Generate PDF (A4, proper margins)
          ↓
10. Close Page (keep browser alive)
          ↓
11. Return PDF Buffer

┌─────────────────────────────────────────────────────────────┐
│                  Thumbnail Serving Flow                     │
└─────────────────────────────────────────────────────────────┘

GET /:templateId/thumbnail
          ↓
DB lookup previewImageUrl
          ↓
  External URL? ──→ 302 redirect to Cloudinary (fast path)
          ↓
  No URL → generate with Puppeteer
          ↓
  Serve JPEG immediately
          ↓
  Upload to Cloudinary in background → update DB
```

## Troubleshooting

### Chromium decompress is slow on first request

`@sparticuz/chromium` decompresses its binary from `node_modules` to `/tmp` on the first call to `chromium.executablePath()`. This adds ~3–5 seconds to the very first PDF/thumbnail request after a cold start. Subsequent requests reuse the running browser instance and are fast.

### `spawn ETXTBSY` under concurrent load

This happens when multiple requests all try to decompress the Chromium binary simultaneously. The `browserInitPromise` lock prevents this: only one init runs at a time, all other callers await the same promise.

### PDF generation timeout

If generation takes too long:

1. Increase timeout: `generatePDFWithTimeout(..., 30000)`
2. Check available memory (Chromium needs ~200MB)
3. Simplify resume data (remove large photo URLs)

### File size too large

If PDFs exceed 500KB:

1. Reduce number of sections
2. Optimize profile photos (serve smaller images from Cloudinary)
3. Use simpler templates (avoid heavy background images)

### Memory usage growing

1. Ensure `closeBrowser()` is called on shutdown
2. Verify pages are being closed after each generation
3. `browser.on('disconnected')` resets `browserInstance` automatically — check logs for unexpected disconnects

### Thumbnails showing 500 in production

All thumbnails should be pre-uploaded to Cloudinary using `scripts/upload-thumbnails.ts` or the GitHub Actions workflow. If a thumbnail still hits the slow path (Puppeteer) in production and times out, check that:
- The GitHub Actions secrets are configured
- The workflow ran successfully after the last template seed
- `previewImageUrl` is set in the database for the affected template

## Local Development

For local development, Puppeteer uses its bundled Chromium (downloaded on `npm install`) unless you set `PUPPETEER_EXECUTABLE_PATH` to point to a local Chrome binary.

```bash
# No extra setup needed — Puppeteer downloads Chromium on npm install
npm install

# Optional: use system Chrome
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable npm run dev
```

In CI (GitHub Actions), Chrome is pre-installed at `/usr/bin/google-chrome-stable`. Set `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` and `PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable` to use it directly.

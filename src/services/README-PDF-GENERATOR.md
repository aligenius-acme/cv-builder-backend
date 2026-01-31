# React PDF Generator Service

## Overview

The React PDF Generator service provides high-quality PDF generation from React templates using Puppeteer. It renders React components server-side and converts them to PDF with accurate colors, fonts, and formatting.

## Features

- ✅ React component rendering to PDF
- ✅ Browser instance reuse for performance
- ✅ Custom color theming support
- ✅ Multiple template layouts (20+ options)
- ✅ Memory management and cleanup
- ✅ Timeout handling
- ✅ A4 format with proper margins
- ✅ Color accuracy and font embedding
- ✅ File size optimization (<500KB)
- ✅ Fast generation (<5 seconds per PDF)

## Installation

Dependencies are already installed:
- `puppeteer@^23.10.4` - Headless browser for PDF generation
- `react@^18.3.1` - React for component rendering
- `react-dom@^18.3.1` - React DOM for server-side rendering
- `@types/react` and `@types/react-dom` - TypeScript types

## Usage

### Basic Usage

```typescript
import { generatePDFFromReact } from './services/react-pdf-generator';
import { ParsedResumeData } from './types';

// Your resume data
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
  // ... other fields
};

// Generate PDF
const pdfBuffer = await generatePDFFromReact(
  'london-navy',  // Template ID
  resumeData
);

// Save to file or send to client
fs.writeFileSync('resume.pdf', pdfBuffer);
```

### With Custom Colors

```typescript
const pdfBuffer = await generatePDFFromReact(
  'berlin-ocean',
  resumeData,
  {
    primaryColor: '#c2410c',    // Custom primary color
    secondaryColor: '#9a3412',   // Custom secondary color
    accentColor: '#ffedd5',      // Custom accent color
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

## Available Templates

The service supports 20+ template layouts with 15+ color palettes:

### Professional Templates
- `london-navy` - Classic elegance, traditional formatting
- `dublin-slate` - Clean traditional layout
- `stockholm-*` - Refined Scandinavian design
- `chicago-*` - Bold executive header
- `boston-*` - Compact academic layout

### Modern Templates
- `berlin-ocean` - Modern left-aligned with accent bars
- `amsterdam-teal` - Ultra-minimal with whitespace
- `copenhagen-*` - Clean two-column with sidebar
- `vancouver-*` - Modern right sidebar
- `singapore-*` - Tech-focused design

### Creative Templates
- `tokyo-violet` - Bold banner design
- `sydney-*` - Timeline-based layout
- `barcelona-*` - Colorful sidebar design
- `milan-*` - Fashion-forward elegant
- `rio-*` - Vibrant and eye-catching

### Simple Templates
- `toronto-graphite` - Simple and professional
- `seattle-*` - Minimal clean design
- `austin-*` - Casual yet professional
- `denver-*` - Entry-level friendly
- `phoenix-*` - Basic clean format

See `src/services/templates.ts` for complete list of template variants.

## Performance

### Benchmarks

Based on test results:
- **First generation**: ~2.3 seconds
- **Subsequent generations**: ~2.3 seconds (browser reuse)
- **File size**: ~118 KB per PDF
- **Success criteria**: < 5 seconds per generation ✅

### Optimization Features

1. **Browser Instance Reuse**: Single browser instance is reused across multiple PDF generations
2. **Memory Management**: Pages are closed after generation, browser is kept alive
3. **Timeout Protection**: All operations have configurable timeouts
4. **Graceful Shutdown**: Browser is properly closed on app shutdown

## API Reference

### `generatePDFFromReact(templateId, resumeData, customColors?)`

Generate a PDF from React template.

**Parameters:**
- `templateId` (string): Template variant ID (e.g., 'london-navy')
- `resumeData` (ParsedResumeData): Resume data to render
- `customColors` (object, optional): Custom color overrides
  - `primaryColor` (string): Primary color hex code
  - `secondaryColor` (string): Secondary color hex code
  - `accentColor` (string): Accent color hex code

**Returns:** `Promise<Buffer>` - PDF as Buffer

**Throws:** Error if generation fails

### `generatePDFWithTimeout(templateId, resumeData, customColors?, timeoutMs?)`

Generate PDF with timeout protection.

**Parameters:**
- Same as `generatePDFFromReact`
- `timeoutMs` (number, optional): Timeout in milliseconds (default: 10000)

**Returns:** `Promise<Buffer>` - PDF as Buffer

**Throws:** Error if generation fails or times out

### `batchGeneratePDFs(requests)`

Generate multiple PDFs in sequence.

**Parameters:**
- `requests` (array): Array of generation requests
  - `templateId` (string): Template variant ID
  - `resumeData` (ParsedResumeData): Resume data
  - `customColors` (object, optional): Custom colors

**Returns:** `Promise<Buffer[]>` - Array of PDF Buffers

**Throws:** Error if any generation fails

### `healthCheck()`

Check if browser is connected and can generate PDFs.

**Returns:** `Promise<object>`
- `browserConnected` (boolean): Browser connection status
- `canGeneratePDF` (boolean): Whether PDF generation works
- `error` (string, optional): Error message if failed

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

The service automatically handles graceful shutdown:

```typescript
// Automatic cleanup on shutdown
process.on('SIGTERM', () => closeBrowser());
process.on('SIGINT', () => closeBrowser());

// Manual cleanup
import { closeBrowser } from './services/react-pdf-generator';

// On app shutdown
await closeBrowser();
```

## Testing

Run the test suite:

```bash
npm run test:pdf-generator
# or
npx ts-node src/test-pdf-generator.ts
```

The test suite includes:
1. Health check test
2. Basic PDF generation
3. Custom colors test
4. Multiple templates test
5. Performance test (browser reuse)
6. File size validation

Test output is saved to `test-output/` directory.

## Troubleshooting

### Browser Launch Failed

If Puppeteer fails to launch:

1. Install Chrome/Chromium manually
2. Set `PUPPETEER_EXECUTABLE_PATH` environment variable
3. Check system resources (memory, disk space)

### PDF Generation Timeout

If generation takes too long:

1. Increase timeout: `generatePDFWithTimeout(..., 30000)`
2. Check browser resources
3. Simplify resume data (remove large images)

### File Size Too Large

If PDFs exceed 500KB:

1. Reduce number of sections
2. Optimize images (if using photos)
3. Simplify formatting
4. Use simpler templates

### Memory Leaks

If memory usage grows over time:

1. Ensure `closeBrowser()` is called on shutdown
2. Check that pages are being closed after generation
3. Monitor browser instance count
4. Restart browser periodically: `await closeBrowser(); await getBrowser();`

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PDF Generation Flow                      │
└─────────────────────────────────────────────────────────────┘

1. Input: Resume Data + Template ID + Colors
           ↓
2. Get Template Config (from templates.ts)
           ↓
3. Create React Component (BaseTemplate)
           ↓
4. Render to HTML String (ReactDOMServer)
           ↓
5. Wrap in Full HTML Document with Styles
           ↓
6. Get/Create Puppeteer Browser Instance (reused)
           ↓
7. Create New Page
           ↓
8. Set HTML Content
           ↓
9. Generate PDF (with proper settings)
           ↓
10. Close Page (keep browser alive)
           ↓
11. Return PDF Buffer
```

## Best Practices

1. **Reuse Browser Instance**: Don't call `closeBrowser()` between requests
2. **Use Timeouts**: Always use `generatePDFWithTimeout()` in production
3. **Error Handling**: Wrap all calls in try-catch blocks
4. **Memory Management**: Close browser on app shutdown
5. **File Size**: Monitor PDF sizes, keep under 500KB
6. **Performance**: Batch multiple requests if possible
7. **Testing**: Test with real resume data before deploying

## Future Enhancements

Potential improvements:

- [ ] Add watermark support
- [ ] Support for custom fonts (Google Fonts)
- [ ] Multi-page resume support with page numbers
- [ ] Header/footer customization
- [ ] PDF metadata (title, author, keywords)
- [ ] Compression options for smaller file sizes
- [ ] Parallel batch processing
- [ ] PDF/A format support for archival
- [ ] Accessibility features (tagged PDF)
- [ ] Custom page sizes (Letter, Legal, etc.)

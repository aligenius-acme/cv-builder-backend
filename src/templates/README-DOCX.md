# DOCX Template Generation System

## Overview

This module provides a parallel rendering engine for generating ATS-compatible Microsoft Word (DOCX) documents from resume data. Each template can have its own custom DOCX generator while sharing common utilities.

## Architecture

### Directory Structure

```
backend/src/
├── services/
│   └── react-docx-generator.ts    # Main DOCX generation service
├── templates/
│   ├── shared/
│   │   └── utils/
│   │       └── docxHelpers.ts     # Shared DOCX utilities
│   ├── ats-professional/
│   │   └── generateDOCX.ts        # ATS Professional template
│   ├── tech-startup/
│   │   └── generateDOCX.ts        # Tech Startup template
│   └── [other-templates]/
│       └── generateDOCX.ts        # Template-specific generators
```

### Key Components

1. **react-docx-generator.ts** - Main service for DOCX generation
   - Dynamically imports template-specific generators
   - Handles color configuration
   - Performance tracking
   - Fallback to default generator

2. **docxHelpers.ts** - Shared utility functions
   - Font styling helpers
   - Spacing converters (points to twips)
   - Section generators
   - Bullet list creators
   - Heading hierarchy (H1, H2, H3)
   - ATS-compatible formatting

3. **Template Generators** - Template-specific DOCX generation
   - Located in each template directory
   - Exports `generateDOCX()` function
   - Uses docx library primitives
   - Shares utilities from docxHelpers

## ATS Compatibility Standards

### Required Standards

1. **Standard Fonts**
   - Calibri (default)
   - Arial
   - Times New Roman
   - Georgia
   - Verdana

2. **Proper Heading Hierarchy**
   - H1: Candidate name
   - H2: Section headers (EXPERIENCE, EDUCATION, etc.)
   - H3: Job titles, degree names

3. **Bullet Points**
   - Standard bullets (•, ▪, –, ›, ○)
   - No custom images or special characters
   - Proper indentation

4. **Layout**
   - Single-column layout (no tables for layout)
   - Consistent margins
   - No text boxes
   - No headers/footers with critical info

5. **Spacing**
   - Proper use of twips (1/20 of a point)
   - Consistent line spacing
   - Section breaks for multi-page documents

## Creating a New Template

### Step 1: Create Template Directory

```bash
mkdir backend/src/templates/your-template
```

### Step 2: Create generateDOCX.ts

```typescript
import { Document, Paragraph } from 'docx';
import { ParsedResumeData } from '../../types';
import { ExtendedTemplateConfig } from '../../services/templates';
import {
  ATS_SAFE_FONTS,
  FONT_SIZES,
  createH1,
  createH2,
  createContactSection,
  createSection,
  // ... other helpers
} from '../shared/utils/docxHelpers';

export interface DOCXColorConfig {
  primary: string;
  secondary?: string;
  accent?: string;
  text?: string;
  muted?: string;
  background?: string;
}

export async function generateDOCX(
  data: ParsedResumeData,
  colors: DOCXColorConfig,
  templateConfig: ExtendedTemplateConfig
): Promise<Document> {
  const paragraphs: Paragraph[] = [];
  const font = ATS_SAFE_FONTS.CALIBRI;
  const primaryColor = colors.primary;

  // Build document sections
  // ... add paragraphs

  return new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 720, right: 720, bottom: 720, left: 720 },
        },
      },
      children: paragraphs,
    }],
  });
}
```

### Step 3: Register Template

Update `react-docx-generator.ts`:

```typescript
export function getSupportedDOCXTemplates(): string[] {
  return [
    'ats-professional',
    'tech-startup',
    'your-template', // Add your template
    // ... other templates
  ];
}
```

## Usage

### Basic Usage

```typescript
import { generateDOCXFromReact } from './services/react-docx-generator';

const buffer = await generateDOCXFromReact(
  'ats-professional-navy',
  resumeData
);

// Save to file
fs.writeFileSync('resume.docx', buffer);
```

### With Custom Colors

```typescript
const buffer = await generateDOCXFromReact(
  'ats-professional-navy',
  resumeData,
  {
    primary: '#059669',
    secondary: '#047857',
    text: '#1a1a2e',
    muted: '#64748b',
  }
);
```

### With Performance Tracking

```typescript
import { generateDOCXWithMetrics } from './services/react-docx-generator';

const { buffer, generationTime } = await generateDOCXWithMetrics(
  'ats-professional-navy',
  resumeData
);

console.log(`Generated in ${generationTime}ms`);
```

## Helper Functions Reference

### Text Styling

```typescript
// Create styled text
createTextRun(text, {
  bold: true,
  italic: false,
  color: '#2563eb',
  size: FONT_SIZES.BODY,
  font: ATS_SAFE_FONTS.CALIBRI,
});

// Quick helpers
boldText(text, size, color);
italicText(text, size, color);
coloredText(text, color, size);
```

### Headings

```typescript
// H1 - Name
createH1(name, {
  color: primaryColor,
  alignment: AlignmentType.LEFT,
  font: ATS_SAFE_FONTS.CALIBRI,
});

// H2 - Section headers
createH2('EXPERIENCE', {
  color: primaryColor,
  uppercase: true,
  underline: true,
});

// H3 - Job titles
createH3('Senior Software Engineer', {
  color: primaryColor,
});
```

### Sections

```typescript
// Contact section
createContactSection(
  name,
  ['email@example.com', '(555) 123-4567', 'City, State'],
  { nameColor: primaryColor, font: ATS_SAFE_FONTS.CALIBRI }
);

// Experience entry
createExperienceEntry(
  'Job Title',
  'Company Name',
  'Location',
  'Jan 2020 – Present',
  ['Bullet point 1', 'Bullet point 2'],
  { titleColor: primaryColor }
);

// Education entry
createEducationEntry(
  'Bachelor of Science',
  'University Name',
  'May 2020',
  { titleColor: primaryColor }
);
```

### Bullet Lists

```typescript
// Single bullet point
createBulletPoint('Achievement description', {
  bullet: BULLET_STYLES.ROUND,
  indentLevel: 0,
});

// Multiple bullets
createBulletList(
  ['Item 1', 'Item 2', 'Item 3'],
  { bullet: BULLET_STYLES.ROUND }
);
```

### Spacing

```typescript
// Convert points to twips
const spacing = pointsToTwips(12); // 12 points = 240 twips

// Use predefined spacing
createSpacing({
  before: SPACING.MEDIUM,
  after: SPACING.SMALL,
  line: 276, // 1.15 line spacing
});

// Empty paragraph for spacing
emptyParagraph(createSpacing({ after: SPACING.MEDIUM }));
```

## Performance Targets

- **Generation Time**: < 3 seconds per document
- **File Size**: 8-15 KB for standard resume
- **Memory Usage**: Minimal (streaming not required for resumes)

## Testing

### Manual Testing

```bash
# Run test script
npm run test-docx

# Or with ts-node
npx ts-node src/test-docx-generation.ts
```

### Test Checklist

1. ✅ DOCX generates without errors
2. ✅ Opens correctly in Microsoft Word
3. ✅ All formatting preserved (fonts, colors, spacing)
4. ✅ Proper heading hierarchy (H1, H2, H3)
5. ✅ Standard bullets render correctly
6. ✅ No layout issues (single-column, no tables)
7. ✅ ATS parser can extract content
8. ✅ Performance under 3 seconds

### ATS Testing Tools

- **Jobscan** - https://www.jobscan.co/
- **Resume Worded** - https://resumeworded.com/
- **TopResume ATS Checker** - https://www.topresume.com/
- **VMock** - https://www.vmock.com/

## Best Practices

### DO ✅

- Use standard ATS-safe fonts
- Maintain proper heading hierarchy
- Use standard bullet characters
- Keep single-column layout
- Use semantic structure (H1, H2, H3)
- Clean bullet text before rendering
- Sanitize all user input
- Provide proper spacing between sections
- Use consistent margins

### DON'T ❌

- Use tables for layout
- Use text boxes
- Use custom fonts
- Use images for bullets
- Use headers/footers for important content
- Mix font families excessively
- Use complex nested structures
- Use special characters for formatting
- Exceed 2 pages unless necessary

## Troubleshooting

### "Template does not export generateDOCX"

- Ensure `generateDOCX.ts` exists in template directory
- Verify the function is exported correctly
- Check template ID is registered in `getSupportedDOCXTemplates()`

### TypeScript Errors with docx Types

- Use `any` for enum types (AlignmentType, HeadingLevel, etc.)
- The docx library has complex type definitions
- See docxHelpers.ts for examples

### Large File Sizes

- Avoid embedding images
- Don't duplicate content
- Use efficient paragraph structures
- Consider compressing with different settings

### ATS Parsing Issues

- Verify using ATS testing tools
- Check heading hierarchy
- Ensure no tables for layout
- Use standard fonts only
- Test with actual ATS systems

## Future Enhancements

1. **Template Variants** - Support for multiple layouts per template
2. **Custom Fonts** - Safe font fallback system
3. **Multi-page Support** - Advanced section breaks
4. **Styles Export** - Reusable Word styles
5. **Table Support** - ATS-safe table rendering
6. **Rich Text** - Advanced formatting options
7. **Localization** - Multi-language support
8. **Accessibility** - WCAG compliance

## References

- [docx library documentation](https://docx.js.org/)
- [Microsoft Word XML specification](https://docs.microsoft.com/en-us/office/open-xml/word/)
- [ATS-friendly resume guidelines](https://www.jobscan.co/blog/ats-friendly-resume/)
- [Word measurement units (twips)](https://docs.microsoft.com/en-us/dotnet/api/documentformat.openxml.wordprocessing)

# Resume Template System

## Overview

This directory contains the complete template system for generating resumes in multiple formats (PDF, DOCX). The system is built with TypeScript and React components for maximum flexibility and reusability.

## Directory Structure

```
templates/
├── index.ts                    # Main template interface and registry
├── shared/                     # Shared components and utilities
│   ├── components/            # Reusable React components (8 components)
│   ├── styles/                # Style utilities (colors, typography, spacing)
│   └── utils/                 # Helper functions (formatters, layout, ATS)
├── ats-professional/          # ATS-optimized professional template
├── tech-startup/              # Modern tech-focused template
├── creative-design/           # Creative design template
├── academic-research/         # Academic/research template
├── entry-student/             # Entry-level/student template
├── executive-leadership/      # Executive leadership template
└── __tests__/                 # Test files

```

## Shared Components (8)

Located in `shared/components/`:

1. **Header.tsx** - Resume header with name and contact information
   - Variants: centered, left-aligned, split
   - Customizable styling and content display

2. **ContactInfo.tsx** - Contact information section
   - Layouts: horizontal, vertical, grid
   - Optional icons and labels
   - Formatted phone numbers and URLs

3. **SectionHeader.tsx** - Section headers with consistent styling
   - Variants: default, underline, filled, minimal, sidebar
   - Optional icons and uppercase transformation

4. **ExperienceSection.tsx** - Work experience entries
   - Layouts: default, compact, detailed
   - Duration calculations
   - Bullet point formatting

5. **EducationSection.tsx** - Education entries
   - GPA display option
   - Achievement listings
   - Date formatting

6. **SkillsSection.tsx** - Skills display
   - Layouts: grid, list, pills, columns, inline
   - Categorized skills support
   - Customizable column counts

7. **ProjectsSection.tsx** - Project showcase
   - Technology stack display
   - Project links
   - Description formatting

8. **CertificationsSection.tsx** - Certifications list
   - Issuer and date information
   - Multiple layout options

## Style Utilities (3)

Located in `shared/styles/`:

### 1. colors.ts
- **Color Palettes**: 5 pre-defined palettes (professional, creative, minimal, modern, executive)
- **Color Functions**: hex/RGB conversion, lighten/darken, opacity, contrast calculation
- **Custom Palette**: Create custom palettes from primary/secondary colors

### 2. typography.ts
- **Font Sizes**: Scale from xs to 4xl
- **Font Weights**: normal, medium, semibold, bold
- **Text Styles**: Pre-defined styles (h1-h4, body, caption, subtitle)
- **Utilities**: Line height calculation, text transformation, truncation

### 3. spacing.ts
- **Spacing Scale**: 0-64pt scale for consistent spacing
- **Page Margins**: Presets (narrow, normal, moderate, wide)
- **Layout Calculations**: Two-column, grid, content bounds
- **Page Sizes**: Letter, A4, Legal

## Utility Functions (4)

Located in `shared/utils/`:

### 1. formatters.ts
Date, text, and data formatting utilities:
- Date formatting and range calculation
- Duration calculation
- Phone number formatting
- URL formatting
- Location formatting
- Text manipulation (truncate, titleCase, wrapText)
- GPA formatting

### 2. layoutHelpers.ts
Layout and positioning calculations:
- Alignment (horizontal/vertical center, right, bottom)
- Grid creation
- Flex layout calculations
- Stacking (vertical/horizontal)
- Pagination
- Safe area calculations

### 3. atsOptimization.ts
ATS-friendly text processing:
- Text sanitization for ATS
- ATS compatibility analysis
- Keyword extraction and density
- Bullet point optimization
- Section header standardization
- ATS score calculation

### 4. docxHelpers.ts (bonus)
DOCX generation utilities for Word document export

## Template Interface

The `ReactTemplate` interface defines the structure for all templates:

```typescript
interface ReactTemplate {
  id: string;
  name: string;
  metadata: TemplateMetadata;
  PDFComponent: React.FC<TemplatePDFProps>;
  generateDOCX: (data: ParsedResumeData, colors: ColorPalette) => Document;
  generateHTML?: (data: ParsedResumeData, colors: ColorPalette) => string;
  validate?: (data: ParsedResumeData) => TemplateValidationResult;
}
```

## Template Registry

The `TemplateRegistry` class manages all available templates:

```typescript
// Register a template
templateRegistry.register(myTemplate);

// Get template by ID
const template = templateRegistry.getTemplate('ats-professional');

// Get templates by category
const professionalTemplates = templateRegistry.getTemplatesByCategory('professional');

// Get ATS-friendly templates (score > 80)
const atsTemplates = templateRegistry.getATSFriendlyTemplates();
```

## Usage Example

```typescript
import {
  Header,
  ExperienceSection,
  SkillsSection,
  getColorPalette,
  formatDateRange
} from './templates/shared';

// Get a color palette
const colors = getColorPalette('professional');

// Use components
<Header contact={resumeData.contact} colors={colors} variant="centered" />
<ExperienceSection
  experiences={resumeData.experience}
  colors={colors}
  showDuration={true}
/>
<SkillsSection
  skills={resumeData.skills}
  colors={colors}
  layout="grid"
  columns={3}
/>
```

## Template Development

To create a new template:

1. Create a new directory under `templates/`
2. Implement the `ReactTemplate` interface
3. Use shared components for consistency
4. Define template metadata (category, ATS score, best for, features)
5. Implement PDF and DOCX generation
6. Register the template with the registry

## Testing

Tests are located in `__tests__/shared.test.ts`:

```bash
npm test -- src/templates/__tests__/shared.test.ts
```

## Success Criteria - Module 2 ✓

- [x] All directories created (6 template dirs + shared)
- [x] 8+ shared components built and typed
- [x] Template interface defined
- [x] Components render without errors (React structure)
- [x] TypeScript types compile (with JSX support)
- [x] 3 style utilities (colors, typography, spacing)
- [x] 3+ utility functions (formatters, layout, ATS)
- [x] Comprehensive documentation
- [x] Test coverage for shared resources

## Next Steps (Module 3)

Implementation of individual templates:
1. ATS Professional Template
2. Tech Startup Template
3. Creative Design Template
4. Academic Research Template
5. Entry Student Template
6. Executive Leadership Template

Each template will use the shared components and utilities created in this module.

## TypeScript Configuration

The project's `tsconfig.json` has been updated to support JSX:

```json
{
  "compilerOptions": {
    "jsx": "react",
    "types": ["node", "jest", "react", "react-dom"]
  }
}
```

## Dependencies

The template system uses:
- React (components)
- @types/react (TypeScript types)
- docx (DOCX generation)
- Existing types from `src/types/index.ts`

Future dependency for PDF rendering:
- @react-pdf/renderer (recommended for PDF generation)

## Notes

- All components use inline styles for PDF compatibility
- ATS optimization is built into all utilities
- Color palettes are customizable per template
- Layout calculations support both single and two-column designs
- All utilities include comprehensive JSDoc comments

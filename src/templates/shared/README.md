# Template Configuration System

## Overview

The Template Configuration System enables dynamic assembly of resume templates from a modular component library. Instead of creating 500 individual template files, we define **template configurations** that specify which components to use and how to combine them.

## Architecture

```
Component Library (55 components)
         ↓
Template Configurations (500 configs)
         ↓
Template Assembler (dynamic rendering)
         ↓
Final Resume PDF/DOCX
```

## Component Library

### Components by Category:
- **Headers** (15 variants): photo-prominent, minimal, bold-modern, gradient-background, etc.
- **Experience** (15 variants): bullet-point, timeline-left, card-layout, skills-tagged, etc.
- **Skills** (12 variants): progress-bars, tag-cloud, categorized, chip, etc.
- **Education** (10 variants): timeline, card, compact, detailed, etc.
- **Sidebars** (8 variants): contact, skills, profile, colored, etc.

Each component is:
- **Self-contained** React functional component
- **Accepts standard props** (data, colors, etc.)
- **Visually distinct** (not just color variations)
- **Exported with registry** for dynamic loading

## Template Configuration

A template configuration defines:

```typescript
interface TemplateConfig {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  description: string;           // Description

  layout: 'single-column' | 'two-column-left' | 'two-column-right';

  components: {
    header: HeaderVariant;
    experience: ExperienceVariant;
    skills: SkillsVariant;
    education: EducationVariant;
    sidebar?: SidebarVariant;
  };

  sections: {
    order: ['experience', 'education', 'skills'];
  };

  colorScheme: ColorScheme;
  fontConfig: FontConfig;

  // Metadata
  category: string;
  atsCompatibility: number;
  photoSupport: boolean;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive' | 'all';
}
```

## Usage

### 1. Generate Template Configurations

```bash
npm run generate:templates
```

This creates `backend/data/generated-templates.json` with 500 template configurations.

### 2. Seed Database

```bash
npm run seed:templates
```

Seeds the configurations to the `ResumeTemplate` table.

### 3. Assemble a Template

```typescript
import { TemplateAssembler } from './services/TemplateAssembler';
import { templateConfig } from './generated-templates.json';

// Load template configuration
const config = templateConfig.find(t => t.id === 'template-0001');

// Assemble template with user data
const template = await TemplateAssembler.assembleTemplate(config, userData);

// Render to PDF/DOCX
const pdf = await generatePDF(template);
```

## Template Generation Strategy

### Strategic Combinations

Instead of generating all possible combinations (216,000+), we:

1. **Define strategic base combinations** (~10-15) for each use case:
   - ATS-Professional: formal headers + bullet-point experience
   - Tech-Startup: modern headers + timeline experience + tech skills
   - Creative-Design: bold headers + project-highlight experience
   - Entry-Level: education-first order + compact layouts

2. **Multiply by color schemes** (7 colors)

3. **Multiply by font pairings** (3 fonts)

Result: ~10 base combinations × 7 colors × 3 fonts = ~210 templates per use case

With 5 major use cases: **500+ unique templates**

### ATS Compatibility Scoring

Templates receive ATS scores (0-100) based on:
- Component choices (formal components score higher)
- Layout simplicity (single-column scores higher)
- Text-based design (less graphics = better ATS)

```typescript
calculateATSScore(header, experience, skills, layout) {
  let score = 70; // Base
  score += headerScore[header];     // +0-10
  score += experienceScore[experience]; // +0-10
  score += skillsScore[skills];     // +0-10
  score += layoutScore[layout];     // +0-5
  return min(100, score);
}
```

## File Structure

```
backend/src/templates/shared/
├── components/
│   └── variants/
│       ├── headers/          # 15 header components + index
│       ├── experience/       # 15 experience components + index
│       ├── skills/           # 12 skills components + index
│       ├── education/        # 10 education components + index
│       └── sidebars/         # 8 sidebar components + index
├── services/
│   ├── TemplateAssembler.ts    # Dynamic template assembly
│   └── TemplateGenerator.ts    # Generate template configs
├── types/
│   └── templateConfig.ts       # TypeScript types
├── styles/
│   ├── colors.ts               # 7 color schemes
│   └── fonts.ts                # Font configurations
└── README.md                   # This file

backend/scripts/
├── generate-templates.ts       # Generate 500 configs
└── seed-generated-templates.ts # Seed to database

backend/data/
├── generated-templates.json    # 500 template configs
└── template-summary.json       # Statistics
```

## Adding New Components

### 1. Create Component

```typescript
// backend/src/templates/shared/components/variants/headers/NewHeader.tsx
export const NewHeader: React.FC<NewHeaderProps> = ({ contact, colors, photoUrl }) => {
  return (
    <div style={{ /* unique styling */ }}>
      {/* component content */}
    </div>
  );
};
```

### 2. Register Component

```typescript
// backend/src/templates/shared/components/variants/headers/index.ts
export { NewHeader } from './NewHeader';

export const headerVariants = {
  // ...existing variants
  'new-header': 'NewHeader',
} as const;
```

### 3. Use in Template Configs

```typescript
// In TemplateGenerator.defineStrategicCombinations()
{
  name: 'Template with New Header',
  headerVariant: 'new-header',
  // ...rest of config
}
```

## Benefits

### ✅ Scalability
- Add 1 new component → instantly usable in 100s of templates
- Modify 1 component → updates all templates using it

### ✅ Consistency
- Shared color schemes across all templates
- Consistent component APIs and behavior

### ✅ Maintainability
- 55 components to maintain vs 500 template files
- Centralized styling and configuration

### ✅ Flexibility
- Users can theoretically customize components
- Easy A/B testing of different combinations

### ✅ Performance
- Templates loaded dynamically (code splitting)
- Only load components needed for selected template

## Color Schemes

7 professional color palettes:

```typescript
const COLOR_SCHEMES = {
  navy: { primary: '#1e3a8a', secondary: '#3b82f6', ... },
  emerald: { primary: '#047857', secondary: '#10b981', ... },
  burgundy: { primary: '#881337', secondary: '#be123c', ... },
  slate: { primary: '#334155', secondary: '#64748b', ... },
  purple: { primary: '#6b21a8', secondary: '#a855f7', ... },
  teal: { primary: '#0f766e', secondary: '#14b8a6', ... },
  orange: { primary: '#c2410c', secondary: '#f97316', ... },
};
```

Each palette includes 13 color definitions for comprehensive theming.

## Next Steps

1. ✅ Component library (55 components)
2. ✅ Template configuration system
3. ⏳ Generate 500 template configs
4. ⏳ Seed database
5. ⏳ Generate thumbnails
6. ⏳ Update frontend template selector
7. ⏳ Testing and QA

## Testing

```bash
# Generate templates
npm run generate:templates

# Verify output
ls backend/data/generated-templates.json

# Seed database
npm run seed:templates

# Verify seeding
npx prisma studio
# Check ResumeTemplate table count
```

---

**Note**: This system provides the foundation for 500+ genuinely unique templates without the maintenance burden of 500 individual files. Each template is a unique combination of components, not just a color variation.

# Entry-Level & Student Templates

Collection of 15 professionally designed resume templates optimized for students, recent graduates, and entry-level candidates.

## Overview

This module contains templates specifically designed for candidates with limited professional experience, emphasizing education, projects, skills, and potential.

## Templates (15)

### 1. Graduate Fresh (`graduate-fresh`)
- **Color:** Teal (#14b8a6)
- **Design:** Clean, modern
- **Best For:** Recent graduates, first professional role
- **ATS Score:** 95%
- **Features:** Education-first, prominent projects section

### 2. Student Clean (`student-clean`)
- **Color:** Indigo (#4f46e5)
- **Design:** Minimalist, ultra-clean
- **Best For:** Current students, internships, co-op
- **ATS Score:** 98%
- **Features:** Academic focus, coursework emphasized

### 3. Intern Ready (`intern-ready`)
- **Color:** Coral (#f97316)
- **Design:** Professional yet fresh
- **Best For:** Internship seekers, summer positions
- **ATS Score:** 96%
- **Features:** Skills prominent, extracurricular activities

### 4. Entry Professional (`entry-professional`)
- **Color:** Navy Blue (#1e40af)
- **Design:** Polished, corporate
- **Best For:** Entry-level professional roles
- **ATS Score:** 97%
- **Features:** Balance of education and experience

### 5. Career Starter (`career-starter`)
- **Color:** Mint Green (#10b981)
- **Design:** Balanced, versatile
- **Best For:** Career starters, first job
- **ATS Score:** 96%
- **Features:** Flexible section ordering, modern design

### 6. Recent Graduate (`recent-graduate`)
- **Color:** Purple (#7c3aed)
- **Design:** Academic-focused
- **Best For:** Recent graduates, graduate school applicants
- **ATS Score:** 97%
- **Features:** GPA and honors prominent, research emphasized

### 7. College Student (`college-student`)
- **Color:** Sky Blue (#0ea5e9)
- **Design:** Comprehensive, balanced
- **Best For:** College students, campus recruiting
- **ATS Score:** 95%
- **Features:** Leadership and involvement sections

### 8. First Job (`first-job`)
- **Color:** Emerald (#059669)
- **Design:** Simple, straightforward
- **Best For:** First-time job seekers, no experience
- **ATS Score:** 98%
- **Features:** Transferable skills, potential-focused

### 9. Entry Level (`entry-level`)
- **Color:** Professional Blue (#2563eb)
- **Design:** Classic, traditional
- **Best For:** Entry-level across all industries
- **ATS Score:** 98%
- **Features:** Standard sections, highly ATS-optimized

### 10. Career Change (`career-change`)
- **Color:** Amber (#d97706)
- **Design:** Skills-based layout
- **Best For:** Career changers, industry switchers
- **ATS Score:** 96%
- **Features:** Transferable skills emphasized, flexible presentation

### 11. Internship (`internship`)
- **Color:** Cyan (#06b6d4)
- **Design:** Clean, professional
- **Best For:** Internship applications, co-op programs
- **ATS Score:** 97%
- **Features:** Academic focus, coursework highlighted

### 12. Junior Professional (`junior-professional`)
- **Color:** Slate (#475569)
- **Design:** Professional, modern
- **Best For:** 0-2 years experience, associate roles
- **ATS Score:** 97%
- **Features:** Experience and skills balanced

### 13. New Graduate (`new-graduate`)
- **Color:** Rose (#e11d48)
- **Design:** Fresh, vibrant
- **Best For:** Brand new graduates, graduation season
- **ATS Score:** 96%
- **Features:** Academic achievements highlighted

### 14. Career Launch (`career-launch`)
- **Color:** Lime Green (#84cc16)
- **Design:** Dynamic, energetic
- **Best For:** Career launch, ambitious candidates
- **ATS Score:** 95%
- **Features:** Achievement-focused, modern layout

### 15. Freshman (`freshman`)
- **Color:** Violet (#8b5cf6)
- **Design:** Very simple, clean
- **Best For:** First/second year students, minimal experience
- **ATS Score:** 97%
- **Features:** Education and potential focused

## Design Characteristics

### Common Features
- **Layout:** Single-column, one-page optimized
- **Header:** Simple, clean contact information
- **Section Order:** Education-first positioning
- **Projects:** Prominent placement and detailed presentation
- **Skills:** Categorized display with modern styling
- **ATS Compatibility:** 95%+ across all templates

### Color Palette
Bright, energetic colors appropriate for entry-level candidates:
- Teal, Indigo, Coral, Mint
- Navy, Purple, Sky Blue, Emerald
- Cyan, Slate, Rose, Lime, Violet

### Typography
Modern sans-serif fonts:
- Calibri (default)
- Arial
- Helvetica

## Special Features for Entry-Level

### 1. Education Section
- Positioned at top (after header/summary)
- GPA display option
- Relevant coursework subsection
- Academic achievements highlighted

### 2. Projects Section
- Prominent positioning
- Technology stack display
- GitHub/portfolio links
- Detailed descriptions

### 3. Skills Section
- Multiple display options (grid, pills, inline, columns)
- Categorization support
- Modern, scannable layouts

### 4. Experience Section
- Compact layout for limited experience
- Emphasis on achievements over duties
- Part-time and volunteer work included

### 5. Additional Sections
- Extracurricular Activities
- Certifications & Awards
- Leadership Positions
- Academic Honors

## File Structure

```
entry-student/
├── GraduateFresh.tsx           # Graduate Fresh template
├── StudentClean.tsx            # Student Clean template
├── InternReady.tsx             # Intern Ready template
├── EntryProfessional.tsx       # Entry Professional template
├── CareerStarter.tsx           # Career Starter template
├── RecentGraduate.tsx          # Recent Graduate template
├── CollegeStudent.tsx          # College Student template
├── FirstJob.tsx                # First Job template
├── EntryLevel.tsx              # Entry Level template
├── CareerChange.tsx            # Career Change template
├── Internship.tsx              # Internship template
├── JuniorProfessional.tsx      # Junior Professional template
├── NewGraduate.tsx             # New Graduate template
├── CareerLaunch.tsx            # Career Launch template
├── Freshman.tsx                # Freshman template
├── generateDOCX.ts             # Shared DOCX generator
├── index.ts                    # Export module
└── README.md                   # This file
```

## Usage

### Import Individual Template
```typescript
import { GraduateFreshTemplate } from './templates/entry-student/GraduateFresh';
```

### Import All Templates
```typescript
import { entryStudentTemplates } from './templates/entry-student';
```

### Get Template by ID
```typescript
import { getEntryStudentTemplate } from './templates/entry-student';

const template = getEntryStudentTemplate('graduate-fresh');
```

## PDF Generation

Each template includes a React component for PDF rendering:

```typescript
const PDFComponent = template.PDFComponent;

<PDFComponent
  data={resumeData}
  colors={template.metadata.colorPalettes[0]}
  options={renderOptions}
/>
```

## DOCX Generation

All templates share a common DOCX generator optimized for entry-level resumes:

```typescript
const docxDocument = template.generateDOCX(
  resumeData,
  colors,
  options
);
```

### DOCX Features
- ATS-safe formatting
- Single-column layout
- Standard fonts (Calibri, Arial)
- Proper heading hierarchy (H1, H2, H3)
- Bullet point support
- Education-first section order

## Metadata

Each template includes comprehensive metadata:

```typescript
{
  id: 'template-id',
  name: 'Template Name',
  category: 'entry-level',
  description: 'Template description',
  colorPalettes: ['color1', 'color2'],
  features: {
    twoColumn: false,
    colorCustomization: true,
    certifications: true,
    // ... more features
  },
  atsScore: 95,
  bestFor: ['Target audiences'],
  version: '1.0.0'
}
```

## Best Practices

### For Students
1. Lead with education (GPA 3.0+)
2. Highlight relevant coursework
3. Include academic projects
4. Show extracurricular leadership

### For Recent Graduates
1. Education first, then skills
2. Emphasize capstone/thesis projects
3. Include internships prominently
4. Show career-relevant activities

### For Career Changers
1. Skills-based presentation
2. Transferable skills highlighted
3. Recent training/certifications
4. Relevant projects over old experience

### For Minimal Experience
1. Focus on potential and skills
2. Include volunteer work
3. Highlight academic achievements
4. Show willingness to learn

## Customization

### Color Customization
All templates support color customization through the ColorPalette interface:

```typescript
const customColors: ColorPalette = {
  primary: '#your-color',
  secondary: '#your-color',
  // ... more colors
};
```

### Section Ordering
Templates can be customized to reorder sections based on candidate strengths.

### Content Display
- Show/hide GPA
- Expand/collapse project details
- Adjust skills layout
- Customize bullet styles

## Testing

All templates have been:
- ✅ TypeScript compiled without errors
- ✅ Tested with sample resume data
- ✅ Verified for one-page constraint
- ✅ Validated for ATS compatibility
- ✅ Checked for DOCX generation

## Version

**Current Version:** 1.0.0

## Contributing

When adding new entry-level templates:
1. Follow the existing naming convention
2. Maintain education-first layout
3. Ensure ATS score > 95%
4. Keep one-page constraint
5. Use modern, energetic colors
6. Include comprehensive metadata
7. Update this README

## License

Part of CV Builder Pro template system.

# Shared Components API Documentation

This document provides detailed API documentation for all shared resume template components.

## Table of Contents

1. [Header Component](#header-component)
2. [ContactInfo Component](#contactinfo-component)
3. [SectionHeader Component](#sectionheader-component)
4. [ExperienceSection Component](#experiencesection-component)
5. [EducationSection Component](#educationsection-component)
6. [SkillsSection Component](#skillssection-component)
7. [ProjectsSection Component](#projectssection-component)
8. [CertificationsSection Component](#certificationssection-component)

---

## Header Component

Resume header with name and contact information.

### Props

```typescript
interface HeaderProps {
  contact: ContactInfo;
  colors: ColorPalette;
  variant?: 'centered' | 'left' | 'split';
  showLinks?: boolean;
}
```

### Variants

- **Default/Centered**: Name and contact centered with bottom border
- **CompactHeader**: Single line with name on left, email/phone on right
- **SplitHeader**: Two-column layout with contact info split

### Usage

```typescript
import { Header } from './templates/shared/components';

<Header
  contact={resumeData.contact}
  colors={colorPalette}
  variant="centered"
  showLinks={true}
/>
```

---

## ContactInfo Component

Displays contact information in various layouts.

### Props

```typescript
interface ContactInfoProps {
  contact: ContactInfo;
  colors: ColorPalette;
  layout?: 'horizontal' | 'vertical' | 'grid';
  showIcons?: boolean;
  showLabels?: boolean;
}
```

### Layouts

- **horizontal**: Single row with separators
- **vertical**: Stacked vertically
- **grid**: 2-column grid layout

### Variants

- **MinimalContactInfo**: Email and phone only
- **LinkedContactInfo**: Highlights links in primary color

### Usage

```typescript
<ContactInfo
  contact={resumeData.contact}
  colors={colorPalette}
  layout="horizontal"
  showIcons={false}
  showLabels={false}
/>
```

---

## SectionHeader Component

Reusable section header with consistent styling.

### Props

```typescript
interface SectionHeaderProps {
  title: string;
  colors: ColorPalette;
  variant?: 'default' | 'underline' | 'filled' | 'minimal' | 'sidebar';
  icon?: string;
  uppercase?: boolean;
}
```

### Variants

- **default**: Simple header with primary color
- **underline**: Header with bottom border
- **filled**: Colored background
- **minimal**: Smallest, simplest style
- **sidebar**: Left border accent

### Additional Components

- **SubsectionHeader**: Smaller subsection header
- **SectionDivider**: Horizontal divider line

### Usage

```typescript
<SectionHeader
  title="Work Experience"
  colors={colorPalette}
  variant="underline"
  uppercase={false}
/>
```

---

## ExperienceSection Component

Displays work experience entries with job details and achievements.

### Props

```typescript
interface ExperienceSectionProps {
  experiences: ExperienceEntry[];
  colors: ColorPalette;
  showDuration?: boolean;
  bulletStyle?: 'bullet' | 'dash' | 'none';
  layout?: 'default' | 'compact' | 'detailed';
}
```

### Layouts

- **default**: Standard layout with title, company, dates, description
- **compact**: Condensed single-line headers
- **detailed**: Expanded with location and duration

### Features

- Automatic date range formatting
- Duration calculation (years, months)
- Bullet point formatting
- Location display

### Usage

```typescript
<ExperienceSection
  experiences={resumeData.experience}
  colors={colorPalette}
  showDuration={true}
  bulletStyle="bullet"
  layout="default"
/>
```

---

## EducationSection Component

Displays education entries with degree, institution, and achievements.

### Props

```typescript
interface EducationSectionProps {
  education: EducationEntry[];
  colors: ColorPalette;
  showGPA?: boolean;
  layout?: 'default' | 'compact' | 'detailed';
}
```

### Layouts

- **default**: Standard layout with degree, institution, date
- **compact**: Single-line format
- **detailed**: Expanded with achievements list

### Features

- GPA formatting
- Achievement bullets
- Graduation date formatting
- Location display

### Usage

```typescript
<EducationSection
  education={resumeData.education}
  colors={colorPalette}
  showGPA={true}
  layout="default"
/>
```

---

## SkillsSection Component

Displays skills in various layouts.

### Props

```typescript
interface SkillsSectionProps {
  skills: string[];
  colors: ColorPalette;
  layout?: 'grid' | 'list' | 'pills' | 'columns' | 'inline';
  columns?: number;
  showBullets?: boolean;
}
```

### Layouts

- **grid**: Multi-column grid with bullets
- **list**: Vertical list with optional bullets
- **pills**: Colored tags/badges
- **columns**: Distributes skills across columns
- **inline**: Comma/dot-separated single line

### Categorized Skills

```typescript
interface CategorizedSkillsProps {
  categories: {
    name: string;
    skills: string[];
  }[];
  colors: ColorPalette;
  layout?: 'grid' | 'list' | 'inline';
}
```

### Usage

```typescript
<SkillsSection
  skills={resumeData.skills}
  colors={colorPalette}
  layout="grid"
  columns={3}
  showBullets={true}
/>

// Or categorized
<CategorizedSkills
  categories={[
    { name: 'Languages', skills: ['JavaScript', 'Python'] },
    { name: 'Frameworks', skills: ['React', 'Node.js'] }
  ]}
  colors={colorPalette}
  layout="list"
/>
```

---

## ProjectsSection Component

Displays project entries with descriptions, technologies, and links.

### Props

```typescript
interface ProjectsSectionProps {
  projects: ProjectEntry[];
  colors: ColorPalette;
  showTechnologies?: boolean;
  showLinks?: boolean;
  layout?: 'default' | 'compact' | 'detailed';
}
```

### Layouts

- **default**: Project name, company, date, description, tech stack
- **compact**: Condensed single description line
- **detailed**: Full details with labeled tech stack

### Features

- Technology stack display
- URL formatting
- Multi-line descriptions
- Date range support

### Usage

```typescript
<ProjectsSection
  projects={resumeData.projects}
  colors={colorPalette}
  showTechnologies={true}
  showLinks={true}
  layout="default"
/>
```

---

## CertificationsSection Component

Displays certifications and licenses.

### Props

```typescript
interface CertificationsSectionProps {
  certifications: CertificationEntry[];
  colors: ColorPalette;
  layout?: 'default' | 'compact' | 'detailed' | 'list';
}
```

### Layouts

- **default**: Name, issuer, date in structured layout
- **compact**: Single-line entries
- **detailed**: Expanded with larger text
- **list**: Bulleted list format

### Features

- Date formatting
- Issuer display
- Flexible layouts

### Usage

```typescript
<CertificationsSection
  certifications={resumeData.certifications}
  colors={colorPalette}
  layout="default"
/>
```

---

## Common Types

### ContactInfo

```typescript
interface ContactInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}
```

### ColorPalette

```typescript
interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textLight: string;
  textMuted: string;
  background: string;
  backgroundAlt: string;
  border: string;
  borderLight: string;
  success: string;
  warning: string;
  error: string;
}
```

### ExperienceEntry

```typescript
interface ExperienceEntry {
  title: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description: string[];
}
```

### EducationEntry

```typescript
interface EducationEntry {
  degree: string;
  institution: string;
  location?: string;
  graduationDate?: string;
  gpa?: string;
  achievements?: string[];
}
```

### ProjectEntry

```typescript
interface ProjectEntry {
  name: string;
  description: string;
  technologies?: string[];
  url?: string;
  link?: string;
  company?: string;
  dates?: string;
}
```

### CertificationEntry

```typescript
interface CertificationEntry {
  name: string;
  issuer?: string;
  date?: string;
}
```

---

## Styling Guidelines

All components use inline styles for PDF compatibility:

```typescript
// Example inline styles
<div style={{
  ...textStyles.h3,
  color: colors.primary,
  marginBottom: 12,
}}>
  Content
</div>
```

## Best Practices

1. **Use consistent spacing** from `spacing.ts`
2. **Apply color palettes** consistently
3. **Leverage text styles** from `typography.ts`
4. **Format data** using utilities from `formatters.ts`
5. **Optimize for ATS** using `atsOptimization.ts` utilities
6. **Test across layouts** to ensure responsiveness

## Accessibility

- All components use semantic HTML
- Color contrast meets WCAG guidelines
- Text is readable at all sizes
- Links are properly formatted

## Performance

- Components are stateless functional components
- No unnecessary re-renders
- Efficient data formatting
- Optimized for PDF generation

---

## Support

For issues or questions about components, refer to:
- Main README: `templates/README.md`
- Template Interface: `templates/index.ts`
- Tests: `templates/__tests__/shared.test.ts`

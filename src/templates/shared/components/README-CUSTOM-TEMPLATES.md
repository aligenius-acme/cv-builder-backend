# Creating Custom React Templates

This guide explains how to create custom resume templates for the PDF generator.

## Template Structure

Every template is a React component that receives:
- `data`: Parsed resume data
- `config`: Template configuration (colors, fonts, margins, etc.)

## Base Template Example

The `BaseTemplate.tsx` serves as a reference implementation. You can:

1. Use it as-is (it supports all template configurations)
2. Extend it to create variations
3. Create completely new templates from scratch

## Creating a New Template

### Step 1: Create Template Component

Create a new file in `src/templates/custom/MyTemplate.tsx`:

```typescript
import * as React from 'react';
import { ParsedResumeData } from '../../../types';
import { ExtendedTemplateConfig } from '../../../services/templates';

export interface MyTemplateProps {
  data: ParsedResumeData;
  config: ExtendedTemplateConfig;
}

export const MyTemplate: React.FC<MyTemplateProps> = ({ data, config }) => {
  const { contact, summary, experience, education, skills } = data;
  const { primaryColor, fontSize, margins } = config;

  return (
    <div style={{
      fontFamily: config.fontFamily || 'Arial, sans-serif',
      fontSize: `${fontSize.body}px`,
      color: config.textColor,
      padding: `${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px`,
      maxWidth: '210mm',
      minHeight: '297mm',
    }}>
      {/* Header */}
      <header style={{
        textAlign: 'center',
        marginBottom: '30px',
        borderBottom: `3px solid ${primaryColor}`,
        paddingBottom: '20px',
      }}>
        <h1 style={{
          fontSize: `${fontSize.header}px`,
          color: primaryColor,
          margin: 0,
        }}>
          {contact.name}
        </h1>
        <div style={{ marginTop: '10px', fontSize: `${fontSize.body}px` }}>
          {contact.email} | {contact.phone} | {contact.location}
        </div>
      </header>

      {/* Summary */}
      {summary && (
        <section style={{ marginBottom: '24px' }}>
          <h2 style={{
            fontSize: `${fontSize.subheader}px`,
            color: primaryColor,
            marginBottom: '12px',
          }}>
            Professional Summary
          </h2>
          <p style={{ lineHeight: 1.6 }}>{summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <section style={{ marginBottom: '24px' }}>
          <h2 style={{
            fontSize: `${fontSize.subheader}px`,
            color: primaryColor,
            marginBottom: '12px',
          }}>
            Experience
          </h2>
          {experience.map((exp, index) => (
            <div key={index} style={{ marginBottom: '16px' }}>
              <h3 style={{
                fontSize: `${fontSize.subheader}px`,
                margin: 0,
              }}>
                {exp.title} - {exp.company}
              </h3>
              <div style={{
                fontSize: `${fontSize.body - 1}px`,
                color: config.mutedColor,
              }}>
                {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
              </div>
              <ul style={{ marginTop: '8px' }}>
                {exp.description.map((desc, i) => (
                  <li key={i} style={{ lineHeight: 1.6 }}>{desc}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* More sections... */}
    </div>
  );
};
```

### Step 2: Register Template (Optional)

If you want to add your template to the template system:

1. Add template configuration to `src/services/templates.ts`
2. Update `BASE_LAYOUTS` array
3. Template will be available via template ID

Or, use it directly:

```typescript
import { generatePDFFromReact } from './services/react-pdf-generator';
import { MyTemplate } from './templates/custom/MyTemplate';

// Use your custom template directly
const html = ReactDOMServer.renderToStaticMarkup(
  <MyTemplate data={resumeData} config={config} />
);
```

## Template Best Practices

### 1. Use Proper Units

```typescript
// ✅ Good: Use mm for page-related sizes
maxWidth: '210mm'  // A4 width
minHeight: '297mm' // A4 height

// ✅ Good: Use px for font sizes (will be converted properly)
fontSize: '12px'
margin: '20px'

// ❌ Bad: Don't use relative units
fontSize: '1em'
width: '100%'
```

### 2. Color Accuracy

```typescript
// ✅ Good: Use exact hex colors
color: '#1e3a5f'
backgroundColor: '#f8fafc'

// ❌ Bad: Don't use named colors (may not print correctly)
color: 'blue'
backgroundColor: 'lightgray'

// ✅ Good: Ensure print color adjustment
style={{
  backgroundColor: primaryColor,
  WebkitPrintColorAdjust: 'exact',
  printColorAdjust: 'exact',
}}
```

### 3. Page Breaks

```typescript
// Control page breaks
<section style={{
  pageBreakInside: 'avoid',  // Don't break this section
  breakInside: 'avoid',      // Standard syntax
}}>
  {/* Content that should stay together */}
</section>

// Force page break
<div style={{
  pageBreakAfter: 'always',
  breakAfter: 'page',
}} />
```

### 4. Responsive Sections

```typescript
// Hide sections if no data
{projects && projects.length > 0 && (
  <section>
    <h2>Projects</h2>
    {/* ... */}
  </section>
)}

// Conditional styling
<div style={{
  display: hasSidebar ? 'grid' : 'block',
  gridTemplateColumns: hasSidebar ? '1fr 2fr' : 'auto',
}}>
  {/* ... */}
</div>
```

### 5. Typography

```typescript
// Good typography practices
const styles = {
  heading: {
    fontWeight: 600,
    letterSpacing: '-0.5px',
    lineHeight: 1.2,
  },
  body: {
    lineHeight: 1.6,
    letterSpacing: '0px',
  },
  small: {
    fontSize: `${fontSize.body - 1}px`,
    lineHeight: 1.4,
  },
};
```

### 6. Layout Patterns

#### Two-Column Layout

```typescript
<div style={{
  display: 'grid',
  gridTemplateColumns: '35% 65%',
  gap: '20px',
}}>
  {/* Sidebar */}
  <aside style={{
    backgroundColor: accentColor,
    padding: '20px',
  }}>
    {/* Skills, contact, etc. */}
  </aside>

  {/* Main content */}
  <main>
    {/* Experience, education, etc. */}
  </main>
</div>
```

#### Timeline Layout

```typescript
<div style={{ position: 'relative', paddingLeft: '40px' }}>
  {/* Vertical line */}
  <div style={{
    position: 'absolute',
    left: '15px',
    top: 0,
    bottom: 0,
    width: '2px',
    backgroundColor: primaryColor,
  }} />

  {experience.map((exp, index) => (
    <div key={index} style={{
      position: 'relative',
      marginBottom: '24px',
    }}>
      {/* Timeline dot */}
      <div style={{
        position: 'absolute',
        left: '-33px',
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        backgroundColor: primaryColor,
      }} />

      {/* Content */}
      <div>{/* ... */}</div>
    </div>
  ))}
</div>
```

## Testing Your Template

### 1. Create Test File

```typescript
// test-my-template.ts
import { MyTemplate } from './templates/custom/MyTemplate';
import { generatePDFFromReact } from './services/react-pdf-generator';

const testData = {
  // ... sample resume data
};

const config = {
  // ... template config
};

// Test rendering
const pdf = await generatePDFFromReact('my-template', testData);
fs.writeFileSync('output.pdf', pdf);
```

### 2. Visual Testing

1. Generate PDF
2. Open in PDF viewer
3. Check:
   - Colors are accurate
   - Fonts are clear
   - Layout is correct
   - No content overflow
   - Page breaks are appropriate
   - File size is reasonable

### 3. Print Testing

1. Print to PDF (virtual printer)
2. Print to paper
3. Verify colors print correctly
4. Check margins and alignment

## Advanced Techniques

### Dynamic Grid Layouts

```typescript
<div style={{
  display: 'grid',
  gridTemplateColumns: `repeat(${Math.ceil(skills.length / 3)}, 1fr)`,
  gap: '8px',
}}>
  {skills.map((skill) => (
    <div key={skill}>{skill}</div>
  ))}
</div>
```

### Conditional Components

```typescript
const renderSection = (
  title: string,
  items: any[],
  renderItem: (item: any) => React.ReactNode
) => {
  if (!items || items.length === 0) return null;

  return (
    <section>
      <h2>{title}</h2>
      {items.map(renderItem)}
    </section>
  );
};

// Usage
{renderSection('Projects', projects, (project) => (
  <div key={project.name}>
    <h3>{project.name}</h3>
    <p>{project.description}</p>
  </div>
))}
```

### Custom Styling Helpers

```typescript
const createSectionTitle = (
  title: string,
  style: 'underlined' | 'boxed' | 'plain'
): React.CSSProperties => {
  const base: React.CSSProperties = {
    fontSize: `${fontSize.subheader}px`,
    color: primaryColor,
    marginBottom: '16px',
  };

  switch (style) {
    case 'underlined':
      return {
        ...base,
        borderBottom: `2px solid ${primaryColor}`,
        paddingBottom: '8px',
      };
    case 'boxed':
      return {
        ...base,
        backgroundColor: accentColor,
        padding: '8px 12px',
      };
    default:
      return base;
  }
};
```

## Common Issues and Solutions

### Issue: Text Overflow

```typescript
// Solution: Use overflow handling
style={{
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: '100%',
}}
```

### Issue: Colors Not Printing

```typescript
// Solution: Add print color adjustment
style={{
  backgroundColor: color,
  WebkitPrintColorAdjust: 'exact',
  printColorAdjust: 'exact',
  colorAdjust: 'exact',
}}
```

### Issue: Page Breaks in Wrong Places

```typescript
// Solution: Use page break controls
style={{
  pageBreakInside: 'avoid',  // Prevent breaking inside
  pageBreakBefore: 'auto',   // Allow break before
  pageBreakAfter: 'avoid',   // Prevent break after
}}
```

### Issue: Font Not Embedding

```typescript
// Solution: Use web-safe fonts or embed custom fonts
style={{
  fontFamily: 'Helvetica, Arial, sans-serif',  // Fallbacks
}}

// For custom fonts, add to HTML head in pdf generator
<link href="https://fonts.googleapis.com/css2?family=Roboto" rel="stylesheet">
```

## Resources

- [Puppeteer PDF Options](https://pptr.dev/api/puppeteer.pdfoptions)
- [CSS Paged Media](https://developer.mozilla.org/en-US/docs/Web/CSS/@page)
- [Print CSS Best Practices](https://www.smashingmagazine.com/2015/01/designing-for-print-with-css/)
- [React Server Components](https://react.dev/reference/react-dom/server)

## Example Templates

See existing templates for reference:
- `BaseTemplate.tsx` - Comprehensive base template
- `professional/` - Professional templates
- `modern/` - Modern templates
- `creative/` - Creative templates

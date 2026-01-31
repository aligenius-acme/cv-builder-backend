# Academic & Research Templates

Professional CV templates designed specifically for academic positions, research roles, and scholarly applications.

## Overview

This collection includes **10 comprehensive CV templates** tailored for the academic job market, from PhD candidates to tenured professors. All templates support multi-page CVs (no one-page constraint), academic citation formatting, and essential scholarly sections.

## Key Features

### Academic-Specific Sections
- **Publications** - Formatted in academic citation style (APA)
- **Grants & Funding** - Grant titles, agencies, amounts, roles
- **Teaching Experience** - Courses taught, institutions, student evaluations
- **Research Interests** - Keywords and research areas
- **Conference Presentations** - Talks, posters, panels, keynotes
- **Academic Service** - Committee work, editorial boards, peer review
- **Professional Memberships** - Academic societies and organizations

### Design Characteristics
- **Layout**: Single-column, dense information, traditional formatting
- **Typography**: Traditional serif fonts (Georgia, Times New Roman, Garamond)
- **Header**: Centered, formal academic style
- **Page Length**: Multi-page CV support (2-4+ pages)
- **ATS Compatibility**: 90-95% (traditional formatting, clear structure)
- **Margins**: Smaller margins (0.4-0.5") to accommodate extensive content
- **DOCX Support**: All 10 templates include DOCX export

### Special Features
- Multi-page rendering without content truncation
- Academic citation formatting for publications
- Dissertation title and advisor fields
- ORCID support in contact information
- Hanging indent for citation lists
- Proper page breaks between major sections

## Templates

### 1. Academic CV
**File**: `AcademicCV.tsx`
**Best For**: All academic positions, faculty, research scientists
**Color**: Traditional academic blue (#1e3a8a)

Comprehensive academic CV with all scholarly sections. Ideal for faculty applications and senior academic positions.

**Sections**: Research Interests, Education, Experience, Publications, Grants & Funding, Teaching, Presentations, Academic Service, Professional Memberships, Skills, Languages

---

### 2. Research Detailed
**File**: `ResearchDetailed.tsx`
**Best For**: Research scientists, principal investigators, senior researchers
**Color**: Teal (#115e59)

Research-focused CV emphasizing publications and grants. Publications section appears early in the document.

**Sections**: Research Interests, Education, Publications, Grants & Funding, Research Experience, Presentations, Technical Expertise

---

### 3. Faculty Traditional
**File**: `FacultyTraditional.tsx`
**Best For**: Faculty members, lecturers, teaching professors
**Color**: Brown (#7c2d12)

Classic faculty CV with teaching emphasis. Conservative formatting with uppercase section headers.

**Sections**: Education, Academic Appointments, Teaching Experience, Publications, Service, Professional Affiliations, Areas of Expertise

---

### 4. Scholar Complete
**File**: `ScholarComplete.tsx`
**Best For**: Tenured professors, senior scholars, academic leaders
**Color**: Deep blue (#1e40af)

Comprehensive scholarly CV with all academic elements. Includes professional summary.

**Sections**: Summary, Research Interests, Education, Academic & Professional Experience, Publications, Grants & Awards, Teaching, Selected Presentations, Service & Leadership, Professional Memberships

---

### 5. Professor Standard
**File**: `ProfessorStandard.tsx`
**Best For**: Professors, associate professors, assistant professors
**Color**: Indigo (#4338ca)

Standard professor CV format with balanced sections. Clear hierarchy and professional presentation.

**Sections**: Education, Academic Positions, Selected Publications, Grants & Funding, Teaching Experience, Service & Committees, Research Skills, Languages

---

### 6. PhD Candidate
**File**: `PhDCandidate.tsx`
**Best For**: PhD candidates, doctoral students, recent PhDs
**Color**: Cyan (#0e7490)

Optimized for doctoral students with research and publication emphasis. Education-first layout.

**Sections**: Research Interests, Education, Research Experience, Publications, Presentations, Teaching Experience, Technical Skills, Awards & Honors, Languages

---

### 7. Postdoc Professional
**File**: `PostdocProfessional.tsx`
**Best For**: Postdoctoral researchers, research fellows
**Color**: Green (#166534)

Professional CV for postdoctoral researchers with publication and grant emphasis.

**Sections**: Research Interests, Education, Research Experience, Publications, Grants & Fellowships, Presentations, Research Skills & Techniques, Awards & Honors, Languages

---

### 8. Research Scientist
**File**: `ResearchScientist.tsx`
**Best For**: Research scientists, senior researchers, lab managers
**Color**: Slate (#1e293b)

Professional template for research scientists in academia or industry. Includes patents and certifications.

**Sections**: Professional Summary, Research Focus, Research Experience, Education, Key Publications, Funding & Grants, Technical Expertise, Certifications & Training, Awards & Recognition

---

### 9. Academic Fellow
**File**: `AcademicFellow.tsx`
**Best For**: Research fellows, visiting scholars
**Color**: Purple (#6b21a8)

Template for research fellows and visiting scholars with fellowship emphasis.

**Sections**: Research Interests, Education, Fellowships & Research Positions, Publications, Grants & Fellowships, Presentations, Research Skills, Professional Memberships, Awards & Honors, Languages

---

### 10. University Faculty
**File**: `UniversityFaculty.tsx`
**Best For**: University faculty, department chairs, academic administrators
**Color**: Deep violet (#6d28d9)

Comprehensive faculty CV for university positions with complete academic record. All section headers in uppercase.

**Sections**: Research Interests, Education, Academic Appointments, Scholarly Publications, Grants & Funding, Teaching Experience, Presentations & Invited Talks, University & Professional Service, Professional Memberships, Honors & Awards, Languages

## Usage

### Basic Usage

```typescript
import { AcademicCV } from './templates/academic-research';
import { academicResumeData } from './data';
import { createCustomPalette } from './shared/styles/colors';

// Generate PDF
const PDFComponent = AcademicCV.PDFComponent;
const colors = createCustomPalette('#1e3a8a', '#1e40af');

// Generate DOCX
const docxDocument = AcademicCV.generateDOCX(academicResumeData, colors);
```

### Import All Templates

```typescript
import { academicResearchTemplates } from './templates/academic-research';

// Get specific template
const template = academicResearchTemplates.find(t => t.id === 'academic-cv');
```

### Import Individual Template

```typescript
import { PhDCandidate } from './templates/academic-research/PhDCandidate';
```

## Data Structure

### Academic Resume Data

Academic templates use an extended data structure with scholarly fields:

```typescript
interface AcademicResumeData extends ParsedResumeData {
  // Academic-specific fields
  publications?: PublicationEntry[];
  grants?: GrantEntry[];
  teaching?: TeachingEntry[];
  presentations?: PresentationEntry[];
  academicService?: AcademicServiceEntry[];
  researchInterests?: ResearchInterest[];
  professionalMemberships?: string[];

  // Extended contact info
  contact: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    website?: string;
    orcid?: string; // Academic identifier
    linkedin?: string;
  };

  // Extended education
  education: Array<{
    degree: string;
    institution: string;
    location?: string;
    graduationDate?: string;
    gpa?: string;
    achievements?: string[];
    dissertationTitle?: string; // For PhD
    advisor?: string; // Dissertation advisor
  }>;
}
```

### Publication Entry

```typescript
interface PublicationEntry {
  title: string;
  authors: string[]; // List of authors
  journal?: string; // Journal or conference name
  year: string;
  volume?: string;
  pages?: string;
  doi?: string;
  url?: string;
  type?: 'journal' | 'conference' | 'book' | 'chapter' | 'preprint' | 'other';
}
```

### Grant Entry

```typescript
interface GrantEntry {
  title: string;
  agency: string; // Funding agency
  amount?: string; // e.g., "$500,000"
  startDate?: string;
  endDate?: string;
  role?: string; // PI, Co-PI, etc.
  status?: 'awarded' | 'pending' | 'completed';
}
```

### Teaching Entry

```typescript
interface TeachingEntry {
  course: string;
  institution: string;
  role?: string; // Instructor, TA, Lecturer
  semester?: string; // Fall, Spring
  year?: string;
  students?: number;
  description?: string[];
}
```

## DOCX Generation

All 10 templates include comprehensive DOCX support via `generateAcademicDOCX.ts`:

### Features
- **Multi-page support** - No page limits
- **Smaller margins** - 0.4" for dense content
- **Traditional fonts** - Georgia for academic style
- **Citation formatting** - Hanging indents for publications
- **Section hierarchy** - Clear heading structure
- **Professional spacing** - Optimized for readability

### Example

```typescript
import { generateAcademicDOCX } from './templates/academic-research/generateAcademicDOCX';
import { Packer } from 'docx';

const document = generateAcademicDOCX(academicData, colors, '#1e3a8a');

// Export to file
Packer.toBlob(document).then(blob => {
  saveAs(blob, 'academic-cv.docx');
});
```

## ATS Compatibility

All academic templates are designed with 90-95% ATS compatibility:

- **Single-column layout** - Easy parsing
- **Traditional formatting** - No complex graphics
- **Clear section headers** - Underlined or bordered
- **Standard fonts** - Georgia, Times New Roman
- **Semantic structure** - Proper heading hierarchy
- **No tables** - Text-based layout
- **Bullet points** - Standard formatting

## Metadata

Each template includes comprehensive metadata:

```typescript
metadata: {
  id: 'academic-cv',
  name: 'Academic CV',
  category: 'academic',
  primaryCategory: 'academic-research',
  atsScore: 95,
  atsCompatibility: 'ats-friendly',
  designStyle: 'traditional',
  pageLength: 'cv-length', // Multi-page support
  industryTags: ['education-academic', 'science-research'],
  experienceLevel: ['mid-level', 'senior', 'executive'],
  bestFor: ['Professor', 'Research Scientist', 'Academic Researcher'],
}
```

## Customization

### Color Customization

```typescript
import { createCustomPalette } from './shared/styles/colors';

// Use institutional colors
const colors = createCustomPalette('#003366', '#004488'); // University blue
```

### Section Order

Sections can be reordered or hidden based on career stage:

- **Early Career**: Education first, fewer publications
- **Mid Career**: Balanced sections
- **Senior**: Publications/grants prominent, extensive service

## Best Practices

### For PhD Candidates
- Use **PhD Candidate** template
- Include dissertation title and advisor
- Emphasize research potential
- List conference presentations
- Include teaching assistantships

### For Postdocs
- Use **Postdoc Professional** template
- Emphasize publications and grants
- Show independent research
- Include collaborations
- List technical skills

### For Faculty
- Use **Faculty Traditional** or **Professor Standard**
- Balance teaching/research/service
- Include course development
- Show committee work
- List professional memberships

### For Senior Academics
- Use **Scholar Complete** or **University Faculty**
- Comprehensive publication list
- Major grants and funding
- Leadership and service
- Mentorship and advising

## File Structure

```
academic-research/
├── AcademicCV.tsx              # Comprehensive academic CV
├── ResearchDetailed.tsx        # Research-focused
├── FacultyTraditional.tsx      # Teaching-focused faculty
├── ScholarComplete.tsx         # Senior scholar
├── ProfessorStandard.tsx       # Standard professor
├── PhDCandidate.tsx            # Doctoral students
├── PostdocProfessional.tsx     # Postdoctoral researchers
├── ResearchScientist.tsx       # Research scientists
├── AcademicFellow.tsx          # Fellows and visiting scholars
├── UniversityFaculty.tsx       # University faculty
├── generateAcademicDOCX.ts     # DOCX generator
├── index.ts                    # Template exports
└── README.md                   # This file
```

## Version History

**Version 1.0.0** (2025-01-30)
- Initial release with 10 templates
- Multi-page CV support
- Academic citation formatting
- DOCX export for all templates
- Comprehensive academic sections
- 90-95% ATS compatibility

## Support

For academic-specific features or template requests, please refer to the main templates documentation.

## License

Part of CV Builder template system.

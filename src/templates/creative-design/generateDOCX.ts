/**
 * DOCX Generator for Creative Design Templates
 *
 * Provides DOCX export for simpler creative templates.
 * Complex two-column templates are PDF-only due to ATS concerns with tables.
 *
 * Supported Templates (Single-Column Banner Layouts):
 * - Creative Director
 * - Brand Manager
 * - Design Lead
 * - Marketing Creative
 * - Digital Designer
 * - Art Director
 * - Content Creator (partial support)
 *
 * Not Supported (Complex Two-Column):
 * - Designer Bold (colored sidebar)
 * - Creative Portfolio (complex layout)
 * - Marketing Dynamic (two-column)
 * - Media Pro (dark sidebar)
 * - Brand Showcase (gradient effects)
 * - UX Portfolio (two-column)
 * - Graphic Designer (color blocking)
 * - Social Media Pro (complex styling)
 */

import { Document, Paragraph, TextRun, AlignmentType, HeadingLevel } from 'docx';
import { ParsedResumeData } from '../../types';
import { ColorPalette } from '../shared/styles/colors';
import { ExtendedTemplateConfig } from '../index';
import {
  createH1,
  createH2,
  createH3,
  createParagraph,
  createBulletList,
  createSection,
  createContactSection,
  createExperienceEntry,
  createEducationEntry,
  createSkillsSection,
  createProjectEntry,
  createCertificationEntry,
  emptyParagraph,
  ATS_SAFE_FONTS,
  SPACING,
  formatColor,
} from '../shared/utils/docxHelpers';

/**
 * Template IDs that support DOCX export
 */
const DOCX_SUPPORTED_TEMPLATES = [
  'creative-director',
  'brand-manager',
  'design-lead',
  'marketing-creative',
  'digital-designer',
  'art-director',
  'content-creator',
];

/**
 * Check if a template supports DOCX export
 */
export function supportsDOCX(templateId: string): boolean {
  return DOCX_SUPPORTED_TEMPLATES.includes(templateId);
}

/**
 * Generate DOCX document for creative design templates
 *
 * @param data - Resume data
 * @param colors - Color configuration
 * @param config - Template configuration with templateId
 * @returns Promise<Document> - DOCX Document object
 */
export async function generateDOCX(
  data: ParsedResumeData,
  colors: ColorPalette,
  config: ExtendedTemplateConfig & { templateId: string }
): Promise<Document> {
  const templateId = config.templateId;

  // Validate template support
  if (!supportsDOCX(templateId)) {
    throw new Error(
      `Template "${templateId}" does not support DOCX export. Please use PDF export for complex creative templates.`
    );
  }

  // Primary color for creative templates
  const primaryColor = formatColor(colors.primary);

  // Common sections array
  const sections: Paragraph[] = [];

  // Header with Name and Title
  sections.push(
    createH1(data.contact.name || 'Your Name', {
      color: primaryColor,
      alignment: AlignmentType.CENTER,
      spacing: { after: SPACING.SMALL },
    })
  );

  // Title based on template
  const titleMap: Record<string, string> = {
    'creative-director': 'Creative Director',
    'brand-manager': 'Brand Manager',
    'design-lead': 'Design Lead',
    'marketing-creative': 'Marketing Creative',
    'digital-designer': 'Digital Designer',
    'art-director': 'Art Director',
    'content-creator': 'Content Creator',
  };

  sections.push(
    createParagraph(titleMap[templateId] || 'Creative Professional', {
      alignment: AlignmentType.CENTER,
      bold: true,
      size: 28,
      color: primaryColor,
      allCaps: true,
      spacing: { after: SPACING.MEDIUM },
    })
  );

  // Contact Information
  const contactLines: string[] = [];
  if (data.contact.email) contactLines.push(data.contact.email);
  if (data.contact.phone) contactLines.push(data.contact.phone);
  if (data.contact.location) contactLines.push(data.contact.location);
  if (data.contact.website) contactLines.push(`Portfolio: ${data.contact.website}`);

  if (contactLines.length > 0) {
    sections.push(
      createParagraph(contactLines.join(' | '), {
        alignment: AlignmentType.CENTER,
        size: 20,
        spacing: { after: SPACING.LARGE },
      })
    );
  }

  sections.push(emptyParagraph());

  // Professional Summary
  if (data.summary) {
    const summaryTitle = ['creative-director', 'art-director'].includes(templateId)
      ? 'Creative Vision'
      : ['brand-manager', 'marketing-creative'].includes(templateId)
      ? 'Professional Summary'
      : 'Profile';

    sections.push(createH2(summaryTitle, { color: primaryColor }));
    sections.push(
      createParagraph(data.summary, {
        spacing: { after: SPACING.SECTION },
      })
    );
  }

  // Skills Section
  if (data.skills && data.skills.length > 0) {
    const skillsTitle = ['art-director', 'creative-director'].includes(templateId)
      ? 'Creative Expertise'
      : ['marketing-creative', 'content-creator'].includes(templateId)
      ? 'Skills & Platforms'
      : 'Core Skills';

    sections.push(createH2(skillsTitle, { color: primaryColor }));

    const skillNames = data.skills.map((skill) =>
      typeof skill === 'string' ? skill : skill.name
    );

    sections.push(
      createParagraph(skillNames.join(' • '), {
        spacing: { after: SPACING.SECTION },
      })
    );
  }

  // Experience Section
  if (data.experience && data.experience.length > 0) {
    const experienceTitle = ['creative-director', 'design-lead', 'art-director'].includes(
      templateId
    )
      ? 'Leadership Experience'
      : 'Professional Experience';

    sections.push(createH2(experienceTitle, { color: primaryColor }));

    data.experience.forEach((exp, index) => {
      sections.push(...createExperienceEntry(exp, primaryColor));
      if (index < data.experience!.length - 1) {
        sections.push(emptyParagraph());
      }
    });

    sections.push(emptyParagraph());
  }

  // Projects/Portfolio Section
  if (data.projects && data.projects.length > 0) {
    const projectsTitle = ['art-director'].includes(templateId)
      ? 'Signature Work'
      : ['digital-designer', 'content-creator'].includes(templateId)
      ? 'Portfolio'
      : ['marketing-creative'].includes(templateId)
      ? 'Campaigns & Projects'
      : 'Key Projects';

    sections.push(createH2(projectsTitle, { color: primaryColor }));

    data.projects.forEach((project, index) => {
      sections.push(...createProjectEntry(project, primaryColor, true));
      if (index < data.projects!.length - 1) {
        sections.push(emptyParagraph());
      }
    });

    sections.push(emptyParagraph());
  }

  // Education Section
  if (data.education && data.education.length > 0) {
    const educationTitle = ['art-director'].includes(templateId)
      ? 'Education & Training'
      : 'Education';

    sections.push(createH2(educationTitle, { color: primaryColor }));

    data.education.forEach((edu) => {
      sections.push(...createEducationEntry(edu, primaryColor));
    });

    sections.push(emptyParagraph());
  }

  // Certifications Section (if available)
  if (data.certifications && data.certifications.length > 0) {
    sections.push(createH2('Certifications', { color: primaryColor }));

    data.certifications.forEach((cert) => {
      sections.push(...createCertificationEntry(cert, primaryColor));
    });

    sections.push(emptyParagraph());
  }

  // Create and return document
  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: sections,
      },
    ],
    styles: {
      default: {
        document: {
          run: {
            font: ATS_SAFE_FONTS.ARIAL,
            size: 22, // 11pt
          },
          paragraph: {
            spacing: {
              line: 276, // 1.15 line spacing
              before: 0,
              after: 160,
            },
          },
        },
      },
    },
  });
}

/**
 * Get list of templates that support DOCX
 */
export function getSupportedTemplates(): string[] {
  return [...DOCX_SUPPORTED_TEMPLATES];
}

/**
 * Get template-specific DOCX generation notes
 */
export function getTemplateNotes(templateId: string): string {
  const notes: Record<string, string> = {
    'creative-director': 'Executive-style single-column layout with centered header',
    'brand-manager': 'Professional layout with emphasis on brand work',
    'design-lead': 'Leadership-focused with clean section hierarchy',
    'marketing-creative': 'Dynamic layout with campaign highlights',
    'digital-designer': 'Portfolio-focused with project showcase',
    'art-director': 'Executive creative layout with signature work section',
    'content-creator': 'Modern layout for content and social media professionals',
  };

  return notes[templateId] || 'Standard creative template layout';
}

export default generateDOCX;

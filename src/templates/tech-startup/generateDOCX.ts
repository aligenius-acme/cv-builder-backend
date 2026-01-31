/**
 * Tech Startup Template - DOCX Generator
 *
 * Modern template optimized for tech industry with:
 * - Clean, modern styling
 * - Skills-forward presentation
 * - Project showcase emphasis
 * - ATS-compatible structure
 */

import { Document, Paragraph, AlignmentType } from 'docx';
import { ParsedResumeData } from '../../types';
import { ExtendedTemplateConfig } from '../../services/templates';
import {
  ATS_SAFE_FONTS,
  FONT_SIZES,
  SPACING,
  createH1,
  createH2,
  createContactSection,
  createSection,
  createSummarySection,
  createExperienceEntry,
  createEducationEntry,
  createSkillsSection,
  createParagraph,
  createTextRun,
  createSpacing,
  createBulletList,
  emptyParagraph,
  cleanBulletText,
  sanitizeText,
} from '../shared/utils/docxHelpers';

export interface DOCXColorConfig {
  primary: string;
  secondary?: string;
  accent?: string;
  text?: string;
  muted?: string;
  background?: string;
}

/**
 * Generate DOCX Document for Tech Startup template
 */
export async function generateDOCX(
  data: ParsedResumeData,
  colors: DOCXColorConfig,
  templateConfig: ExtendedTemplateConfig
): Promise<Document> {
  const paragraphs: Paragraph[] = [];
  const font = ATS_SAFE_FONTS.ARIAL; // Modern tech font
  const primaryColor = colors.primary || '#0369a1';

  // ============================================================================
  // HEADER
  // ============================================================================

  const contactDetails: string[] = [];
  if (data.contact.email) contactDetails.push(sanitizeText(data.contact.email));
  if (data.contact.phone) contactDetails.push(sanitizeText(data.contact.phone));
  if (data.contact.location) contactDetails.push(sanitizeText(data.contact.location));

  paragraphs.push(...createContactSection(
    sanitizeText(data.contact.name || 'Candidate Name'),
    contactDetails,
    { nameColor: primaryColor, font }
  ));

  // Links
  const links: string[] = [];
  if (data.contact.github) links.push(`GitHub: ${sanitizeText(data.contact.github)}`);
  if (data.contact.linkedin) links.push(`LinkedIn: ${sanitizeText(data.contact.linkedin)}`);
  if (data.contact.website) links.push(`Portfolio: ${sanitizeText(data.contact.website)}`);

  if (links.length > 0) {
    paragraphs.push(
      createParagraph(
        [createTextRun(links.join('  |  '), { size: FONT_SIZES.BODY, color: primaryColor, font })],
        { spacing: createSpacing({ after: SPACING.MEDIUM }) }
      )
    );
  }

  // ============================================================================
  // SUMMARY
  // ============================================================================

  if (data.summary) {
    paragraphs.push(...createSection('ABOUT', [
      createSummarySection(sanitizeText(data.summary), { font }),
    ], { titleColor: primaryColor, uppercase: true, underline: false, font }));
  }

  // ============================================================================
  // TECHNICAL SKILLS (prioritized for tech roles)
  // ============================================================================

  if (data.skills && data.skills.length > 0) {
    paragraphs.push(...createSection('TECHNICAL SKILLS', [
      createSkillsSection(data.skills.map(s => sanitizeText(s)), { font }),
    ], { titleColor: primaryColor, uppercase: true, underline: false, font }));
  }

  // ============================================================================
  // EXPERIENCE
  // ============================================================================

  if (data.experience && data.experience.length > 0) {
    const experienceContent: Paragraph[] = [];

    for (const exp of data.experience) {
      const dates = exp.current
        ? `${exp.startDate || 'Present'} – Present`
        : `${exp.startDate || ''} – ${exp.endDate || ''}`.trim();

      const bullets = (exp.description || []).map(desc => cleanBulletText(sanitizeText(desc)));

      experienceContent.push(...createExperienceEntry(
        sanitizeText(exp.title),
        sanitizeText(exp.company),
        exp.location ? sanitizeText(exp.location) : undefined,
        dates,
        bullets,
        { titleColor: primaryColor, font }
      ));
    }

    paragraphs.push(...createSection('EXPERIENCE', experienceContent, {
      titleColor: primaryColor,
      uppercase: true,
      underline: false,
      font,
    }));
  }

  // ============================================================================
  // PROJECTS (emphasized for tech roles)
  // ============================================================================

  if (data.projects && data.projects.length > 0) {
    const projectsContent: Paragraph[] = [];

    for (const project of data.projects) {
      projectsContent.push(
        createParagraph(
          [createTextRun(sanitizeText(project.name), { bold: true, size: FONT_SIZES.BODY_LARGE, color: primaryColor, font })],
          { spacing: createSpacing({ before: SPACING.SMALL, after: SPACING.TIGHT }) }
        )
      );

      if (project.description) {
        projectsContent.push(
          createParagraph(
            [createTextRun(sanitizeText(project.description), { size: FONT_SIZES.BODY, font })],
            { spacing: createSpacing({ after: SPACING.TIGHT }) }
          )
        );
      }

      if (project.technologies && project.technologies.length > 0) {
        projectsContent.push(
          createParagraph(
            [createTextRun(`Tech Stack: ${project.technologies.join(', ')}`, {
              size: FONT_SIZES.BODY,
              italic: true,
              color: '666666',
              font,
            })],
            { spacing: createSpacing({ after: SPACING.SMALL }) }
          )
        );
      }
    }

    paragraphs.push(...createSection('PROJECTS', projectsContent, {
      titleColor: primaryColor,
      uppercase: true,
      underline: false,
      font,
    }));
  }

  // ============================================================================
  // EDUCATION
  // ============================================================================

  if (data.education && data.education.length > 0) {
    const educationContent: Paragraph[] = [];

    for (const edu of data.education) {
      educationContent.push(...createEducationEntry(
        sanitizeText(edu.degree),
        sanitizeText(edu.institution),
        edu.graduationDate ? sanitizeText(edu.graduationDate) : undefined,
        { titleColor: primaryColor, font }
      ));
    }

    paragraphs.push(...createSection('EDUCATION', educationContent, {
      titleColor: primaryColor,
      uppercase: true,
      underline: false,
      font,
    }));
  }

  // ============================================================================
  // CERTIFICATIONS
  // ============================================================================

  if (data.certifications && data.certifications.length > 0) {
    const certContent: Paragraph[] = [];
    for (const cert of data.certifications) {
      const certName = typeof cert === 'string' ? cert : cert.name;
      certContent.push(
        createParagraph(
          [createTextRun(`• ${sanitizeText(certName)}`, { size: FONT_SIZES.BODY, font })],
          { spacing: createSpacing({ after: SPACING.LINE }) }
        )
      );
    }

    paragraphs.push(...createSection('CERTIFICATIONS', certContent, {
      titleColor: primaryColor,
      uppercase: true,
      underline: false,
      font,
    }));
  }

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

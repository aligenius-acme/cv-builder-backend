/**
 * Executive Leadership Templates - DOCX Generator
 *
 * Generates Word documents for executive templates with:
 * - Professional executive styling
 * - ATS-compatible structure
 * - Executive summary prominence
 * - Traditional serif fonts
 * - Two-page optimization
 *
 * Supports 8 of 10 templates (ManagingDirector and ExecutiveLeader are PDF-only)
 */

import { Document, Paragraph, AlignmentType, BorderStyle } from 'docx';
import { ParsedResumeData } from '../../types';
import { ColorPalette } from '../shared/styles/colors';
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
  emptyParagraph,
  cleanBulletText,
  sanitizeText,
} from '../shared/utils/docxHelpers';

/**
 * Template-specific color configurations
 */
const TEMPLATE_CONFIGS: Record<string, { primaryColor: string; font: string; sectionStyle: 'underline' | 'bold' }> = {
  'executive-impact': {
    primaryColor: '#1e3a8a',
    font: ATS_SAFE_FONTS.GEORGIA,
    sectionStyle: 'underline',
  },
  'c-suite-elite': {
    primaryColor: '#7c2d12',
    font: ATS_SAFE_FONTS.GEORGIA,
    sectionStyle: 'underline',
  },
  'leadership-premium': {
    primaryColor: '#262626',
    font: ATS_SAFE_FONTS.TIMES_NEW_ROMAN,
    sectionStyle: 'underline',
  },
  'director-professional': {
    primaryColor: '#14532d',
    font: ATS_SAFE_FONTS.GEORGIA,
    sectionStyle: 'underline',
  },
  'senior-executive': {
    primaryColor: '#1e40af',
    font: ATS_SAFE_FONTS.GEORGIA,
    sectionStyle: 'underline',
  },
  'vp-executive': {
    primaryColor: '#1e3a8a',
    font: ATS_SAFE_FONTS.GEORGIA,
    sectionStyle: 'underline',
  },
  'chief-officer': {
    primaryColor: '#881337',
    font: ATS_SAFE_FONTS.GEORGIA,
    sectionStyle: 'underline',
  },
  'board-member': {
    primaryColor: '#374151',
    font: ATS_SAFE_FONTS.GEORGIA,
    sectionStyle: 'underline',
  },
};

/**
 * Generate DOCX Document for Executive Templates
 */
export function generateExecutiveDOCX(
  data: ParsedResumeData,
  colors: ColorPalette,
  templateId: string
): Document {
  const config = TEMPLATE_CONFIGS[templateId] || TEMPLATE_CONFIGS['executive-impact'];
  const paragraphs: Paragraph[] = [];
  const font = config.font;
  const primaryColor = colors?.primary || config.primaryColor;

  // ============================================================================
  // HEADER - Executive Style
  // ============================================================================

  const contactDetails: string[] = [];
  if (data.contact.email) contactDetails.push(sanitizeText(data.contact.email));
  if (data.contact.phone) contactDetails.push(sanitizeText(data.contact.phone));
  if (data.contact.location) contactDetails.push(sanitizeText(data.contact.location));

  // Name - Large and prominent
  paragraphs.push(
    createParagraph(
      [createTextRun(sanitizeText(data.contact.name || 'Executive Name'), {
        size: FONT_SIZES.XLARGE,
        bold: true,
        color: primaryColor,
        font,
      })],
      {
        alignment: AlignmentType.CENTER,
        spacing: createSpacing({ after: SPACING.TIGHT }),
      }
    )
  );

  // Contact info
  if (contactDetails.length > 0) {
    paragraphs.push(
      createParagraph(
        [createTextRun(contactDetails.join(' • '), { size: FONT_SIZES.BODY, font })],
        {
          alignment: AlignmentType.CENTER,
          spacing: createSpacing({ after: SPACING.TIGHT }),
        }
      )
    );
  }

  // Links
  const links: string[] = [];
  if (data.contact.linkedin) links.push(sanitizeText(data.contact.linkedin));
  if (data.contact.website) links.push(sanitizeText(data.contact.website));

  if (links.length > 0) {
    paragraphs.push(
      createParagraph(
        [createTextRun(links.join(' • '), { size: FONT_SIZES.SMALL, color: primaryColor, font })],
        {
          alignment: AlignmentType.CENTER,
          spacing: createSpacing({ after: SPACING.MEDIUM }),
          border: {
            bottom: {
              color: primaryColor,
              space: 1,
              style: BorderStyle.SINGLE,
              size: 12,
            },
          },
        }
      )
    );
  } else {
    paragraphs.push(
      createParagraph([], {
        spacing: createSpacing({ after: SPACING.TIGHT }),
        border: {
          bottom: {
            color: primaryColor,
            space: 1,
            style: BorderStyle.SINGLE,
            size: 12,
          },
        },
      })
    );
  }

  // ============================================================================
  // EXECUTIVE SUMMARY / PROFILE
  // ============================================================================

  if (data.summary) {
    paragraphs.push(...createSection('EXECUTIVE PROFILE', [
      createSummarySection(sanitizeText(data.summary), { font }),
    ], { titleColor: primaryColor, uppercase: true, underline: true, font }));
  }

  // ============================================================================
  // CORE COMPETENCIES / EXPERTISE
  // ============================================================================

  if (data.skills && data.skills.length > 0) {
    paragraphs.push(...createSection('CORE COMPETENCIES', [
      createSkillsSection(data.skills.map(s => sanitizeText(s)), { font }),
    ], { titleColor: primaryColor, uppercase: true, underline: true, font }));
  }

  // ============================================================================
  // PROFESSIONAL EXPERIENCE / LEADERSHIP EXPERIENCE
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

    const experienceTitle = templateId.includes('board')
      ? 'EXECUTIVE & BOARD EXPERIENCE'
      : 'PROFESSIONAL EXPERIENCE';

    paragraphs.push(...createSection(experienceTitle, experienceContent, {
      titleColor: primaryColor,
      uppercase: true,
      underline: true,
      font,
    }));
  }

  // ============================================================================
  // STRATEGIC INITIATIVES / KEY ACHIEVEMENTS
  // ============================================================================

  if (data.projects && data.projects.length > 0) {
    const projectsContent: Paragraph[] = [];

    for (const project of data.projects) {
      projectsContent.push(
        createParagraph(
          [createTextRun(sanitizeText(project.name), {
            bold: true,
            size: FONT_SIZES.BODY_LARGE,
            color: primaryColor,
            font,
          })],
          { spacing: createSpacing({ before: SPACING.SMALL, after: SPACING.TIGHT }) }
        )
      );

      if (project.description) {
        projectsContent.push(
          createParagraph(
            [createTextRun(sanitizeText(project.description), { size: FONT_SIZES.BODY, font })],
            { spacing: createSpacing({ after: SPACING.SMALL }) }
          )
        );
      }
    }

    const projectsTitle = templateId.includes('board')
      ? 'STRATEGIC CONTRIBUTIONS'
      : 'KEY ACHIEVEMENTS & INITIATIVES';

    paragraphs.push(...createSection(projectsTitle, projectsContent, {
      titleColor: primaryColor,
      uppercase: true,
      underline: true,
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

    const educationTitle = 'EDUCATION & EXECUTIVE DEVELOPMENT';

    paragraphs.push(...createSection(educationTitle, educationContent, {
      titleColor: primaryColor,
      uppercase: true,
      underline: true,
      font,
    }));
  }

  // ============================================================================
  // BOARD MEMBERSHIPS & PROFESSIONAL AFFILIATIONS
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

    const certsTitle = templateId.includes('board')
      ? 'BOARD POSITIONS & AFFILIATIONS'
      : 'PROFESSIONAL AFFILIATIONS';

    paragraphs.push(...createSection(certsTitle, certContent, {
      titleColor: primaryColor,
      uppercase: true,
      underline: true,
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

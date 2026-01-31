/**
 * ATS Professional Template - DOCX Generator
 *
 * Generates ATS-optimized Word documents with:
 * - Single-column layout (no tables)
 * - Standard fonts (Calibri)
 * - Proper heading hierarchy
 * - Standard bullet points
 * - Clean, parseable structure
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
  createH3,
  createContactSection,
  createSection,
  createSummarySection,
  createExperienceEntry,
  createEducationEntry,
  createSkillsSection,
  createBulletList,
  createParagraph,
  createTextRun,
  createSpacing,
  emptyParagraph,
  cleanBulletText,
  sanitizeText,
} from '../shared/utils/docxHelpers';

/**
 * Color configuration for this template
 */
export interface DOCXColorConfig {
  primary: string;
  secondary?: string;
  accent?: string;
  text?: string;
  muted?: string;
  background?: string;
}

/**
 * Generate DOCX Document for ATS Professional template
 */
export async function generateDOCX(
  data: ParsedResumeData,
  colors: DOCXColorConfig,
  templateConfig: ExtendedTemplateConfig
): Promise<Document> {
  const paragraphs: Paragraph[] = [];

  // Use Calibri as default ATS-safe font
  const font = ATS_SAFE_FONTS.CALIBRI;
  const primaryColor = colors.primary || '#2563eb';

  // ============================================================================
  // HEADER - Contact Information
  // ============================================================================

  const contactDetails: string[] = [];
  if (data.contact.email) contactDetails.push(sanitizeText(data.contact.email));
  if (data.contact.phone) contactDetails.push(sanitizeText(data.contact.phone));
  if (data.contact.location) contactDetails.push(sanitizeText(data.contact.location));

  const contactSection = createContactSection(
    sanitizeText(data.contact.name || 'Candidate Name'),
    contactDetails,
    {
      nameColor: primaryColor,
      alignment: AlignmentType.LEFT,
      font,
    }
  );
  paragraphs.push(...contactSection);

  // Links (LinkedIn, GitHub, Website)
  const links: string[] = [];
  if (data.contact.linkedin) links.push(sanitizeText(data.contact.linkedin));
  if (data.contact.github) links.push(sanitizeText(data.contact.github));
  if (data.contact.website) links.push(sanitizeText(data.contact.website));

  if (links.length > 0) {
    const linksText = links.join('  |  ');
    paragraphs.push(
      createParagraph(
        [createTextRun(linksText, {
          size: FONT_SIZES.BODY,
          color: primaryColor,
          font,
        })],
        {
          spacing: createSpacing({ after: SPACING.MEDIUM }),
        }
      )
    );
  }

  // ============================================================================
  // SUMMARY / PROFESSIONAL PROFILE
  // ============================================================================

  if (data.summary) {
    const summaryContent = [
      createSummarySection(sanitizeText(data.summary), { font }),
    ];

    paragraphs.push(...createSection('PROFESSIONAL SUMMARY', summaryContent, {
      titleColor: primaryColor,
      uppercase: true,
      underline: true,
      font,
    }));
  }

  // ============================================================================
  // EXPERIENCE
  // ============================================================================

  if (data.experience && data.experience.length > 0) {
    const experienceContent: Paragraph[] = [];

    for (const exp of data.experience) {
      // Format dates
      const dates = exp.current
        ? `${exp.startDate || 'Present'} – Present`
        : `${exp.startDate || ''} – ${exp.endDate || ''}`.trim();

      // Clean bullet points
      const bullets = (exp.description || []).map(desc => cleanBulletText(sanitizeText(desc)));

      const expEntry = createExperienceEntry(
        sanitizeText(exp.title),
        sanitizeText(exp.company),
        exp.location ? sanitizeText(exp.location) : undefined,
        dates,
        bullets,
        {
          titleColor: primaryColor,
          font,
        }
      );

      experienceContent.push(...expEntry);
    }

    paragraphs.push(...createSection('PROFESSIONAL EXPERIENCE', experienceContent, {
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
      const eduEntry = createEducationEntry(
        sanitizeText(edu.degree),
        sanitizeText(edu.institution),
        edu.graduationDate ? sanitizeText(edu.graduationDate) : undefined,
        {
          titleColor: primaryColor,
          font,
        }
      );

      educationContent.push(...eduEntry);

      // Add GPA if present
      if (edu.gpa) {
        educationContent.push(
          createParagraph(
            [createTextRun(`GPA: ${sanitizeText(edu.gpa)}`, {
              size: FONT_SIZES.BODY,
              font,
            })],
            {
              spacing: createSpacing({ after: SPACING.SMALL }),
            }
          )
        );
      }

      // Add achievements if present
      if (edu.achievements && edu.achievements.length > 0) {
        const achievementBullets = edu.achievements.map(a => cleanBulletText(sanitizeText(a)));
        educationContent.push(...createBulletList(achievementBullets, { font }));
        educationContent.push(emptyParagraph(createSpacing({ after: SPACING.SMALL })));
      }
    }

    paragraphs.push(...createSection('EDUCATION', educationContent, {
      titleColor: primaryColor,
      uppercase: true,
      underline: true,
      font,
    }));
  }

  // ============================================================================
  // SKILLS
  // ============================================================================

  if (data.skills && data.skills.length > 0) {
    const cleanedSkills = data.skills.map(skill => sanitizeText(skill));
    const skillsContent = [createSkillsSection(cleanedSkills, { font })];

    paragraphs.push(...createSection('SKILLS', skillsContent, {
      titleColor: primaryColor,
      uppercase: true,
      underline: true,
      font,
    }));
  }

  // ============================================================================
  // PROJECTS (if present)
  // ============================================================================

  if (data.projects && data.projects.length > 0) {
    const projectsContent: Paragraph[] = [];

    for (const project of data.projects) {
      // Project name
      projectsContent.push(createH3(sanitizeText(project.name), {
        color: primaryColor,
        font,
      }));

      // Project description
      if (project.description) {
        projectsContent.push(
          createParagraph(
            [createTextRun(sanitizeText(project.description), {
              size: FONT_SIZES.BODY,
              font,
            })],
            {
              spacing: createSpacing({ after: SPACING.TIGHT }),
            }
          )
        );
      }

      // Technologies
      if (project.technologies && project.technologies.length > 0) {
        const techText = `Technologies: ${project.technologies.map(t => sanitizeText(t)).join(', ')}`;
        projectsContent.push(
          createParagraph(
            [createTextRun(techText, {
              size: FONT_SIZES.BODY,
              italic: true,
              color: '666666',
              font,
            })],
            {
              spacing: createSpacing({ after: SPACING.SMALL }),
            }
          )
        );
      }

      // Project URL
      if (project.url || project.link) {
        const url = project.url || project.link;
        projectsContent.push(
          createParagraph(
            [createTextRun(sanitizeText(url!), {
              size: FONT_SIZES.SMALL,
              color: primaryColor,
              font,
            })],
            {
              spacing: createSpacing({ after: SPACING.SMALL }),
            }
          )
        );
      }
    }

    paragraphs.push(...createSection('PROJECTS', projectsContent, {
      titleColor: primaryColor,
      uppercase: true,
      underline: true,
      font,
    }));
  }

  // ============================================================================
  // CERTIFICATIONS (if present)
  // ============================================================================

  if (data.certifications && data.certifications.length > 0) {
    const certificationContent: Paragraph[] = [];

    for (const cert of data.certifications) {
      const certName = typeof cert === 'string' ? cert : cert.name;
      const certIssuer = typeof cert === 'object' && cert.issuer ? cert.issuer : undefined;
      const certDate = typeof cert === 'object' && cert.date ? cert.date : undefined;

      const certParts: string[] = [sanitizeText(certName)];
      if (certIssuer) certParts.push(sanitizeText(certIssuer));
      if (certDate) certParts.push(sanitizeText(certDate));

      certificationContent.push(
        createParagraph(
          [createTextRun(`• ${certParts.join(' - ')}`, {
            size: FONT_SIZES.BODY,
            font,
          })],
          {
            spacing: createSpacing({ after: SPACING.LINE }),
          }
        )
      );
    }

    paragraphs.push(...createSection('CERTIFICATIONS', certificationContent, {
      titleColor: primaryColor,
      uppercase: true,
      underline: true,
      font,
    }));
  }

  // ============================================================================
  // LANGUAGES (if present)
  // ============================================================================

  if (data.languages && data.languages.length > 0) {
    const languagesText = data.languages.map(lang => sanitizeText(lang)).join(', ');
    const languagesContent = [
      createParagraph(
        [createTextRun(languagesText, {
          size: FONT_SIZES.BODY,
          font,
        })],
        {
          spacing: createSpacing({ after: SPACING.MEDIUM }),
        }
      ),
    ];

    paragraphs.push(...createSection('LANGUAGES', languagesContent, {
      titleColor: primaryColor,
      uppercase: true,
      underline: true,
      font,
    }));
  }

  // ============================================================================
  // AWARDS (if present)
  // ============================================================================

  if (data.awards && data.awards.length > 0) {
    const awardsContent: Paragraph[] = [];

    for (const award of data.awards) {
      const awardName = typeof award === 'string' ? award : award.name;
      const awardIssuer = typeof award === 'object' && award.issuer ? award.issuer : undefined;
      const awardDate = typeof award === 'object' && award.date ? award.date : undefined;

      const awardParts: string[] = [sanitizeText(awardName)];
      if (awardIssuer) awardParts.push(sanitizeText(awardIssuer));
      if (awardDate) awardParts.push(sanitizeText(awardDate));

      awardsContent.push(
        createParagraph(
          [createTextRun(`• ${awardParts.join(' - ')}`, {
            size: FONT_SIZES.BODY,
            font,
          })],
          {
            spacing: createSpacing({ after: SPACING.LINE }),
          }
        )
      );
    }

    paragraphs.push(...createSection('AWARDS & HONORS', awardsContent, {
      titleColor: primaryColor,
      uppercase: true,
      underline: true,
      font,
    }));
  }

  // ============================================================================
  // CREATE DOCUMENT
  // ============================================================================

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,    // 0.5 inch in twips (720/1440)
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: paragraphs,
      },
    ],
  });
}

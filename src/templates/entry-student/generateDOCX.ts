/**
 * Entry-Level/Student Template DOCX Generator
 * Shared DOCX generation for all entry-level and student templates
 */

import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
} from 'docx';
import { ParsedResumeData } from '../../types';
import { ColorPalette } from '../shared/styles/colors';
import {
  ATS_SAFE_FONTS,
  FONT_SIZES,
  SPACING,
  pointsToTwips,
  createH1,
  createH2,
  createH3,
  createBulletPoint,
  emptyParagraph,
  createTextRun,
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
 * Generate DOCX for entry-level/student templates
 */
export function generateDOCX(
  data: ParsedResumeData,
  colors: ColorPalette | DOCXColorConfig,
  options?: any
): Document {
  const paragraphs: Paragraph[] = [];
  const font = ATS_SAFE_FONTS.CALIBRI;
  const primaryColor = colors.primary;

  // Contact Information
  const { contact, summary, education, experience, projects, skills, certifications } = data;

  // Name (H1)
  paragraphs.push(
    createH1(contact.name || 'Your Name', {
      color: primaryColor,
      alignment: AlignmentType.CENTER,
      font,
    })
  );

  // Contact info
  const contactItems = [
    contact.email,
    contact.phone,
    contact.location,
    contact.linkedin,
    contact.github,
  ].filter(Boolean);

  if (contactItems.length > 0) {
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: SPACING.MEDIUM },
        children: contactItems.map((item, index) => {
          const runs: TextRun[] = [
            new TextRun({
              text: item,
              size: FONT_SIZES.SMALL,
              font,
            }),
          ];

          if (index < contactItems.length - 1) {
            runs.push(
              new TextRun({
                text: ' | ',
                size: FONT_SIZES.SMALL,
                font,
              })
            );
          }

          return runs;
        }).flat(),
      })
    );
  }

  paragraphs.push(emptyParagraph({ after: SPACING.SMALL }));

  // Summary/Objective
  if (summary) {
    paragraphs.push(
      createH2('PROFESSIONAL SUMMARY', {
        color: primaryColor,
        uppercase: true,
        underline: true,
        font,
      })
    );

    paragraphs.push(
      new Paragraph({
        text: summary,
        spacing: { after: SPACING.MEDIUM },
        style: 'Normal',
        children: [
          new TextRun({
            text: summary,
            size: FONT_SIZES.BODY,
            font,
          }),
        ],
      })
    );
  }

  // Education Section (First for entry-level)
  if (education && education.length > 0) {
    paragraphs.push(
      createH2('EDUCATION', {
        color: primaryColor,
        uppercase: true,
        underline: true,
        font,
      })
    );

    education.forEach((edu, index) => {
      // Degree
      paragraphs.push(
        createH3(edu.degree, {
          color: primaryColor,
          font,
        })
      );

      // Institution and date
      const institutionLine = [
        edu.institution,
        edu.location,
      ].filter(Boolean).join(' • ');

      paragraphs.push(
        new Paragraph({
          spacing: { after: pointsToTwips(2) },
          children: [
            new TextRun({
              text: institutionLine,
              size: FONT_SIZES.BODY,
              font,
              bold: true,
            }),
            ...(edu.graduationDate
              ? [
                  new TextRun({
                    text: `    ${edu.graduationDate}`,
                    size: FONT_SIZES.BODY,
                    font,
                    italics: true,
                  }),
                ]
              : []),
          ],
        })
      );

      // GPA
      if (edu.gpa) {
        paragraphs.push(
          new Paragraph({
            spacing: { after: pointsToTwips(4) },
            children: [
              new TextRun({
                text: `GPA: ${edu.gpa}`,
                size: FONT_SIZES.SMALL,
                font,
              }),
            ],
          })
        );
      }

      // Achievements/Coursework
      if (edu.achievements && edu.achievements.length > 0) {
        edu.achievements.forEach(achievement => {
          paragraphs.push(createBulletPoint(achievement, { font }));
        });
      }

      if (index < education.length - 1) {
        paragraphs.push(emptyParagraph({ after: SPACING.SMALL }));
      }
    });

    paragraphs.push(emptyParagraph({ after: SPACING.MEDIUM }));
  }

  // Skills Section
  if (skills && skills.length > 0) {
    paragraphs.push(
      createH2('SKILLS', {
        color: primaryColor,
        uppercase: true,
        underline: true,
        font,
      })
    );

    paragraphs.push(
      new Paragraph({
        spacing: { after: SPACING.MEDIUM },
        children: [
          new TextRun({
            text: skills.join(' • '),
            size: FONT_SIZES.BODY,
            font,
          }),
        ],
      })
    );
  }

  // Projects Section (Important for students)
  if (projects && projects.length > 0) {
    paragraphs.push(
      createH2('PROJECTS', {
        color: primaryColor,
        uppercase: true,
        underline: true,
        font,
      })
    );

    projects.forEach((project, index) => {
      paragraphs.push(
        createH3(project.name, {
          color: primaryColor,
          font,
        })
      );

      // Project details
      const projectDetails = [
        project.company,
        project.dates,
      ].filter(Boolean).join(' • ');

      if (projectDetails) {
        paragraphs.push(
          new Paragraph({
            spacing: { after: pointsToTwips(4) },
            children: [
              new TextRun({
                text: projectDetails,
                size: FONT_SIZES.SMALL,
                font,
                italics: true,
              }),
            ],
          })
        );
      }

      // Description
      const description = Array.isArray(project.description)
        ? project.description
        : [project.description];

      description.forEach(desc => {
        if (desc && desc.trim()) {
          paragraphs.push(createBulletPoint(desc, { font }));
        }
      });

      // Technologies
      if (project.technologies && project.technologies.length > 0) {
        paragraphs.push(
          new Paragraph({
            spacing: { after: pointsToTwips(4) },
            children: [
              new TextRun({
                text: 'Technologies: ',
                size: FONT_SIZES.SMALL,
                font,
                bold: true,
              }),
              new TextRun({
                text: project.technologies.join(', '),
                size: FONT_SIZES.SMALL,
                font,
              }),
            ],
          })
        );
      }

      if (index < projects.length - 1) {
        paragraphs.push(emptyParagraph({ after: SPACING.SMALL }));
      }
    });

    paragraphs.push(emptyParagraph({ after: SPACING.MEDIUM }));
  }

  // Experience Section
  if (experience && experience.length > 0) {
    paragraphs.push(
      createH2('EXPERIENCE', {
        color: primaryColor,
        uppercase: true,
        underline: true,
        font,
      })
    );

    experience.forEach((exp, index) => {
      paragraphs.push(
        createH3(exp.title, {
          color: primaryColor,
          font,
        })
      );

      // Company and dates
      const companyLine = [exp.company, exp.location].filter(Boolean).join(' • ');
      const dates = exp.current
        ? `${exp.startDate} – Present`
        : `${exp.startDate} – ${exp.endDate}`;

      paragraphs.push(
        new Paragraph({
          spacing: { after: pointsToTwips(4) },
          children: [
            new TextRun({
              text: companyLine,
              size: FONT_SIZES.BODY,
              font,
              bold: true,
            }),
            new TextRun({
              text: `    ${dates}`,
              size: FONT_SIZES.BODY,
              font,
              italics: true,
            }),
          ],
        })
      );

      // Description bullets
      exp.description.forEach(desc => {
        paragraphs.push(createBulletPoint(desc, { font }));
      });

      if (index < experience.length - 1) {
        paragraphs.push(emptyParagraph({ after: SPACING.SMALL }));
      }
    });

    paragraphs.push(emptyParagraph({ after: SPACING.MEDIUM }));
  }

  // Certifications Section
  if (certifications && certifications.length > 0) {
    paragraphs.push(
      createH2('CERTIFICATIONS', {
        color: primaryColor,
        uppercase: true,
        underline: true,
        font,
      })
    );

    certifications.forEach((cert, index) => {
      const certText = [
        cert.name,
        cert.issuer,
        cert.date,
      ].filter(Boolean).join(' • ');

      paragraphs.push(
        new Paragraph({
          spacing: { after: pointsToTwips(6) },
          children: [
            new TextRun({
              text: certText,
              size: FONT_SIZES.BODY,
              font,
            }),
          ],
        })
      );
    });
  }

  // Create document
  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: pointsToTwips(36),    // 0.5 inch
              right: pointsToTwips(36),
              bottom: pointsToTwips(36),
              left: pointsToTwips(36),
            },
          },
        },
        children: paragraphs,
      },
    ],
  });
}

export default generateDOCX;

/**
 * Synchronous DOCX Generator for ATS Professional Templates
 * Simplified version that returns Document synchronously
 */

import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
} from 'docx';
import { ParsedResumeData } from '../../types';
import { ColorPalette } from '../shared/styles/colors';

/**
 * Generate a simple ATS-friendly DOCX document
 */
export function generateDOCXSync(
  data: ParsedResumeData,
  colors: ColorPalette,
  primaryColor?: string
): Document {
  const color = primaryColor || colors.primary || '#2563eb';
  const paragraphs: Paragraph[] = [];

  // Helper to remove # from color
  const cleanColor = (c: string) => c.replace('#', '');

  // ============================================================================
  // HEADER - Name and Contact
  // ============================================================================

  // Name
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: data.contact.name || 'Your Name',
          bold: true,
          size: 32,
          color: cleanColor(color),
          font: 'Calibri',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    })
  );

  // Contact Information
  const contactParts: string[] = [];
  if (data.contact.email) contactParts.push(data.contact.email);
  if (data.contact.phone) contactParts.push(data.contact.phone);
  if (data.contact.location) contactParts.push(data.contact.location);

  if (contactParts.length > 0) {
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: contactParts.join(' | '), size: 20 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
  }

  // Links
  const links: string[] = [];
  if (data.contact.linkedin) links.push(data.contact.linkedin);
  if (data.contact.github) links.push(data.contact.github);
  if (data.contact.website) links.push(data.contact.website);

  if (links.length > 0) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: links.join(' | '),
            size: 20,
            color: cleanColor(color),
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
      })
    );
  }

  // ============================================================================
  // SUMMARY
  // ============================================================================

  if (data.summary) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'PROFESSIONAL SUMMARY',
            bold: true,
            size: 24,
            color: cleanColor(color),
          }),
        ],
        spacing: { before: 200, after: 100 },
        border: {
          bottom: {
            color: cleanColor(color),
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    );

    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: data.summary })],
        spacing: { after: 200 },
      })
    );
  }

  // ============================================================================
  // EXPERIENCE
  // ============================================================================

  if (data.experience && data.experience.length > 0) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'PROFESSIONAL EXPERIENCE',
            bold: true,
            size: 24,
            color: cleanColor(color),
          }),
        ],
        spacing: { before: 200, after: 100 },
        border: {
          bottom: {
            color: cleanColor(color),
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    );

    data.experience.forEach((exp, index) => {
      // Job Title
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.title,
              bold: true,
              size: 22,
            }),
          ],
          spacing: { before: index === 0 ? 0 : 150, after: 50 },
        })
      );

      // Company and Dates
      const dates = exp.current
        ? `${exp.startDate || ''} - Present`
        : `${exp.startDate || ''} - ${exp.endDate || ''}`;

      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${exp.company}${exp.location ? ', ' + exp.location : ''} | ${dates}`,
              italics: true,
            }),
          ],
          spacing: { after: 100 },
        })
      );

      // Responsibilities
      if (exp.description && exp.description.length > 0) {
        exp.description.forEach((desc) => {
          paragraphs.push(
            new Paragraph({
              children: [new TextRun({ text: desc })],
              bullet: { level: 0 },
              spacing: { after: 50 },
            })
          );
        });
      }
    });
  }

  // ============================================================================
  // EDUCATION
  // ============================================================================

  if (data.education && data.education.length > 0) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'EDUCATION',
            bold: true,
            size: 24,
            color: cleanColor(color),
          }),
        ],
        spacing: { before: 200, after: 100 },
        border: {
          bottom: {
            color: cleanColor(color),
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    );

    data.education.forEach((edu, index) => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: edu.degree,
              bold: true,
              size: 22,
            }),
          ],
          spacing: { before: index === 0 ? 0 : 150, after: 50 },
        })
      );

      let eduDetails = edu.institution;
      if (edu.location) eduDetails += `, ${edu.location}`;
      if (edu.graduationDate) eduDetails += ` | ${edu.graduationDate}`;
      if (edu.gpa) eduDetails += ` | GPA: ${edu.gpa}`;

      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: eduDetails, italics: true })],
          spacing: { after: 100 },
        })
      );

      if (edu.achievements && edu.achievements.length > 0) {
        edu.achievements.forEach((achievement) => {
          paragraphs.push(
            new Paragraph({
              children: [new TextRun({ text: achievement })],
              bullet: { level: 0 },
              spacing: { after: 50 },
            })
          );
        });
      }
    });
  }

  // ============================================================================
  // SKILLS
  // ============================================================================

  if (data.skills && data.skills.length > 0) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'SKILLS',
            bold: true,
            size: 24,
            color: cleanColor(color),
          }),
        ],
        spacing: { before: 200, after: 100 },
        border: {
          bottom: {
            color: cleanColor(color),
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    );

    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: data.skills.join(' • ') })],
        spacing: { after: 200 },
      })
    );
  }

  // ============================================================================
  // CERTIFICATIONS
  // ============================================================================

  if (data.certifications && data.certifications.length > 0) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'CERTIFICATIONS',
            bold: true,
            size: 24,
            color: cleanColor(color),
          }),
        ],
        spacing: { before: 200, after: 100 },
        border: {
          bottom: {
            color: cleanColor(color),
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    );

    data.certifications.forEach((cert) => {
      let certText: string;
      if (typeof cert === 'string') {
        certText = cert;
      } else {
        certText = cert.name;
        if (cert.issuer) certText += ` - ${cert.issuer}`;
        if (cert.date) certText += ` (${cert.date})`;
      }

      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: certText })],
          bullet: { level: 0 },
          spacing: { after: 50 },
        })
      );
    });
  }

  // ============================================================================
  // CREATE AND RETURN DOCUMENT
  // ============================================================================

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720, // 0.5 inch
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

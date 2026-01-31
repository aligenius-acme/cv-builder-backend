/**
 * Academic DOCX Generator
 * Multi-page CV support with academic sections
 */

import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  PageBreak,
} from 'docx';
import { ParsedResumeData } from '../../types';
import { ColorPalette } from '../shared/styles/colors';
import {
  AcademicResumeData,
  PublicationEntry,
  GrantEntry,
  TeachingEntry,
  PresentationEntry,
} from '../../types/academic';

/**
 * Generate academic CV DOCX with multi-page support
 */
export function generateAcademicDOCX(
  data: ParsedResumeData | AcademicResumeData,
  colors: ColorPalette,
  primaryColor?: string
): Document {
  const color = primaryColor || colors.primary || '#1e3a8a';
  const paragraphs: Paragraph[] = [];

  // Helper to remove # from color
  const cleanColor = (c: string) => c.replace('#', '');

  // Cast to academic data for type checking
  const academicData = data as AcademicResumeData;

  // ============================================================================
  // HEADER - Name and Contact (Centered, Traditional)
  // ============================================================================

  // Name
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: data.contact.name || 'Your Name',
          bold: true,
          size: 28,
          color: cleanColor(color),
          font: 'Georgia',
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
        children: [
          new TextRun({
            text: contactParts.join(' • '),
            size: 20,
            font: 'Georgia',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      })
    );
  }

  // Academic Links (Website, ORCID, LinkedIn)
  const academicLinks: string[] = [];
  if (data.contact.website) academicLinks.push(data.contact.website);
  if (academicData.contact.orcid)
    academicLinks.push(`ORCID: ${academicData.contact.orcid}`);
  if (data.contact.linkedin) academicLinks.push(data.contact.linkedin);

  if (academicLinks.length > 0) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: academicLinks.join(' • '),
            size: 18,
            font: 'Georgia',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
      })
    );
  }

  // ============================================================================
  // RESEARCH INTERESTS
  // ============================================================================

  if (academicData.researchInterests && academicData.researchInterests.length > 0) {
    paragraphs.push(createSectionHeader('RESEARCH INTERESTS', cleanColor(color)));

    academicData.researchInterests.forEach((interest) => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: interest.area, bold: true }),
            interest.keywords && interest.keywords.length > 0
              ? new TextRun({ text: `: ${interest.keywords.join(', ')}` })
              : new TextRun({ text: '' }),
          ],
          spacing: { after: 100 },
        })
      );
    });

    paragraphs.push(createSpacer());
  }

  // ============================================================================
  // EDUCATION
  // ============================================================================

  if (data.education && data.education.length > 0) {
    paragraphs.push(createSectionHeader('EDUCATION', cleanColor(color)));

    data.education.forEach((edu) => {
      // Degree
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: edu.degree,
              bold: true,
              size: 22,
            }),
          ],
          spacing: { after: 50 },
        })
      );

      // Institution and Date
      let eduDetails = edu.institution;
      if (edu.location) eduDetails += `, ${edu.location}`;
      if (edu.graduationDate) eduDetails += ` | ${edu.graduationDate}`;

      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: eduDetails, italics: true })],
          spacing: { after: 50 },
        })
      );

      // Dissertation title (if exists)
      const eduWithDissertation = edu as AcademicResumeData['education'][0];
      if (eduWithDissertation.dissertationTitle) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Dissertation: ', italics: true }),
              new TextRun({ text: eduWithDissertation.dissertationTitle }),
            ],
            spacing: { after: 50 },
          })
        );
      }

      // Advisor
      if (eduWithDissertation.advisor) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Advisor: ', italics: true }),
              new TextRun({ text: eduWithDissertation.advisor }),
            ],
            spacing: { after: 50 },
          })
        );
      }

      // GPA
      if (edu.gpa) {
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: `GPA: ${edu.gpa}` })],
            spacing: { after: 50 },
          })
        );
      }

      // Achievements
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

      paragraphs.push(createSpacer(100));
    });

    paragraphs.push(createSpacer());
  }

  // ============================================================================
  // PROFESSIONAL EXPERIENCE
  // ============================================================================

  if (data.experience && data.experience.length > 0) {
    paragraphs.push(createSectionHeader('PROFESSIONAL EXPERIENCE', cleanColor(color)));

    data.experience.forEach((exp) => {
      // Title
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.title,
              bold: true,
              size: 22,
            }),
          ],
          spacing: { after: 50 },
        })
      );

      // Institution and Dates
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

      paragraphs.push(createSpacer(100));
    });

    paragraphs.push(createSpacer());
  }

  // ============================================================================
  // PUBLICATIONS
  // ============================================================================

  if (academicData.publications && academicData.publications.length > 0) {
    paragraphs.push(createSectionHeader('PUBLICATIONS', cleanColor(color)));

    academicData.publications.forEach((pub) => {
      const citation = formatPublicationCitation(pub);
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: citation })],
          spacing: { after: 150 },
          indent: { left: 360, hanging: 360 }, // Hanging indent for citations
        })
      );
    });

    paragraphs.push(createSpacer());
  }

  // ============================================================================
  // GRANTS & FUNDING
  // ============================================================================

  if (academicData.grants && academicData.grants.length > 0) {
    paragraphs.push(createSectionHeader('GRANTS & FUNDING', cleanColor(color)));

    academicData.grants.forEach((grant) => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: grant.title, bold: true }),
            new TextRun({ text: '\n' }),
            new TextRun({
              text: `${grant.agency}${grant.role ? ' (' + grant.role + ')' : ''}${grant.amount ? ' • ' + grant.amount : ''}`,
            }),
            grant.startDate || grant.endDate
              ? new TextRun({
                  text: ` | ${grant.startDate || ''} - ${grant.endDate || ''}`,
                  italics: true,
                })
              : new TextRun({ text: '' }),
          ],
          spacing: { after: 150 },
        })
      );
    });

    paragraphs.push(createSpacer());
  }

  // ============================================================================
  // TEACHING EXPERIENCE
  // ============================================================================

  if (academicData.teaching && academicData.teaching.length > 0) {
    paragraphs.push(createSectionHeader('TEACHING EXPERIENCE', cleanColor(color)));

    academicData.teaching.forEach((course) => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${course.course}${course.role ? ' (' + course.role + ')' : ''}`,
              bold: true,
            }),
            new TextRun({ text: '\n' }),
            new TextRun({
              text: `${course.institution}${course.semester && course.year ? ' • ' + course.semester + ' ' + course.year : course.year || ''}${course.students ? ' • ' + course.students + ' students' : ''}`,
            }),
          ],
          spacing: { after: course.description ? 50 : 150 },
        })
      );

      if (course.description && course.description.length > 0) {
        course.description.forEach((desc) => {
          paragraphs.push(
            new Paragraph({
              children: [new TextRun({ text: desc })],
              bullet: { level: 0 },
              spacing: { after: 50 },
            })
          );
        });
        paragraphs.push(createSpacer(100));
      }
    });

    paragraphs.push(createSpacer());
  }

  // ============================================================================
  // CONFERENCE PRESENTATIONS
  // ============================================================================

  if (academicData.presentations && academicData.presentations.length > 0) {
    paragraphs.push(createSectionHeader('CONFERENCE PRESENTATIONS', cleanColor(color)));

    academicData.presentations.forEach((pres) => {
      const presText = `${pres.title}${pres.type ? ' (' + pres.type + ')' : ''}. ${pres.event}${pres.location ? ', ' + pres.location : ''}${pres.date ? '. ' + pres.date : ''}.`;

      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: presText })],
          spacing: { after: 100 },
        })
      );
    });

    paragraphs.push(createSpacer());
  }

  // ============================================================================
  // ACADEMIC SERVICE
  // ============================================================================

  if (academicData.academicService && academicData.academicService.length > 0) {
    paragraphs.push(createSectionHeader('ACADEMIC SERVICE', cleanColor(color)));

    academicData.academicService.forEach((service) => {
      const dates = service.current
        ? `${service.startDate || ''} - Present`
        : service.startDate && service.endDate
        ? `${service.startDate} - ${service.endDate}`
        : service.startDate || service.endDate || '';

      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${service.role}${service.organization ? ', ' + service.organization : ''}`,
              bold: true,
            }),
            dates ? new TextRun({ text: ` | ${dates}`, italics: true }) : new TextRun({ text: '' }),
          ],
          spacing: { after: service.description ? 50 : 100 },
        })
      );

      if (service.description) {
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: service.description })],
            spacing: { after: 100 },
          })
        );
      }
    });

    paragraphs.push(createSpacer());
  }

  // ============================================================================
  // PROFESSIONAL MEMBERSHIPS
  // ============================================================================

  if (academicData.professionalMemberships && academicData.professionalMemberships.length > 0) {
    paragraphs.push(createSectionHeader('PROFESSIONAL MEMBERSHIPS', cleanColor(color)));

    academicData.professionalMemberships.forEach((membership) => {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: membership })],
          bullet: { level: 0 },
          spacing: { after: 50 },
        })
      );
    });

    paragraphs.push(createSpacer());
  }

  // ============================================================================
  // SKILLS
  // ============================================================================

  if (data.skills && data.skills.length > 0) {
    paragraphs.push(createSectionHeader('SKILLS', cleanColor(color)));

    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: data.skills.join(' • ') })],
        spacing: { after: 200 },
      })
    );
  }

  // ============================================================================
  // LANGUAGES
  // ============================================================================

  if (data.languages && data.languages.length > 0) {
    paragraphs.push(createSectionHeader('LANGUAGES', cleanColor(color)));

    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: data.languages.join(', ') })],
        spacing: { after: 200 },
      })
    );
  }

  // ============================================================================
  // CREATE AND RETURN DOCUMENT (Smaller margins for dense content)
  // ============================================================================

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 576, // 0.4 inch - smaller margins
              right: 576,
              bottom: 576,
              left: 576,
            },
          },
        },
        children: paragraphs,
      },
    ],
  });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function createSectionHeader(title: string, color: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 24,
        color: color,
        font: 'Georgia',
      }),
    ],
    spacing: { before: 200, after: 100 },
    border: {
      bottom: {
        color: color,
        space: 1,
        style: BorderStyle.SINGLE,
        size: 6,
      },
    },
  });
}

function createSpacer(space: number = 200): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: '' })],
    spacing: { after: space },
  });
}

function formatPublicationCitation(pub: PublicationEntry): string {
  // APA-style citation format
  const authorsStr = pub.authors.join(', ');
  let citation = `${authorsStr} (${pub.year}). ${pub.title}`;

  if (pub.journal) {
    citation += `. ${pub.journal}`;
    if (pub.volume) citation += `, ${pub.volume}`;
    if (pub.pages) citation += `, ${pub.pages}`;
  }

  if (pub.doi) {
    citation += `. https://doi.org/${pub.doi}`;
  } else if (pub.url) {
    citation += `. ${pub.url}`;
  }

  return citation;
}

import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType, ShadingType } from 'docx';
import { ParsedResumeData, AnonymizationConfig } from '../types';
import { ExtendedTemplateConfig } from './templates';

// Bullet character map
const BULLETS: Record<string, string> = {
  dot: '•',
  dash: '–',
  arrow: '›',
  none: '',
};

// Anonymize resume data
export function anonymizeResumeData(
  data: ParsedResumeData,
  config: AnonymizationConfig
): ParsedResumeData {
  const anonymized = JSON.parse(JSON.stringify(data)) as ParsedResumeData;

  if (config.maskName && anonymized.contact.name) {
    anonymized.contact.name = 'Candidate';
  }

  if (config.maskEmail && anonymized.contact.email) {
    anonymized.contact.email = 'candidate@email.com';
  }

  if (config.maskPhone && anonymized.contact.phone) {
    anonymized.contact.phone = '[Phone Hidden]';
  }

  if (config.maskLocation && anonymized.contact.location) {
    anonymized.contact.location = '[Location Hidden]';
  }

  if (config.maskCompanyNames) {
    anonymized.experience = anonymized.experience.map((exp, index) => ({
      ...exp,
      company: `Company ${index + 1}`,
    }));
  }

  anonymized.contact.linkedin = undefined;
  anonymized.contact.github = undefined;
  anonymized.contact.website = undefined;

  return anonymized;
}

// Helper to convert hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

// ============================================================================
// PDF GENERATION - Different layouts
// ============================================================================

export async function generatePDF(
  data: ParsedResumeData,
  template: ExtendedTemplateConfig
): Promise<Buffer> {
  switch (template.layoutType) {
    case 'modern':
      return generateModernPDF(data, template);
    case 'minimal':
      return generateMinimalPDF(data, template);
    case 'ats-optimized':
      return generateATSPDF(data, template);
    case 'executive':
      return generateExecutivePDF(data, template);
    case 'creative':
      return generateCreativePDF(data, template);
    case 'classic':
    default:
      return generateClassicPDF(data, template);
  }
}

// Classic/Professional layout - Centered header, underlined sections
async function generateClassicPDF(
  data: ParsedResumeData,
  template: ExtendedTemplateConfig
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: template.margins,
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const { fontSize, primaryColor } = template;
      const bullet = BULLETS[template.bulletStyle];
      const pageWidth = doc.page.width - template.margins.left - template.margins.right;

      // Centered Header
      if (data.contact.name) {
        doc
          .font('Helvetica-Bold')
          .fontSize(fontSize.header)
          .fillColor(primaryColor)
          .text(data.contact.name, { align: 'center' });
      }

      const contactLine = [data.contact.email, data.contact.phone, data.contact.location]
        .filter(Boolean)
        .join('  |  ');
      if (contactLine) {
        doc
          .font('Helvetica')
          .fontSize(fontSize.body)
          .fillColor('#444444')
          .moveDown(0.3)
          .text(contactLine, { align: 'center' });
      }

      const links = [data.contact.linkedin, data.contact.github].filter(Boolean);
      if (links.length > 0) {
        doc
          .fontSize(fontSize.body - 1)
          .fillColor('#0066cc')
          .moveDown(0.2)
          .text(links.join('  |  '), { align: 'center' });
      }

      doc.moveDown(1);

      // Section helper with underline
      const addSection = (title: string) => {
        doc
          .font('Helvetica-Bold')
          .fontSize(fontSize.subheader)
          .fillColor(primaryColor)
          .text(title.toUpperCase());
        doc
          .strokeColor(primaryColor)
          .lineWidth(1)
          .moveTo(template.margins.left, doc.y + 2)
          .lineTo(template.margins.left + pageWidth, doc.y + 2)
          .stroke();
        doc.moveDown(0.5);
      };

      // Render sections in order
      for (const section of template.sections.order) {
        if (!template.sections.visible[section]) continue;

        switch (section) {
          case 'summary':
            if (data.summary) {
              addSection('Professional Summary');
              doc
                .font('Helvetica')
                .fontSize(fontSize.body)
                .fillColor('#333333')
                .text(data.summary, { align: 'justify' });
              doc.moveDown(0.8);
            }
            break;

          case 'experience':
            if (data.experience.length > 0) {
              addSection('Professional Experience');
              for (const exp of data.experience) {
                doc
                  .font('Helvetica-Bold')
                  .fontSize(fontSize.body + 1)
                  .fillColor('#222222')
                  .text(exp.title);
                const line = [exp.company, exp.location].filter(Boolean).join(', ');
                const dates = [exp.startDate, exp.current ? 'Present' : exp.endDate]
                  .filter(Boolean)
                  .join(' – ');
                doc
                  .font('Helvetica')
                  .fontSize(fontSize.body)
                  .fillColor('#555555')
                  .text(`${line}${dates ? '  |  ' + dates : ''}`);
                doc.moveDown(0.2);
                for (const desc of exp.description || []) {
                  doc
                    .font('Helvetica')
                    .fontSize(fontSize.body)
                    .fillColor('#333333')
                    .text(`${bullet} ${desc}`, { indent: 10 });
                }
                doc.moveDown(0.5);
              }
            }
            break;

          case 'education':
            if (data.education.length > 0) {
              addSection('Education');
              for (const edu of data.education) {
                doc
                  .font('Helvetica-Bold')
                  .fontSize(fontSize.body + 1)
                  .fillColor('#222222')
                  .text(edu.degree);
                const eduLine = [edu.institution, edu.graduationDate].filter(Boolean).join('  |  ');
                if (eduLine) {
                  doc.font('Helvetica').fontSize(fontSize.body).fillColor('#555555').text(eduLine);
                }
                if (edu.gpa) {
                  doc.font('Helvetica').fontSize(fontSize.body).fillColor('#555555').text(`GPA: ${edu.gpa}`);
                }
                doc.moveDown(0.4);
              }
            }
            break;

          case 'skills':
            if (data.skills.length > 0) {
              addSection('Skills');
              doc
                .font('Helvetica')
                .fontSize(fontSize.body)
                .fillColor('#333333')
                .text(data.skills.join('  •  '));
              doc.moveDown(0.8);
            }
            break;

          case 'certifications':
            if (data.certifications && data.certifications.length > 0) {
              addSection('Certifications');
              for (const cert of data.certifications) {
                doc.font('Helvetica').fontSize(fontSize.body).fillColor('#333333').text(`${bullet} ${cert}`);
              }
              doc.moveDown(0.8);
            }
            break;

          case 'projects':
            if (data.projects && data.projects.length > 0) {
              addSection('Projects');
              for (const proj of data.projects) {
                doc.font('Helvetica-Bold').fontSize(fontSize.body + 1).fillColor('#222222').text(proj.name);
                if (proj.description) {
                  doc.font('Helvetica').fontSize(fontSize.body).fillColor('#555555').text(proj.description);
                }
                if (proj.technologies?.length) {
                  doc
                    .font('Helvetica-Oblique')
                    .fontSize(fontSize.body - 1)
                    .fillColor('#666666')
                    .text(`Technologies: ${proj.technologies.join(', ')}`);
                }
                doc.moveDown(0.4);
              }
            }
            break;
        }
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// Modern layout - Two-column with sidebar
async function generateModernPDF(
  data: ParsedResumeData,
  template: ExtendedTemplateConfig
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 0, right: 0, bottom: 0, left: 0 },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const { fontSize, primaryColor, accentColor } = template;
      const sidebarWidth = (doc.page.width * (template.sidebarWidth || 35)) / 100;
      const mainWidth = doc.page.width - sidebarWidth;
      const bullet = BULLETS[template.bulletStyle];

      // Draw sidebar background
      const rgb = hexToRgb(primaryColor);
      doc.rect(0, 0, sidebarWidth, doc.page.height).fill(primaryColor);

      // Sidebar content
      let sideY = 40;

      // Name in sidebar
      if (data.contact.name) {
        doc
          .font('Helvetica-Bold')
          .fontSize(fontSize.header - 4)
          .fillColor('#ffffff')
          .text(data.contact.name, 20, sideY, { width: sidebarWidth - 40 });
        sideY = doc.y + 20;
      }

      // Contact info in sidebar
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#ffffff').text('CONTACT', 20, sideY);
      sideY = doc.y + 8;
      doc.font('Helvetica').fontSize(9).fillColor('#ffffffcc');
      if (data.contact.email) {
        doc.text(data.contact.email, 20, sideY, { width: sidebarWidth - 40 });
        sideY = doc.y + 4;
      }
      if (data.contact.phone) {
        doc.text(data.contact.phone, 20, sideY, { width: sidebarWidth - 40 });
        sideY = doc.y + 4;
      }
      if (data.contact.location) {
        doc.text(data.contact.location, 20, sideY, { width: sidebarWidth - 40 });
        sideY = doc.y + 4;
      }
      if (data.contact.linkedin) {
        doc.text(data.contact.linkedin.replace('https://', ''), 20, sideY, { width: sidebarWidth - 40 });
        sideY = doc.y + 4;
      }
      sideY += 20;

      // Skills in sidebar as pills
      if (data.skills.length > 0) {
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#ffffff').text('SKILLS', 20, sideY);
        sideY = doc.y + 10;
        doc.font('Helvetica').fontSize(8);
        let pillX = 20;
        let pillY = sideY;
        for (const skill of data.skills) {
          const textWidth = doc.widthOfString(skill) + 12;
          if (pillX + textWidth > sidebarWidth - 20) {
            pillX = 20;
            pillY += 18;
          }
          // Pill background
          doc.roundedRect(pillX, pillY, textWidth, 14, 7).fill('#ffffff33');
          doc.fillColor('#ffffff').text(skill, pillX + 6, pillY + 3);
          pillX += textWidth + 6;
        }
        sideY = pillY + 30;
      }

      // Education in sidebar
      if (data.education.length > 0) {
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#ffffff').text('EDUCATION', 20, sideY);
        sideY = doc.y + 8;
        for (const edu of data.education) {
          doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff').text(edu.degree, 20, sideY, { width: sidebarWidth - 40 });
          sideY = doc.y + 2;
          if (edu.institution) {
            doc.font('Helvetica').fontSize(8).fillColor('#ffffffcc').text(edu.institution, 20, sideY, { width: sidebarWidth - 40 });
            sideY = doc.y + 2;
          }
          if (edu.graduationDate) {
            doc.font('Helvetica').fontSize(8).fillColor('#ffffffaa').text(edu.graduationDate, 20, sideY);
            sideY = doc.y + 8;
          }
        }
      }

      // Main content area
      let mainY = 40;
      const mainX = sidebarWidth + 30;
      const contentWidth = mainWidth - 60;

      // Summary
      if (template.sections.visible.summary && data.summary) {
        doc.font('Helvetica-Bold').fontSize(fontSize.subheader).fillColor(primaryColor).text('PROFILE', mainX, mainY);
        mainY = doc.y + 8;
        doc.font('Helvetica').fontSize(fontSize.body).fillColor('#333333').text(data.summary, mainX, mainY, { width: contentWidth });
        mainY = doc.y + 20;
      }

      // Experience
      if (data.experience.length > 0) {
        doc.font('Helvetica-Bold').fontSize(fontSize.subheader).fillColor(primaryColor).text('EXPERIENCE', mainX, mainY);
        mainY = doc.y + 10;

        for (const exp of data.experience) {
          doc.font('Helvetica-Bold').fontSize(fontSize.body + 1).fillColor('#222222').text(exp.title, mainX, mainY, { width: contentWidth });
          mainY = doc.y + 2;
          const line = [exp.company, exp.location].filter(Boolean).join(', ');
          const dates = [exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ');
          doc.font('Helvetica').fontSize(fontSize.body).fillColor(primaryColor).text(`${line}  |  ${dates}`, mainX, mainY, { width: contentWidth });
          mainY = doc.y + 6;
          for (const desc of exp.description || []) {
            doc.font('Helvetica').fontSize(fontSize.body).fillColor('#444444').text(`${bullet} ${desc}`, mainX + 10, mainY, { width: contentWidth - 10 });
            mainY = doc.y + 3;
          }
          mainY += 10;
        }
      }

      // Projects
      if (data.projects && data.projects.length > 0) {
        doc.font('Helvetica-Bold').fontSize(fontSize.subheader).fillColor(primaryColor).text('PROJECTS', mainX, mainY);
        mainY = doc.y + 10;
        for (const proj of data.projects) {
          doc.font('Helvetica-Bold').fontSize(fontSize.body + 1).fillColor('#222222').text(proj.name, mainX, mainY, { width: contentWidth });
          mainY = doc.y + 2;
          if (proj.description) {
            doc.font('Helvetica').fontSize(fontSize.body).fillColor('#444444').text(proj.description, mainX, mainY, { width: contentWidth });
            mainY = doc.y + 4;
          }
          if (proj.technologies?.length) {
            doc.font('Helvetica-Oblique').fontSize(fontSize.body - 1).fillColor('#666666').text(proj.technologies.join(', '), mainX, mainY, { width: contentWidth });
            mainY = doc.y + 8;
          }
        }
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// Minimal layout - Clean and spacious
async function generateMinimalPDF(
  data: ParsedResumeData,
  template: ExtendedTemplateConfig
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: template.margins,
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const { fontSize, primaryColor } = template;
      const bullet = BULLETS[template.bulletStyle];

      // Left-aligned minimal header
      if (data.contact.name) {
        doc
          .font('Helvetica')
          .fontSize(fontSize.header)
          .fillColor(primaryColor)
          .text(data.contact.name);
      }

      const contactLine = [data.contact.email, data.contact.phone, data.contact.location]
        .filter(Boolean)
        .join('   ');
      if (contactLine) {
        doc.font('Helvetica').fontSize(fontSize.body).fillColor('#666666').text(contactLine);
      }

      doc.moveDown(2);

      // Simple section helper - no underlines, just spacing
      const addSection = (title: string) => {
        doc.font('Helvetica').fontSize(fontSize.subheader).fillColor(primaryColor).text(title.toUpperCase());
        doc.moveDown(0.3);
      };

      // Experience (typically first in minimal)
      if (data.experience.length > 0) {
        addSection('Experience');
        for (const exp of data.experience) {
          const dates = [exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ');
          doc
            .font('Helvetica-Bold')
            .fontSize(fontSize.body)
            .fillColor('#222222')
            .text(`${exp.title}`, { continued: dates ? true : false });
          if (dates) {
            doc.font('Helvetica').fillColor('#666666').text(`  ${dates}`);
          }
          doc.font('Helvetica').fontSize(fontSize.body).fillColor('#444444').text(exp.company);
          for (const desc of exp.description || []) {
            doc.font('Helvetica').fontSize(fontSize.body).fillColor('#333333').text(`${bullet} ${desc}`, { indent: 15 });
          }
          doc.moveDown(0.8);
        }
        doc.moveDown(0.5);
      }

      // Education
      if (data.education.length > 0) {
        addSection('Education');
        for (const edu of data.education) {
          doc.font('Helvetica-Bold').fontSize(fontSize.body).fillColor('#222222').text(edu.degree);
          doc.font('Helvetica').fontSize(fontSize.body).fillColor('#444444').text(`${edu.institution || ''}  ${edu.graduationDate || ''}`);
          doc.moveDown(0.5);
        }
        doc.moveDown(0.5);
      }

      // Skills - inline
      if (data.skills.length > 0) {
        addSection('Skills');
        doc.font('Helvetica').fontSize(fontSize.body).fillColor('#333333').text(data.skills.join(', '));
        doc.moveDown(1);
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// ATS-Optimized layout - Plain, maximum compatibility
async function generateATSPDF(
  data: ParsedResumeData,
  template: ExtendedTemplateConfig
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: template.margins,
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const { fontSize } = template;
      const pageWidth = doc.page.width - template.margins.left - template.margins.right;

      // Plain header - no colors
      if (data.contact.name) {
        doc.font('Helvetica-Bold').fontSize(fontSize.header).fillColor('#000000').text(data.contact.name);
      }
      doc.font('Helvetica').fontSize(fontSize.body).fillColor('#000000');
      if (data.contact.email) doc.text(data.contact.email);
      if (data.contact.phone) doc.text(data.contact.phone);
      if (data.contact.location) doc.text(data.contact.location);
      if (data.contact.linkedin) doc.text(data.contact.linkedin);

      doc.moveDown(1);

      // Simple underlined section
      const addSection = (title: string) => {
        doc.font('Helvetica-Bold').fontSize(fontSize.subheader).fillColor('#000000').text(title.toUpperCase());
        doc.strokeColor('#000000').lineWidth(0.5).moveTo(template.margins.left, doc.y).lineTo(template.margins.left + pageWidth, doc.y).stroke();
        doc.moveDown(0.4);
      };

      // Summary
      if (data.summary) {
        addSection('SUMMARY');
        doc.font('Helvetica').fontSize(fontSize.body).fillColor('#000000').text(data.summary);
        doc.moveDown(0.8);
      }

      // Skills as list (ATS prefers this)
      if (data.skills.length > 0) {
        addSection('SKILLS');
        doc.font('Helvetica').fontSize(fontSize.body).fillColor('#000000');
        // List skills on separate lines for better ATS parsing
        const skillRows = [];
        for (let i = 0; i < data.skills.length; i += 4) {
          skillRows.push(data.skills.slice(i, i + 4).join(', '));
        }
        for (const row of skillRows) {
          doc.text(row);
        }
        doc.moveDown(0.8);
      }

      // Experience
      if (data.experience.length > 0) {
        addSection('PROFESSIONAL EXPERIENCE');
        for (const exp of data.experience) {
          doc.font('Helvetica-Bold').fontSize(fontSize.body).fillColor('#000000').text(exp.title);
          const dates = [exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' - ');
          doc.font('Helvetica').fontSize(fontSize.body).text(`${exp.company}${dates ? ', ' + dates : ''}`);
          for (const desc of exp.description || []) {
            doc.text(`• ${desc}`);
          }
          doc.moveDown(0.6);
        }
      }

      // Education
      if (data.education.length > 0) {
        addSection('EDUCATION');
        for (const edu of data.education) {
          doc.font('Helvetica-Bold').fontSize(fontSize.body).fillColor('#000000').text(edu.degree);
          doc.font('Helvetica').text(`${edu.institution || ''}${edu.graduationDate ? ', ' + edu.graduationDate : ''}`);
          doc.moveDown(0.4);
        }
      }

      // Certifications
      if (data.certifications && data.certifications.length > 0) {
        addSection('CERTIFICATIONS');
        for (const cert of data.certifications) {
          doc.font('Helvetica').fontSize(fontSize.body).fillColor('#000000').text(`• ${cert}`);
        }
        doc.moveDown(0.8);
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// Executive layout - Bold header banner, prominent summary
async function generateExecutivePDF(
  data: ParsedResumeData,
  template: ExtendedTemplateConfig
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 0, right: 40, bottom: 40, left: 40 },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const { fontSize, primaryColor, accentColor } = template;
      const bullet = BULLETS[template.bulletStyle];
      const pageWidth = doc.page.width;

      // Full-width header banner
      doc.rect(0, 0, pageWidth, 100).fill(primaryColor);

      // Name in banner
      if (data.contact.name) {
        doc
          .font('Helvetica-Bold')
          .fontSize(fontSize.header)
          .fillColor('#ffffff')
          .text(data.contact.name, 40, 30, { width: pageWidth - 80 });
      }

      // Contact in banner
      const contactLine = [data.contact.email, data.contact.phone, data.contact.location].filter(Boolean).join('  |  ');
      if (contactLine) {
        doc.font('Helvetica').fontSize(fontSize.body).fillColor('#ffffffcc').text(contactLine, 40, 65, { width: pageWidth - 80 });
      }

      let y = 120;

      // Prominent summary box
      if (data.summary) {
        const rgb = hexToRgb(accentColor || '#ebf8ff');
        doc.rect(40, y, pageWidth - 80, 80).fill(accentColor || '#ebf8ff');
        doc
          .font('Helvetica-Bold')
          .fontSize(fontSize.subheader)
          .fillColor(primaryColor)
          .text('EXECUTIVE SUMMARY', 55, y + 15);
        doc
          .font('Helvetica')
          .fontSize(fontSize.body)
          .fillColor('#333333')
          .text(data.summary, 55, y + 35, { width: pageWidth - 110 });
        y = doc.y + 30;
      }

      // Section with boxed header
      const addSection = (title: string) => {
        doc.rect(40, y, 150, 22).fill(primaryColor);
        doc.font('Helvetica-Bold').fontSize(11).fillColor('#ffffff').text(title.toUpperCase(), 50, y + 5);
        y += 30;
      };

      // Experience
      if (data.experience.length > 0) {
        addSection('EXPERIENCE');
        for (const exp of data.experience) {
          doc.font('Helvetica-Bold').fontSize(fontSize.body + 1).fillColor('#222222').text(exp.title, 40, y);
          y = doc.y + 2;
          const line = [exp.company, exp.location].filter(Boolean).join(', ');
          const dates = [exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ');
          doc.font('Helvetica').fontSize(fontSize.body).fillColor(primaryColor).text(`${line}  |  ${dates}`, 40, y);
          y = doc.y + 6;
          for (const desc of exp.description || []) {
            doc.font('Helvetica').fontSize(fontSize.body).fillColor('#333333').text(`${bullet} ${desc}`, 50, y, { width: pageWidth - 100 });
            y = doc.y + 3;
          }
          y += 10;
        }
        y += 10;
      }

      // Skills in grid
      if (data.skills.length > 0) {
        addSection('CORE COMPETENCIES');
        doc.font('Helvetica').fontSize(fontSize.body);
        const cols = 3;
        const colWidth = (pageWidth - 100) / cols;
        let col = 0;
        let startY = y;
        for (const skill of data.skills) {
          doc.fillColor('#333333').text(`• ${skill}`, 50 + col * colWidth, y, { width: colWidth - 10 });
          col++;
          if (col >= cols) {
            col = 0;
            y = doc.y + 3;
          }
        }
        y = Math.max(y, doc.y) + 20;
      }

      // Education
      if (data.education.length > 0) {
        addSection('EDUCATION');
        for (const edu of data.education) {
          doc.font('Helvetica-Bold').fontSize(fontSize.body).fillColor('#222222').text(edu.degree, 40, y);
          y = doc.y + 2;
          doc.font('Helvetica').fontSize(fontSize.body).fillColor('#555555').text(`${edu.institution || ''}  |  ${edu.graduationDate || ''}`, 40, y);
          y = doc.y + 8;
        }
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// Creative layout - Colorful sections and pill skills
async function generateCreativePDF(
  data: ParsedResumeData,
  template: ExtendedTemplateConfig
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: template.margins,
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const { fontSize, primaryColor, accentColor } = template;
      const bullet = BULLETS[template.bulletStyle];
      const pageWidth = doc.page.width - template.margins.left - template.margins.right;

      // Boxed header with accent background
      doc.rect(template.margins.left - 10, template.margins.top - 10, pageWidth + 20, 70).fill(accentColor || '#f5f3ff');
      doc.rect(template.margins.left - 10, template.margins.top - 10, 5, 70).fill(primaryColor);

      if (data.contact.name) {
        doc
          .font('Helvetica-Bold')
          .fontSize(fontSize.header)
          .fillColor(primaryColor)
          .text(data.contact.name, template.margins.left + 5, template.margins.top);
      }

      const contactLine = [data.contact.email, data.contact.phone, data.contact.location].filter(Boolean).join('  •  ');
      if (contactLine) {
        doc.font('Helvetica').fontSize(fontSize.body).fillColor('#555555').text(contactLine, template.margins.left + 5);
      }

      doc.y = template.margins.top + 80;

      // Highlighted section
      const addSection = (title: string) => {
        doc.rect(template.margins.left, doc.y, pageWidth, 22).fill(accentColor || '#f5f3ff');
        doc.font('Helvetica-Bold').fontSize(fontSize.subheader).fillColor(primaryColor).text(title.toUpperCase(), template.margins.left + 10, doc.y + 5);
        doc.y += 30;
      };

      // Summary
      if (data.summary) {
        addSection('About Me');
        doc.font('Helvetica').fontSize(fontSize.body).fillColor('#333333').text(data.summary);
        doc.moveDown(1);
      }

      // Skills as pills
      if (data.skills.length > 0) {
        addSection('Skills');
        doc.font('Helvetica').fontSize(9);
        let pillX = template.margins.left;
        let pillY = doc.y;
        for (const skill of data.skills) {
          const textWidth = doc.widthOfString(skill) + 16;
          if (pillX + textWidth > template.margins.left + pageWidth) {
            pillX = template.margins.left;
            pillY += 22;
          }
          doc.roundedRect(pillX, pillY, textWidth, 18, 9).fill(primaryColor);
          doc.fillColor('#ffffff').text(skill, pillX + 8, pillY + 4);
          pillX += textWidth + 8;
        }
        doc.y = pillY + 35;
      }

      // Projects
      if (data.projects && data.projects.length > 0) {
        addSection('Featured Projects');
        for (const proj of data.projects) {
          doc.font('Helvetica-Bold').fontSize(fontSize.body + 1).fillColor(primaryColor).text(proj.name);
          if (proj.description) {
            doc.font('Helvetica').fontSize(fontSize.body).fillColor('#444444').text(proj.description);
          }
          if (proj.technologies?.length) {
            doc.font('Helvetica-Oblique').fontSize(fontSize.body - 1).fillColor('#666666').text(proj.technologies.join(' • '));
          }
          doc.moveDown(0.5);
        }
        doc.moveDown(0.5);
      }

      // Experience
      if (data.experience.length > 0) {
        addSection('Experience');
        for (const exp of data.experience) {
          doc.font('Helvetica-Bold').fontSize(fontSize.body + 1).fillColor('#222222').text(exp.title);
          const line = [exp.company, exp.location].filter(Boolean).join(', ');
          const dates = [exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ');
          doc.font('Helvetica').fontSize(fontSize.body).fillColor(primaryColor).text(`${line}  |  ${dates}`);
          for (const desc of exp.description || []) {
            doc.font('Helvetica').fontSize(fontSize.body).fillColor('#444444').text(`${bullet} ${desc}`, { indent: 10 });
          }
          doc.moveDown(0.6);
        }
      }

      // Education
      if (data.education.length > 0) {
        addSection('Education');
        for (const edu of data.education) {
          doc.font('Helvetica-Bold').fontSize(fontSize.body).fillColor('#222222').text(edu.degree);
          doc.font('Helvetica').fontSize(fontSize.body).fillColor('#555555').text(`${edu.institution || ''}  |  ${edu.graduationDate || ''}`);
          doc.moveDown(0.3);
        }
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// ============================================================================
// DOCX GENERATION
// ============================================================================

export async function generateDOCX(
  data: ParsedResumeData,
  template: ExtendedTemplateConfig
): Promise<Buffer> {
  const children: Paragraph[] = [];
  const primaryColorHex = template.primaryColor.replace('#', '');

  // Header / Name
  if (data.contact.name) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: data.contact.name,
            bold: true,
            size: template.fontSize.header * 2,
            color: primaryColorHex,
          }),
        ],
        alignment: template.headerStyle === 'centered' ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: { after: 100 },
      })
    );
  }

  // Contact Info
  const contactParts = [data.contact.email, data.contact.phone, data.contact.location].filter(Boolean);
  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: contactParts.join('  |  '),
            size: 20,
            color: '666666',
          }),
        ],
        alignment: template.headerStyle === 'centered' ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: { after: 100 },
      })
    );
  }

  // Links
  const links = [data.contact.linkedin, data.contact.github].filter(Boolean);
  if (links.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: links.join('  |  '),
            size: 18,
            color: '0066cc',
          }),
        ],
        alignment: template.headerStyle === 'centered' ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: { after: 200 },
      })
    );
  }

  // Section header helper
  const addSectionHeader = (title: string) => {
    const hasBorder = template.sectionStyle === 'underlined' || template.sectionStyle === 'boxed';
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: template.fontSize.subheader * 2,
            color: primaryColorHex,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
        border: hasBorder
          ? {
              bottom: {
                color: primaryColorHex,
                size: 8,
                style: BorderStyle.SINGLE,
              },
            }
          : undefined,
      })
    );
  };

  // Render sections in order
  for (const section of template.sections.order) {
    if (!template.sections.visible[section]) continue;

    switch (section) {
      case 'summary':
        if (data.summary) {
          addSectionHeader('Summary');
          children.push(
            new Paragraph({
              children: [new TextRun({ text: data.summary, size: 22 })],
              spacing: { after: 200 },
            })
          );
        }
        break;

      case 'experience':
        if (data.experience.length > 0) {
          addSectionHeader('Experience');
          for (const exp of data.experience) {
            children.push(
              new Paragraph({
                children: [new TextRun({ text: exp.title, bold: true, size: 24 })],
                spacing: { before: 100 },
              })
            );
            const line = [exp.company, exp.location].filter(Boolean).join(', ');
            const dates = [exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ');
            children.push(
              new Paragraph({
                children: [new TextRun({ text: `${line}  |  ${dates}`, size: 20, color: '555555' })],
                spacing: { after: 50 },
              })
            );
            for (const desc of exp.description || []) {
              children.push(
                new Paragraph({
                  children: [new TextRun({ text: `• ${desc}`, size: 22 })],
                  indent: { left: 200 },
                  spacing: { after: 40 },
                })
              );
            }
          }
        }
        break;

      case 'education':
        if (data.education.length > 0) {
          addSectionHeader('Education');
          for (const edu of data.education) {
            children.push(
              new Paragraph({
                children: [new TextRun({ text: edu.degree, bold: true, size: 24 })],
                spacing: { before: 100 },
              })
            );
            const eduLine = [edu.institution, edu.graduationDate].filter(Boolean).join('  |  ');
            if (eduLine) {
              children.push(
                new Paragraph({
                  children: [new TextRun({ text: eduLine, size: 20, color: '555555' })],
                  spacing: { after: 50 },
                })
              );
            }
          }
        }
        break;

      case 'skills':
        if (data.skills.length > 0) {
          addSectionHeader('Skills');
          children.push(
            new Paragraph({
              children: [new TextRun({ text: data.skills.join('  •  '), size: 22 })],
              spacing: { after: 200 },
            })
          );
        }
        break;

      case 'certifications':
        if (data.certifications && data.certifications.length > 0) {
          addSectionHeader('Certifications');
          for (const cert of data.certifications) {
            children.push(
              new Paragraph({
                children: [new TextRun({ text: `• ${cert}`, size: 22 })],
                spacing: { after: 40 },
              })
            );
          }
        }
        break;

      case 'projects':
        if (data.projects && data.projects.length > 0) {
          addSectionHeader('Projects');
          for (const proj of data.projects) {
            children.push(
              new Paragraph({
                children: [new TextRun({ text: proj.name, bold: true, size: 24 })],
                spacing: { before: 100 },
              })
            );
            if (proj.description) {
              children.push(
                new Paragraph({
                  children: [new TextRun({ text: proj.description, size: 22 })],
                  spacing: { after: 50 },
                })
              );
            }
            if (proj.technologies?.length) {
              children.push(
                new Paragraph({
                  children: [new TextRun({ text: `Technologies: ${proj.technologies.join(', ')}`, italics: true, size: 20, color: '666666' })],
                  spacing: { after: 100 },
                })
              );
            }
          }
        }
        break;
    }
  }

  const doc = new Document({
    sections: [{ children }],
  });

  return Packer.toBuffer(doc);
}

// ============================================================================
// COVER LETTER GENERATION
// ============================================================================

export async function generateCoverLetterPDF(
  content: string,
  candidateName: string,
  companyName: string,
  jobTitle: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 72, right: 72, bottom: 72, left: 72 },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      doc.font('Helvetica').fontSize(11).fillColor('#333333').text(today);
      doc.moveDown(2);
      doc.text(`Dear Hiring Manager at ${companyName},`);
      doc.moveDown();

      const paragraphs = content.split('\n\n');
      for (const para of paragraphs) {
        if (para.trim()) {
          doc.text(para.trim(), { align: 'justify', lineGap: 4 });
          doc.moveDown();
        }
      }

      doc.moveDown();
      doc.text('Sincerely,');
      doc.moveDown(2);
      doc.font('Helvetica-Bold').text(candidateName);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export async function generateCoverLetterDOCX(
  content: string,
  candidateName: string,
  companyName: string,
  jobTitle: string
): Promise<Buffer> {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      children: [new TextRun({ text: today, size: 22 })],
      spacing: { after: 400 },
    })
  );

  children.push(
    new Paragraph({
      children: [new TextRun({ text: `Dear Hiring Manager at ${companyName},`, size: 22 })],
      spacing: { after: 200 },
    })
  );

  const paragraphs = content.split('\n\n');
  for (const para of paragraphs) {
    if (para.trim()) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: para.trim(), size: 22 })],
          spacing: { after: 200 },
        })
      );
    }
  }

  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'Sincerely,', size: 22 })],
      spacing: { before: 200, after: 400 },
    })
  );

  children.push(
    new Paragraph({
      children: [new TextRun({ text: candidateName, bold: true, size: 22 })],
    })
  );

  const doc = new Document({
    sections: [{ children }],
  });

  return Packer.toBuffer(doc);
}

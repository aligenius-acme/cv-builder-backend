import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType, ShadingType } from 'docx';
import { ParsedResumeData, AnonymizationConfig, SkillCategory } from '../types';
import { ExtendedTemplateConfig, getTemplateConfig, BASE_LAYOUTS, COLOR_PALETTES } from './templates';

// Bullet character map
const BULLETS: Record<string, string> = {
  dot: '•',
  dash: '–',
  arrow: '›',
  check: '✓',
  none: '',
};

// Helper to clean bullet points from text
function cleanBullet(text: string): string {
  return text.replace(/^[•\-*▪◦›●○]\s*/, '').trim();
}

// Helper to get certification name (handles both string and object formats)
function getCertName(cert: string | { name: string }): string {
  if (typeof cert === 'string') return cleanBullet(cert);
  return cleanBullet(cert.name || '');
}

// Helper to normalize skills to string array
function normalizeSkills(skills: string[] | SkillCategory[]): string[] {
  if (!skills || skills.length === 0) return [];

  // Check if it's categorized skills
  if (typeof skills[0] === 'object' && 'category' in skills[0]) {
    // Flatten categorized skills into a single array
    return (skills as SkillCategory[]).flatMap(cat => cat.items);
  }

  return skills as string[];
}

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

// ============================================================================
// MAIN PDF GENERATION
// ============================================================================

export async function generatePDF(
  data: ParsedResumeData,
  template: ExtendedTemplateConfig
): Promise<Buffer> {
  console.log(`📄 Generating PDF with:`, {
    templateName: template.name,
    hasSidebar: template.hasSidebar,
    headerStyle: template.headerStyle,
    sidebarPosition: template.sidebarPosition
  });

  // Route to appropriate layout generator
  if (template.hasSidebar) {
    if (template.sidebarPosition === 'right') {
      console.log('  → Using generateSidebarRightPDF');
      return generateSidebarRightPDF(data, template);
    }
    console.log('  → Using generateSidebarLeftPDF');
    return generateSidebarLeftPDF(data, template);
  }

  switch (template.headerStyle) {
    case 'banner':
      console.log('  → Using generateBannerPDF');
      return generateBannerPDF(data, template);
    case 'centered':
      console.log('  → Using generateCenteredPDF');
      return generateCenteredPDF(data, template);
    default:
      console.log('  → Using generateLeftAlignedPDF');
      return generateLeftAlignedPDF(data, template);
  }
}

// ============================================================================
// LEFT-ALIGNED LAYOUT (Modern, Minimal, Compact)
// ============================================================================

async function generateLeftAlignedPDF(
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

      const { fontSize, primaryColor, margins } = template;
      const textColor = template.textColor || '#1a1a2e';
      const mutedColor = template.mutedColor || '#64748b';
      const bullet = BULLETS[template.bulletStyle];
      const pageWidth = doc.page.width - margins.left - margins.right;

      // Header - Name
      if (data.contact.name) {
        doc
          .font('Helvetica-Bold')
          .fontSize(fontSize.header)
          .fillColor(primaryColor)
          .text(data.contact.name);
      }

      // Contact line
      const contactParts = [
        data.contact.email,
        data.contact.phone,
        data.contact.location
      ].filter(Boolean);

      if (contactParts.length > 0) {
        doc
          .font('Helvetica')
          .fontSize(fontSize.body)
          .fillColor(mutedColor)
          .moveDown(0.3)
          .text(contactParts.join('  •  '));
      }

      // Links
      const links = [data.contact.linkedin, data.contact.github].filter(Boolean);
      if (links.length > 0) {
        doc
          .fontSize(fontSize.body - 0.5)
          .fillColor(primaryColor)
          .text(links.map(l => l?.replace('https://', '')).join('  •  '));
      }

      doc.moveDown(1.2);

      // Section renderer
      const renderSection = (title: string) => {
        if (template.sectionStyle === 'underlined') {
          doc
            .font('Helvetica-Bold')
            .fontSize(fontSize.subheader)
            .fillColor(primaryColor)
            .text(title.toUpperCase(), { characterSpacing: 0.5 });
          doc
            .strokeColor(primaryColor)
            .lineWidth(0.75)
            .moveTo(margins.left, doc.y + 2)
            .lineTo(margins.left + pageWidth, doc.y + 2)
            .stroke();
          doc.moveDown(0.5);
        } else if (template.sectionStyle === 'highlighted' || template.sectionStyle === 'accent-bar') {
          const y = doc.y;
          doc.rect(margins.left - 4, y, 3, fontSize.subheader + 4).fill(primaryColor);
          doc
            .font('Helvetica-Bold')
            .fontSize(fontSize.subheader)
            .fillColor(textColor)
            .text(title.toUpperCase(), margins.left + 6, y + 1, { characterSpacing: 0.5 });
          doc.y = y + fontSize.subheader + 10;
        } else if (template.sectionStyle === 'dotted') {
          doc
            .font('Helvetica-Bold')
            .fontSize(fontSize.subheader)
            .fillColor(primaryColor)
            .text(title.toUpperCase(), { characterSpacing: 0.5 });
          doc
            .strokeColor(mutedColor)
            .lineWidth(0.5)
            .dash(2, { space: 2 })
            .moveTo(margins.left, doc.y + 2)
            .lineTo(margins.left + 60, doc.y + 2)
            .stroke()
            .undash();
          doc.moveDown(0.5);
        } else {
          doc
            .font('Helvetica-Bold')
            .fontSize(fontSize.subheader)
            .fillColor(primaryColor)
            .text(title.toUpperCase(), { characterSpacing: 0.5 });
          doc.moveDown(0.3);
        }
      };

      // Summary
      if (data.summary) {
        renderSection('Summary');
        doc
          .font('Helvetica')
          .fontSize(fontSize.body)
          .fillColor(textColor)
          .text(data.summary, { lineGap: 2 });
        doc.moveDown(1);
      }

      // Experience
      if (data.experience.length > 0) {
        renderSection('Experience');
        for (const exp of data.experience) {
          const title = exp.title || exp.position || 'Position';
          doc
            .font('Helvetica-Bold')
            .fontSize(fontSize.body + 0.5)
            .fillColor(textColor)
            .text(title);

          const company = exp.company + (exp.location ? `, ${exp.location}` : '');
          const dates = [exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ');

          doc
            .font('Helvetica')
            .fontSize(fontSize.body)
            .fillColor(mutedColor)
            .text(`${company}  |  ${dates}`);

          doc.moveDown(0.25);

          const descriptions = exp.description || exp.highlights || [];
          for (const desc of descriptions) {
            doc
              .font('Helvetica')
              .fontSize(fontSize.body)
              .fillColor(textColor)
              .text(`${bullet}  ${cleanBullet(desc)}`, { indent: 8, lineGap: 1 });
          }
          doc.moveDown(0.6);
        }
        doc.moveDown(0.4);
      }

      // Education
      if (data.education.length > 0) {
        renderSection('Education');
        for (const edu of data.education) {
          doc
            .font('Helvetica-Bold')
            .fontSize(fontSize.body + 0.5)
            .fillColor(textColor)
            .text(edu.degree);

          const eduInfo = [edu.institution, edu.graduationDate].filter(Boolean).join('  |  ');
          if (eduInfo) {
            doc
              .font('Helvetica')
              .fontSize(fontSize.body)
              .fillColor(mutedColor)
              .text(eduInfo);
          }
          doc.moveDown(0.4);
        }
        doc.moveDown(0.4);
      }

      // Skills
      if (data.skills.length > 0) {
        renderSection('Skills');
        const normalizedSkills = normalizeSkills(data.skills);
        if (template.skillsStyle === 'pills') {
          doc.font('Helvetica').fontSize(fontSize.body - 1);
          let x = margins.left;
          let y = doc.y;
          for (const skill of normalizedSkills) {
            const width = doc.widthOfString(skill) + 14;
            if (x + width > margins.left + pageWidth) {
              x = margins.left;
              y += 20;
            }
            doc.roundedRect(x, y, width, 16, 8).fill(template.accentColor || '#f1f5f9');
            doc.fillColor(primaryColor).text(skill, x + 7, y + 3.5);
            x += width + 6;
          }
          doc.y = y + 28;
        } else {
          doc
            .font('Helvetica')
            .fontSize(fontSize.body)
            .fillColor(textColor)
            .text(data.skills.join('  •  '), { lineGap: 2 });
          doc.moveDown(0.8);
        }
      }

      // Projects
      if (data.projects && data.projects.length > 0) {
        renderSection('Projects');
        for (const proj of data.projects) {
          doc
            .font('Helvetica-Bold')
            .fontSize(fontSize.body + 0.5)
            .fillColor(textColor)
            .text(proj.name);

          if (proj.description) {
            doc
              .font('Helvetica')
              .fontSize(fontSize.body)
              .fillColor(mutedColor)
              .text(proj.description);
          }
          if (proj.technologies?.length) {
            doc
              .font('Helvetica-Oblique')
              .fontSize(fontSize.body - 1)
              .fillColor(primaryColor)
              .text(proj.technologies.join(', '));
          }
          doc.moveDown(0.4);
        }
      }

      // Certifications
      if (data.certifications && data.certifications.length > 0) {
        renderSection('Certifications');
        for (const cert of data.certifications) {
          doc
            .font('Helvetica')
            .fontSize(fontSize.body)
            .fillColor(textColor)
            .text(`${bullet}  ${getCertName(cert)}`);
        }
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// ============================================================================
// CENTERED LAYOUT (Classic, Elegant)
// ============================================================================

async function generateCenteredPDF(
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

      const { fontSize, primaryColor, margins } = template;
      const textColor = template.textColor || '#1a1a2e';
      const mutedColor = template.mutedColor || '#64748b';
      const bullet = BULLETS[template.bulletStyle];
      const pageWidth = doc.page.width - margins.left - margins.right;

      // Centered Header
      if (data.contact.name) {
        doc
          .font('Helvetica-Bold')
          .fontSize(fontSize.header)
          .fillColor(primaryColor)
          .text(data.contact.name.toUpperCase(), { align: 'center', characterSpacing: 2 });
      }

      // Decorative line
      const lineY = doc.y + 8;
      const centerX = doc.page.width / 2;
      doc
        .strokeColor(primaryColor)
        .lineWidth(1.5)
        .moveTo(centerX - 40, lineY)
        .lineTo(centerX + 40, lineY)
        .stroke();
      doc.y = lineY + 12;

      // Contact
      const contactParts = [data.contact.email, data.contact.phone, data.contact.location].filter(Boolean);
      if (contactParts.length > 0) {
        doc
          .font('Helvetica')
          .fontSize(fontSize.body)
          .fillColor(mutedColor)
          .text(contactParts.join('   •   '), { align: 'center' });
      }

      doc.moveDown(1.5);

      // Section renderer
      const renderSection = (title: string) => {
        doc
          .font('Helvetica')
          .fontSize(fontSize.subheader)
          .fillColor(primaryColor)
          .text(title.toUpperCase(), { characterSpacing: 1 });

        if (template.sectionStyle === 'dotted') {
          doc
            .strokeColor(primaryColor)
            .lineWidth(0.5)
            .dash(1.5, { space: 1.5 })
            .moveTo(margins.left, doc.y + 3)
            .lineTo(margins.left + 50, doc.y + 3)
            .stroke()
            .undash();
        } else {
          doc
            .strokeColor(primaryColor)
            .lineWidth(0.75)
            .moveTo(margins.left, doc.y + 3)
            .lineTo(margins.left + pageWidth, doc.y + 3)
            .stroke();
        }
        doc.moveDown(0.6);
      };

      // Summary
      if (data.summary) {
        renderSection('Profile');
        doc
          .font('Helvetica')
          .fontSize(fontSize.body)
          .fillColor(textColor)
          .text(data.summary, { align: 'justify', lineGap: 2 });
        doc.moveDown(1);
      }

      // Experience
      if (data.experience.length > 0) {
        renderSection('Experience');
        for (const exp of data.experience) {
          const title = exp.title || exp.position || 'Position';
          doc
            .font('Helvetica-Bold')
            .fontSize(fontSize.body + 0.5)
            .fillColor(textColor)
            .text(title);

          const info = [exp.company, exp.location].filter(Boolean).join(', ');
          const dates = [exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ');

          doc
            .font('Helvetica')
            .fontSize(fontSize.body)
            .fillColor(mutedColor)
            .text(`${info}  |  ${dates}`);

          doc.moveDown(0.25);
          const descriptions = exp.description || exp.highlights || [];
          for (const desc of descriptions) {
            doc
              .font('Helvetica')
              .fontSize(fontSize.body)
              .fillColor(textColor)
              .text(`${bullet}  ${cleanBullet(desc)}`, { indent: 12, lineGap: 1 });
          }
          doc.moveDown(0.6);
        }
      }

      // Education
      if (data.education.length > 0) {
        renderSection('Education');
        for (const edu of data.education) {
          doc
            .font('Helvetica-Bold')
            .fontSize(fontSize.body + 0.5)
            .fillColor(textColor)
            .text(edu.degree);

          const info = [edu.institution, edu.graduationDate].filter(Boolean).join('  |  ');
          doc
            .font('Helvetica')
            .fontSize(fontSize.body)
            .fillColor(mutedColor)
            .text(info);
          doc.moveDown(0.4);
        }
      }

      // Skills
      if (data.skills.length > 0) {
        renderSection('Skills');
        doc
          .font('Helvetica')
          .fontSize(fontSize.body)
          .fillColor(textColor)
          .text(data.skills.join('   •   '));
        doc.moveDown(0.8);
      }

      // Certifications
      if (data.certifications && data.certifications.length > 0) {
        renderSection('Certifications');
        for (const cert of data.certifications) {
          doc
            .font('Helvetica')
            .fontSize(fontSize.body)
            .fillColor(textColor)
            .text(`${bullet}  ${getCertName(cert)}`);
        }
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// ============================================================================
// BANNER LAYOUT (Executive, Bold)
// ============================================================================

async function generateBannerPDF(
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

      const { fontSize, primaryColor } = template;
      const textColor = template.textColor || '#1a1a2e';
      const mutedColor = template.mutedColor || '#64748b';
      const accentColor = template.accentColor || '#e8f4fc';
      const bullet = BULLETS[template.bulletStyle];
      const pageWidth = doc.page.width;

      // Header banner
      doc.rect(0, 0, pageWidth, 100).fill(primaryColor);

      // Name in banner
      if (data.contact.name) {
        doc
          .font('Helvetica-Bold')
          .fontSize(fontSize.header)
          .fillColor('#ffffff')
          .text(data.contact.name.toUpperCase(), 40, 32, { width: pageWidth - 80, characterSpacing: 1 });
      }

      // Contact in banner
      const contactParts = [data.contact.email, data.contact.phone, data.contact.location].filter(Boolean);
      if (contactParts.length > 0) {
        doc
          .font('Helvetica')
          .fontSize(fontSize.body)
          .fillColor('rgba(255,255,255,0.85)')
          .text(contactParts.join('   |   '), 40, 68, { width: pageWidth - 80 });
      }

      let y = 120;

      // Section renderer
      const renderSection = (title: string) => {
        if (template.sectionStyle === 'boxed') {
          doc.rect(40, y, 140, 22).fill(primaryColor);
          doc
            .font('Helvetica-Bold')
            .fontSize(11)
            .fillColor('#ffffff')
            .text(title.toUpperCase(), 50, y + 5, { characterSpacing: 0.5 });
          y += 32;
        } else {
          // Accent bar style
          doc.rect(40, y, 4, 18).fill(accentColor);
          doc
            .font('Helvetica-Bold')
            .fontSize(fontSize.subheader)
            .fillColor(primaryColor)
            .text(title.toUpperCase(), 52, y + 2, { characterSpacing: 0.5 });
          y += 28;
        }
      };

      // Summary
      if (data.summary) {
        // Summary box
        doc.rect(40, y, pageWidth - 80, 70).fill(accentColor);
        doc
          .font('Helvetica')
          .fontSize(fontSize.body)
          .fillColor(textColor)
          .text(data.summary, 52, y + 12, { width: pageWidth - 104, lineGap: 2 });
        y = Math.max(y + 80, doc.y + 20);
      }

      // Experience
      if (data.experience.length > 0) {
        renderSection('Experience');
        for (const exp of data.experience) {
          doc
            .font('Helvetica-Bold')
            .fontSize(fontSize.body + 1)
            .fillColor(textColor)
            .text(exp.title || exp.position || '', 40, y, { width: pageWidth - 80 });
          y = doc.y + 2;

          const info = [exp.company, exp.location].filter(Boolean).join(', ');
          const dates = [exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ');

          doc
            .font('Helvetica')
            .fontSize(fontSize.body)
            .fillColor(primaryColor)
            .text(`${info}  |  ${dates}`, 40, y);
          y = doc.y + 6;

          const descriptions = exp.description || exp.highlights || [];
          for (const desc of descriptions) {
            doc
              .font('Helvetica')
              .fontSize(fontSize.body)
              .fillColor(textColor)
              .text(`${bullet}  ${cleanBullet(desc)}`, 52, y, { width: pageWidth - 100, lineGap: 1 });
            y = doc.y + 3;
          }
          y += 10;
        }
      }

      // Skills
      if (data.skills.length > 0) {
        renderSection('Skills');
        const normalizedSkills2 = normalizeSkills(data.skills);
        if (template.skillsStyle === 'grid') {
          const cols = 3;
          const colWidth = (pageWidth - 100) / cols;
          let col = 0;
          let startY = y;
          for (const skill of normalizedSkills2) {
            doc
              .font('Helvetica')
              .fontSize(fontSize.body)
              .fillColor(textColor)
              .text(`•  ${skill}`, 50 + col * colWidth, y, { width: colWidth - 10 });
            col++;
            if (col >= cols) {
              col = 0;
              y = doc.y + 3;
            }
          }
          y = Math.max(y, doc.y) + 20;
        } else if (template.skillsStyle === 'pills') {
          doc.font('Helvetica').fontSize(fontSize.body - 1);
          let x = 40;
          let pillY = y;
          for (const skill of normalizedSkills2) {
            const width = doc.widthOfString(skill) + 16;
            if (x + width > pageWidth - 40) {
              x = 40;
              pillY += 22;
            }
            doc.roundedRect(x, pillY, width, 18, 9).fill(primaryColor);
            doc.fillColor('#ffffff').text(skill, x + 8, pillY + 4);
            x += width + 8;
          }
          y = pillY + 32;
        } else {
          doc
            .font('Helvetica')
            .fontSize(fontSize.body)
            .fillColor(textColor)
            .text(data.skills.join('  •  '), 40, y, { width: pageWidth - 80 });
          y = doc.y + 20;
        }
      }

      // Education
      if (data.education.length > 0) {
        renderSection('Education');
        for (const edu of data.education) {
          doc
            .font('Helvetica-Bold')
            .fontSize(fontSize.body)
            .fillColor(textColor)
            .text(edu.degree, 40, y);
          y = doc.y + 2;

          const info = [edu.institution, edu.graduationDate].filter(Boolean).join('  |  ');
          doc
            .font('Helvetica')
            .fontSize(fontSize.body)
            .fillColor(mutedColor)
            .text(info, 40, y);
          y = doc.y + 10;
        }
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// ============================================================================
// SIDEBAR LEFT LAYOUT (Modern two-column)
// ============================================================================

async function generateSidebarLeftPDF(
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

      const { fontSize, primaryColor, secondaryColor } = template;
      const textColor = template.textColor || '#1a1a2e';
      const mutedColor = template.mutedColor || '#64748b';
      const sidebarWidth = (doc.page.width * (template.sidebarWidth || 32)) / 100;
      const mainWidth = doc.page.width - sidebarWidth;
      const bullet = BULLETS[template.bulletStyle];

      // Sidebar background
      doc.rect(0, 0, sidebarWidth, doc.page.height).fill(secondaryColor || primaryColor);

      // Accent stripe
      doc.rect(0, 0, sidebarWidth, 6).fill(primaryColor);

      let sideY = 30;

      // Name in sidebar
      if (data.contact.name) {
        doc
          .font('Helvetica-Bold')
          .fontSize(fontSize.header - 4)
          .fillColor('#ffffff')
          .text(data.contact.name, 18, sideY, { width: sidebarWidth - 36 });
        sideY = doc.y + 18;
      }

      // Contact section
      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor(primaryColor)
        .text('CONTACT', 18, sideY);
      sideY = doc.y + 8;

      doc.font('Helvetica').fontSize(8.5).fillColor('rgba(255,255,255,0.85)');

      if (data.contact.email) {
        doc.text(data.contact.email, 18, sideY, { width: sidebarWidth - 36 });
        sideY = doc.y + 4;
      }
      if (data.contact.phone) {
        doc.text(data.contact.phone, 18, sideY, { width: sidebarWidth - 36 });
        sideY = doc.y + 4;
      }
      if (data.contact.location) {
        doc.text(data.contact.location, 18, sideY, { width: sidebarWidth - 36 });
        sideY = doc.y + 4;
      }
      if (data.contact.linkedin) {
        doc.text(data.contact.linkedin.replace('https://', ''), 18, sideY, { width: sidebarWidth - 36 });
        sideY = doc.y + 4;
      }
      sideY += 16;

      // Skills in sidebar
      if (data.skills.length > 0) {
        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor(primaryColor)
          .text('SKILLS', 18, sideY);
        sideY = doc.y + 10;

        const normalizedSkills3 = normalizeSkills(data.skills);
        if (template.skillsStyle === 'pills') {
          doc.font('Helvetica').fontSize(8);
          let x = 18;
          let pillY = sideY;
          for (const skill of normalizedSkills3) {
            const width = doc.widthOfString(skill) + 12;
            if (x + width > sidebarWidth - 18) {
              x = 18;
              pillY += 18;
            }
            doc.roundedRect(x, pillY, width, 14, 7).fill('rgba(255,255,255,0.2)');
            doc.fillColor('#ffffff').text(skill, x + 6, pillY + 3);
            x += width + 6;
          }
          sideY = pillY + 28;
        } else {
          doc.font('Helvetica').fontSize(8.5);
          for (const skill of normalizedSkills3) {
            doc.fillColor('rgba(255,255,255,0.85)').text(`•  ${skill}`, 18, sideY, { width: sidebarWidth - 36 });
            sideY = doc.y + 3;
          }
          sideY += 12;
        }
      }

      // Education in sidebar
      if (data.education.length > 0) {
        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor(primaryColor)
          .text('EDUCATION', 18, sideY);
        sideY = doc.y + 8;

        for (const edu of data.education) {
          doc
            .font('Helvetica-Bold')
            .fontSize(8.5)
            .fillColor('#ffffff')
            .text(edu.degree, 18, sideY, { width: sidebarWidth - 36 });
          sideY = doc.y + 2;

          if (edu.institution) {
            doc
              .font('Helvetica')
              .fontSize(8)
              .fillColor('rgba(255,255,255,0.75)')
              .text(edu.institution, 18, sideY, { width: sidebarWidth - 36 });
            sideY = doc.y + 2;
          }
          if (edu.graduationDate) {
            doc
              .font('Helvetica')
              .fontSize(7.5)
              .fillColor('rgba(255,255,255,0.6)')
              .text(edu.graduationDate, 18, sideY);
            sideY = doc.y + 10;
          }
        }
      }

      // Main content
      let mainY = 30;
      const mainX = sidebarWidth + 28;
      const contentWidth = mainWidth - 56;

      // Summary
      if (data.summary) {
        doc
          .font('Helvetica-Bold')
          .fontSize(fontSize.subheader)
          .fillColor(primaryColor)
          .text('ABOUT', mainX, mainY);
        mainY = doc.y + 8;

        doc
          .font('Helvetica')
          .fontSize(fontSize.body)
          .fillColor(textColor)
          .text(data.summary, mainX, mainY, { width: contentWidth, lineGap: 2 });
        mainY = doc.y + 20;
      }

      // Experience
      if (data.experience.length > 0) {
        doc
          .font('Helvetica-Bold')
          .fontSize(fontSize.subheader)
          .fillColor(primaryColor)
          .text('EXPERIENCE', mainX, mainY);
        mainY = doc.y + 10;

        for (const exp of data.experience) {
          doc
            .font('Helvetica-Bold')
            .fontSize(fontSize.body + 0.5)
            .fillColor(textColor)
            .text(exp.title || exp.position || '', mainX, mainY, { width: contentWidth });
          mainY = doc.y + 2;

          const info = [exp.company, exp.location].filter(Boolean).join(' • ');
          const dates = [exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ');

          doc
            .font('Helvetica')
            .fontSize(fontSize.body - 0.5)
            .fillColor(primaryColor)
            .text(`${info}  |  ${dates}`, mainX, mainY, { width: contentWidth });
          mainY = doc.y + 6;

          const descriptions = exp.description || exp.highlights || [];
          for (const desc of descriptions) {
            doc
              .font('Helvetica')
              .fontSize(fontSize.body)
              .fillColor(mutedColor)
              .text(`${bullet}  ${cleanBullet(desc)}`, mainX + 8, mainY, { width: contentWidth - 8, lineGap: 1 });
            mainY = doc.y + 3;
          }
          mainY += 10;
        }
      }

      // Projects
      if (data.projects && data.projects.length > 0) {
        doc
          .font('Helvetica-Bold')
          .fontSize(fontSize.subheader)
          .fillColor(primaryColor)
          .text('PROJECTS', mainX, mainY);
        mainY = doc.y + 10;

        for (const proj of data.projects) {
          doc
            .font('Helvetica-Bold')
            .fontSize(fontSize.body)
            .fillColor(textColor)
            .text(proj.name, mainX, mainY, { width: contentWidth });
          mainY = doc.y + 2;

          if (proj.description) {
            doc
              .font('Helvetica')
              .fontSize(fontSize.body - 0.5)
              .fillColor(mutedColor)
              .text(proj.description, mainX, mainY, { width: contentWidth });
            mainY = doc.y + 3;
          }
          if (proj.technologies?.length) {
            doc
              .font('Helvetica-Oblique')
              .fontSize(fontSize.body - 1)
              .fillColor(primaryColor)
              .text(proj.technologies.join(' • '), mainX, mainY, { width: contentWidth });
            mainY = doc.y + 10;
          }
        }
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// ============================================================================
// SIDEBAR RIGHT LAYOUT
// ============================================================================

async function generateSidebarRightPDF(
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

      const { fontSize, primaryColor } = template;
      const textColor = template.textColor || '#1a1a2e';
      const mutedColor = template.mutedColor || '#64748b';
      const accentColor = template.accentColor || '#f8fafc';
      const sidebarWidth = (doc.page.width * (template.sidebarWidth || 30)) / 100;
      const mainWidth = doc.page.width - sidebarWidth;
      const bullet = BULLETS[template.bulletStyle];

      // Right sidebar background
      doc.rect(mainWidth, 0, sidebarWidth, doc.page.height).fill(accentColor);
      // Accent stripe
      doc.rect(mainWidth, 0, 3, doc.page.height).fill(primaryColor);

      // Main content (left)
      let mainY = 36;
      const mainX = 36;
      const contentWidth = mainWidth - 72;

      // Name
      if (data.contact.name) {
        doc
          .font('Helvetica-Bold')
          .fontSize(fontSize.header)
          .fillColor(primaryColor)
          .text(data.contact.name, mainX, mainY, { width: contentWidth });
        mainY = doc.y + 4;
      }

      // Contact line
      const contactParts = [data.contact.email, data.contact.phone].filter(Boolean);
      if (contactParts.length > 0) {
        doc
          .font('Helvetica')
          .fontSize(fontSize.body)
          .fillColor(mutedColor)
          .text(contactParts.join('  |  '), mainX, mainY);
        mainY = doc.y + 18;
      }

      // Summary
      if (data.summary) {
        doc
          .font('Helvetica-Bold')
          .fontSize(fontSize.subheader)
          .fillColor(primaryColor)
          .text('PROFILE', mainX, mainY);
        mainY = doc.y + 8;

        doc
          .font('Helvetica')
          .fontSize(fontSize.body)
          .fillColor(textColor)
          .text(data.summary, mainX, mainY, { width: contentWidth, lineGap: 2 });
        mainY = doc.y + 18;
      }

      // Experience
      if (data.experience.length > 0) {
        doc
          .font('Helvetica-Bold')
          .fontSize(fontSize.subheader)
          .fillColor(primaryColor)
          .text('EXPERIENCE', mainX, mainY);
        mainY = doc.y + 10;

        for (const exp of data.experience) {
          doc
            .font('Helvetica-Bold')
            .fontSize(fontSize.body + 0.5)
            .fillColor(textColor)
            .text(exp.title || exp.position || '', mainX, mainY, { width: contentWidth });
          mainY = doc.y + 2;

          const info = [exp.company, exp.location].filter(Boolean).join(', ');
          const dates = [exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ');

          doc
            .font('Helvetica')
            .fontSize(fontSize.body - 0.5)
            .fillColor(primaryColor)
            .text(`${info}  |  ${dates}`, mainX, mainY);
          mainY = doc.y + 5;

          const descriptions = exp.description || exp.highlights || [];
          for (const desc of descriptions) {
            doc
              .font('Helvetica')
              .fontSize(fontSize.body)
              .fillColor(textColor)
              .text(`${bullet}  ${cleanBullet(desc)}`, mainX + 8, mainY, { width: contentWidth - 8, lineGap: 1 });
            mainY = doc.y + 3;
          }
          mainY += 10;
        }
      }

      // Projects
      if (data.projects && data.projects.length > 0) {
        doc
          .font('Helvetica-Bold')
          .fontSize(fontSize.subheader)
          .fillColor(primaryColor)
          .text('PROJECTS', mainX, mainY);
        mainY = doc.y + 10;

        for (const proj of data.projects) {
          doc
            .font('Helvetica-Bold')
            .fontSize(fontSize.body)
            .fillColor(textColor)
            .text(proj.name, mainX, mainY, { width: contentWidth });
          mainY = doc.y + 2;

          if (proj.description) {
            doc
              .font('Helvetica')
              .fontSize(fontSize.body)
              .fillColor(mutedColor)
              .text(proj.description, mainX, mainY, { width: contentWidth });
            mainY = doc.y + 3;
          }
          mainY += 8;
        }
      }

      // Sidebar content (right)
      let sideY = 36;
      const sideX = mainWidth + 16;
      const sideWidth = sidebarWidth - 32;

      // Location
      if (data.contact.location) {
        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor(primaryColor)
          .text('LOCATION', sideX, sideY);
        sideY = doc.y + 5;

        doc
          .font('Helvetica')
          .fontSize(8.5)
          .fillColor(textColor)
          .text(data.contact.location, sideX, sideY, { width: sideWidth });
        sideY = doc.y + 16;
      }

      // Links
      if (data.contact.linkedin || data.contact.github) {
        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor(primaryColor)
          .text('LINKS', sideX, sideY);
        sideY = doc.y + 5;

        doc.font('Helvetica').fontSize(8).fillColor(mutedColor);
        if (data.contact.linkedin) {
          doc.text(data.contact.linkedin.replace('https://', ''), sideX, sideY, { width: sideWidth });
          sideY = doc.y + 3;
        }
        if (data.contact.github) {
          doc.text(data.contact.github.replace('https://', ''), sideX, sideY, { width: sideWidth });
          sideY = doc.y + 3;
        }
        sideY += 12;
      }

      // Skills
      if (data.skills.length > 0) {
        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor(primaryColor)
          .text('SKILLS', sideX, sideY);
        sideY = doc.y + 8;

        const normalizedSkills4 = normalizeSkills(data.skills);
        doc.font('Helvetica').fontSize(8.5);
        for (const skill of normalizedSkills4) {
          doc.fillColor(textColor).text(`•  ${skill}`, sideX, sideY, { width: sideWidth });
          sideY = doc.y + 3;
        }
        sideY += 12;
      }

      // Education
      if (data.education.length > 0) {
        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor(primaryColor)
          .text('EDUCATION', sideX, sideY);
        sideY = doc.y + 8;

        for (const edu of data.education) {
          doc
            .font('Helvetica-Bold')
            .fontSize(8.5)
            .fillColor(textColor)
            .text(edu.degree, sideX, sideY, { width: sideWidth });
          sideY = doc.y + 2;

          if (edu.institution) {
            doc
              .font('Helvetica')
              .fontSize(8)
              .fillColor(mutedColor)
              .text(edu.institution, sideX, sideY, { width: sideWidth });
            sideY = doc.y + 2;
          }
          if (edu.graduationDate) {
            doc.text(edu.graduationDate, sideX, sideY);
            sideY = doc.y + 10;
          }
        }
      }

      // Certifications
      if (data.certifications && data.certifications.length > 0) {
        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor(primaryColor)
          .text('CERTIFICATIONS', sideX, sideY);
        sideY = doc.y + 8;

        doc.font('Helvetica').fontSize(8);
        for (const cert of data.certifications) {
          doc.fillColor(textColor).text(`•  ${getCertName(cert)}`, sideX, sideY, { width: sideWidth });
          sideY = doc.y + 3;
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
        spacing: { after: 200 },
      })
    );
  }

  // Section header helper
  const addSectionHeader = (title: string) => {
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
        border: {
          bottom: {
            color: primaryColorHex,
            size: 8,
            style: BorderStyle.SINGLE,
          },
        },
      })
    );
  };

  // Summary
  if (data.summary) {
    addSectionHeader('Summary');
    children.push(
      new Paragraph({
        children: [new TextRun({ text: data.summary, size: 22 })],
        spacing: { after: 200 },
      })
    );
  }

  // Experience
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
      const descList = exp.description || exp.highlights || [];
      for (const desc of descList) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: `• ${cleanBullet(desc)}`, size: 22 })],
            indent: { left: 200 },
            spacing: { after: 40 },
          })
        );
      }
    }
  }

  // Education
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

  // Skills
  if (data.skills.length > 0) {
    addSectionHeader('Skills');
    children.push(
      new Paragraph({
        children: [new TextRun({ text: data.skills.join('  •  '), size: 22 })],
        spacing: { after: 200 },
      })
    );
  }

  // Certifications
  if (data.certifications && data.certifications.length > 0) {
    addSectionHeader('Certifications');
    for (const cert of data.certifications) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `• ${getCertName(cert)}`, size: 22 })],
          spacing: { after: 40 },
        })
      );
    }
  }

  // Projects
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

  // Languages
  if (data.languages && data.languages.length > 0) {
    addSectionHeader('Languages');
    children.push(
      new Paragraph({
        children: [new TextRun({ text: data.languages.join('  •  '), size: 22 })],
        spacing: { after: 200 },
      })
    );
  }

  // Awards
  if (data.awards && data.awards.length > 0) {
    addSectionHeader('Awards & Honors');
    for (const award of data.awards) {
      const awardText = typeof award === 'string' ? award : award.name;
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `• ${cleanBullet(awardText)}`, size: 22 })],
          spacing: { after: 40 },
        })
      );
    }
  }

  // Volunteer Work
  if (data.volunteerWork && data.volunteerWork.length > 0) {
    addSectionHeader('Volunteer Work');
    for (const vol of data.volunteerWork) {
      // Handle both string and object formats
      if (typeof vol === 'string') {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: `• ${cleanBullet(vol)}`, size: 22 })],
            spacing: { after: 40 },
          })
        );
      } else {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: vol.role, bold: true, size: 24 })],
            spacing: { before: 100 },
          })
        );
        const volLine = [vol.organization, vol.location].filter(Boolean).join(', ');
        const dates = [vol.startDate, vol.current ? 'Present' : vol.endDate].filter(Boolean).join(' – ');
        if (volLine || dates) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: `${volLine}${volLine && dates ? '  |  ' : ''}${dates}`, size: 20, color: '555555' })],
              spacing: { after: 50 },
            })
          );
        }
        const descList = vol.description || [];
        for (const desc of descList) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: `• ${cleanBullet(desc)}`, size: 22 })],
              indent: { left: 200 },
              spacing: { after: 40 },
            })
          );
        }
      }
    }
  }

  const doc = new Document({
    sections: [{ children }],
  });

  return Packer.toBuffer(doc);
}

/**
 * Generate DOCX using template-specific generators (Module 4 - React DOCX)
 * Falls back to legacy generateDOCX if template doesn't have a custom generator
 */
export async function generateDOCXEnhanced(
  data: ParsedResumeData,
  templateId: string,
  template?: ExtendedTemplateConfig
): Promise<Buffer> {
  // Use legacy DOCX generation (template-specific generators removed)
  const templateConfig = template || getTemplateConfig(templateId);
  return generateDOCX(data, templateConfig);
}

// ============================================================================
// TEMPLATE REGISTRY INTEGRATION (Module 6)
// ============================================================================

/**
 * Generate PDF using template from registry
 * Loads template dynamically and uses React template if available
 */
export async function generatePDFFromRegistry(
  data: ParsedResumeData,
  templateId: string
): Promise<Buffer> {
  // Use HTML-to-PDF approach (same as preview) for consistency
  const { generateTemplateHTML } = await import('./template-html-generator');
  const { incrementTemplateUsage } = await import('./template-registry');
  const puppeteer = await import('puppeteer');

  // Increment usage count
  await incrementTemplateUsage(templateId);

  // Generate HTML using the same method as preview
  const html = await generateTemplateHTML(templateId, data);

  // Convert HTML to PDF using Puppeteer
  console.log(`Starting PDF generation for template: ${templateId}`);
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // Set viewport for A4 size
    await page.setViewport({
      width: 794, // A4 width in pixels at 96 DPI
      height: 1123, // A4 height in pixels at 96 DPI
      deviceScaleFactor: 2,
    });

    // Set HTML content
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Generate PDF
    const pdfData = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: true,
    });

    // Ensure it's a proper Buffer (Puppeteer returns Uint8Array)
    const pdfBuffer = Buffer.from(pdfData);
    console.log(`PDF generated successfully, size: ${pdfBuffer.length} bytes`);
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

// ============================================================================
// DOCX TEMPLATE-AWARE GENERATION HELPERS
// ============================================================================

/** Strip `#` from a CSS hex color for use in docx color fields */
const hex = (c: string) => c.replace('#', '');

/** Blend a hex color with white at the given opacity (0–1) to produce a tint */
function blendWithWhite(color: string, opacity: number): string {
  const c = color.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const rr = Math.round(r * opacity + 255 * (1 - opacity));
  const gg = Math.round(g * opacity + 255 * (1 - opacity));
  const bb = Math.round(b * opacity + 255 * (1 - opacity));
  return [rr, gg, bb].map(x => x.toString(16).padStart(2, '0')).join('');
}

interface DocxPalette {
  primary: string;
  secondary: string;
  text: string;
  muted: string;
  font: string;
}

/** Shared no-border object used in tables */
const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: 'auto' } as const;

/**
 * Maps template config → Word-compatible font matching the HTML layout font.
 */
function toWordFont(tplConfig: { layoutType?: string; headerStyle?: string; fontFamily?: string }): string {
  const lt = tplConfig.layoutType || '';
  if (lt === 'academic') return 'Garamond';
  if (lt === 'classic' || lt === 'executive' || lt === 'ruled-elegant' || lt === 'bordered-page') return 'Georgia';
  if (lt === 'bold-modern') return 'Arial';
  if (lt === 'contemporary' || lt === 'compact' || lt === 'infographic' || lt === 'portfolio' || lt === 'split-panel' || lt === 'column-split') return 'Calibri';
  if (lt === 'professional' || lt === 'top-accent') return 'Arial';
  if (lt === 'tech') return 'Calibri';
  if (tplConfig.headerStyle === 'centered') return 'Georgia';
  if (tplConfig.headerStyle === 'banner') return 'Calibri';
  const f = tplConfig.fontFamily || '';
  if (f.includes('Times') || f.includes('Garamond')) return 'Times New Roman';
  if (f.includes('Georgia')) return 'Georgia';
  if (f.includes('Courier')) return 'Courier New';
  return 'Calibri';
}

/**
 * Maps template config → specific builder key that matches a layout component.
 * Falls back to derived headerStyle/sectionStyle when layoutType is generic.
 */
function docxBuilderKey(tplConfig: {
  layoutType?: string;
  hasSidebar?: boolean;
  headerStyle?: string;
  sectionStyle?: string;
  fontFamily?: string;
}): string {
  const lt = tplConfig.layoutType || '';
  if (lt && lt !== 'single-standard') {
    if (lt === 'two-sidebar')   return 'sidebar';
    if (lt === 'academic')      return 'academic';
    if (lt === 'bold-modern')   return 'bold_modern';
    if (lt === 'contemporary')  return 'contemporary';
    if (lt === 'executive')     return 'executive';
    if (lt === 'minimal')       return 'minimal';
    if (lt === 'compact')       return 'compact';
    if (lt === 'timeline')      return 'timeline';
    if (lt === 'professional')  return 'professional';
    if (lt === 'tech')          return 'tech';
    if (lt === 'infographic')   return 'infographic';
    if (lt === 'portfolio')     return 'portfolio';
    if (lt === 'split-panel')   return 'sidebar';
    if (lt === 'column-split')  return 'sidebar';
    if (lt === 'ruled-elegant') return 'classic';
    if (lt === 'top-accent')    return 'professional';
    if (lt === 'bordered-page') return 'classic';
  }
  // Fallback via derived style properties
  if (tplConfig.hasSidebar || tplConfig.headerStyle === 'split') return 'sidebar';
  if (tplConfig.sectionStyle === 'highlighted')  return 'bold_modern';
  if (tplConfig.sectionStyle === 'accent-bar' || tplConfig.headerStyle === 'banner') return 'contemporary';
  if (tplConfig.headerStyle === 'centered') {
    const f = tplConfig.fontFamily || '';
    return f.includes('Garamond') ? 'academic' : 'classic';
  }
  return 'default';
}

// ============================================================================
// SHARED CONTENT HELPERS (palette-aware, template-agnostic)
// ============================================================================

type TitleStyle = {
  align?: 'left' | 'center';
  uppercase?: boolean;
  color?: string;
  border?: 'bottom' | 'bottom_thick' | 'bottom_double' | 'left' | 'none';
  borderColor?: string;
  font?: string;
  bold?: boolean;
};

function makeSectionTitle(text: string, s: TitleStyle): Paragraph {
  const label = (s.uppercase ?? true) ? text.toUpperCase() : text;
  const color = s.color ?? '2563EB';
  const bc = s.borderColor ?? color;
  const border =
    s.border === 'bottom'        ? { bottom: { style: BorderStyle.SINGLE, size: 4,  color: bc } } :
    s.border === 'bottom_thick'  ? { bottom: { style: BorderStyle.SINGLE, size: 10, color: bc } } :
    s.border === 'bottom_double' ? { bottom: { style: BorderStyle.DOUBLE, size: 6,  color: bc } } :
    s.border === 'left'          ? { left:   { style: BorderStyle.SINGLE, size: 28, color: bc } } :
    {};
  return new Paragraph({
    children: [new TextRun({ text: label, bold: s.bold ?? true, color, size: 22, font: s.font })],
    alignment: s.align === 'center' ? AlignmentType.CENTER : AlignmentType.LEFT,
    border,
    spacing: { before: 300, after: 120 },
    indent: s.border === 'left' ? { left: 160 } : undefined,
  });
}

function makeExpBlock(exp: any, bullet: string, palette: DocxPalette): Paragraph[] {
  const paras: Paragraph[] = [
    new Paragraph({
      children: [
        new TextRun({ text: exp.title || '', bold: true, color: hex(palette.text), size: 22, font: palette.font }),
        ...(exp.company ? [new TextRun({ text: ` — ${exp.company}`, bold: true, color: hex(palette.text), size: 22, font: palette.font })] : []),
      ],
      spacing: { before: 160, after: 40 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `${exp.startDate || ''} – ${exp.current ? 'Present' : exp.endDate || ''}`, italics: true, color: hex(palette.muted), size: 20, font: palette.font }),
        ...(exp.location ? [new TextRun({ text: `  |  ${exp.location}`, color: hex(palette.muted), size: 20, font: palette.font })] : []),
      ],
      spacing: { after: 80 },
    }),
  ];
  if (exp.description && Array.isArray(exp.description)) {
    exp.description.forEach((b: string) =>
      paras.push(new Paragraph({ text: `${bullet} ${cleanBullet(b)}`, spacing: { after: 50 }, indent: { left: 200 } }))
    );
  }
  paras.push(new Paragraph({ text: '', spacing: { after: 120 } }));
  return paras;
}

function makeEduBlock(edu: any, palette: DocxPalette): Paragraph[] {
  return [
    new Paragraph({
      children: [
        new TextRun({ text: edu.degree || '', bold: true, color: hex(palette.text), size: 22, font: palette.font }),
        ...(edu.institution ? [new TextRun({ text: ` — ${edu.institution}`, color: hex(palette.text), size: 22, font: palette.font })] : []),
      ],
      spacing: { before: 120, after: 40 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: edu.graduationDate || '', italics: true, color: hex(palette.muted), size: 20, font: palette.font }),
        ...(edu.gpa ? [new TextRun({ text: `  |  GPA: ${edu.gpa}`, color: hex(palette.muted), size: 20, font: palette.font })] : []),
      ],
      spacing: { after: 120 },
    }),
  ];
}

function makeSkillsLine(skills: any[], palette: DocxPalette, sep = '•'): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: normalizeSkills(skills).join(`  ${sep}  `), size: 22, font: palette.font })],
    spacing: { after: 160 },
  });
}

function makeOptionalSections(data: ParsedResumeData, ts: TitleStyle, bullet: string, palette: DocxPalette): Paragraph[] {
  const out: Paragraph[] = [];

  if (data.certifications?.length) {
    out.push(makeSectionTitle('Certifications', ts));
    data.certifications.forEach((c: any) => {
      const name = typeof c === 'string' ? c : c.name || '';
      const date = typeof c === 'object' && c.date ? ` (${c.date})` : '';
      out.push(new Paragraph({ text: `${bullet} ${cleanBullet(name)}${date}`, spacing: { after: 60 } }));
    });
    out.push(new Paragraph({ text: '', spacing: { after: 120 } }));
  }
  if (data.languages?.length) {
    out.push(makeSectionTitle('Languages', ts));
    out.push(new Paragraph({ text: (data.languages as string[]).join('  •  '), spacing: { after: 160 } }));
  }
  if (data.awards?.length) {
    out.push(makeSectionTitle('Awards & Honors', ts));
    data.awards.forEach((a: any) => {
      const name = typeof a === 'string' ? a : a.name || '';
      const date = typeof a === 'object' && a.date ? ` (${a.date})` : '';
      out.push(new Paragraph({ text: `${bullet} ${cleanBullet(name)}${date}`, spacing: { after: 60 } }));
    });
    out.push(new Paragraph({ text: '', spacing: { after: 120 } }));
  }
  if (data.volunteerWork?.length) {
    out.push(makeSectionTitle('Volunteer Work', ts));
    data.volunteerWork.forEach((v: any) => {
      if (typeof v === 'string') {
        out.push(new Paragraph({ text: `${bullet} ${v}`, spacing: { after: 60 } }));
      } else {
        out.push(
          new Paragraph({
            children: [
              new TextRun({ text: v.role || '', bold: true, font: palette.font }),
              new TextRun({ text: v.organization ? ` — ${v.organization}` : '', bold: true, font: palette.font }),
            ],
            spacing: { before: 120, after: 40 },
          }),
          new Paragraph({
            children: [new TextRun({
              text: v.period || `${v.startDate || ''}${v.endDate ? ` – ${v.endDate}` : v.current ? ' – Present' : ''}`,
              italics: true, color: hex(palette.muted), font: palette.font,
            })],
            spacing: { after: 40 },
          }),
        );
        if (v.description?.length) {
          v.description.forEach((b: string) =>
            out.push(new Paragraph({ text: `${bullet} ${cleanBullet(b)}`, spacing: { after: 40 } }))
          );
        }
        out.push(new Paragraph({ text: '', spacing: { after: 100 } }));
      }
    });
  }
  if (data.projects?.length) {
    out.push(makeSectionTitle('Projects', ts));
    data.projects.forEach((p: any) => {
      out.push(new Paragraph({
        children: [new TextRun({ text: p.name || '', bold: true, color: hex(palette.text), font: palette.font })],
        spacing: { before: 120, after: 40 },
      }));
      if (p.description) out.push(new Paragraph({ text: p.description, spacing: { after: 40 } }));
      if (p.technologies?.length) out.push(new Paragraph({
        children: [
          new TextRun({ text: 'Technologies: ', italics: true, font: palette.font }),
          new TextRun({ text: p.technologies.join(', '), font: palette.font }),
        ],
        spacing: { after: 40 },
      }));
      if (p.url) out.push(new Paragraph({ text: p.url, spacing: { after: 80 } }));
    });
    out.push(new Paragraph({ text: '', spacing: { after: 120 } }));
  }
  return out;
}

// ============================================================================
// PER-TEMPLATE DOCX BUILDERS
// ============================================================================

/**
 * Classic — Georgia serif, centered uppercase name, thin gray decorative rule,
 * non-uppercase section titles with thin primary-color bottom border.
 */
function buildClassicDocx(data: ParsedResumeData, p: DocxPalette): Paragraph[] {
  const ts: TitleStyle = { uppercase: false, color: hex(p.primary), border: 'bottom', font: p.font };
  const out: Paragraph[] = [];

  out.push(new Paragraph({
    children: [new TextRun({ text: (data.contact?.name || 'Resume').toUpperCase(), bold: true, color: hex(p.text), size: 56, font: p.font })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
  }));
  if (data.contact) {
    const parts = [data.contact.email, data.contact.phone, data.contact.location, data.contact.linkedin].filter(Boolean) as string[];
    if (parts.length) out.push(new Paragraph({
      children: [new TextRun({ text: parts.join(' · '), color: hex(p.muted), size: 20, font: p.font })],
      alignment: AlignmentType.CENTER, spacing: { after: 80 },
    }));
  }
  // Thin gray decorative rule
  out.push(new Paragraph({
    children: [new TextRun({ text: '', size: 2 })],
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: 'BBBBBB' } },
    spacing: { before: 0, after: 280 },
  }));

  if (data.summary) { out.push(makeSectionTitle('Professional Summary', ts)); out.push(new Paragraph({ text: data.summary, spacing: { after: 240 } })); }
  if (data.experience?.length) { out.push(makeSectionTitle('Experience', ts)); data.experience.forEach((e: any) => out.push(...makeExpBlock(e, '–', p))); }
  if (data.education?.length) { out.push(makeSectionTitle('Education', ts)); data.education.forEach((e: any) => out.push(...makeEduBlock(e, p))); }
  if (data.skills?.length) { out.push(makeSectionTitle('Skills', ts)); out.push(makeSkillsLine(data.skills, p)); }
  out.push(...makeOptionalSections(data, ts, '–', p));
  return out;
}

/**
 * Academic — Garamond serif, centered non-uppercase name, generous spacing,
 * centered uppercase section titles with 2px primary-color bottom border.
 */
function buildAcademicDocx(data: ParsedResumeData, p: DocxPalette): Paragraph[] {
  const ts: TitleStyle = { align: 'center', uppercase: true, color: hex(p.primary), border: 'bottom', font: p.font };
  const out: Paragraph[] = [];

  out.push(new Paragraph({
    children: [new TextRun({ text: data.contact?.name || 'Resume', bold: true, color: hex(p.primary), size: 60, font: p.font })],
    alignment: AlignmentType.CENTER, spacing: { after: 80 },
  }));
  if (data.contact) {
    const parts = [data.contact.email, data.contact.phone, data.contact.location, data.contact.linkedin].filter(Boolean) as string[];
    if (parts.length) out.push(new Paragraph({
      children: [new TextRun({ text: parts.join(' · '), color: hex(p.muted), size: 20, font: p.font })],
      alignment: AlignmentType.CENTER, spacing: { after: 80 },
    }));
  }
  out.push(new Paragraph({
    children: [new TextRun({ text: '', size: 2 })],
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: hex(p.muted) } },
    spacing: { before: 0, after: 400 },
  }));

  if (data.summary) { out.push(makeSectionTitle('Professional Summary', ts)); out.push(new Paragraph({ text: data.summary, spacing: { after: 320 } })); }
  if (data.experience?.length) { out.push(makeSectionTitle('Experience', ts)); data.experience.forEach((e: any) => out.push(...makeExpBlock(e, '•', p))); }
  if (data.education?.length) { out.push(makeSectionTitle('Education', ts)); data.education.forEach((e: any) => out.push(...makeEduBlock(e, p))); }
  if (data.skills?.length) { out.push(makeSectionTitle('Skills', ts)); out.push(makeSkillsLine(data.skills, p)); }
  out.push(...makeOptionalSections(data, ts, '•', p));
  return out;
}

/**
 * Bold Modern — Arial Black, name in primaryColor with thick 3px bottom border,
 * UPPERCASE large name, section titles with bottom border line, ▸ bullets.
 * Matches BoldModernLayout.tsx (no colored banner — just 3px bottom border).
 */
function buildBoldModernDocx(data: ParsedResumeData, p: DocxPalette): Paragraph[] {
  const ts: TitleStyle = { uppercase: true, color: hex(p.primary), border: 'bottom_thick', font: p.font };
  const out: Paragraph[] = [];

  // Name: UPPERCASE, primaryColor, large, thick bottom border (3px ≈ size 24)
  out.push(new Paragraph({
    children: [new TextRun({ text: (data.contact?.name || 'Resume').toUpperCase(), bold: true, color: hex(p.primary), size: 72, font: p.font })],
    border: { bottom: { style: BorderStyle.SINGLE, size: 24, color: hex(p.primary) } },
    spacing: { before: 80, after: 120 },
  }));
  if (data.contact) {
    const parts = [data.contact.email, data.contact.phone, data.contact.location, data.contact.linkedin].filter(Boolean) as string[];
    if (parts.length) out.push(new Paragraph({
      children: [new TextRun({ text: parts.join('  ·  '), color: hex(p.muted), size: 20, font: p.font })],
      spacing: { after: 360 },
    }));
  }

  if (data.summary) { out.push(makeSectionTitle('Professional Summary', ts)); out.push(new Paragraph({ text: data.summary, spacing: { after: 240 } })); }
  if (data.experience?.length) { out.push(makeSectionTitle('Experience', ts)); data.experience.forEach((e: any) => out.push(...makeExpBlock(e, '▸', p))); }
  if (data.education?.length) { out.push(makeSectionTitle('Education', ts)); data.education.forEach((e: any) => out.push(...makeEduBlock(e, p))); }
  if (data.skills?.length) { out.push(makeSectionTitle('Skills', ts)); out.push(makeSkillsLine(data.skills, p, '▸')); }
  out.push(...makeOptionalSections(data, ts, '▸', p));
  return out;
}

function buildContemporaryDocx(data: ParsedResumeData, p: DocxPalette): Paragraph[] {
  const ts: TitleStyle = { uppercase: true, color: hex(p.text), border: 'left', borderColor: hex(p.primary), font: p.font };
  const out: Paragraph[] = [];

  out.push(new Paragraph({
    children: [new TextRun({ text: data.contact?.name || 'Resume', bold: true, color: hex(p.primary), size: 56, font: p.font })],
    border: { bottom: { style: BorderStyle.SINGLE, size: 24, color: hex(p.primary) } },
    spacing: { after: 100 },
  }));
  if (data.contact) {
    const parts = [data.contact.email, data.contact.phone, data.contact.location, data.contact.linkedin].filter(Boolean) as string[];
    if (parts.length) out.push(new Paragraph({
      children: [new TextRun({ text: parts.join(' · '), color: hex(p.muted), size: 20, font: p.font })],
      spacing: { before: 100, after: 360 },
    }));
  }

  if (data.summary) { out.push(makeSectionTitle('Professional Summary', ts)); out.push(new Paragraph({ text: data.summary, spacing: { after: 240 } })); }
  if (data.experience?.length) { out.push(makeSectionTitle('Experience', ts)); data.experience.forEach((e: any) => out.push(...makeExpBlock(e, '•', p))); }
  if (data.education?.length) { out.push(makeSectionTitle('Education', ts)); data.education.forEach((e: any) => out.push(...makeEduBlock(e, p))); }
  if (data.skills?.length) { out.push(makeSectionTitle('Skills', ts)); out.push(makeSkillsLine(data.skills, p)); }
  out.push(...makeOptionalSections(data, ts, '•', p));
  return out;
}

/**
 * Executive — Georgia serif, 8px top accent bar on name, bottom border below header,
 * uppercase section titles with DOUBLE bottom border, ◆ bullets.
 */
function buildExecutiveDocx(data: ParsedResumeData, p: DocxPalette): Paragraph[] {
  const ts: TitleStyle = { uppercase: true, color: hex(p.primary), border: 'bottom_double', font: p.font };
  const out: Paragraph[] = [];

  // Name with thick top accent bar
  out.push(new Paragraph({
    children: [new TextRun({ text: data.contact?.name || 'Resume', bold: true, color: hex(p.primary), size: 60, font: p.font })],
    border: {
      top: { style: BorderStyle.SINGLE, size: 48, color: hex(p.primary) },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: 'E5E7EB' },
    },
    spacing: { before: 80, after: 80 },
  }));
  if (data.contact) {
    const parts = [data.contact.email, data.contact.phone, data.contact.location, data.contact.linkedin].filter(Boolean) as string[];
    if (parts.length) out.push(new Paragraph({
      children: [new TextRun({ text: parts.join('  |  '), color: hex(p.muted), size: 20, font: p.font })],
      spacing: { after: 360 },
    }));
  }

  if (data.summary) { out.push(makeSectionTitle('Professional Summary', ts)); out.push(new Paragraph({ text: data.summary, spacing: { after: 280 } })); }
  if (data.experience?.length) { out.push(makeSectionTitle('Experience', ts)); data.experience.forEach((e: any) => out.push(...makeExpBlock(e, '▪', p))); }
  if (data.education?.length) { out.push(makeSectionTitle('Education', ts)); data.education.forEach((e: any) => out.push(...makeEduBlock(e, p))); }
  if (data.skills?.length) { out.push(makeSectionTitle('Skills', ts)); out.push(makeSkillsLine(data.skills, p, '▪')); }
  out.push(...makeOptionalSections(data, ts, '▪', p));
  return out;
}

/**
 * Minimal — Inter/Calibri, centered light-weight name, generous 50px-equivalent spacing,
 * centered uppercase section titles (no border), no bullet chars on descriptions,
 * 1px mutedColor left border on each experience description paragraph.
 * Matches ModernMinimalLayout.tsx visual structure.
 */
function buildMinimalDocx(data: ParsedResumeData, p: DocxPalette): Paragraph[] {
  const ts: TitleStyle = { align: 'center', uppercase: true, color: hex(p.primary), border: 'none', bold: false, font: p.font };
  const out: Paragraph[] = [];

  // Centered light-weight name
  out.push(new Paragraph({
    children: [new TextRun({ text: data.contact?.name || 'Resume', bold: false, color: hex(p.text), size: 64, font: p.font })],
    alignment: AlignmentType.CENTER, spacing: { after: 160 },
  }));
  if (data.contact) {
    const parts = [data.contact.email, data.contact.phone, data.contact.location, data.contact.linkedin].filter(Boolean) as string[];
    if (parts.length) out.push(new Paragraph({
      children: [new TextRun({ text: parts.join('    '), color: hex(p.muted), size: 20, font: p.font })],
      alignment: AlignmentType.CENTER, spacing: { after: 600 },
    }));
  }

  // Summary — centered paragraph block, no border
  if (data.summary) {
    out.push(makeSectionTitle('Summary', ts));
    out.push(new Paragraph({
      children: [new TextRun({ text: data.summary, size: 23, font: p.font })],
      alignment: AlignmentType.CENTER, spacing: { after: 560 },
    }));
  }

  // Experience — no bullet chars; left border on each description line (mutedColor)
  if (data.experience?.length) {
    out.push(makeSectionTitle('Experience', ts));
    data.experience.forEach((e: any) => {
      // Title — slightly larger, non-bold (fontWeight 500 → semi-bold in DOCX)
      out.push(new Paragraph({
        children: [new TextRun({ text: e.title || '', bold: true, size: 26, color: hex(p.text), font: p.font })],
        spacing: { before: 280, after: 60 },
      }));
      // Company in primaryColor
      out.push(new Paragraph({
        children: [
          new TextRun({ text: e.company || '', bold: false, color: hex(p.primary), size: 22, font: p.font }),
          ...(e.location ? [new TextRun({ text: `  •  ${e.location}`, color: hex(p.muted), size: 20, font: p.font })] : []),
        ],
        spacing: { after: 40 },
      }));
      // Date line in mutedColor, italic
      out.push(new Paragraph({
        children: [new TextRun({ text: `${e.startDate || ''} – ${e.current ? 'Present' : e.endDate || ''}`, italics: true, color: hex(p.muted), size: 20, font: p.font })],
        spacing: { after: 80 },
      }));
      // Description lines — NO bullet chars, left border in mutedColor (matches CSS borderLeft)
      if (e.description?.length) {
        e.description.forEach((desc: string) => out.push(new Paragraph({
          children: [new TextRun({ text: cleanBullet(desc), size: 22, font: p.font })],
          border: { left: { style: BorderStyle.SINGLE, size: 4, color: hex(p.muted) } },
          indent: { left: 120 },
          spacing: { after: 80 },
        })));
      }
      out.push(new Paragraph({ text: '', spacing: { after: 280 } }));
    });
  }

  // Education — centered
  if (data.education?.length) {
    out.push(makeSectionTitle('Education', ts));
    data.education.forEach((edu: any) => {
      out.push(new Paragraph({
        children: [new TextRun({ text: edu.degree || '', bold: true, size: 22, color: hex(p.text), font: p.font })],
        alignment: AlignmentType.CENTER, spacing: { before: 160, after: 60 },
      }));
      out.push(new Paragraph({
        children: [
          new TextRun({ text: edu.institution || '', color: hex(p.muted), size: 20, font: p.font }),
          ...(edu.graduationDate ? [new TextRun({ text: `  •  ${edu.graduationDate}`, color: hex(p.muted), size: 20, font: p.font })] : []),
          ...(edu.gpa ? [new TextRun({ text: `  •  GPA: ${edu.gpa}`, color: hex(p.muted), size: 20, font: p.font })] : []),
        ],
        alignment: AlignmentType.CENTER, spacing: { after: 160 },
      }));
    });
    out.push(new Paragraph({ text: '', spacing: { after: 280 } }));
  }

  // Skills — centered tags separated by spaces
  if (data.skills?.length) {
    out.push(makeSectionTitle('Skills', ts));
    out.push(new Paragraph({
      children: [new TextRun({ text: normalizeSkills(data.skills).join('   ·   '), size: 22, font: p.font })],
      alignment: AlignmentType.CENTER, spacing: { after: 560 },
    }));
  }

  out.push(...makeOptionalSections(data, ts, '', p));
  return out;
}

/**
 * Default / Professional — Arial, 6px left accent bar on name block,
 * thick single bottom border on section titles, ▸ bullets.
 */
function buildDefaultDocx(data: ParsedResumeData, p: DocxPalette): Paragraph[] {
  const ts: TitleStyle = { uppercase: true, color: hex(p.primary), border: 'bottom_thick', font: p.font };
  const out: Paragraph[] = [];

  out.push(new Paragraph({
    children: [new TextRun({ text: data.contact?.name || 'Resume', bold: true, color: hex(p.primary), size: 52, font: p.font })],
    border: { left: { style: BorderStyle.SINGLE, size: 48, color: hex(p.primary) } },
    indent: { left: 200 }, spacing: { after: 40 },
  }));
  if (data.contact) {
    const parts = [data.contact.email, data.contact.phone, data.contact.location, data.contact.linkedin].filter(Boolean) as string[];
    if (parts.length) out.push(new Paragraph({
      children: [new TextRun({ text: parts.join('  |  '), color: hex(p.muted), size: 20, font: p.font })],
      indent: { left: 200 }, spacing: { after: 320 },
    }));
  }

  if (data.summary) { out.push(makeSectionTitle('Professional Summary', ts)); out.push(new Paragraph({ text: data.summary, spacing: { after: 240 } })); }
  if (data.experience?.length) { out.push(makeSectionTitle('Experience', ts)); data.experience.forEach((e: any) => out.push(...makeExpBlock(e, '▸', p))); }
  if (data.education?.length) { out.push(makeSectionTitle('Education', ts)); data.education.forEach((e: any) => out.push(...makeEduBlock(e, p))); }
  if (data.skills?.length) { out.push(makeSectionTitle('Skills', ts)); out.push(makeSkillsLine(data.skills, p, '▸')); }
  out.push(...makeOptionalSections(data, ts, '▸', p));
  return out;
}

/**
 * Sidebar — 32/68 two-column table, left column tinted with primaryColor at 12% opacity.
 * Left col: name + contact + skills + education + languages + certs + awards.
 * Right col: summary + experience + projects + volunteer.
 */
function buildSidebarDocx(data: ParsedResumeData, p: DocxPalette): (Paragraph | Table)[] {
  const leftTs: TitleStyle  = { uppercase: true, color: hex(p.primary), border: 'bottom', font: p.font };
  const rightTs: TitleStyle = { uppercase: true, color: hex(p.primary), border: 'bottom', font: p.font };
  const left: Paragraph[]  = [];
  const right: Paragraph[] = [];

  // Left: name + bottom rule
  left.push(new Paragraph({
    children: [new TextRun({ text: data.contact?.name || 'Resume', bold: true, color: hex(p.primary), size: 44, font: p.font })],
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: blendWithWhite(p.primary, 0.4) } },
    spacing: { after: 160 },
  }));

  // Left: contact stacked
  if (data.contact) {
    if (data.contact.email)    left.push(new Paragraph({ children: [new TextRun({ text: data.contact.email,    size: 18, color: hex(p.muted), font: p.font })], spacing: { after: 40 } }));
    if (data.contact.phone)    left.push(new Paragraph({ children: [new TextRun({ text: data.contact.phone,    size: 18, color: hex(p.muted), font: p.font })], spacing: { after: 40 } }));
    if (data.contact.location) left.push(new Paragraph({ children: [new TextRun({ text: data.contact.location, size: 18, color: hex(p.muted), font: p.font })], spacing: { after: 40 } }));
    if (data.contact.linkedin) left.push(new Paragraph({ children: [new TextRun({ text: data.contact.linkedin, size: 18, color: hex(p.muted), font: p.font })], spacing: { after: 80 } }));
  }
  left.push(new Paragraph({ text: '', spacing: { after: 160 } }));

  if (data.skills?.length) {
    left.push(makeSectionTitle('Skills', leftTs));
    normalizeSkills(data.skills).forEach(s => left.push(new Paragraph({ children: [new TextRun({ text: `• ${s}`, size: 20, font: p.font })], spacing: { after: 50 } })));
    left.push(new Paragraph({ text: '', spacing: { after: 160 } }));
  }
  if (data.education?.length) {
    left.push(makeSectionTitle('Education', leftTs));
    data.education.forEach((e: any) => left.push(...makeEduBlock(e, p)));
  }
  if (data.languages?.length) {
    left.push(makeSectionTitle('Languages', leftTs));
    (data.languages as string[]).forEach(l => left.push(new Paragraph({ children: [new TextRun({ text: l, size: 20, font: p.font })], spacing: { after: 40 } })));
    left.push(new Paragraph({ text: '', spacing: { after: 120 } }));
  }
  if (data.certifications?.length) {
    left.push(makeSectionTitle('Certifications', leftTs));
    data.certifications.forEach((c: any) => {
      const n = typeof c === 'string' ? c : c.name || '';
      left.push(new Paragraph({ children: [new TextRun({ text: `• ${cleanBullet(n)}`, size: 20, font: p.font })], spacing: { after: 50 } }));
    });
    left.push(new Paragraph({ text: '', spacing: { after: 120 } }));
  }
  if (data.awards?.length) {
    left.push(makeSectionTitle('Awards', leftTs));
    data.awards.forEach((a: any) => {
      const n = typeof a === 'string' ? a : a.name || '';
      left.push(new Paragraph({ children: [new TextRun({ text: `• ${cleanBullet(n)}`, size: 20, font: p.font })], spacing: { after: 50 } }));
    });
  }

  // Right: summary
  if (data.summary) { right.push(makeSectionTitle('Professional Summary', rightTs)); right.push(new Paragraph({ text: data.summary, spacing: { after: 240 } })); }
  // Right: experience
  if (data.experience?.length) { right.push(makeSectionTitle('Experience', rightTs)); data.experience.forEach((e: any) => right.push(...makeExpBlock(e, '•', p))); }
  // Right: projects
  if (data.projects?.length) {
    right.push(makeSectionTitle('Projects', rightTs));
    data.projects.forEach((pr: any) => {
      right.push(new Paragraph({ children: [new TextRun({ text: pr.name || '', bold: true, color: hex(p.text), font: p.font })], spacing: { before: 120, after: 40 } }));
      if (pr.description) right.push(new Paragraph({ text: pr.description, spacing: { after: 40 } }));
      if (pr.technologies?.length) right.push(new Paragraph({
        children: [new TextRun({ text: 'Technologies: ', italics: true, font: p.font }), new TextRun({ text: pr.technologies.join(', '), font: p.font })],
        spacing: { after: 40 },
      }));
    });
    right.push(new Paragraph({ text: '', spacing: { after: 120 } }));
  }
  // Right: volunteer
  if (data.volunteerWork?.length) {
    right.push(makeSectionTitle('Volunteer Work', rightTs));
    data.volunteerWork.forEach((v: any) => {
      if (typeof v === 'string') {
        right.push(new Paragraph({ children: [new TextRun({ text: `• ${v}`, font: p.font })], spacing: { after: 60 } }));
      } else {
        right.push(new Paragraph({
          children: [
            new TextRun({ text: v.role || '', bold: true, font: p.font }),
            new TextRun({ text: v.organization ? ` — ${v.organization}` : '', bold: true, font: p.font }),
          ],
          spacing: { before: 120, after: 40 },
        }));
        if (v.description?.length) v.description.forEach((b: string) =>
          right.push(new Paragraph({ children: [new TextRun({ text: `• ${cleanBullet(b)}`, font: p.font })], spacing: { after: 40 } }))
        );
        right.push(new Paragraph({ text: '', spacing: { after: 100 } }));
      }
    });
  }

  // Sidebar tint: primaryColor at 12% opacity blended with white
  const sidebarBg = blendWithWhite(p.primary, 0.12);

  return [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({
      children: [
        new TableCell({
          width: { size: 32, type: WidthType.PERCENTAGE },
          children: left,
          borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER },
          shading: { type: ShadingType.SOLID, fill: sidebarBg, color: sidebarBg },
          margins: { top: 200, bottom: 200, left: 200, right: 200 },
        }),
        new TableCell({
          width: { size: 68, type: WidthType.PERCENTAGE },
          children: right,
          borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER },
          margins: { top: 200, bottom: 200, left: 280, right: 200 },
        }),
      ],
    })],
  })];
}

/**
 * Professional — Arial, left 6px accent bar on name, company in secondaryColor italic,
 * UPPERCASE sections with thick bottom border, ▪ square bullets, 3-col competencies grid.
 * Matches ProfessionalLayout.tsx visual structure.
 */
function buildProfessionalDocx(data: ParsedResumeData, p: DocxPalette): (Paragraph | Table)[] {
  const ts: TitleStyle = { uppercase: true, color: hex(p.primary), border: 'bottom_thick', font: p.font };
  const out: (Paragraph | Table)[] = [];
  out.push(new Paragraph({ children: [new TextRun({ text: data.contact?.name || 'Resume', bold: true, color: hex(p.primary), size: 56, font: p.font })], border: { left: { style: BorderStyle.SINGLE, size: 48, color: hex(p.primary) } }, indent: { left: 280 }, spacing: { after: 60 } }));
  if (data.contact) {
    const parts = [data.contact.email, data.contact.phone, data.contact.location, data.contact.linkedin].filter(Boolean) as string[];
    if (parts.length) out.push(new Paragraph({ children: [new TextRun({ text: parts.join('  |  '), color: hex(p.muted), size: 20, font: p.font })], indent: { left: 280 }, spacing: { after: 400 } }));
  }
  if (data.summary) { out.push(makeSectionTitle('Professional Summary', ts)); out.push(new Paragraph({ text: data.summary, spacing: { after: 240 } })); }
  if (data.experience?.length) {
    out.push(makeSectionTitle('Experience', ts));
    data.experience.forEach((exp: any) => {
      out.push(new Paragraph({ children: [new TextRun({ text: exp.title || '', bold: true, color: hex(p.text), size: 22, font: p.font })], spacing: { before: 160, after: 30 } }));
      out.push(new Paragraph({ children: [
        new TextRun({ text: exp.company || '', bold: true, italics: true, color: hex(p.secondary), size: 21, font: p.font }),
        ...(exp.location ? [new TextRun({ text: `  |  ${exp.location}`, italics: true, color: hex(p.muted), size: 20, font: p.font })] : []),
        new TextRun({ text: `   ${exp.startDate || ''} – ${exp.current ? 'Present' : exp.endDate || ''}`, italics: true, color: hex(p.muted), size: 20, font: p.font }),
      ], spacing: { after: 80 } }));
      if (exp.description?.length) {
        exp.description.forEach((desc: string) => out.push(new Paragraph({
          children: [new TextRun({ text: `▪ ${cleanBullet(desc)}`, size: 22, font: p.font })],
          indent: { left: 200 }, spacing: { after: 40 },
        })));
      }
      out.push(new Paragraph({ text: '', spacing: { after: 120 } }));
    });
  }
  if (data.education?.length) { out.push(makeSectionTitle('Education', ts)); data.education.forEach((e: any) => out.push(...makeEduBlock(e, p))); }
  if (data.skills?.length) {
    out.push(makeSectionTitle('Core Competencies', ts));
    const skillItems = normalizeSkills(data.skills);
    const skillRows: TableRow[] = [];
    for (let i = 0; i < skillItems.length; i += 3) {
      skillRows.push(new TableRow({ children: Array.from({ length: 3 }, (_, j) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: skillItems[i + j] || '', size: 20, font: p.font })], spacing: { after: 40 } })], borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER }, width: { size: 33, type: WidthType.PERCENTAGE } })) }));
    }
    if (skillRows.length) out.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: skillRows }));
    out.push(new Paragraph({ text: '', spacing: { after: 160 } }));
  }
  out.push(...makeOptionalSections(data, ts, '▪', p));
  return out;
}
/**
 * Tech — Courier New monospace, command-line `> SECTION` headers with bottom border,
 * → arrow bullets, skills-first approach, bordered 3-col skill grid.
 * Matches TechLayout.tsx visual structure.
 */
function buildTechDocx(data: ParsedResumeData, p: DocxPalette): (Paragraph | Table)[] {
  const cf = 'Courier New';
  const out: (Paragraph | Table)[] = [];
  const techTitle = (text: string) => new Paragraph({
    children: [new TextRun({ text: `> ${text.toUpperCase()}`, bold: true, color: hex(p.primary), size: 22, font: cf })],
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: hex(p.primary) } }, spacing: { before: 320, after: 120 },
  });
  out.push(new Paragraph({ children: [new TextRun({ text: data.contact?.name || 'Resume', bold: true, color: hex(p.primary), size: 52, font: cf })], border: { bottom: { style: BorderStyle.SINGLE, size: 20, color: hex(p.primary) } }, spacing: { after: 80 } }));
  if (data.contact) {
    const parts = [data.contact.email, data.contact.phone, data.contact.location, data.contact.linkedin].filter(Boolean) as string[];
    if (parts.length) out.push(new Paragraph({ children: [new TextRun({ text: parts.join('  |  '), color: hex(p.muted), size: 20, font: cf })], spacing: { after: 360 } }));
  }
  if (data.skills?.length) {
    out.push(techTitle('Technical Skills'));
    const skillItems = normalizeSkills(data.skills);
    const skillRows: TableRow[] = [];
    const borderColor = blendWithWhite(p.primary, 0.4);
    for (let i = 0; i < skillItems.length; i += 3) {
      skillRows.push(new TableRow({ children: Array.from({ length: 3 }, (_, j) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: skillItems[i + j] || '', size: 20, font: cf })], spacing: { after: 40 } })], borders: { top: { style: BorderStyle.SINGLE, size: 4, color: borderColor }, bottom: { style: BorderStyle.SINGLE, size: 4, color: borderColor }, left: { style: BorderStyle.SINGLE, size: 4, color: borderColor }, right: { style: BorderStyle.SINGLE, size: 4, color: borderColor } }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, width: { size: 33, type: WidthType.PERCENTAGE } })) }));
    }
    if (skillRows.length) out.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: skillRows }));
    out.push(new Paragraph({ text: '', spacing: { after: 200 } }));
  }
  if (data.summary) { out.push(techTitle('About')); out.push(new Paragraph({ children: [new TextRun({ text: data.summary, font: cf })], spacing: { after: 240 } })); }
  if (data.experience?.length) { out.push(techTitle('Experience')); data.experience.forEach((e: any) => out.push(...makeExpBlock(e, '→', p))); }
  if (data.education?.length) { out.push(techTitle('Education')); data.education.forEach((e: any) => out.push(...makeEduBlock(e, p))); }
  const techTs: TitleStyle = { uppercase: true, color: hex(p.primary), border: 'bottom', font: cf };
  out.push(...makeOptionalSections(data, techTs, '→', p));
  return out;
}
/**
 * Compact — full-width header, then 70/30 two-column table.
 * Left (70%): summary, experience (max 3 bullets), projects.
 * Right (30%): skills, education, languages, certs, awards.
 * Matches CompactLayout.tsx visual structure.
 */
function buildCompactDocx(data: ParsedResumeData, p: DocxPalette): (Paragraph | Table)[] {
  const mainTs: TitleStyle = { uppercase: true, color: hex(p.primary), border: 'none', font: p.font };
  const sideTs: TitleStyle = { uppercase: true, color: hex(p.primary), border: 'none', font: p.font };
  const out: (Paragraph | Table)[] = [];
  out.push(new Paragraph({ children: [new TextRun({ text: data.contact?.name || 'Resume', bold: true, color: hex(p.primary), size: 44, font: p.font })], border: { bottom: { style: BorderStyle.SINGLE, size: 16, color: hex(p.primary) } }, spacing: { after: 80 } }));
  if (data.contact) {
    const parts = [data.contact.email, data.contact.phone, data.contact.location, data.contact.linkedin].filter(Boolean) as string[];
    if (parts.length) out.push(new Paragraph({ children: [new TextRun({ text: parts.join('  |  '), color: hex(p.muted), size: 18, font: p.font })], spacing: { after: 200 } }));
  }
  const main: (Paragraph | Table)[] = [];
  if (data.summary) { main.push(makeSectionTitle('Summary', mainTs)); main.push(new Paragraph({ children: [new TextRun({ text: data.summary, size: 20, font: p.font })], spacing: { after: 120 } })); }
  if (data.experience?.length) {
    main.push(makeSectionTitle('Experience', mainTs));
    data.experience.forEach((exp: any) => {
      main.push(new Paragraph({ children: [new TextRun({ text: exp.title || '', bold: true, size: 21, font: p.font }), new TextRun({ text: exp.company ? `  —  ${exp.company}` : '', color: hex(p.primary), size: 20, font: p.font })], spacing: { before: 120, after: 30 } }));
      main.push(new Paragraph({ children: [new TextRun({ text: `${exp.startDate || ''} – ${exp.current ? 'Present' : exp.endDate || ''}`, italics: true, color: hex(p.muted), size: 18, font: p.font })], spacing: { after: 50 } }));
      ((exp.description || []) as string[]).forEach((desc: string) => main.push(new Paragraph({ children: [new TextRun({ text: `• ${cleanBullet(desc)}`, size: 19, font: p.font })], indent: { left: 160 }, spacing: { after: 30 } })));
      main.push(new Paragraph({ text: '', spacing: { after: 80 } }));
    });
  }
  if (data.projects?.length) {
    main.push(makeSectionTitle('Projects', mainTs));
    data.projects.forEach((pr: any) => {
      main.push(new Paragraph({ children: [new TextRun({ text: pr.name || '', bold: true, size: 21, font: p.font })], spacing: { before: 80, after: 30 } }));
      if (pr.description) main.push(new Paragraph({ children: [new TextRun({ text: pr.description, size: 19, font: p.font })], spacing: { after: 30 } }));
      if (pr.technologies?.length) main.push(new Paragraph({ children: [new TextRun({ text: pr.technologies.join(', '), italics: true, color: hex(p.muted), size: 18, font: p.font })], spacing: { after: 40 } }));
    });
  }
  if (data.volunteerWork?.length) {
    main.push(makeSectionTitle('Volunteer Work', mainTs));
    data.volunteerWork.forEach((v: any) => {
      if (typeof v === 'string') {
        main.push(new Paragraph({ children: [new TextRun({ text: `• ${v}`, size: 19, font: p.font })], spacing: { after: 30 } }));
      } else {
        main.push(new Paragraph({ children: [new TextRun({ text: v.role || '', bold: true, size: 20, font: p.font }), new TextRun({ text: v.organization ? ` — ${v.organization}` : '', size: 19, font: p.font })], spacing: { before: 80, after: 20 } }));
        main.push(new Paragraph({ children: [new TextRun({ text: v.period || `${v.startDate || ''}${v.current ? ' – Present' : v.endDate ? ` – ${v.endDate}` : ''}`, italics: true, color: hex(p.muted), size: 18, font: p.font })], spacing: { after: 40 } }));
      }
    });
  }
  const side: Paragraph[] = [];
  if (data.skills?.length) { side.push(makeSectionTitle('Skills', sideTs)); normalizeSkills(data.skills).forEach(s => side.push(new Paragraph({ children: [new TextRun({ text: `• ${s}`, size: 19, font: p.font })], spacing: { after: 30 } }))); side.push(new Paragraph({ text: '', spacing: { after: 100 } })); }
  if (data.education?.length) {
    side.push(makeSectionTitle('Education', sideTs));
    data.education.forEach((edu: any) => {
      side.push(new Paragraph({ children: [new TextRun({ text: edu.degree || '', bold: true, size: 20, font: p.font })], spacing: { before: 80, after: 20 } }));
      side.push(new Paragraph({ children: [new TextRun({ text: edu.institution || '', color: hex(p.muted), size: 18, font: p.font })], spacing: { after: 30 } }));
      if (edu.graduationDate) side.push(new Paragraph({ children: [new TextRun({ text: edu.graduationDate, italics: true, color: hex(p.muted), size: 18, font: p.font })], spacing: { after: 60 } }));
    });
    side.push(new Paragraph({ text: '', spacing: { after: 80 } }));
  }
  if (data.languages?.length) { side.push(makeSectionTitle('Languages', sideTs)); (data.languages as string[]).forEach(l => side.push(new Paragraph({ children: [new TextRun({ text: l, size: 19, font: p.font })], spacing: { after: 30 } }))); side.push(new Paragraph({ text: '', spacing: { after: 80 } })); }
  if (data.certifications?.length) {
    side.push(makeSectionTitle('Certifications', sideTs));
    data.certifications.forEach((c: any) => { const n = typeof c === 'string' ? c : (c as any).name || ''; side.push(new Paragraph({ children: [new TextRun({ text: `• ${cleanBullet(n)}`, size: 19, font: p.font })], spacing: { after: 30 } })); });
    side.push(new Paragraph({ text: '', spacing: { after: 80 } }));
  }
  if (data.awards?.length) {
    side.push(makeSectionTitle('Awards', sideTs));
    data.awards.forEach((a: any) => { const n = typeof a === 'string' ? a : (a as any).name || ''; side.push(new Paragraph({ children: [new TextRun({ text: `• ${cleanBullet(n)}`, size: 19, font: p.font })], spacing: { after: 30 } })); });
  }
  out.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [new TableRow({ children: [
    new TableCell({ width: { size: 70, type: WidthType.PERCENTAGE }, children: main, borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER }, margins: { top: 80, bottom: 80, left: 0, right: 200 } }),
    new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, children: side, borders: { top: NO_BORDER, bottom: NO_BORDER, right: NO_BORDER, left: { style: BorderStyle.SINGLE, size: 4, color: blendWithWhite(p.primary, 0.2) } }, margins: { top: 80, bottom: 80, left: 200, right: 0 } }),
  ] })] }));
  return out;
}
/**
 * Infographic — 35/65 borderless table. Left sidebar (35%): contact with icons, skills, languages.
 * Right main (65%): large name, summary, experience, projects.
 * Right border on left cell. Matches InfographicLayout.tsx structure.
 */
function buildInfographicDocx(data: ParsedResumeData, p: DocxPalette): (Paragraph | Table)[] {
  const leftTs: TitleStyle  = { uppercase: true, color: hex(p.primary), border: 'bottom', font: p.font };
  const rightTs: TitleStyle = { uppercase: true, color: hex(p.primary), border: 'bottom', font: p.font };
  const left: Paragraph[] = [];
  const right: Paragraph[] = [];
  if (data.contact) {
    if (data.contact.email)    left.push(new Paragraph({ children: [new TextRun({ text: `✉ ${data.contact.email}`,    size: 18, color: hex(p.muted), font: p.font })], spacing: { after: 40 } }));
    if (data.contact.phone)    left.push(new Paragraph({ children: [new TextRun({ text: `☎ ${data.contact.phone}`,    size: 18, color: hex(p.muted), font: p.font })], spacing: { after: 40 } }));
    if (data.contact.location) left.push(new Paragraph({ children: [new TextRun({ text: `● ${data.contact.location}`, size: 18, color: hex(p.muted), font: p.font })], spacing: { after: 40 } }));
    if (data.contact.linkedin) left.push(new Paragraph({ children: [new TextRun({ text: `► ${data.contact.linkedin}`, size: 18, color: hex(p.muted), font: p.font })], spacing: { after: 80 } }));
    left.push(new Paragraph({ text: '', spacing: { after: 120 } }));
  }
  if (data.skills?.length) { left.push(makeSectionTitle('Skills', leftTs)); normalizeSkills(data.skills).forEach(s => left.push(new Paragraph({ children: [new TextRun({ text: `• ${s}`, size: 19, font: p.font })], spacing: { after: 40 } }))); left.push(new Paragraph({ text: '', spacing: { after: 120 } })); }
  if (data.languages?.length) { left.push(makeSectionTitle('Languages', leftTs)); (data.languages as string[]).forEach(l => left.push(new Paragraph({ children: [new TextRun({ text: l, size: 19, font: p.font })], spacing: { after: 40 } }))); left.push(new Paragraph({ text: '', spacing: { after: 120 } })); }
  if (data.certifications?.length) {
    left.push(makeSectionTitle('Certs', leftTs));
    data.certifications.forEach((c: any) => { const n = typeof c === 'string' ? c : (c as any).name || ''; left.push(new Paragraph({ children: [new TextRun({ text: `• ${cleanBullet(n)}`, size: 19, font: p.font })], spacing: { after: 40 } })); });
  }
  right.push(new Paragraph({ children: [new TextRun({ text: data.contact?.name || 'Resume', bold: true, color: hex(p.primary), size: 60, font: p.font })], spacing: { after: 80 } }));
  if (data.summary) { right.push(makeSectionTitle('Profile', rightTs)); right.push(new Paragraph({ text: data.summary, spacing: { after: 200 } })); }
  if (data.experience?.length) { right.push(makeSectionTitle('Experience', rightTs)); data.experience.forEach((e: any) => right.push(...makeExpBlock(e, '→', p))); }
  if (data.education?.length) { right.push(makeSectionTitle('Education', rightTs)); data.education.forEach((e: any) => right.push(...makeEduBlock(e, p))); }
  if (data.projects?.length) {
    right.push(makeSectionTitle('Projects', rightTs));
    data.projects.forEach((pr: any) => { right.push(new Paragraph({ children: [new TextRun({ text: pr.name || '', bold: true, color: hex(p.text), font: p.font })], spacing: { before: 120, after: 40 } })); if (pr.description) right.push(new Paragraph({ text: pr.description, spacing: { after: 40 } })); });
  }
  if (data.awards?.length) {
    right.push(makeSectionTitle('Awards', rightTs));
    data.awards.forEach((a: any) => { const n = typeof a === 'string' ? a : (a as any).name || ''; right.push(new Paragraph({ children: [new TextRun({ text: `• ${cleanBullet(n)}`, font: p.font })], spacing: { after: 60 } })); });
  }
  if (data.volunteerWork?.length) {
    right.push(makeSectionTitle('Volunteer Work', rightTs));
    data.volunteerWork.forEach((v: any) => {
      if (typeof v === 'string') {
        right.push(new Paragraph({ children: [new TextRun({ text: `→ ${v}`, font: p.font })], spacing: { after: 60 } }));
      } else {
        right.push(new Paragraph({ children: [new TextRun({ text: v.role || '', bold: true, font: p.font }), new TextRun({ text: v.organization ? ` — ${v.organization}` : '', font: p.font })], spacing: { before: 100, after: 30 } }));
        right.push(new Paragraph({ children: [new TextRun({ text: v.period || `${v.startDate || ''}${v.current ? ' – Present' : v.endDate ? ` – ${v.endDate}` : ''}`, italics: true, color: hex(p.muted), size: 20, font: p.font })], spacing: { after: 40 } }));
      }
    });
  }
  return [new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [new TableRow({ children: [
    new TableCell({ width: { size: 35, type: WidthType.PERCENTAGE }, children: left, borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: { style: BorderStyle.SINGLE, size: 8, color: blendWithWhite(p.primary, 0.3) } }, margins: { top: 80, bottom: 80, left: 0, right: 200 } }),
    new TableCell({ width: { size: 65, type: WidthType.PERCENTAGE }, children: right, borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER }, margins: { top: 80, bottom: 80, left: 200, right: 0 } }),
  ] })] })];
}
/**
 * Portfolio — projects-first layout. Name + summary + contact header, then Featured
 * Projects in 2-col bordered table, condensed experience, 4-col skills grid.
 * Matches PortfolioLayout.tsx visual structure.
 */
function buildPortfolioDocx(data: ParsedResumeData, p: DocxPalette): (Paragraph | Table)[] {
  const ts: TitleStyle = { uppercase: true, color: hex(p.primary), border: 'none', font: p.font };
  const out: (Paragraph | Table)[] = [];
  out.push(new Paragraph({ children: [new TextRun({ text: data.contact?.name || 'Resume', bold: true, color: hex(p.primary), size: 60, font: p.font })], border: { bottom: { style: BorderStyle.SINGLE, size: 20, color: hex(p.primary) } }, spacing: { after: 100 } }));
  if (data.contact) {
    const parts = [data.contact.email, data.contact.phone, data.contact.location, data.contact.linkedin].filter(Boolean) as string[];
    if (parts.length) out.push(new Paragraph({ children: [new TextRun({ text: parts.join('  |  '), color: hex(p.muted), size: 20, font: p.font })], spacing: { after: 120 } }));
  }
  if (data.summary) out.push(new Paragraph({ children: [new TextRun({ text: data.summary, size: 21, font: p.font })], spacing: { after: 360 } }));
  if (data.projects?.length) {
    out.push(makeSectionTitle('Featured Projects', ts));
    const projRows: TableRow[] = [];
    for (let i = 0; i < data.projects.length; i += 2) {
      const pr1 = data.projects[i]; const pr2 = data.projects[i + 1];
      const makeCell = (pr: any, borderColor: string) => new TableCell({
        children: [
          new Paragraph({ children: [new TextRun({ text: pr?.name || '', bold: true, color: hex(p.text), size: 22, font: p.font })], spacing: { after: 60 } }),
          new Paragraph({ children: [new TextRun({ text: pr?.description || '', size: 20, font: p.font })], spacing: { after: 60 } }),
          ...(pr?.technologies?.length ? [new Paragraph({ children: [new TextRun({ text: pr.technologies.join(' · '), italics: true, color: hex(p.muted), size: 18, font: p.font })], spacing: { after: 40 } })] : []),
        ],
        borders: { top: { style: BorderStyle.SINGLE, size: 4, color: borderColor }, left: { style: BorderStyle.SINGLE, size: 4, color: borderColor }, bottom: { style: BorderStyle.SINGLE, size: 4, color: borderColor }, right: { style: BorderStyle.SINGLE, size: 4, color: borderColor } },
        margins: { top: 120, bottom: 120, left: 160, right: 160 }, width: { size: 50, type: WidthType.PERCENTAGE },
      });
      projRows.push(new TableRow({ children: [makeCell(pr1, hex(p.primary)), makeCell(pr2 || {}, hex(p.secondary))] }));
    }
    if (projRows.length) out.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: projRows }));
    out.push(new Paragraph({ text: '', spacing: { after: 200 } }));
  }
  if (data.experience?.length) {
    out.push(makeSectionTitle('Experience', ts));
    data.experience.forEach((exp: any) => {
      out.push(new Paragraph({ children: [
        new TextRun({ text: exp.title || '', bold: true, size: 22, font: p.font }),
        new TextRun({ text: exp.company ? `  —  ${exp.company}` : '', color: hex(p.primary), size: 21, font: p.font }),
        new TextRun({ text: `  ·  ${exp.startDate || ''} – ${exp.current ? 'Present' : exp.endDate || ''}`, italics: true, color: hex(p.muted), size: 20, font: p.font }),
      ], spacing: { before: 120, after: 60 } }));
      if (exp.description?.length) {
        exp.description.forEach((d: string) => out.push(new Paragraph({ children: [new TextRun({ text: `• ${cleanBullet(d)}`, size: 20, font: p.font })], indent: { left: 200 }, spacing: { after: 40 } })));
      }
      out.push(new Paragraph({ text: '', spacing: { after: 80 } }));
    });
  }
  if (data.skills?.length) {
    out.push(makeSectionTitle('Skills', ts));
    const skillItems = normalizeSkills(data.skills);
    const skillRows4: TableRow[] = [];
    for (let i = 0; i < skillItems.length; i += 4) {
      skillRows4.push(new TableRow({ children: Array.from({ length: 4 }, (_, j) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: skillItems[i + j] || '', size: 19, font: p.font })], spacing: { after: 30 } })], borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER }, width: { size: 25, type: WidthType.PERCENTAGE } })) }));
    }
    if (skillRows4.length) out.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: skillRows4 }));
    out.push(new Paragraph({ text: '', spacing: { after: 200 } }));
  }
  if (data.education?.length) { out.push(makeSectionTitle('Education', ts)); data.education.forEach((e: any) => out.push(...makeEduBlock(e, p))); }
  // Remaining sections — explicitly listed to avoid duplicating projects (already shown above)
  if (data.certifications?.length) {
    out.push(makeSectionTitle('Certifications', ts));
    data.certifications.forEach((c: any) => { const n = typeof c === 'string' ? c : c.name || ''; const d = typeof c === 'object' && c.date ? ` (${c.date})` : ''; out.push(new Paragraph({ text: `• ${cleanBullet(n)}${d}`, spacing: { after: 60 } })); });
    out.push(new Paragraph({ text: '', spacing: { after: 120 } }));
  }
  if (data.languages?.length) {
    out.push(makeSectionTitle('Languages', ts));
    out.push(new Paragraph({ text: (data.languages as string[]).join('  •  '), spacing: { after: 160 } }));
  }
  if (data.awards?.length) {
    out.push(makeSectionTitle('Awards', ts));
    data.awards.forEach((a: any) => { const n = typeof a === 'string' ? a : a.name || ''; out.push(new Paragraph({ text: `• ${cleanBullet(n)}`, spacing: { after: 60 } })); });
    out.push(new Paragraph({ text: '', spacing: { after: 120 } }));
  }
  if (data.volunteerWork?.length) {
    out.push(makeSectionTitle('Volunteer Work', ts));
    data.volunteerWork.forEach((v: any) => {
      if (typeof v === 'string') {
        out.push(new Paragraph({ text: `• ${v}`, spacing: { after: 60 } }));
      } else {
        out.push(new Paragraph({ children: [new TextRun({ text: v.role || '', bold: true, font: p.font }), new TextRun({ text: v.organization ? ` — ${v.organization}` : '', font: p.font })], spacing: { before: 100, after: 30 } }));
        out.push(new Paragraph({ children: [new TextRun({ text: v.period || `${v.startDate || ''}${v.current ? ' – Present' : v.endDate ? ` – ${v.endDate}` : ''}`, italics: true, color: hex(p.muted), font: p.font })], spacing: { after: 80 } }));
      }
    });
  }
  return out;
}
/**
 * Timeline — vertical timeline with 2-column borderless table per experience entry.
 * Left column (22%): start/end dates in primaryColor.
 * Right column (78%): content with left border acting as the timeline spine.
 * Summary has a 4px solid primaryColor left-border indent block.
 * Name: centered, bold, primaryColor (matches TimelineLayout.tsx).
 */
function buildTimelineDocx(data: ParsedResumeData, p: DocxPalette): (Paragraph | Table)[] {
  const ts: TitleStyle = { uppercase: true, color: hex(p.primary), border: 'bottom', font: p.font };
  const out: (Paragraph | Table)[] = [];

  // Centered name in primaryColor (bold 700)
  out.push(new Paragraph({
    children: [new TextRun({ text: data.contact?.name || 'Resume', bold: true, color: hex(p.primary), size: 60, font: p.font })],
    alignment: AlignmentType.CENTER, spacing: { after: 120 },
  }));
  if (data.contact) {
    const parts = [data.contact.email, data.contact.phone, data.contact.location].filter(Boolean) as string[];
    if (parts.length) out.push(new Paragraph({
      children: [new TextRun({ text: parts.join('  •  '), color: hex(p.muted), size: 20, font: p.font })],
      alignment: AlignmentType.CENTER, spacing: { after: 440 },
    }));
  }

  // Summary with 4px left border in primaryColor (matches CSS borderLeft: 4px solid primaryColor)
  if (data.summary) {
    out.push(makeSectionTitle('Summary', ts));
    out.push(new Paragraph({
      children: [new TextRun({ text: data.summary, size: 22, font: p.font })],
      border: { left: { style: BorderStyle.SINGLE, size: 20, color: hex(p.primary) } },
      indent: { left: 240 },
      spacing: { after: 400 },
    }));
  }

  // Experience Timeline — each entry as 2-column table (date | content)
  if (data.experience?.length) {
    out.push(makeSectionTitle('Experience Timeline', ts));
    data.experience.forEach((exp: any) => {
      const dateLeft: Paragraph[] = [
        new Paragraph({
          children: [new TextRun({ text: exp.startDate || '', bold: true, color: hex(p.primary), size: 20, font: p.font })],
          spacing: { after: 40 },
        }),
        new Paragraph({
          children: [new TextRun({ text: exp.current ? 'Present' : (exp.endDate || ''), color: hex(p.muted), size: 18, font: p.font })],
          spacing: { after: 0 },
        }),
      ];
      const contentRight: Paragraph[] = [
        new Paragraph({
          children: [new TextRun({ text: exp.title || '', bold: true, color: hex(p.text), size: 24, font: p.font })],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: exp.company || '', bold: true, color: hex(p.primary), size: 22, font: p.font }),
            ...(exp.location ? [new TextRun({ text: `  •  ${exp.location}`, color: hex(p.muted), size: 20, font: p.font })] : []),
          ],
          spacing: { after: 80 },
        }),
        ...((exp.description || []) as string[]).map((desc: string) => new Paragraph({
          children: [new TextRun({ text: `→ ${cleanBullet(desc)}`, size: 21, font: p.font })],
          spacing: { after: 50 },
        })),
      ];
      out.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [new TableRow({
          children: [
            new TableCell({
              width: { size: 22, type: WidthType.PERCENTAGE },
              children: dateLeft,
              borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER },
              margins: { top: 80, bottom: 80, left: 0, right: 160 },
            }),
            new TableCell({
              width: { size: 78, type: WidthType.PERCENTAGE },
              children: contentRight,
              borders: {
                top: NO_BORDER, bottom: NO_BORDER, right: NO_BORDER,
                left: { style: BorderStyle.SINGLE, size: 8, color: blendWithWhite(p.primary, 0.5) },
              },
              margins: { top: 80, bottom: 80, left: 200, right: 0 },
            }),
          ],
        })],
      }));
      out.push(new Paragraph({ text: '', spacing: { after: 100 } }));
    });
    out.push(new Paragraph({ text: '', spacing: { after: 160 } }));
  }

  if (data.skills?.length) { out.push(makeSectionTitle('Skills', ts)); out.push(makeSkillsLine(data.skills, p)); }
  if (data.education?.length) { out.push(makeSectionTitle('Education', ts)); data.education.forEach((e: any) => out.push(...makeEduBlock(e, p))); }
  out.push(...makeOptionalSections(data, ts, '•', p));
  return out;
}

/**
 * Generate DOCX using template from registry
 * Loads template dynamically and uses React DOCX if available
 */
export async function generateDOCXFromRegistry(
  data: ParsedResumeData,
  templateId: string
): Promise<Buffer> {
  const { incrementTemplateUsage, getTemplateConfigFromDB } = await import('./template-registry');

  // Increment usage count
  try {
    await incrementTemplateUsage(templateId);
  } catch (err) {
    console.warn('Failed to increment template usage:', err);
  }

  console.log(`Generating DOCX for template: ${templateId}`);

  try {
    const tplConfig = await getTemplateConfigFromDB(templateId);

    const docFont = toWordFont(tplConfig);
    const palette: DocxPalette = {
      primary: tplConfig.primaryColor || '#2563EB',
      secondary: tplConfig.secondaryColor || '#1E40AF',
      text: tplConfig.textColor || '#111827',
      muted: tplConfig.mutedColor || '#6B7280',
      font: docFont,
    };

    const builderKey = docxBuilderKey(tplConfig);
    console.log(`DOCX builder: ${builderKey}, font: ${docFont}, layoutType: ${tplConfig.layoutType}, headerStyle: ${tplConfig.headerStyle}, sectionStyle: ${tplConfig.sectionStyle}`);

    let children: (Paragraph | Table)[];
    switch (builderKey) {
      case 'classic':      children = buildClassicDocx(data, palette);      break;
      case 'academic':     children = buildAcademicDocx(data, palette);     break;
      case 'bold_modern':  children = buildBoldModernDocx(data, palette);   break;
      case 'contemporary': children = buildContemporaryDocx(data, palette); break;
      case 'executive':    children = buildExecutiveDocx(data, palette);    break;
      case 'minimal':      children = buildMinimalDocx(data, palette);      break;
      case 'compact':      children = buildCompactDocx(data, palette);      break;
      case 'timeline':     children = buildTimelineDocx(data, palette);     break;
      case 'professional': children = buildProfessionalDocx(data, palette); break;
      case 'tech':         children = buildTechDocx(data, palette);         break;
      case 'infographic':  children = buildInfographicDocx(data, palette);  break;
      case 'portfolio':    children = buildPortfolioDocx(data, palette);    break;
      case 'sidebar':      children = buildSidebarDocx(data, palette);      break;
      default:             children = buildDefaultDocx(data, palette);
    }

    const doc = new Document({
      styles: {
        default: {
          document: {
            run: { font: docFont, size: 22 }, // 11pt body default
          },
        },
      },
      sections: [{
        properties: {
          page: {
            size: { width: 11906, height: 16838 }, // A4 in twips
            margin: { top: 720, right: 720, bottom: 720, left: 720 }, // 0.5 in
          },
        },
        children,
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    console.log(`DOCX generated successfully (${builderKey}), size: ${buffer.length} bytes`);
    return buffer;
  } catch (err) {
    console.error('Template-aware DOCX failed, falling back to flat implementation:', err);
    return generateFlatDocx(data);
  }
}

/** Fallback flat DOCX with no template-specific formatting */
async function generateFlatDocx(data: ParsedResumeData): Promise<Buffer> {
  const sections: Paragraph[] = [];

  // Header with name
  sections.push(
    new Paragraph({
      text: data.contact?.name || 'Resume',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  // Contact info
  if (data.contact) {
    const contactParts = [];
    if (data.contact.email) contactParts.push(data.contact.email);
    if (data.contact.phone) contactParts.push(data.contact.phone);
    if (data.contact.location) contactParts.push(data.contact.location);
    if (data.contact.linkedin) contactParts.push(data.contact.linkedin);

    sections.push(
      new Paragraph({
        text: contactParts.join(' | '),
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    );
  }

  // Summary
  if (data.summary) {
    sections.push(
      new Paragraph({
        text: 'PROFESSIONAL SUMMARY',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        text: data.summary,
        spacing: { after: 400 },
      })
    );
  }

  // Experience
  if (data.experience && data.experience.length > 0) {
    sections.push(
      new Paragraph({
        text: 'EXPERIENCE',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 100 },
      })
    );

    data.experience.forEach((exp: any) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.title || '', bold: true }),
            new TextRun({ text: exp.company ? ` - ${exp.company}` : '', bold: true }),
          ],
          spacing: { before: 200, after: 50 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `${exp.startDate || ''} - ${exp.current ? 'Present' : exp.endDate || ''}`,
              italics: true,
            }),
          ],
          spacing: { after: 100 },
        })
      );

      if (exp.description && Array.isArray(exp.description)) {
        exp.description.forEach((bullet: string) => {
          sections.push(
            new Paragraph({
              text: `• ${bullet}`,
              spacing: { after: 50 },
            })
          );
        });
      }

      sections.push(new Paragraph({ text: '', spacing: { after: 200 } }));
    });
  }

  // Education
  if (data.education && data.education.length > 0) {
    sections.push(
      new Paragraph({
        text: 'EDUCATION',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 100 },
      })
    );

    data.education.forEach((edu: any) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.degree || '', bold: true }),
            new TextRun({ text: edu.institution ? ` - ${edu.institution}` : '' }),
          ],
          spacing: { before: 100, after: 50 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: edu.graduationDate || '',
              italics: true,
            }),
          ],
          spacing: { after: 200 },
        })
      );
    });
  }

  // Skills
  if (data.skills && data.skills.length > 0) {
    const skillsText = data.skills
      .map((s: any) => typeof s === 'string' ? s : (s.category || s.name || ''))
      .filter(Boolean)
      .join(', ');
    sections.push(
      new Paragraph({
        text: 'SKILLS',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        text: skillsText,
        spacing: { after: 200 },
      })
    );
  }

  // Certifications
  if (data.certifications && data.certifications.length > 0) {
    sections.push(
      new Paragraph({
        text: 'CERTIFICATIONS',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 100 },
      })
    );
    data.certifications.forEach((cert: any) => {
      const certName = typeof cert === 'string' ? cert : cert.name || '';
      const certDate = typeof cert === 'object' && cert.date ? ` (${cert.date})` : '';
      sections.push(
        new Paragraph({
          text: `• ${certName}${certDate}`,
          spacing: { after: 80 },
        })
      );
    });
    sections.push(new Paragraph({ text: '', spacing: { after: 200 } }));
  }

  // Projects
  if (data.projects && data.projects.length > 0) {
    sections.push(
      new Paragraph({
        text: 'PROJECTS',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 100 },
      })
    );
    data.projects.forEach((proj: any) => {
      sections.push(
        new Paragraph({
          children: [new TextRun({ text: proj.name || '', bold: true })],
          spacing: { before: 150, after: 50 },
        })
      );
      if (proj.description) {
        sections.push(
          new Paragraph({ text: proj.description, spacing: { after: 50 } })
        );
      }
      if (proj.technologies && proj.technologies.length > 0) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Technologies: ', italics: true }),
              new TextRun({ text: proj.technologies.join(', ') }),
            ],
            spacing: { after: 50 },
          })
        );
      }
      if (proj.url) {
        sections.push(
          new Paragraph({ text: proj.url, spacing: { after: 100 } })
        );
      }
    });
    sections.push(new Paragraph({ text: '', spacing: { after: 200 } }));
  }

  // Languages
  if (data.languages && data.languages.length > 0) {
    sections.push(
      new Paragraph({
        text: 'LANGUAGES',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        text: data.languages.join(' • '),
        spacing: { after: 200 },
      })
    );
  }

  // Awards
  if (data.awards && data.awards.length > 0) {
    sections.push(
      new Paragraph({
        text: 'AWARDS & HONORS',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 100 },
      })
    );
    data.awards.forEach((award: any) => {
      const awardName = typeof award === 'string' ? award : award.name || '';
      const awardDate = typeof award === 'object' && award.date ? ` (${award.date})` : '';
      sections.push(
        new Paragraph({
          text: `• ${awardName}${awardDate}`,
          spacing: { after: 80 },
        })
      );
    });
    sections.push(new Paragraph({ text: '', spacing: { after: 200 } }));
  }

  // Volunteer Work
  if (data.volunteerWork && data.volunteerWork.length > 0) {
    sections.push(
      new Paragraph({
        text: 'VOLUNTEER WORK',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 100 },
      })
    );
    data.volunteerWork.forEach((vol: any) => {
      if (typeof vol === 'string') {
        sections.push(new Paragraph({ text: `• ${vol}`, spacing: { after: 80 } }));
      } else {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: vol.role || '', bold: true }),
              new TextRun({ text: vol.organization ? ` - ${vol.organization}` : '', bold: true }),
            ],
            spacing: { before: 150, after: 50 },
          }),
          new Paragraph({
            children: [new TextRun({
              text: vol.period || `${vol.startDate || ''}${vol.endDate ? ` - ${vol.endDate}` : vol.current ? ' - Present' : ''}`,
              italics: true,
            })],
            spacing: { after: 50 },
          })
        );
        if (vol.description && Array.isArray(vol.description)) {
          vol.description.forEach((bullet: string) => {
            sections.push(new Paragraph({ text: `• ${bullet}`, spacing: { after: 50 } }));
          });
        }
        sections.push(new Paragraph({ text: '', spacing: { after: 150 } }));
      }
    });
  }

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: sections,
      },
    ],
  });

  // Convert to buffer
  const buffer = await Packer.toBuffer(doc);
  console.log(`DOCX generated successfully, size: ${buffer.length} bytes`);
  return buffer;
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

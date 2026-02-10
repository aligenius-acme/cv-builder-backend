import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
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
            .text(exp.title, 40, y, { width: pageWidth - 80 });
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
            .text(exp.title, mainX, mainY, { width: contentWidth });
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
            .text(exp.title, mainX, mainY, { width: contentWidth });
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
    });

    // Ensure it's a proper Buffer (Puppeteer returns Uint8Array)
    const pdfBuffer = Buffer.from(pdfData);
    console.log(`PDF generated successfully, size: ${pdfBuffer.length} bytes`);
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

/**
 * Generate DOCX using template from registry
 * Loads template dynamically and uses React DOCX if available
 */
export async function generateDOCXFromRegistry(
  data: ParsedResumeData,
  templateId: string
): Promise<Buffer> {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx');
  const { incrementTemplateUsage, getTemplateById } = await import('./template-registry');

  // Increment usage count
  try {
    await incrementTemplateUsage(templateId);
  } catch (err) {
    console.warn('Failed to increment template usage:', err);
  }

  // Generate a simple DOCX document from resume data
  console.log(`Generating DOCX for template: ${templateId}`);

  const sections = [];

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
          text: `${exp.startDate || ''} - ${exp.current ? 'Present' : exp.endDate || ''}`,
          italics: true,
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
          text: edu.graduationDate || '',
          italics: true,
          spacing: { after: 200 },
        })
      );
    });
  }

  // Skills
  if (data.skills && data.skills.length > 0) {
    sections.push(
      new Paragraph({
        text: 'SKILLS',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        text: data.skills.join(', '),
        spacing: { after: 200 },
      })
    );
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

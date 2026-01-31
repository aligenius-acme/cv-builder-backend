/**
 * Template HTML Generator
 * Generates HTML for templates matching the preview images
 */

import { ParsedResumeData } from '../types';
import { getTemplateById } from './template-registry';
import puppeteer from 'puppeteer';

interface TemplateColors {
  primary: string;
  secondary: string;
  text: string;
  textLight: string;
}

// Color palettes matching preview generation
const colorPalettes: Record<string, TemplateColors> = {
  'ats-professional': { primary: '#1e3a8a', secondary: '#64748b', text: '#1f2937', textLight: '#4b5563' },
  'tech-startup': { primary: '#0ea5e9', secondary: '#64748b', text: '#0f172a', textLight: '#475569' },
  'creative-design': { primary: '#ec4899', secondary: '#f97316', text: '#18181b', textLight: '#52525b' },
  'academic-research': { primary: '#115e59', secondary: '#475569', text: '#1f2937', textLight: '#4b5563' },
  'entry-student': { primary: '#8b5cf6', secondary: '#64748b', text: '#1f2937', textLight: '#6b7280' },
  'executive-leadership': { primary: '#7c2d12', secondary: '#44403c', text: '#1c1917', textLight: '#57534e' },
};

// Helper function to format name for sidebar (split into lines)
function formatNameForSidebar(name: string): string {
  const parts = name.toUpperCase().trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0]}<br/>${parts.slice(1).join(' ')}`;
  }
  return name.toUpperCase();
}

// Helper function to get job title from experience
function getJobTitle(experience: any[]): string {
  if (experience && experience.length > 0 && experience[0].title) {
    return experience[0].title;
  }
  return 'Professional';
}

export async function generateTemplateHTML(
  templateId: string,
  data: ParsedResumeData
): Promise<string> {
  // Get template from database
  const template = await getTemplateById(templateId);
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  // Get colors based on category (matching preview generation)
  const colors = colorPalettes[template.primaryCategory || 'ats-professional'] || colorPalettes['ats-professional'];

  // Determine layout type
  const nameLower = template.name.toLowerCase();
  const isTwoColumn =
    nameLower.includes('bold') ||
    nameLower.includes('casual') ||
    nameLower.includes('pro') ||
    nameLower.includes('portfolio') ||
    nameLower.includes('sidebar') ||
    (nameLower.includes('modern') && template.primaryCategory === 'tech-startup');

  const isCreative = template.primaryCategory === 'creative-design';
  const isAcademic = template.primaryCategory === 'academic-research';

  // Generate appropriate HTML
  if (isTwoColumn) {
    console.log(`  ✅ Using TWO-COLUMN layout for "${template.name}"`);
    return generateTwoColumnHTML(template.name, data, colors, isCreative);
  } else if (isAcademic) {
    console.log(`  ✅ Using ACADEMIC layout for "${template.name}"`);
    return generateAcademicHTML(template.name, data, colors);
  } else {
    console.log(`  ✅ Using SINGLE-COLUMN layout for "${template.name}"`);
    return generateSingleColumnHTML(template.name, data, colors, isCreative);
  }
}

function generateSingleColumnHTML(name: string, data: ParsedResumeData, colors: TemplateColors, isCreative: boolean): string {
  const contact = data.contact || {};
  const experience = data.experience || [];
  const education = data.education || [];
  const skills = data.skills || [];
  const summary = data.summary || '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Calibri', Arial, sans-serif;
          background: white;
          width: 850px;
          padding: ${isCreative ? '32px 40px' : '40px 48px'};
          color: ${colors.text};
          line-height: 1.5;
        }
        .header {
          text-align: center;
          margin-bottom: ${isCreative ? '22px' : '18px'};
          ${isCreative ? `border-bottom: 3px solid ${colors.primary}; padding-bottom: 14px;` : 'padding-bottom: 6px;'}
        }
        .name {
          font-size: ${isCreative ? '32px' : '28px'};
          font-weight: bold;
          color: ${colors.primary};
          margin-bottom: 6px;
          letter-spacing: 0.5px;
        }
        .title {
          font-size: 13px;
          color: ${colors.textLight};
          font-weight: 600;
          margin-bottom: 6px;
        }
        .contact {
          font-size: 9px;
          color: ${colors.textLight};
          line-height: 1.4;
        }
        .section { margin-bottom: 16px; }
        .section-title {
          font-size: 12px;
          font-weight: bold;
          color: ${colors.primary};
          ${!isCreative ? `border-bottom: 2px solid ${colors.primary};` : `background: ${colors.primary}; color: white; padding: 3px 8px; margin: 0 -8px;`}
          padding-bottom: 3px;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }
        .summary-text {
          font-size: 9.5px;
          line-height: 1.65;
          color: ${colors.textLight};
          text-align: justify;
        }
        .job-entry { margin-bottom: 11px; }
        .job-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 3px; }
        .job-title { font-weight: bold; font-size: 11px; color: ${colors.text}; }
        .job-date { font-size: 9px; color: ${colors.textLight}; font-style: italic; }
        .company { font-size: 10px; color: ${colors.textLight}; margin-bottom: 4px; }
        .bullet { font-size: 9px; line-height: 1.55; margin: 2px 0 2px 18px; color: ${colors.textLight}; }
        .bullet:before { content: "•"; margin-right: 8px; color: ${colors.primary}; font-weight: bold; }
        .skills { display: flex; flex-wrap: wrap; gap: 5px; }
        .skill {
          background: ${isCreative ? colors.primary : '#f1f5f9'};
          color: ${isCreative ? 'white' : colors.text};
          padding: 3px 10px;
          border-radius: ${isCreative ? '12px' : '4px'};
          font-size: 8.5px;
          font-weight: 500;
        }
        .edu-entry { margin-bottom: 8px; }
        .degree { font-weight: bold; font-size: 10.5px; color: ${colors.text}; }
        .school { font-size: 9.5px; color: ${colors.textLight}; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="name">${(contact.name || 'YOUR NAME').toUpperCase()}</div>
        <div class="contact">
          ${contact.email || ''} ${contact.phone ? '• ' + contact.phone : ''} ${contact.location ? '• ' + contact.location : ''}<br/>
          ${contact.linkedin || ''} ${contact.github ? '• ' + contact.github : ''}
        </div>
      </div>

      ${summary ? `
      <div class="section">
        <div class="section-title">Professional Summary</div>
        <div class="summary-text">${summary}</div>
      </div>
      ` : ''}

      ${experience.length > 0 ? `
      <div class="section">
        <div class="section-title">Professional Experience</div>
        ${experience.map(exp => `
        <div class="job-entry">
          <div class="job-header">
            <div class="job-title">${exp.title || ''}</div>
            <div class="job-date">${exp.startDate || ''} - ${exp.current ? 'Present' : exp.endDate || ''}</div>
          </div>
          <div class="company">${exp.company || ''} ${exp.location ? '• ' + exp.location : ''}</div>
          ${Array.isArray(exp.description) ? exp.description.map((bullet: string) => `
          <div class="bullet">${bullet}</div>
          `).join('') : ''}
        </div>
        `).join('')}
      </div>
      ` : ''}

      ${skills.length > 0 ? `
      <div class="section">
        <div class="section-title">Skills</div>
        <div class="skills">
          ${(Array.isArray(skills) ? skills : []).map(skill =>
            typeof skill === 'string' ? `<span class="skill">${skill}</span>` : ''
          ).join('')}
        </div>
      </div>
      ` : ''}

      ${education.length > 0 ? `
      <div class="section">
        <div class="section-title">Education</div>
        ${education.map(edu => `
        <div class="edu-entry">
          <div class="degree">${edu.degree || ''}</div>
          <div class="school">${edu.institution || ''} ${edu.location ? '• ' + edu.location : ''} ${edu.graduationDate ? '• ' + edu.graduationDate : ''}</div>
        </div>
        `).join('')}
      </div>
      ` : ''}
    </body>
    </html>
  `;
}

function generateTwoColumnHTML(name: string, data: ParsedResumeData, colors: TemplateColors, isCreative: boolean): string {
  const contact = data.contact || {};
  const experience = data.experience || [];
  const education = data.education || [];
  const skills = data.skills || [];
  const summary = data.summary || '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          background: white;
          width: 850px;
          display: flex;
          color: ${colors.text};
        }
        .sidebar {
          width: 280px;
          background: ${isCreative ? colors.primary : '#f8fafc'};
          padding: 32px 22px;
          color: ${isCreative ? 'white' : colors.text};
          ${isCreative ? `background: linear-gradient(180deg, ${colors.primary} 0%, ${colors.secondary} 100%);` : ''}
        }
        .main { flex: 1; padding: 36px 32px; }
        .name {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 6px;
          line-height: 1.2;
          ${isCreative ? 'color: white;' : `color: ${colors.primary};`}
        }
        .title {
          font-size: 13px;
          color: ${isCreative ? 'rgba(255,255,255,0.95)' : colors.textLight};
          margin-bottom: 22px;
          font-weight: 600;
        }
        .sidebar-section { margin-bottom: 20px; }
        .sidebar-title {
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 10px;
          letter-spacing: 0.8px;
          ${isCreative ? 'color: white; border-bottom: 2px solid rgba(255,255,255,0.6);' : `color: ${colors.primary}; border-bottom: 2px solid ${colors.primary};`}
          padding-bottom: 5px;
        }
        .sidebar-item {
          font-size: 8.5px;
          margin: 5px 0;
          line-height: 1.5;
          color: ${isCreative ? 'rgba(255,255,255,0.9)' : colors.textLight};
        }
        .section { margin-bottom: 20px; }
        .section-title {
          font-size: 13px;
          font-weight: bold;
          color: ${colors.primary};
          border-bottom: 2.5px solid ${colors.primary};
          padding-bottom: 4px;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .job-entry { margin-bottom: 12px; }
        .job-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; }
        .job-title { font-weight: bold; font-size: 11px; color: ${colors.text}; }
        .job-date { font-size: 9px; color: ${colors.textLight}; font-style: italic; }
        .company { font-size: 9.5px; color: ${colors.textLight}; margin-bottom: 4px; }
        .bullet { font-size: 9px; line-height: 1.5; margin: 2px 0 2px 14px; color: ${colors.textLight}; }
        .bullet:before { content: "•"; margin-right: 8px; color: ${colors.primary}; font-weight: bold; }
        .skill-pill {
          background: ${isCreative ? 'rgba(255,255,255,0.95)' : colors.primary};
          color: ${isCreative ? colors.primary : 'white'};
          padding: 4px 10px;
          border-radius: 10px;
          font-size: 7.5px;
          margin: 4px 3px 4px 0;
          display: inline-block;
          font-weight: 600;
          ${isCreative ? `box-shadow: 0 2px 4px rgba(0,0,0,0.1);` : ''}
        }
        .summary-text { font-size: 9.5px; line-height: 1.65; color: ${colors.textLight}; text-align: justify; }
      </style>
    </head>
    <body>
      <div class="sidebar">
        <div class="name">${formatNameForSidebar(contact.name || 'YOUR NAME')}</div>
        <div class="title">${getJobTitle(experience)}</div>

        <div class="sidebar-section">
          <div class="sidebar-title">Contact</div>
          ${contact.email ? `<div class="sidebar-item">📧 ${contact.email}</div>` : ''}
          ${contact.phone ? `<div class="sidebar-item">📱 ${contact.phone}</div>` : ''}
          ${contact.location ? `<div class="sidebar-item">📍 ${contact.location}</div>` : ''}
          ${contact.linkedin ? `<div class="sidebar-item">🔗 ${contact.linkedin}</div>` : ''}
          ${contact.github ? `<div class="sidebar-item">💻 ${contact.github}</div>` : ''}
        </div>

        ${skills.length > 0 ? `
        <div class="sidebar-section">
          <div class="sidebar-title">Skills</div>
          ${(Array.isArray(skills) ? skills : []).map(skill =>
            typeof skill === 'string' ? `<div class="skill-pill">${skill}</div>` : ''
          ).join('')}
        </div>
        ` : ''}
      </div>

      <div class="main">
        ${summary ? `
        <div class="section">
          <div class="section-title">Summary</div>
          <div style="font-size: 9.5px; line-height: 1.65;">${summary}</div>
        </div>
        ` : ''}

        ${experience.length > 0 ? `
        <div class="section">
          <div class="section-title">Experience</div>
          ${experience.map(exp => `
          <div class="job-entry">
            <div class="job-header">
              <div class="job-title">${exp.title || ''}</div>
              <div class="job-date">${exp.startDate || ''} - ${exp.current ? 'Present' : exp.endDate || ''}</div>
            </div>
            <div class="company">${exp.company || ''}</div>
            ${Array.isArray(exp.description) ? exp.description.map((bullet: string) => `
            <div class="bullet">${bullet}</div>
            `).join('') : ''}
          </div>
          `).join('')}
        </div>
        ` : ''}

        ${education.length > 0 ? `
        <div class="section">
          <div class="section-title">Education</div>
          ${education.map(edu => `
          <div class="job-entry">
            <div class="job-title">${edu.degree || ''}</div>
            <div class="company">${edu.institution || ''} ${edu.graduationDate ? '• ' + edu.graduationDate : ''}</div>
          </div>
          `).join('')}
        </div>
        ` : ''}
      </div>
    </body>
    </html>
  `;
}

function generateAcademicHTML(name: string, data: ParsedResumeData, colors: TemplateColors): string {
  const contact = data.contact || {};
  const education = data.education || [];
  const experience = data.experience || [];

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Times New Roman', Georgia, serif;
          background: white;
          width: 850px;
          padding: 42px 56px;
          color: ${colors.text};
          font-size: 10px;
          line-height: 1.5;
        }
        .header {
          text-align: center;
          margin-bottom: 26px;
          border-bottom: 2px solid ${colors.primary};
          padding-bottom: 14px;
        }
        .name {
          font-size: 26px;
          font-weight: bold;
          margin-bottom: 8px;
          color: ${colors.primary};
        }
        .contact { font-size: 9.5px; color: ${colors.textLight}; }
        .section { margin-bottom: 18px; }
        .section-title {
          font-size: 12px;
          font-weight: bold;
          color: ${colors.primary};
          border-bottom: 1.5px solid ${colors.primary};
          padding-bottom: 3px;
          margin-bottom: 10px;
          text-transform: uppercase;
        }
        .entry { margin-bottom: 10px; font-size: 9.5px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="name">${(contact.name || 'YOUR NAME').toUpperCase()}</div>
        <div class="contact">
          ${contact.email || ''} • ${contact.phone || ''} • ${contact.location || ''}
        </div>
      </div>

      ${education.length > 0 ? `
      <div class="section">
        <div class="section-title">Education</div>
        ${education.map(edu => `
        <div class="entry">
          <strong>${edu.degree || ''}</strong>, ${edu.institution || ''}, ${edu.graduationDate || ''}
        </div>
        `).join('')}
      </div>
      ` : ''}

      ${experience.length > 0 ? `
      <div class="section">
        <div class="section-title">Experience</div>
        ${experience.map(exp => `
        <div class="entry">
          <strong>${exp.title || ''}</strong>, ${exp.company || ''}, ${exp.startDate || ''} - ${exp.current ? 'Present' : exp.endDate || ''}
        </div>
        `).join('')}
      </div>
      ` : ''}
    </body>
    </html>
  `;
}

/**
 * Generate PDF from template HTML using Puppeteer
 */
export async function generateTemplatePDF(
  templateId: string,
  data: ParsedResumeData
): Promise<Buffer> {
  console.log(`📄 Generating PDF for template: ${templateId}`);

  const html = await generateTemplateHTML(templateId, data);
  console.log(`  HTML generated, length: ${html.length} chars`);

  // Save HTML for debugging
  const fs = require('fs');
  const path = require('path');
  const debugPath = path.join(__dirname, `../../debug-${templateId}.html`);
  fs.writeFileSync(debugPath, html);
  console.log(`  💾 HTML saved to: ${debugPath}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 10000 });

    const buffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: false,
    });

    console.log(`  PDF generated successfully, size: ${buffer.length} bytes`);
    return Buffer.from(buffer);
  } catch (error) {
    console.error(`  PDF generation error:`, error);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Corporate Modern Template
 * ATS-optimized modern corporate template
 *
 * Features:
 * - Contemporary corporate design
 * - Teal/cyan accents
 * - Clean lines and spacing
 * - Professional yet fresh
 *
 * Best for: Modern corporations, tech-forward businesses, progressive companies
 */

import React from 'react';
import { Document } from 'docx';
import { ReactTemplate, TemplatePDFProps } from '../index';
import { ParsedResumeData } from '../../types';
import { ColorPalette, createCustomPalette } from '../shared/styles/colors';
import { Header } from '../shared/components/Header';
import { SectionHeader } from '../shared/components/SectionHeader';
import { ExperienceSection } from '../shared/components/ExperienceSection';
import { EducationSection } from '../shared/components/EducationSection';
import { SkillsSection } from '../shared/components/SkillsSection';
import { generateDOCXSync } from './generateDOCXSync';

const CorporateModernPDF: React.FC<TemplatePDFProps> = ({ data, colors }) => {
  const modernColors = createCustomPalette('#0891b2', '#0e7490'); // Teal/cyan

  return (
    <div
      style={{
        fontFamily: 'Arial, Calibri, sans-serif',
        fontSize: 11,
        color: modernColors.text,
        backgroundColor: '#ffffff',
        padding: '40px 50px',
        lineHeight: 1.5,
      }}
    >
      <Header contact={data.contact} colors={modernColors} variant="centered" />

      {data.summary && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Professional Summary" colors={modernColors} variant="underline" uppercase />
          <p style={{ margin: '8px 0', lineHeight: 1.6, color: modernColors.textLight }}>
            {data.summary}
          </p>
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Experience" colors={modernColors} variant="underline" uppercase />
          <ExperienceSection experiences={data.experience} colors={modernColors} bulletStyle="bullet" />
        </div>
      )}

      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Education" colors={modernColors} variant="underline" uppercase />
          <EducationSection education={data.education} colors={modernColors} />
        </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Skills & Expertise" colors={modernColors} variant="underline" uppercase />
          <SkillsSection skills={data.skills} colors={modernColors} layout="grid" columns={3} />
        </div>
      )}

      {data.certifications && data.certifications.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Certifications" colors={modernColors} variant="underline" uppercase />
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            {data.certifications.map((cert, index) => (
              <li key={index} style={{ marginBottom: 4, color: modernColors.textLight }}>
                {typeof cert === 'string' ? cert : `${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ''}${cert.date ? ` (${cert.date})` : ''}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export const CorporateModern: ReactTemplate = {
  id: 'corporate-modern',
  name: 'Corporate Modern',

  metadata: {
    id: 'corporate-modern',
    name: 'Corporate Modern',
    description: 'Contemporary corporate template with modern styling and clean design',
    category: 'professional',
    previewImage: '/templates/corporate-modern.png',
    colorPalettes: ['modern', 'professional', 'minimal'],
    features: {
      twoColumn: false,
      headerImage: false,
      colorCustomization: true,
      sectionIcons: false,
      skillBars: false,
      timeline: false,
      portfolio: false,
      publications: false,
      languages: false,
      certifications: true,
    },
    atsScore: 95,
    bestFor: ['Project Manager', 'Business Analyst', 'Operations', 'Corporate Roles'],
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  PDFComponent: CorporateModernPDF,

  generateDOCX: (data: ParsedResumeData, colors: ColorPalette) => {
    return generateDOCXSync(data, colors, '#0891b2');
  },
};

export default CorporateModern;

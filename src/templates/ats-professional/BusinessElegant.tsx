/**
 * Business Elegant Template
 * ATS-optimized elegant business template
 *
 * Features:
 * - Refined professional appearance
 * - Subtle blue accents
 * - Balanced layout
 * - Modern yet conservative
 *
 * Best for: Business development, sales, marketing, operations
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

const BusinessElegantPDF: React.FC<TemplatePDFProps> = ({ data, colors }) => {
  const businessColors = createCustomPalette('#2563eb', '#1e40af'); // Professional blue

  return (
    <div
      style={{
        fontFamily: 'Calibri, Arial, sans-serif',
        fontSize: 11,
        color: businessColors.text,
        backgroundColor: '#ffffff',
        padding: '40px 50px',
        lineHeight: 1.5,
      }}
    >
      <Header contact={data.contact} colors={businessColors} variant="centered" />

      {data.summary && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Professional Summary" colors={businessColors} variant="underline" uppercase />
          <p style={{ margin: '8px 0', lineHeight: 1.6, color: businessColors.textLight }}>
            {data.summary}
          </p>
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Professional Experience" colors={businessColors} variant="underline" uppercase />
          <ExperienceSection experiences={data.experience} colors={businessColors} bulletStyle="bullet" />
        </div>
      )}

      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Education" colors={businessColors} variant="underline" uppercase />
          <EducationSection education={data.education} colors={businessColors} />
        </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Key Skills" colors={businessColors} variant="underline" uppercase />
          <SkillsSection skills={data.skills} colors={businessColors} layout="grid" columns={3} />
        </div>
      )}

      {data.certifications && data.certifications.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Certifications" colors={businessColors} variant="underline" uppercase />
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            {data.certifications.map((cert, index) => (
              <li key={index} style={{ marginBottom: 4, color: businessColors.textLight }}>
                {typeof cert === 'string' ? cert : `${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ''}${cert.date ? ` (${cert.date})` : ''}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export const BusinessElegant: ReactTemplate = {
  id: 'business-elegant',
  name: 'Business Elegant',

  metadata: {
    id: 'business-elegant',
    name: 'Business Elegant',
    description: 'Elegant professional template for business roles with refined appearance',
    category: 'professional',
    previewImage: '/templates/business-elegant.png',
    colorPalettes: ['professional', 'modern', 'executive'],
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
    bestFor: ['Business Development', 'Sales Manager', 'Marketing Manager', 'Operations Manager'],
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  PDFComponent: BusinessElegantPDF,

  generateDOCX: (data: ParsedResumeData, colors: ColorPalette) => {
    return generateDOCXSync(data, colors, '#2563eb');
  },
};

export default BusinessElegant;

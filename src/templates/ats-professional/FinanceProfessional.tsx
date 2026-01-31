/**
 * Finance Professional Template
 * ATS-optimized template for finance and banking professionals
 *
 * Features:
 * - Conservative design with navy blue accents
 * - Quantitative achievements emphasis
 * - Clean, parseable layout
 * - Professional appearance
 *
 * Best for: Financial analysts, accountants, banking professionals
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

const FinanceProfessionalPDF: React.FC<TemplatePDFProps> = ({ data, colors }) => {
  const financeColors = createCustomPalette('#1e40af', '#1e3a8a'); // Navy blue

  return (
    <div
      style={{
        fontFamily: 'Calibri, Arial, sans-serif',
        fontSize: 11,
        color: financeColors.text,
        backgroundColor: '#ffffff',
        padding: '40px 50px',
        lineHeight: 1.5,
      }}
    >
      <Header contact={data.contact} colors={financeColors} variant="centered" />

      {data.summary && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Professional Summary" colors={financeColors} variant="underline" uppercase />
          <p style={{ margin: '8px 0', lineHeight: 1.6, color: financeColors.textLight }}>
            {data.summary}
          </p>
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Professional Experience" colors={financeColors} variant="underline" uppercase />
          <ExperienceSection experiences={data.experience} colors={financeColors} bulletStyle="bullet" />
        </div>
      )}

      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Education" colors={financeColors} variant="underline" uppercase />
          <EducationSection education={data.education} colors={financeColors} />
        </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Core Competencies" colors={financeColors} variant="underline" uppercase />
          <SkillsSection skills={data.skills} colors={financeColors} layout="grid" columns={3} />
        </div>
      )}

      {data.certifications && data.certifications.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Professional Certifications" colors={financeColors} variant="underline" uppercase />
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            {data.certifications.map((cert, index) => (
              <li key={index} style={{ marginBottom: 4, color: financeColors.textLight }}>
                {typeof cert === 'string' ? cert : `${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ''}${cert.date ? ` (${cert.date})` : ''}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export const FinanceProfessional: ReactTemplate = {
  id: 'finance-professional',
  name: 'Finance Professional',

  metadata: {
    id: 'finance-professional',
    name: 'Finance Professional',
    description: 'Conservative template designed for finance and banking professionals with emphasis on quantitative achievements',
    category: 'professional',
    previewImage: '/templates/finance-professional.png',
    colorPalettes: ['executive', 'professional', 'minimal'],
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
    atsScore: 96,
    bestFor: ['Financial Analyst', 'Investment Banking', 'Accounting', 'Corporate Finance', 'CFO'],
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  PDFComponent: FinanceProfessionalPDF,

  generateDOCX: (data: ParsedResumeData, colors: ColorPalette) => {
    return generateDOCXSync(data, colors, '#1e40af');
  },
};

export default FinanceProfessional;

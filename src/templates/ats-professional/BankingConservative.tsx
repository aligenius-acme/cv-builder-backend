/**
 * Banking Conservative Template
 * ATS-optimized template for banking and financial services
 *
 * Features:
 * - Ultra-conservative design
 * - Traditional formatting
 * - Burgundy accents
 * - Maximum professionalism
 *
 * Best for: Investment banking, private banking, wealth management
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

const BankingConservativePDF: React.FC<TemplatePDFProps> = ({ data, colors }) => {
  const bankingColors = createCustomPalette('#7f1d1d', '#991b1b'); // Burgundy

  return (
    <div
      style={{
        fontFamily: 'Times New Roman, Georgia, serif',
        fontSize: 11,
        color: bankingColors.text,
        backgroundColor: '#ffffff',
        padding: '40px 50px',
        lineHeight: 1.6,
      }}
    >
      <Header contact={data.contact} colors={bankingColors} variant="centered" />

      {data.summary && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Professional Summary" colors={bankingColors} variant="underline" uppercase />
          <p style={{ margin: '8px 0', lineHeight: 1.6, color: bankingColors.textLight, textAlign: 'justify' }}>
            {data.summary}
          </p>
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Professional Experience" colors={bankingColors} variant="underline" uppercase />
          <ExperienceSection experiences={data.experience} colors={bankingColors} bulletStyle="bullet" />
        </div>
      )}

      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Education" colors={bankingColors} variant="underline" uppercase />
          <EducationSection education={data.education} colors={bankingColors} />
        </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Professional Competencies" colors={bankingColors} variant="underline" uppercase />
          <SkillsSection skills={data.skills} colors={bankingColors} layout="list" showBullets />
        </div>
      )}

      {data.certifications && data.certifications.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Licenses & Certifications" colors={bankingColors} variant="underline" uppercase />
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            {data.certifications.map((cert, index) => (
              <li key={index} style={{ marginBottom: 4, color: bankingColors.textLight }}>
                {typeof cert === 'string' ? cert : `${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ''}${cert.date ? ` (${cert.date})` : ''}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export const BankingConservative: ReactTemplate = {
  id: 'banking-conservative',
  name: 'Banking Conservative',

  metadata: {
    id: 'banking-conservative',
    name: 'Banking Conservative',
    description: 'Ultra-conservative template for banking and financial services professionals',
    category: 'professional',
    previewImage: '/templates/banking-conservative.png',
    colorPalettes: ['executive', 'minimal', 'professional'],
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
    atsScore: 97,
    bestFor: ['Investment Banker', 'Private Banker', 'Wealth Manager', 'Financial Advisor'],
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  PDFComponent: BankingConservativePDF,

  generateDOCX: (data: ParsedResumeData, colors: ColorPalette) => {
    return generateDOCXSync(data, colors, '#7f1d1d');
  },
};

export default BankingConservative;

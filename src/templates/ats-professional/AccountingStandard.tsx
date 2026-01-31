/**
 * Accounting Standard Template
 * ATS-optimized template for accounting professionals
 *
 * Features:
 * - Clean, organized layout
 * - Professional green accents
 * - Detail-oriented design
 * - CPA/certification emphasis
 *
 * Best for: CPAs, accountants, auditors, tax professionals
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

const AccountingStandardPDF: React.FC<TemplatePDFProps> = ({ data, colors }) => {
  const accountingColors = createCustomPalette('#064e3b', '#065f46'); // Professional green

  return (
    <div
      style={{
        fontFamily: 'Calibri, Arial, sans-serif',
        fontSize: 11,
        color: accountingColors.text,
        backgroundColor: '#ffffff',
        padding: '40px 50px',
        lineHeight: 1.5,
      }}
    >
      <Header contact={data.contact} colors={accountingColors} variant="centered" />

      {data.summary && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Professional Summary" colors={accountingColors} variant="underline" uppercase />
          <p style={{ margin: '8px 0', lineHeight: 1.6, color: accountingColors.textLight }}>
            {data.summary}
          </p>
        </div>
      )}

      {data.certifications && data.certifications.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Professional Certifications" colors={accountingColors} variant="underline" uppercase />
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            {data.certifications.map((cert, index) => (
              <li key={index} style={{ marginBottom: 4, color: accountingColors.textLight }}>
                {typeof cert === 'string' ? cert : `${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ''}${cert.date ? ` (${cert.date})` : ''}`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Professional Experience" colors={accountingColors} variant="underline" uppercase />
          <ExperienceSection experiences={data.experience} colors={accountingColors} bulletStyle="bullet" />
        </div>
      )}

      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Education" colors={accountingColors} variant="underline" uppercase />
          <EducationSection education={data.education} colors={accountingColors} />
        </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Technical Skills" colors={accountingColors} variant="underline" uppercase />
          <SkillsSection skills={data.skills} colors={accountingColors} layout="grid" columns={3} />
        </div>
      )}
    </div>
  );
};

export const AccountingStandard: ReactTemplate = {
  id: 'accounting-standard',
  name: 'Accounting Standard',

  metadata: {
    id: 'accounting-standard',
    name: 'Accounting Standard',
    description: 'Clean, organized template for accounting professionals with CPA certification emphasis',
    category: 'professional',
    previewImage: '/templates/accounting-standard.png',
    colorPalettes: ['professional', 'minimal', 'executive'],
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
    bestFor: ['CPA', 'Accountant', 'Auditor', 'Tax Specialist', 'Controller'],
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  PDFComponent: AccountingStandardPDF,

  generateDOCX: (data: ParsedResumeData, colors: ColorPalette) => {
    return generateDOCXSync(data, colors, '#064e3b');
  },
};

export default AccountingStandard;

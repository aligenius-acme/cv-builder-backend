/**
 * Insurance Professional Template
 * ATS-optimized template for insurance industry professionals
 *
 * Features:
 * - Trustworthy design
 * - Deep blue color scheme
 * - Clear section organization
 * - Professional credibility
 *
 * Best for: Insurance agents, underwriters, claims adjusters, actuaries
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

const InsuranceProfessionalPDF: React.FC<TemplatePDFProps> = ({ data, colors }) => {
  const insuranceColors = createCustomPalette('#1e40af', '#1e3a8a'); // Deep blue

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        fontSize: 11,
        color: insuranceColors.text,
        backgroundColor: '#ffffff',
        padding: '40px 50px',
        lineHeight: 1.5,
      }}
    >
      <Header contact={data.contact} colors={insuranceColors} variant="centered" />

      {data.summary && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Professional Profile" colors={insuranceColors} variant="underline" uppercase />
          <p style={{ margin: '8px 0', lineHeight: 1.6, color: insuranceColors.textLight }}>
            {data.summary}
          </p>
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Professional Experience" colors={insuranceColors} variant="underline" uppercase />
          <ExperienceSection experiences={data.experience} colors={insuranceColors} bulletStyle="bullet" />
        </div>
      )}

      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Education" colors={insuranceColors} variant="underline" uppercase />
          <EducationSection education={data.education} colors={insuranceColors} />
        </div>
      )}

      {data.certifications && data.certifications.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Licenses & Professional Designations" colors={insuranceColors} variant="underline" uppercase />
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            {data.certifications.map((cert, index) => (
              <li key={index} style={{ marginBottom: 4, color: insuranceColors.textLight }}>
                {typeof cert === 'string' ? cert : `${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ''}${cert.date ? ` (${cert.date})` : ''}`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Areas of Expertise" colors={insuranceColors} variant="underline" uppercase />
          <SkillsSection skills={data.skills} colors={insuranceColors} layout="grid" columns={2} />
        </div>
      )}
    </div>
  );
};

export const InsuranceProfessional: ReactTemplate = {
  id: 'insurance-professional',
  name: 'Insurance Professional',

  metadata: {
    id: 'insurance-professional',
    name: 'Insurance Professional',
    description: 'Professional template for insurance industry roles with emphasis on licenses and credentials',
    category: 'professional',
    previewImage: '/templates/insurance-professional.png',
    colorPalettes: ['professional', 'executive', 'minimal'],
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
    bestFor: ['Insurance Agent', 'Underwriter', 'Claims Adjuster', 'Actuary', 'Risk Manager'],
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  PDFComponent: InsuranceProfessionalPDF,

  generateDOCX: (data: ParsedResumeData, colors: ColorPalette) => {
    return generateDOCXSync(data, colors, '#1e40af');
  },
};

export default InsuranceProfessional;

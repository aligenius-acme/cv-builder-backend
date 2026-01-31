/**
 * Consulting Refined Template
 * ATS-optimized refined template for senior consultants
 *
 * Features:
 * - Sophisticated design
 * - Indigo color scheme
 * - Strategic presentation
 * - Results-oriented layout
 *
 * Best for: Senior consultants, partners, strategic advisors
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

const ConsultingRefinedPDF: React.FC<TemplatePDFProps> = ({ data, colors }) => {
  const refinedColors = createCustomPalette('#3730a3', '#4338ca'); // Indigo

  return (
    <div
      style={{
        fontFamily: 'Calibri, Arial, sans-serif',
        fontSize: 11,
        color: refinedColors.text,
        backgroundColor: '#ffffff',
        padding: '40px 50px',
        lineHeight: 1.5,
      }}
    >
      <Header contact={data.contact} colors={refinedColors} variant="centered" />

      {data.summary && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Professional Profile" colors={refinedColors} variant="underline" uppercase />
          <p style={{ margin: '8px 0', lineHeight: 1.6, color: refinedColors.textLight }}>
            {data.summary}
          </p>
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Consulting Experience" colors={refinedColors} variant="underline" uppercase />
          <ExperienceSection experiences={data.experience} colors={refinedColors} bulletStyle="bullet" />
        </div>
      )}

      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Education" colors={refinedColors} variant="underline" uppercase />
          <EducationSection education={data.education} colors={refinedColors} />
        </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Areas of Expertise" colors={refinedColors} variant="underline" uppercase />
          <SkillsSection skills={data.skills} colors={refinedColors} layout="grid" columns={3} />
        </div>
      )}

      {data.certifications && data.certifications.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Certifications & Training" colors={refinedColors} variant="underline" uppercase />
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            {data.certifications.map((cert, index) => (
              <li key={index} style={{ marginBottom: 4, color: refinedColors.textLight }}>
                {typeof cert === 'string' ? cert : `${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ''}${cert.date ? ` (${cert.date})` : ''}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export const ConsultingRefined: ReactTemplate = {
  id: 'consulting-refined',
  name: 'Consulting Refined',

  metadata: {
    id: 'consulting-refined',
    name: 'Consulting Refined',
    description: 'Refined template for senior consultants with sophisticated design and strategic focus',
    category: 'professional',
    previewImage: '/templates/consulting-refined.png',
    colorPalettes: ['executive', 'professional', 'modern'],
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
    bestFor: ['Senior Consultant', 'Partner', 'Strategic Advisor', 'Principal'],
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  PDFComponent: ConsultingRefinedPDF,

  generateDOCX: (data: ParsedResumeData, colors: ColorPalette) => {
    return generateDOCXSync(data, colors, '#3730a3');
  },
};

export default ConsultingRefined;

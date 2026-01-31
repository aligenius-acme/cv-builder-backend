/**
 * Consulting Classic Template
 * ATS-optimized template for management consultants
 *
 * Features:
 * - Classic professional design
 * - Slate gray color scheme
 * - Achievement-focused layout
 * - Clear hierarchy
 *
 * Best for: Management consultants, strategy consultants, business analysts
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

const ConsultingClassicPDF: React.FC<TemplatePDFProps> = ({ data, colors }) => {
  const consultingColors = createCustomPalette('#475569', '#334155'); // Slate gray

  return (
    <div
      style={{
        fontFamily: 'Calibri, Arial, sans-serif',
        fontSize: 11,
        color: consultingColors.text,
        backgroundColor: '#ffffff',
        padding: '40px 50px',
        lineHeight: 1.5,
      }}
    >
      <Header contact={data.contact} colors={consultingColors} variant="centered" />

      {data.summary && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Executive Summary" colors={consultingColors} variant="underline" uppercase />
          <p style={{ margin: '8px 0', lineHeight: 1.6, color: consultingColors.textLight }}>
            {data.summary}
          </p>
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Professional Experience" colors={consultingColors} variant="underline" uppercase />
          <ExperienceSection experiences={data.experience} colors={consultingColors} bulletStyle="bullet" />
        </div>
      )}

      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Education" colors={consultingColors} variant="underline" uppercase />
          <EducationSection education={data.education} colors={consultingColors} />
        </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Core Competencies" colors={consultingColors} variant="underline" uppercase />
          <SkillsSection skills={data.skills} colors={consultingColors} layout="grid" columns={3} />
        </div>
      )}

      {data.certifications && data.certifications.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Professional Development" colors={consultingColors} variant="underline" uppercase />
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            {data.certifications.map((cert, index) => (
              <li key={index} style={{ marginBottom: 4, color: consultingColors.textLight }}>
                {typeof cert === 'string' ? cert : `${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ''}${cert.date ? ` (${cert.date})` : ''}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export const ConsultingClassic: ReactTemplate = {
  id: 'consulting-classic',
  name: 'Consulting Classic',

  metadata: {
    id: 'consulting-classic',
    name: 'Consulting Classic',
    description: 'Classic professional template for consultants with achievement-focused design',
    category: 'professional',
    previewImage: '/templates/consulting-classic.png',
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
    bestFor: ['Management Consultant', 'Strategy Consultant', 'Business Analyst', 'Principal Consultant'],
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  PDFComponent: ConsultingClassicPDF,

  generateDOCX: (data: ParsedResumeData, colors: ColorPalette) => {
    return generateDOCXSync(data, colors, '#475569');
  },
};

export default ConsultingClassic;

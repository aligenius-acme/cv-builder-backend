/**
 * Corporate Standard Template
 * ATS-optimized professional template for corporate environments
 *
 * Features:
 * - Single-column layout
 * - Centered header with contact info
 * - Underlined section headers
 * - Standard bullet points
 * - 95%+ ATS compatibility
 *
 * Best for: Corporate roles, finance, consulting, traditional business
 */

import React from 'react';
import { Document, Paragraph, AlignmentType, TextRun } from 'docx';
import { ReactTemplate, TemplatePDFProps } from '../index';
import { ParsedResumeData } from '../../types';
import { ColorPalette, getColorPalette } from '../shared/styles/colors';
import { Header } from '../shared/components/Header';
import { SectionHeader } from '../shared/components/SectionHeader';
import { ExperienceSection } from '../shared/components/ExperienceSection';
import { EducationSection } from '../shared/components/EducationSection';
import { SkillsSection } from '../shared/components/SkillsSection';
import { generateDOCXSync } from './generateDOCXSync';

/**
 * PDF Component for Corporate Standard Template
 */
const CorporateStandardPDF: React.FC<TemplatePDFProps> = ({ data, colors }) => {
  return (
    <div
      style={{
        fontFamily: 'Calibri, Arial, sans-serif',
        fontSize: 11,
        color: colors.text,
        backgroundColor: '#ffffff',
        padding: '40px 50px',
        lineHeight: 1.5,
      }}
    >
      {/* Header - Centered */}
      <Header contact={data.contact} colors={colors} variant="centered" />

      {/* Professional Summary */}
      {data.summary && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Professional Summary" colors={colors} variant="underline" uppercase />
          <p style={{ margin: '8px 0', lineHeight: 1.6, color: colors.textLight }}>
            {data.summary}
          </p>
        </div>
      )}

      {/* Professional Experience */}
      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Professional Experience" colors={colors} variant="underline" uppercase />
          <ExperienceSection experiences={data.experience} colors={colors} bulletStyle="bullet" />
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Education" colors={colors} variant="underline" uppercase />
          <EducationSection education={data.education} colors={colors} />
        </div>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Skills" colors={colors} variant="underline" uppercase />
          <SkillsSection skills={data.skills} colors={colors} layout="inline" />
        </div>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Certifications" colors={colors} variant="underline" uppercase />
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            {data.certifications.map((cert, index) => (
              <li key={index} style={{ marginBottom: 4, color: colors.textLight }}>
                {typeof cert === 'string' ? cert : `${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ''}${cert.date ? ` (${cert.date})` : ''}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/**
 * Template Definition
 */
export const CorporateStandard: ReactTemplate = {
  id: 'corporate-standard',
  name: 'Corporate Standard',

  metadata: {
    id: 'corporate-standard',
    name: 'Corporate Standard',
    description: 'Clean, professional template optimized for ATS systems in corporate environments',
    category: 'professional',
    previewImage: '/templates/corporate-standard.png',
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
    atsScore: 95,
    bestFor: ['Finance', 'Banking', 'Corporate', 'Consulting', 'Management'],
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  PDFComponent: CorporateStandardPDF,

  generateDOCX: (data: ParsedResumeData, colors: ColorPalette) => {
    return generateDOCXSync(data, colors, colors.primary);
  },
};

export default CorporateStandard;

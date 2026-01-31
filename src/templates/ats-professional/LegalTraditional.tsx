/**
 * Legal Traditional Template
 * ATS-optimized template for legal professionals
 *
 * Features:
 * - Traditional serif-inspired styling
 * - Conservative charcoal color scheme
 * - Formal section organization
 * - Maximum ATS compatibility
 *
 * Best for: Attorneys, legal counsel, compliance officers, paralegals
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

const LegalTraditionalPDF: React.FC<TemplatePDFProps> = ({ data, colors }) => {
  const legalColors = createCustomPalette('#374151', '#1f2937'); // Charcoal gray

  return (
    <div
      style={{
        fontFamily: 'Times New Roman, Georgia, serif',
        fontSize: 11,
        color: legalColors.text,
        backgroundColor: '#ffffff',
        padding: '40px 50px',
        lineHeight: 1.6,
      }}
    >
      <Header contact={data.contact} colors={legalColors} variant="centered" />

      {data.summary && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Professional Profile" colors={legalColors} variant="underline" uppercase />
          <p style={{ margin: '8px 0', lineHeight: 1.6, color: legalColors.textLight, textAlign: 'justify' }}>
            {data.summary}
          </p>
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Professional Experience" colors={legalColors} variant="underline" uppercase />
          <ExperienceSection experiences={data.experience} colors={legalColors} bulletStyle="bullet" />
        </div>
      )}

      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Education & Bar Admissions" colors={legalColors} variant="underline" uppercase />
          <EducationSection education={data.education} colors={legalColors} />
        </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Areas of Practice" colors={legalColors} variant="underline" uppercase />
          <SkillsSection skills={data.skills} colors={legalColors} layout="list" showBullets />
        </div>
      )}

      {data.certifications && data.certifications.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Professional Affiliations" colors={legalColors} variant="underline" uppercase />
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            {data.certifications.map((cert, index) => (
              <li key={index} style={{ marginBottom: 4, color: legalColors.textLight }}>
                {typeof cert === 'string' ? cert : `${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ''}${cert.date ? ` (${cert.date})` : ''}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export const LegalTraditional: ReactTemplate = {
  id: 'legal-traditional',
  name: 'Legal Traditional',

  metadata: {
    id: 'legal-traditional',
    name: 'Legal Traditional',
    description: 'Traditional template for legal professionals with serif fonts and conservative formatting',
    category: 'professional',
    previewImage: '/templates/legal-traditional.png',
    colorPalettes: ['minimal', 'professional', 'executive'],
    features: {
      twoColumn: false,
      headerImage: false,
      colorCustomization: true,
      sectionIcons: false,
      skillBars: false,
      timeline: false,
      portfolio: false,
      publications: true,
      languages: false,
      certifications: true,
    },
    atsScore: 97,
    bestFor: ['Attorney', 'Legal Counsel', 'Compliance Officer', 'Paralegal', 'Judge'],
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  PDFComponent: LegalTraditionalPDF,

  generateDOCX: (data: ParsedResumeData, colors: ColorPalette) => {
    return generateDOCXSync(data, colors, '#374151');
  },
};

export default LegalTraditional;

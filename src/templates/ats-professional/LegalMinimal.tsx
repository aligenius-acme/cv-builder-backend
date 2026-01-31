/**
 * Legal Minimal Template
 * ATS-optimized minimalist template for legal professionals
 *
 * Features:
 * - Ultra-minimal design
 * - Black and white palette
 * - Maximum readability
 * - Perfect for conservative firms
 *
 * Best for: Law firms, legal departments, judicial positions
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

const LegalMinimalPDF: React.FC<TemplatePDFProps> = ({ data, colors }) => {
  const minimalColors = createCustomPalette('#000000', '#404040'); // Black and gray

  return (
    <div
      style={{
        fontFamily: 'Times New Roman, Georgia, serif',
        fontSize: 11,
        color: minimalColors.text,
        backgroundColor: '#ffffff',
        padding: '40px 50px',
        lineHeight: 1.6,
      }}
    >
      <div style={{ textAlign: 'left', marginBottom: 24, borderBottom: '1px solid #000000', paddingBottom: 12 }}>
        <h1 style={{ fontSize: 16, margin: '0 0 6px 0', color: '#000000', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
          {data.contact.name || 'Attorney Name'}
        </h1>
        <div style={{ fontSize: 10, color: minimalColors.textLight }}>
          {[data.contact.email, data.contact.phone, data.contact.location].filter(Boolean).join(' | ')}
        </div>
      </div>

      {data.summary && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="PROFESSIONAL SUMMARY" colors={minimalColors} variant="underline" uppercase />
          <p style={{ margin: '8px 0', lineHeight: 1.6, color: minimalColors.textLight, textAlign: 'justify' }}>
            {data.summary}
          </p>
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="EXPERIENCE" colors={minimalColors} variant="underline" uppercase />
          <ExperienceSection experiences={data.experience} colors={minimalColors} bulletStyle="bullet" />
        </div>
      )}

      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="EDUCATION" colors={minimalColors} variant="underline" uppercase />
          <EducationSection education={data.education} colors={minimalColors} />
        </div>
      )}

      {data.certifications && data.certifications.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="BAR ADMISSIONS" colors={minimalColors} variant="underline" uppercase />
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            {data.certifications.map((cert, index) => (
              <li key={index} style={{ marginBottom: 4, color: minimalColors.textLight }}>
                {typeof cert === 'string' ? cert : `${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ''}${cert.date ? ` (${cert.date})` : ''}`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="PRACTICE AREAS" colors={minimalColors} variant="underline" uppercase />
          <SkillsSection skills={data.skills} colors={minimalColors} layout="list" showBullets />
        </div>
      )}
    </div>
  );
};

export const LegalMinimal: ReactTemplate = {
  id: 'legal-minimal',
  name: 'Legal Minimal',

  metadata: {
    id: 'legal-minimal',
    name: 'Legal Minimal',
    description: 'Ultra-minimal black and white template for conservative legal environments',
    category: 'professional',
    previewImage: '/templates/legal-minimal.png',
    colorPalettes: ['minimal'],
    features: {
      twoColumn: false,
      headerImage: false,
      colorCustomization: false,
      sectionIcons: false,
      skillBars: false,
      timeline: false,
      portfolio: false,
      publications: true,
      languages: false,
      certifications: true,
    },
    atsScore: 98,
    bestFor: ['Attorney', 'Judge', 'Legal Counsel', 'Partner', 'Associate'],
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  PDFComponent: LegalMinimalPDF,

  generateDOCX: (data: ParsedResumeData, colors: ColorPalette) => {
    return generateDOCXSync(data, colors, '#000000');
  },
};

export default LegalMinimal;

/**
 * Professional Elite Template
 * ATS-optimized premium professional template
 *
 * Features:
 * - Premium design
 * - Rich navy blue palette
 * - Distinguished appearance
 * - Executive presence
 *
 * Best for: Top-tier professionals, prestigious firms, senior positions
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

const ProfessionalElitePDF: React.FC<TemplatePDFProps> = ({ data, colors }) => {
  const eliteColors = createCustomPalette('#1e40af', '#1e3a8a'); // Rich navy

  return (
    <div
      style={{
        fontFamily: 'Calibri, Times New Roman, serif',
        fontSize: 11,
        color: eliteColors.text,
        backgroundColor: '#ffffff',
        padding: '40px 55px',
        lineHeight: 1.6,
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 24, borderBottom: `2px solid ${eliteColors.primary}`, paddingBottom: 16 }}>
        <h1 style={{ fontSize: 18, margin: '0 0 8px 0', color: eliteColors.primary, fontWeight: 700, letterSpacing: '0.5px' }}>
          {data.contact.name || 'Professional Name'}
        </h1>
        <div style={{ fontSize: 10, color: eliteColors.textLight, letterSpacing: '0.3px' }}>
          {[data.contact.email, data.contact.phone, data.contact.location].filter(Boolean).join(' • ')}
        </div>
        {(data.contact.linkedin || data.contact.website) && (
          <div style={{ fontSize: 10, color: eliteColors.primary, marginTop: 4 }}>
            {[data.contact.linkedin, data.contact.website].filter(Boolean).join(' • ')}
          </div>
        )}
      </div>

      {data.summary && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Professional Summary" colors={eliteColors} variant="underline" uppercase />
          <p style={{ margin: '8px 0', lineHeight: 1.6, color: eliteColors.textLight, textAlign: 'justify' }}>
            {data.summary}
          </p>
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Professional Experience" colors={eliteColors} variant="underline" uppercase />
          <ExperienceSection experiences={data.experience} colors={eliteColors} bulletStyle="bullet" showDuration />
        </div>
      )}

      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Education" colors={eliteColors} variant="underline" uppercase />
          <EducationSection education={data.education} colors={eliteColors} />
        </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Core Competencies" colors={eliteColors} variant="underline" uppercase />
          <SkillsSection skills={data.skills} colors={eliteColors} layout="grid" columns={3} />
        </div>
      )}

      {data.certifications && data.certifications.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Professional Credentials" colors={eliteColors} variant="underline" uppercase />
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            {data.certifications.map((cert, index) => (
              <li key={index} style={{ marginBottom: 4, color: eliteColors.textLight }}>
                {typeof cert === 'string' ? cert : `${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ''}${cert.date ? ` (${cert.date})` : ''}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export const ProfessionalElite: ReactTemplate = {
  id: 'professional-elite',
  name: 'Professional Elite',

  metadata: {
    id: 'professional-elite',
    name: 'Professional Elite',
    description: 'Premium professional template for distinguished candidates and prestigious positions',
    category: 'professional',
    previewImage: '/templates/professional-elite.png',
    colorPalettes: ['executive', 'professional', 'minimal'],
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
    atsScore: 96,
    bestFor: ['Senior Professional', 'Executive', 'Distinguished Career', 'Premium Positions'],
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  PDFComponent: ProfessionalElitePDF,

  generateDOCX: (data: ParsedResumeData, colors: ColorPalette) => {
    return generateDOCXSync(data, colors, '#1e40af');
  },
};

export default ProfessionalElite;

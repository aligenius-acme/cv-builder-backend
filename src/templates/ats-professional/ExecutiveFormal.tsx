/**
 * Executive Formal Template
 * ATS-optimized template for senior executives and C-suite professionals
 *
 * Features:
 * - Sophisticated formal design
 * - Deep navy color scheme
 * - Leadership-focused sections
 * - Distinguished appearance
 *
 * Best for: C-suite executives, VPs, senior directors, board members
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

const ExecutiveFormalPDF: React.FC<TemplatePDFProps> = ({ data, colors }) => {
  const executiveColors = createCustomPalette('#1e3a8a', '#1e40af'); // Deep navy

  return (
    <div
      style={{
        fontFamily: 'Times New Roman, Georgia, serif',
        fontSize: 11,
        color: executiveColors.text,
        backgroundColor: '#ffffff',
        padding: '40px 60px',
        lineHeight: 1.6,
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, margin: '0 0 8px 0', color: executiveColors.primary, fontWeight: 700 }}>
          {data.contact.name || 'Executive Name'}
        </h1>
        <div style={{ fontSize: 10, color: executiveColors.textLight }}>
          {[data.contact.email, data.contact.phone, data.contact.location].filter(Boolean).join(' • ')}
        </div>
        {(data.contact.linkedin || data.contact.website) && (
          <div style={{ fontSize: 10, color: executiveColors.primary, marginTop: 4 }}>
            {[data.contact.linkedin, data.contact.website].filter(Boolean).join(' • ')}
          </div>
        )}
      </div>

      {data.summary && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Executive Profile" colors={executiveColors} variant="underline" uppercase />
          <p style={{ margin: '8px 0', lineHeight: 1.6, color: executiveColors.textLight, textAlign: 'justify' }}>
            {data.summary}
          </p>
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Leadership Experience" colors={executiveColors} variant="underline" uppercase />
          <ExperienceSection experiences={data.experience} colors={executiveColors} bulletStyle="bullet" showDuration />
        </div>
      )}

      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Education" colors={executiveColors} variant="underline" uppercase />
          <EducationSection education={data.education} colors={executiveColors} />
        </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Executive Competencies" colors={executiveColors} variant="underline" uppercase />
          <SkillsSection skills={data.skills} colors={executiveColors} layout="inline" />
        </div>
      )}

      {data.certifications && data.certifications.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Board Memberships & Affiliations" colors={executiveColors} variant="underline" uppercase />
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            {data.certifications.map((cert, index) => (
              <li key={index} style={{ marginBottom: 4, color: executiveColors.textLight }}>
                {typeof cert === 'string' ? cert : `${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ''}${cert.date ? ` (${cert.date})` : ''}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export const ExecutiveFormal: ReactTemplate = {
  id: 'executive-formal',
  name: 'Executive Formal',

  metadata: {
    id: 'executive-formal',
    name: 'Executive Formal',
    description: 'Sophisticated template for C-suite executives and senior leadership positions',
    category: 'executive',
    previewImage: '/templates/executive-formal.png',
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
    atsScore: 94,
    bestFor: ['CEO', 'CFO', 'COO', 'VP', 'Senior Director', 'Board Member'],
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  PDFComponent: ExecutiveFormalPDF,

  generateDOCX: (data: ParsedResumeData, colors: ColorPalette) => {
    return generateDOCXSync(data, colors, '#1e3a8a');
  },
};

export default ExecutiveFormal;

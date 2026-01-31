/**
 * Finance Executive Template
 * ATS-optimized template for senior finance leaders
 *
 * Features:
 * - Executive-level design
 * - Deep blue professional palette
 * - Strategic focus
 * - Leadership achievements emphasis
 *
 * Best for: CFO, Finance VP, Treasurer, Finance Director
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

const FinanceExecutivePDF: React.FC<TemplatePDFProps> = ({ data, colors }) => {
  const execFinanceColors = createCustomPalette('#1e3a8a', '#1e40af'); // Executive blue

  return (
    <div
      style={{
        fontFamily: 'Times New Roman, Calibri, serif',
        fontSize: 11,
        color: execFinanceColors.text,
        backgroundColor: '#ffffff',
        padding: '40px 55px',
        lineHeight: 1.6,
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 18, margin: '0 0 8px 0', color: execFinanceColors.primary, fontWeight: 700 }}>
          {data.contact.name || 'Finance Executive'}
        </h1>
        <div style={{ fontSize: 10, color: execFinanceColors.textLight }}>
          {[data.contact.email, data.contact.phone, data.contact.location].filter(Boolean).join(' | ')}
        </div>
        {(data.contact.linkedin || data.contact.website) && (
          <div style={{ fontSize: 10, color: execFinanceColors.primary, marginTop: 4 }}>
            {[data.contact.linkedin, data.contact.website].filter(Boolean).join(' | ')}
          </div>
        )}
      </div>

      {data.summary && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Executive Summary" colors={execFinanceColors} variant="underline" uppercase />
          <p style={{ margin: '8px 0', lineHeight: 1.6, color: execFinanceColors.textLight, textAlign: 'justify' }}>
            {data.summary}
          </p>
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Executive Leadership" colors={execFinanceColors} variant="underline" uppercase />
          <ExperienceSection experiences={data.experience} colors={execFinanceColors} bulletStyle="bullet" showDuration />
        </div>
      )}

      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Education" colors={execFinanceColors} variant="underline" uppercase />
          <EducationSection education={data.education} colors={execFinanceColors} />
        </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Core Competencies" colors={execFinanceColors} variant="underline" uppercase />
          <SkillsSection skills={data.skills} colors={execFinanceColors} layout="inline" />
        </div>
      )}

      {data.certifications && data.certifications.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Professional Credentials" colors={execFinanceColors} variant="underline" uppercase />
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            {data.certifications.map((cert, index) => (
              <li key={index} style={{ marginBottom: 4, color: execFinanceColors.textLight }}>
                {typeof cert === 'string' ? cert : `${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ''}${cert.date ? ` (${cert.date})` : ''}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export const FinanceExecutive: ReactTemplate = {
  id: 'finance-executive',
  name: 'Finance Executive',

  metadata: {
    id: 'finance-executive',
    name: 'Finance Executive',
    description: 'Executive-level template for senior finance leaders with strategic focus',
    category: 'executive',
    previewImage: '/templates/finance-executive.png',
    colorPalettes: ['executive', 'professional', 'minimal'],
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
    atsScore: 94,
    bestFor: ['CFO', 'VP Finance', 'Finance Director', 'Treasurer', 'Controller'],
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  PDFComponent: FinanceExecutivePDF,

  generateDOCX: (data: ParsedResumeData, colors: ColorPalette) => {
    return generateDOCXSync(data, colors, '#1e3a8a');
  },
};

export default FinanceExecutive;

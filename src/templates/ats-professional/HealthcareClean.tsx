/**
 * Healthcare Clean Template
 * ATS-optimized template for healthcare professionals
 *
 * Features:
 * - Clean, clinical design
 * - Forest green accents (trustworthy, professional)
 * - Clear section hierarchy
 * - Certifications and licenses emphasis
 *
 * Best for: Nurses, physicians, healthcare administrators, medical professionals
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
import { CertificationsSection } from '../shared/components/CertificationsSection';
import { generateDOCXSync } from './generateDOCXSync';

const HealthcareCleanPDF: React.FC<TemplatePDFProps> = ({ data, colors }) => {
  const healthcareColors = createCustomPalette('#065f46', '#047857'); // Forest green

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        fontSize: 11,
        color: healthcareColors.text,
        backgroundColor: '#ffffff',
        padding: '40px 50px',
        lineHeight: 1.5,
      }}
    >
      <Header contact={data.contact} colors={healthcareColors} variant="centered" />

      {data.summary && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Professional Summary" colors={healthcareColors} variant="underline" uppercase />
          <p style={{ margin: '8px 0', lineHeight: 1.6, color: healthcareColors.textLight }}>
            {data.summary}
          </p>
        </div>
      )}

      {data.certifications && data.certifications.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Licenses & Certifications" colors={healthcareColors} variant="underline" uppercase />
          <CertificationsSection certifications={data.certifications} colors={healthcareColors} layout="list" />
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Clinical Experience" colors={healthcareColors} variant="underline" uppercase />
          <ExperienceSection experiences={data.experience} colors={healthcareColors} bulletStyle="bullet" />
        </div>
      )}

      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Education" colors={healthcareColors} variant="underline" uppercase />
          <EducationSection education={data.education} colors={healthcareColors} />
        </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Clinical Skills & Competencies" colors={healthcareColors} variant="underline" uppercase />
          <SkillsSection skills={data.skills} colors={healthcareColors} layout="grid" columns={2} />
        </div>
      )}
    </div>
  );
};

export const HealthcareClean: ReactTemplate = {
  id: 'healthcare-clean',
  name: 'Healthcare Clean',

  metadata: {
    id: 'healthcare-clean',
    name: 'Healthcare Clean',
    description: 'Clean, professional template for healthcare workers with emphasis on certifications and clinical experience',
    category: 'professional',
    previewImage: '/templates/healthcare-clean.png',
    colorPalettes: ['professional', 'minimal'],
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
    atsScore: 95,
    bestFor: ['Nurse', 'Physician', 'Healthcare Administrator', 'Medical Assistant', 'Therapist'],
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  PDFComponent: HealthcareCleanPDF,

  generateDOCX: (data: ParsedResumeData, colors: ColorPalette) => {
    return generateDOCXSync(data, colors, '#065f46');
  },
};

export default HealthcareClean;

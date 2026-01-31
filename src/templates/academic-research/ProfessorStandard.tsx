/**
 * Professor Standard Template
 * Standard professor CV format with balanced sections
 *
 * Features:
 * - Balanced academic sections
 * - Traditional layout
 * - Clear hierarchy
 * - Professional presentation
 *
 * Best for: Professors, associate professors, assistant professors
 */

import React from 'react';
import { Document } from 'docx';
import { ReactTemplate, TemplatePDFProps } from '../index';
import { ParsedResumeData } from '../../types';
import { AcademicResumeData } from '../../types/academic';
import { ColorPalette, createCustomPalette } from '../shared/styles/colors';
import { Header } from '../shared/components/Header';
import { SectionHeader } from '../shared/components/SectionHeader';
import { ExperienceSection } from '../shared/components/ExperienceSection';
import { EducationSection } from '../shared/components/EducationSection';
import {
  PublicationsSection,
  GrantsSection,
  TeachingSection,
  AcademicServiceSection,
} from '../shared/components/AcademicSections';
import { generateAcademicDOCX } from './generateAcademicDOCX';

const ProfessorStandardPDF: React.FC<TemplatePDFProps> = ({ data, colors }) => {
  const professorColors = createCustomPalette('#4338ca', '#4f46e5'); // Indigo
  const academicData = data as AcademicResumeData;

  return (
    <div
      style={{
        fontFamily: 'Georgia, Garamond, serif',
        fontSize: 11,
        color: professorColors.text,
        backgroundColor: '#ffffff',
        padding: '30px 40px',
        lineHeight: 1.5,
      }}
    >
      <Header contact={data.contact} colors={professorColors} variant="centered" />

      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Education" colors={professorColors} variant="underline" />
          <EducationSection education={data.education} colors={professorColors} />
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Academic Positions" colors={professorColors} variant="underline" />
          <ExperienceSection experiences={data.experience} colors={professorColors} bulletStyle="bullet" />
        </div>
      )}

      {academicData.publications && academicData.publications.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Selected Publications" colors={professorColors} variant="underline" />
          <PublicationsSection publications={academicData.publications} colors={professorColors} />
        </div>
      )}

      {academicData.grants && academicData.grants.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Grants & Funding" colors={professorColors} variant="underline" />
          <GrantsSection grants={academicData.grants} colors={professorColors} />
        </div>
      )}

      {academicData.teaching && academicData.teaching.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Teaching Experience" colors={professorColors} variant="underline" />
          <TeachingSection teaching={academicData.teaching} colors={professorColors} />
        </div>
      )}

      {academicData.academicService && academicData.academicService.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Service & Committees" colors={professorColors} variant="underline" />
          <AcademicServiceSection service={academicData.academicService} colors={professorColors} />
        </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Research Skills" colors={professorColors} variant="underline" />
          <div style={{ color: professorColors.textLight }}>
            {data.skills.join(' • ')}
          </div>
        </div>
      )}

      {data.languages && data.languages.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Languages" colors={professorColors} variant="underline" />
          <div style={{ color: professorColors.textLight }}>
            {data.languages.join(', ')}
          </div>
        </div>
      )}
    </div>
  );
};

export const ProfessorStandard: ReactTemplate = {
  id: 'professor-standard',
  name: 'Professor Standard',

  metadata: {
    id: 'professor-standard',
    name: 'Professor Standard',
    description: 'Standard professor CV with balanced academic sections and traditional formatting',
    category: 'academic',
    primaryCategory: 'academic-research',
    previewImage: '/templates/professor-standard.png',
    colorPalettes: ['traditional', 'professional'],
    features: {
      twoColumn: false,
      headerImage: false,
      colorCustomization: true,
      sectionIcons: false,
      skillBars: false,
      timeline: false,
      portfolio: false,
      publications: true,
      languages: true,
      certifications: false,
    },
    atsScore: 95,
    atsCompatibility: 'ats-friendly',
    designStyle: 'traditional',
    pageLength: 'cv-length',
    industryTags: ['education-academic'],
    experienceLevel: ['mid-level', 'senior'],
    bestFor: ['Professor', 'Associate Professor', 'Assistant Professor', 'Adjunct Professor'],
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  PDFComponent: ProfessorStandardPDF,

  generateDOCX: (data: ParsedResumeData, colors: ColorPalette) => {
    return generateAcademicDOCX(data, colors, '#4338ca');
  },
};

export default ProfessorStandard;

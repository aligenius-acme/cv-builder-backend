/**
 * Research Detailed Template
 * Research-focused CV emphasizing publications and grants
 *
 * Features:
 * - Publications-first layout
 * - Detailed research sections
 * - Grant funding prominence
 * - Traditional serif typography
 *
 * Best for: Research scientists, principal investigators, senior researchers
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
  PresentationsSection,
  ResearchInterestsSection,
} from '../shared/components/AcademicSections';
import { generateAcademicDOCX } from './generateAcademicDOCX';

const ResearchDetailedPDF: React.FC<TemplatePDFProps> = ({ data, colors }) => {
  const researchColors = createCustomPalette('#115e59', '#0f766e'); // Teal for research
  const academicData = data as AcademicResumeData;

  return (
    <div
      style={{
        fontFamily: 'Garamond, Georgia, serif',
        fontSize: 11,
        color: researchColors.text,
        backgroundColor: '#ffffff',
        padding: '30px 40px',
        lineHeight: 1.5,
      }}
    >
      <Header contact={data.contact} colors={researchColors} variant="centered" />

      {academicData.researchInterests && academicData.researchInterests.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Research Interests" colors={researchColors} variant="underline" />
          <ResearchInterestsSection interests={academicData.researchInterests} colors={researchColors} />
        </div>
      )}

      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Education" colors={researchColors} variant="underline" />
          <EducationSection education={data.education} colors={researchColors} />
        </div>
      )}

      {academicData.publications && academicData.publications.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Selected Publications" colors={researchColors} variant="underline" />
          <PublicationsSection publications={academicData.publications} colors={researchColors} />
        </div>
      )}

      {academicData.grants && academicData.grants.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Research Grants & Funding" colors={researchColors} variant="underline" />
          <GrantsSection grants={academicData.grants} colors={researchColors} />
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Research Experience" colors={researchColors} variant="underline" />
          <ExperienceSection experiences={data.experience} colors={researchColors} bulletStyle="bullet" />
        </div>
      )}

      {academicData.presentations && academicData.presentations.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Conference Presentations" colors={researchColors} variant="underline" />
          <PresentationsSection presentations={academicData.presentations} colors={researchColors} />
        </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Technical Expertise" colors={researchColors} variant="underline" />
          <div style={{ color: researchColors.textLight }}>
            {data.skills.join(' • ')}
          </div>
        </div>
      )}
    </div>
  );
};

export const ResearchDetailed: ReactTemplate = {
  id: 'research-detailed',
  name: 'Research Detailed',

  metadata: {
    id: 'research-detailed',
    name: 'Research Detailed',
    description: 'Research-focused CV emphasizing publications, grants, and scholarly achievements',
    category: 'academic',
    primaryCategory: 'academic-research',
    previewImage: '/templates/research-detailed.png',
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
    atsScore: 94,
    atsCompatibility: 'ats-friendly',
    designStyle: 'traditional',
    pageLength: 'cv-length',
    industryTags: ['science-research'],
    experienceLevel: ['mid-level', 'senior'],
    bestFor: ['Research Scientist', 'Principal Investigator', 'Senior Researcher', 'Lab Director'],
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  PDFComponent: ResearchDetailedPDF,

  generateDOCX: (data: ParsedResumeData, colors: ColorPalette) => {
    return generateAcademicDOCX(data, colors, '#115e59');
  },
};

export default ResearchDetailed;

/**
 * Scholar Complete Template
 * Comprehensive scholarly CV with all academic elements
 *
 * Features:
 * - All academic sections included
 * - Balanced layout
 * - Professional presentation
 * - Multi-page support
 *
 * Best for: Senior scholars, tenured professors, academic leaders
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
  PresentationsSection,
  AcademicServiceSection,
  ResearchInterestsSection,
  ProfessionalMembershipsSection,
} from '../shared/components/AcademicSections';
import { generateAcademicDOCX } from './generateAcademicDOCX';

const ScholarCompletePDF: React.FC<TemplatePDFProps> = ({ data, colors }) => {
  const scholarColors = createCustomPalette('#1e40af', '#1e3a8a'); // Deep blue
  const academicData = data as AcademicResumeData;

  return (
    <div
      style={{
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: 11,
        color: scholarColors.text,
        backgroundColor: '#ffffff',
        padding: '30px 40px',
        lineHeight: 1.5,
      }}
    >
      <Header contact={data.contact} colors={scholarColors} variant="centered" />

      {data.summary && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Summary" colors={scholarColors} variant="underline" />
          <p style={{ margin: '8px 0', lineHeight: 1.6, color: scholarColors.textLight }}>
            {data.summary}
          </p>
        </div>
      )}

      {academicData.researchInterests && academicData.researchInterests.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Research Interests" colors={scholarColors} variant="underline" />
          <ResearchInterestsSection interests={academicData.researchInterests} colors={scholarColors} />
        </div>
      )}

      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Education" colors={scholarColors} variant="underline" />
          <EducationSection education={data.education} colors={scholarColors} />
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Academic & Professional Experience" colors={scholarColors} variant="underline" />
          <ExperienceSection experiences={data.experience} colors={scholarColors} bulletStyle="bullet" />
        </div>
      )}

      {academicData.publications && academicData.publications.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Publications" colors={scholarColors} variant="underline" />
          <PublicationsSection publications={academicData.publications} colors={scholarColors} />
        </div>
      )}

      {academicData.grants && academicData.grants.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Grants & Awards" colors={scholarColors} variant="underline" />
          <GrantsSection grants={academicData.grants} colors={scholarColors} />
        </div>
      )}

      {academicData.teaching && academicData.teaching.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Teaching" colors={scholarColors} variant="underline" />
          <TeachingSection teaching={academicData.teaching} colors={scholarColors} />
        </div>
      )}

      {academicData.presentations && academicData.presentations.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Selected Presentations" colors={scholarColors} variant="underline" />
          <PresentationsSection presentations={academicData.presentations} colors={scholarColors} />
        </div>
      )}

      {academicData.academicService && academicData.academicService.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Service & Leadership" colors={scholarColors} variant="underline" />
          <AcademicServiceSection service={academicData.academicService} colors={scholarColors} />
        </div>
      )}

      {academicData.professionalMemberships && academicData.professionalMemberships.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Professional Memberships" colors={scholarColors} variant="underline" />
          <ProfessionalMembershipsSection memberships={academicData.professionalMemberships} colors={scholarColors} />
        </div>
      )}
    </div>
  );
};

export const ScholarComplete: ReactTemplate = {
  id: 'scholar-complete',
  name: 'Scholar Complete',

  metadata: {
    id: 'scholar-complete',
    name: 'Scholar Complete',
    description: 'Comprehensive scholarly CV with all academic sections for senior academics',
    category: 'academic',
    primaryCategory: 'academic-research',
    previewImage: '/templates/scholar-complete.png',
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
    industryTags: ['education-academic', 'science-research'],
    experienceLevel: ['senior', 'executive'],
    bestFor: ['Tenured Professor', 'Senior Scholar', 'Academic Dean', 'Department Head', 'Research Director'],
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  PDFComponent: ScholarCompletePDF,

  generateDOCX: (data: ParsedResumeData, colors: ColorPalette) => {
    return generateAcademicDOCX(data, colors, '#1e40af');
  },
};

export default ScholarComplete;

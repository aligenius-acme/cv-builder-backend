/**
 * Academic CV Template
 * Comprehensive academic CV with all scholarly sections
 *
 * Features:
 * - Publications in citation format
 * - Grants and funding
 * - Teaching experience
 * - Conference presentations
 * - Multi-page support
 * - Traditional academic layout
 *
 * Best for: All academic positions, faculty, research scientists
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
import { SkillsSection } from '../shared/components/SkillsSection';
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

const AcademicCVPDF: React.FC<TemplatePDFProps> = ({ data, colors }) => {
  const academicColors = createCustomPalette('#1e3a8a', '#1e40af'); // Traditional academic blue
  const academicData = data as AcademicResumeData;

  return (
    <div
      style={{
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: 11,
        color: academicColors.text,
        backgroundColor: '#ffffff',
        padding: '30px 40px', // Smaller padding for more content
        lineHeight: 1.5,
      }}
    >
      <Header contact={data.contact} colors={academicColors} variant="centered" />

      {academicData.researchInterests && academicData.researchInterests.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Research Interests" colors={academicColors} variant="underline" />
          <ResearchInterestsSection interests={academicData.researchInterests} colors={academicColors} />
        </div>
      )}

      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Education" colors={academicColors} variant="underline" />
          <EducationSection education={data.education} colors={academicColors} />
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Professional Experience" colors={academicColors} variant="underline" />
          <ExperienceSection experiences={data.experience} colors={academicColors} bulletStyle="bullet" />
        </div>
      )}

      {academicData.publications && academicData.publications.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Publications" colors={academicColors} variant="underline" />
          <PublicationsSection publications={academicData.publications} colors={academicColors} />
        </div>
      )}

      {academicData.grants && academicData.grants.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Grants & Funding" colors={academicColors} variant="underline" />
          <GrantsSection grants={academicData.grants} colors={academicColors} />
        </div>
      )}

      {academicData.teaching && academicData.teaching.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Teaching Experience" colors={academicColors} variant="underline" />
          <TeachingSection teaching={academicData.teaching} colors={academicColors} />
        </div>
      )}

      {academicData.presentations && academicData.presentations.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Conference Presentations" colors={academicColors} variant="underline" />
          <PresentationsSection presentations={academicData.presentations} colors={academicColors} />
        </div>
      )}

      {academicData.academicService && academicData.academicService.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Academic Service" colors={academicColors} variant="underline" />
          <AcademicServiceSection service={academicData.academicService} colors={academicColors} />
        </div>
      )}

      {academicData.professionalMemberships && academicData.professionalMemberships.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Professional Memberships" colors={academicColors} variant="underline" />
          <ProfessionalMembershipsSection memberships={academicData.professionalMemberships} colors={academicColors} />
        </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Technical Skills" colors={academicColors} variant="underline" />
          <SkillsSection skills={data.skills} colors={academicColors} layout="inline" />
        </div>
      )}

      {data.languages && data.languages.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Languages" colors={academicColors} variant="underline" />
          <div style={{ color: academicColors.textLight }}>
            {data.languages.join(', ')}
          </div>
        </div>
      )}
    </div>
  );
};

export const AcademicCV: ReactTemplate = {
  id: 'academic-cv',
  name: 'Academic CV',

  metadata: {
    id: 'academic-cv',
    name: 'Academic CV',
    description: 'Comprehensive academic CV with publications, grants, teaching, and multi-page support',
    category: 'academic',
    primaryCategory: 'academic-research',
    previewImage: '/templates/academic-cv.png',
    colorPalettes: ['traditional', 'professional', 'academic'],
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
    pageLength: 'cv-length', // Multi-page support
    industryTags: ['education-academic', 'science-research'],
    experienceLevel: ['mid-level', 'senior', 'executive'],
    bestFor: ['Professor', 'Research Scientist', 'Academic Researcher', 'Faculty Member', 'Postdoctoral Fellow'],
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  PDFComponent: AcademicCVPDF,

  generateDOCX: (data: ParsedResumeData, colors: ColorPalette) => {
    return generateAcademicDOCX(data, colors, '#1e3a8a');
  },
};

export default AcademicCV;

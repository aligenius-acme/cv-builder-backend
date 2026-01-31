/**
 * University Faculty Template
 * Comprehensive faculty CV for university positions
 *
 * Features:
 * - Complete academic record
 * - Teaching, research, service balance
 * - Traditional university format
 * - Multi-page support
 *
 * Best for: University faculty, department chairs, academic administrators
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

const UniversityFacultyPDF: React.FC<TemplatePDFProps> = ({ data, colors }) => {
  const universityColors = createCustomPalette('#6d28d9', '#7c3aed'); // Deep violet
  const academicData = data as AcademicResumeData;

  return (
    <div
      style={{
        fontFamily: '"Times New Roman", Georgia, serif',
        fontSize: 11,
        color: universityColors.text,
        backgroundColor: '#ffffff',
        padding: '30px 40px',
        lineHeight: 1.5,
      }}
    >
      <Header contact={data.contact} colors={universityColors} variant="centered" />

      {academicData.researchInterests && academicData.researchInterests.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="RESEARCH INTERESTS" colors={universityColors} variant="underline" uppercase />
          <ResearchInterestsSection interests={academicData.researchInterests} colors={universityColors} />
        </div>
      )}

      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="EDUCATION" colors={universityColors} variant="underline" uppercase />
          <EducationSection education={data.education} colors={universityColors} />
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="ACADEMIC APPOINTMENTS" colors={universityColors} variant="underline" uppercase />
          <ExperienceSection experiences={data.experience} colors={universityColors} bulletStyle="bullet" />
        </div>
      )}

      {academicData.publications && academicData.publications.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="SCHOLARLY PUBLICATIONS" colors={universityColors} variant="underline" uppercase />
          <PublicationsSection publications={academicData.publications} colors={universityColors} />
        </div>
      )}

      {academicData.grants && academicData.grants.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="GRANTS & FUNDING" colors={universityColors} variant="underline" uppercase />
          <GrantsSection grants={academicData.grants} colors={universityColors} />
        </div>
      )}

      {academicData.teaching && academicData.teaching.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="TEACHING EXPERIENCE" colors={universityColors} variant="underline" uppercase />
          <TeachingSection teaching={academicData.teaching} colors={universityColors} />
        </div>
      )}

      {academicData.presentations && academicData.presentations.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="PRESENTATIONS & INVITED TALKS" colors={universityColors} variant="underline" uppercase />
          <PresentationsSection presentations={academicData.presentations} colors={universityColors} />
        </div>
      )}

      {academicData.academicService && academicData.academicService.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="UNIVERSITY & PROFESSIONAL SERVICE" colors={universityColors} variant="underline" uppercase />
          <AcademicServiceSection service={academicData.academicService} colors={universityColors} />
        </div>
      )}

      {academicData.professionalMemberships && academicData.professionalMemberships.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="PROFESSIONAL MEMBERSHIPS" colors={universityColors} variant="underline" uppercase />
          <ProfessionalMembershipsSection memberships={academicData.professionalMemberships} colors={universityColors} />
        </div>
      )}

      {data.awards && data.awards.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="HONORS & AWARDS" colors={universityColors} variant="underline" uppercase />
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            {data.awards.map((award, index) => (
              <li key={index} style={{ marginBottom: 4, color: universityColors.textLight }}>
                {typeof award === 'string' ? award : `${award.name}${award.issuer ? ' - ' + award.issuer : ''}${award.date ? ' (' + award.date + ')' : ''}`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.languages && data.languages.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="LANGUAGES" colors={universityColors} variant="underline" uppercase />
          <div style={{ color: universityColors.textLight }}>
            {data.languages.join(', ')}
          </div>
        </div>
      )}
    </div>
  );
};

export const UniversityFaculty: ReactTemplate = {
  id: 'university-faculty',
  name: 'University Faculty',

  metadata: {
    id: 'university-faculty',
    name: 'University Faculty',
    description: 'Comprehensive faculty CV for university positions with complete academic record',
    category: 'academic',
    primaryCategory: 'academic-research',
    previewImage: '/templates/university-faculty.png',
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
    experienceLevel: ['mid-level', 'senior', 'executive'],
    bestFor: ['University Faculty', 'Department Chair', 'Academic Dean', 'Tenured Professor', 'Full Professor'],
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  PDFComponent: UniversityFacultyPDF,

  generateDOCX: (data: ParsedResumeData, colors: ColorPalette) => {
    return generateAcademicDOCX(data, colors, '#6d28d9');
  },
};

export default UniversityFaculty;

/**
 * Faculty Traditional Template
 * Classic faculty CV with teaching emphasis
 *
 * Features:
 * - Teaching experience prominent
 * - Traditional academic sections
 * - Conservative formatting
 * - Multi-page CV support
 *
 * Best for: Faculty members, lecturers, teaching professors
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
  TeachingSection,
  AcademicServiceSection,
  ProfessionalMembershipsSection,
} from '../shared/components/AcademicSections';
import { generateAcademicDOCX } from './generateAcademicDOCX';

const FacultyTraditionalPDF: React.FC<TemplatePDFProps> = ({ data, colors }) => {
  const facultyColors = createCustomPalette('#7c2d12', '#92400e'); // Brown for traditional
  const academicData = data as AcademicResumeData;

  return (
    <div
      style={{
        fontFamily: '"Times New Roman", Georgia, serif',
        fontSize: 11,
        color: facultyColors.text,
        backgroundColor: '#ffffff',
        padding: '30px 40px',
        lineHeight: 1.5,
      }}
    >
      <Header contact={data.contact} colors={facultyColors} variant="centered" />

      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="EDUCATION" colors={facultyColors} variant="underline" uppercase />
          <EducationSection education={data.education} colors={facultyColors} />
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="ACADEMIC APPOINTMENTS" colors={facultyColors} variant="underline" uppercase />
          <ExperienceSection experiences={data.experience} colors={facultyColors} bulletStyle="bullet" />
        </div>
      )}

      {academicData.teaching && academicData.teaching.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="TEACHING EXPERIENCE" colors={facultyColors} variant="underline" uppercase />
          <TeachingSection teaching={academicData.teaching} colors={facultyColors} />
        </div>
      )}

      {academicData.publications && academicData.publications.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="PUBLICATIONS" colors={facultyColors} variant="underline" uppercase />
          <PublicationsSection publications={academicData.publications} colors={facultyColors} />
        </div>
      )}

      {academicData.academicService && academicData.academicService.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="SERVICE" colors={facultyColors} variant="underline" uppercase />
          <AcademicServiceSection service={academicData.academicService} colors={facultyColors} />
        </div>
      )}

      {academicData.professionalMemberships && academicData.professionalMemberships.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="PROFESSIONAL AFFILIATIONS" colors={facultyColors} variant="underline" uppercase />
          <ProfessionalMembershipsSection memberships={academicData.professionalMemberships} colors={facultyColors} />
        </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="AREAS OF EXPERTISE" colors={facultyColors} variant="underline" uppercase />
          <div style={{ color: facultyColors.textLight }}>
            {data.skills.join(', ')}
          </div>
        </div>
      )}
    </div>
  );
};

export const FacultyTraditional: ReactTemplate = {
  id: 'faculty-traditional',
  name: 'Faculty Traditional',

  metadata: {
    id: 'faculty-traditional',
    name: 'Faculty Traditional',
    description: 'Classic faculty CV with teaching emphasis and conservative academic formatting',
    category: 'academic',
    primaryCategory: 'academic-research',
    previewImage: '/templates/faculty-traditional.png',
    colorPalettes: ['traditional', 'minimal'],
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
    bestFor: ['Faculty Member', 'Lecturer', 'Teaching Professor', 'Associate Professor', 'Department Chair'],
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  PDFComponent: FacultyTraditionalPDF,

  generateDOCX: (data: ParsedResumeData, colors: ColorPalette) => {
    return generateAcademicDOCX(data, colors, '#7c2d12');
  },
};

export default FacultyTraditional;

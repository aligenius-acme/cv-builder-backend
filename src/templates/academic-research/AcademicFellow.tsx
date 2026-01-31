/**
 * Academic Fellow Template
 * Template for research fellows and visiting scholars
 *
 * Features:
 * - Fellowship emphasis
 * - Research achievements
 * - Academic collaboration
 * - Professional formatting
 *
 * Best for: Research fellows, visiting scholars, academic fellows
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
  PresentationsSection,
  ResearchInterestsSection,
  ProfessionalMembershipsSection,
} from '../shared/components/AcademicSections';
import { generateAcademicDOCX } from './generateAcademicDOCX';

const AcademicFellowPDF: React.FC<TemplatePDFProps> = ({ data, colors }) => {
  const fellowColors = createCustomPalette('#6b21a8', '#7c3aed'); // Purple for fellows
  const academicData = data as AcademicResumeData;

  return (
    <div
      style={{
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: 11,
        color: fellowColors.text,
        backgroundColor: '#ffffff',
        padding: '30px 40px',
        lineHeight: 1.5,
      }}
    >
      <Header contact={data.contact} colors={fellowColors} variant="centered" />

      {academicData.researchInterests && academicData.researchInterests.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Research Interests" colors={fellowColors} variant="underline" />
          <ResearchInterestsSection interests={academicData.researchInterests} colors={fellowColors} />
        </div>
      )}

      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Education" colors={fellowColors} variant="underline" />
          <EducationSection education={data.education} colors={fellowColors} />
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Fellowships & Research Positions" colors={fellowColors} variant="underline" />
          <ExperienceSection experiences={data.experience} colors={fellowColors} bulletStyle="bullet" />
        </div>
      )}

      {academicData.publications && academicData.publications.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Publications" colors={fellowColors} variant="underline" />
          <PublicationsSection publications={academicData.publications} colors={fellowColors} />
        </div>
      )}

      {academicData.grants && academicData.grants.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Grants & Fellowships" colors={fellowColors} variant="underline" />
          <GrantsSection grants={academicData.grants} colors={fellowColors} />
        </div>
      )}

      {academicData.presentations && academicData.presentations.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Presentations" colors={fellowColors} variant="underline" />
          <PresentationsSection presentations={academicData.presentations} colors={fellowColors} />
        </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Research Skills" colors={fellowColors} variant="underline" />
          <SkillsSection skills={data.skills} colors={fellowColors} layout="inline" />
        </div>
      )}

      {academicData.professionalMemberships && academicData.professionalMemberships.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Professional Memberships" colors={fellowColors} variant="underline" />
          <ProfessionalMembershipsSection memberships={academicData.professionalMemberships} colors={fellowColors} />
        </div>
      )}

      {data.awards && data.awards.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Awards & Honors" colors={fellowColors} variant="underline" />
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            {data.awards.map((award, index) => (
              <li key={index} style={{ marginBottom: 4, color: fellowColors.textLight }}>
                {typeof award === 'string' ? award : `${award.name}${award.issuer ? ' - ' + award.issuer : ''}${award.date ? ' (' + award.date + ')' : ''}`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.languages && data.languages.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Languages" colors={fellowColors} variant="underline" />
          <div style={{ color: fellowColors.textLight }}>
            {data.languages.join(', ')}
          </div>
        </div>
      )}
    </div>
  );
};

export const AcademicFellow: ReactTemplate = {
  id: 'academic-fellow',
  name: 'Academic Fellow',

  metadata: {
    id: 'academic-fellow',
    name: 'Academic Fellow',
    description: 'CV template for research fellows and visiting scholars with fellowship emphasis',
    category: 'academic',
    primaryCategory: 'academic-research',
    previewImage: '/templates/academic-fellow.png',
    colorPalettes: ['professional', 'traditional'],
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
    atsScore: 93,
    atsCompatibility: 'ats-friendly',
    designStyle: 'traditional',
    pageLength: 'cv-length',
    industryTags: ['education-academic', 'science-research'],
    experienceLevel: ['junior', 'mid-level'],
    bestFor: ['Research Fellow', 'Visiting Scholar', 'Academic Fellow', 'Senior Fellow'],
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  PDFComponent: AcademicFellowPDF,

  generateDOCX: (data: ParsedResumeData, colors: ColorPalette) => {
    return generateAcademicDOCX(data, colors, '#6b21a8');
  },
};

export default AcademicFellow;

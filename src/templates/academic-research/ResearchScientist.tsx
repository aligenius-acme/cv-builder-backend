/**
 * Research Scientist Template
 * Professional template for research scientists in academia or industry
 *
 * Features:
 * - Publications and patents
 * - Research methodology
 * - Technical expertise
 * - Professional presentation
 *
 * Best for: Research scientists, senior researchers, lab managers
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
  ResearchInterestsSection,
} from '../shared/components/AcademicSections';
import { generateAcademicDOCX } from './generateAcademicDOCX';

const ResearchScientistPDF: React.FC<TemplatePDFProps> = ({ data, colors }) => {
  const scientistColors = createCustomPalette('#1e293b', '#334155'); // Slate for professional
  const academicData = data as AcademicResumeData;

  return (
    <div
      style={{
        fontFamily: 'Georgia, Calibri, sans-serif',
        fontSize: 11,
        color: scientistColors.text,
        backgroundColor: '#ffffff',
        padding: '30px 40px',
        lineHeight: 1.5,
      }}
    >
      <Header contact={data.contact} colors={scientistColors} variant="centered" />

      {data.summary && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Professional Summary" colors={scientistColors} variant="underline" />
          <p style={{ margin: '8px 0', lineHeight: 1.6, color: scientistColors.textLight }}>
            {data.summary}
          </p>
        </div>
      )}

      {academicData.researchInterests && academicData.researchInterests.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Research Focus" colors={scientistColors} variant="underline" />
          <ResearchInterestsSection interests={academicData.researchInterests} colors={scientistColors} />
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Research Experience" colors={scientistColors} variant="underline" />
          <ExperienceSection experiences={data.experience} colors={scientistColors} bulletStyle="bullet" />
        </div>
      )}

      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Education" colors={scientistColors} variant="underline" />
          <EducationSection education={data.education} colors={scientistColors} />
        </div>
      )}

      {academicData.publications && academicData.publications.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Key Publications" colors={scientistColors} variant="underline" />
          <PublicationsSection publications={academicData.publications} colors={scientistColors} />
        </div>
      )}

      {academicData.grants && academicData.grants.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Funding & Grants" colors={scientistColors} variant="underline" />
          <GrantsSection grants={academicData.grants} colors={scientistColors} />
        </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Technical Expertise" colors={scientistColors} variant="underline" />
          <SkillsSection skills={data.skills} colors={scientistColors} layout="grid" columns={2} />
        </div>
      )}

      {data.certifications && data.certifications.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Certifications & Training" colors={scientistColors} variant="underline" />
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            {data.certifications.map((cert, index) => (
              <li key={index} style={{ marginBottom: 4, color: scientistColors.textLight }}>
                {typeof cert === 'string' ? cert : `${cert.name}${cert.issuer ? ' - ' + cert.issuer : ''}${cert.date ? ' (' + cert.date + ')' : ''}`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.awards && data.awards.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Awards & Recognition" colors={scientistColors} variant="underline" />
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            {data.awards.map((award, index) => (
              <li key={index} style={{ marginBottom: 4, color: scientistColors.textLight }}>
                {typeof award === 'string' ? award : `${award.name}${award.issuer ? ' - ' + award.issuer : ''}${award.date ? ' (' + award.date + ')' : ''}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export const ResearchScientist: ReactTemplate = {
  id: 'research-scientist',
  name: 'Research Scientist',

  metadata: {
    id: 'research-scientist',
    name: 'Research Scientist',
    description: 'Professional template for research scientists with publications and technical expertise',
    category: 'academic',
    primaryCategory: 'academic-research',
    previewImage: '/templates/research-scientist.png',
    colorPalettes: ['professional', 'modern'],
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
    atsCompatibility: 'ats-friendly',
    designStyle: 'traditional',
    pageLength: 'cv-length',
    industryTags: ['science-research'],
    experienceLevel: ['mid-level', 'senior'],
    bestFor: ['Research Scientist', 'Senior Researcher', 'Lab Manager', 'Principal Scientist'],
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  PDFComponent: ResearchScientistPDF,

  generateDOCX: (data: ParsedResumeData, colors: ColorPalette) => {
    return generateAcademicDOCX(data, colors, '#1e293b');
  },
};

export default ResearchScientist;

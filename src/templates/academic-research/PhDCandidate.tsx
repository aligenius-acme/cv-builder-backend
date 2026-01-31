/**
 * PhD Candidate Template
 * Optimized for doctoral students and recent graduates
 *
 * Features:
 * - Education-first layout
 * - Research emphasis
 * - Publications and presentations
 * - Clean, modern academic style
 *
 * Best for: PhD candidates, doctoral students, recent PhDs
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
  PresentationsSection,
  ResearchInterestsSection,
  TeachingSection,
} from '../shared/components/AcademicSections';
import { generateAcademicDOCX } from './generateAcademicDOCX';

const PhDCandidatePDF: React.FC<TemplatePDFProps> = ({ data, colors }) => {
  const phdColors = createCustomPalette('#0e7490', '#0891b2'); // Cyan for early career
  const academicData = data as AcademicResumeData;

  return (
    <div
      style={{
        fontFamily: 'Georgia, serif',
        fontSize: 11,
        color: phdColors.text,
        backgroundColor: '#ffffff',
        padding: '35px 45px',
        lineHeight: 1.5,
      }}
    >
      <Header contact={data.contact} colors={phdColors} variant="centered" />

      {academicData.researchInterests && academicData.researchInterests.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Research Interests" colors={phdColors} variant="underline" />
          <ResearchInterestsSection interests={academicData.researchInterests} colors={phdColors} />
        </div>
      )}

      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Education" colors={phdColors} variant="underline" />
          <EducationSection education={data.education} colors={phdColors} />
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Research Experience" colors={phdColors} variant="underline" />
          <ExperienceSection experiences={data.experience} colors={phdColors} bulletStyle="bullet" />
        </div>
      )}

      {academicData.publications && academicData.publications.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Publications" colors={phdColors} variant="underline" />
          <PublicationsSection publications={academicData.publications} colors={phdColors} />
        </div>
      )}

      {academicData.presentations && academicData.presentations.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Conference Presentations" colors={phdColors} variant="underline" />
          <PresentationsSection presentations={academicData.presentations} colors={phdColors} />
        </div>
      )}

      {academicData.teaching && academicData.teaching.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Teaching Experience" colors={phdColors} variant="underline" />
          <TeachingSection teaching={academicData.teaching} colors={phdColors} />
        </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Technical Skills" colors={phdColors} variant="underline" />
          <SkillsSection skills={data.skills} colors={phdColors} layout="inline" />
        </div>
      )}

      {data.awards && data.awards.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Awards & Honors" colors={phdColors} variant="underline" />
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            {data.awards.map((award, index) => (
              <li key={index} style={{ marginBottom: 4, color: phdColors.textLight }}>
                {typeof award === 'string' ? award : `${award.name}${award.issuer ? ' - ' + award.issuer : ''}${award.date ? ' (' + award.date + ')' : ''}`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.languages && data.languages.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Languages" colors={phdColors} variant="underline" />
          <div style={{ color: phdColors.textLight }}>
            {data.languages.join(', ')}
          </div>
        </div>
      )}
    </div>
  );
};

export const PhDCandidate: ReactTemplate = {
  id: 'phd-candidate',
  name: 'PhD Candidate',

  metadata: {
    id: 'phd-candidate',
    name: 'PhD Candidate',
    description: 'CV template optimized for doctoral students with research and publication emphasis',
    category: 'academic',
    primaryCategory: 'academic-research',
    previewImage: '/templates/phd-candidate.png',
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
      languages: true,
      certifications: false,
    },
    atsScore: 93,
    atsCompatibility: 'ats-friendly',
    designStyle: 'traditional',
    pageLength: 'cv-length',
    industryTags: ['education-academic', 'science-research'],
    experienceLevel: ['entry-level', 'junior'],
    bestFor: ['PhD Candidate', 'Doctoral Student', 'Graduate Researcher', 'PhD Graduate'],
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  PDFComponent: PhDCandidatePDF,

  generateDOCX: (data: ParsedResumeData, colors: ColorPalette) => {
    return generateAcademicDOCX(data, colors, '#0e7490');
  },
};

export default PhDCandidate;

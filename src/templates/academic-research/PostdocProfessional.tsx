/**
 * Postdoc Professional Template
 * Professional CV for postdoctoral researchers
 *
 * Features:
 * - Research-focused layout
 * - Publications prominent
 * - Skills and techniques
 * - Grant experience
 *
 * Best for: Postdoctoral researchers, research fellows
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
} from '../shared/components/AcademicSections';
import { generateAcademicDOCX } from './generateAcademicDOCX';

const PostdocProfessionalPDF: React.FC<TemplatePDFProps> = ({ data, colors }) => {
  const postdocColors = createCustomPalette('#166534', '#15803d'); // Green for research
  const academicData = data as AcademicResumeData;

  return (
    <div
      style={{
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: 11,
        color: postdocColors.text,
        backgroundColor: '#ffffff',
        padding: '30px 40px',
        lineHeight: 1.5,
      }}
    >
      <Header contact={data.contact} colors={postdocColors} variant="centered" />

      {academicData.researchInterests && academicData.researchInterests.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Research Interests" colors={postdocColors} variant="underline" />
          <ResearchInterestsSection interests={academicData.researchInterests} colors={postdocColors} />
        </div>
      )}

      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Education" colors={postdocColors} variant="underline" />
          <EducationSection education={data.education} colors={postdocColors} />
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Research Experience" colors={postdocColors} variant="underline" />
          <ExperienceSection experiences={data.experience} colors={postdocColors} bulletStyle="bullet" />
        </div>
      )}

      {academicData.publications && academicData.publications.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Publications" colors={postdocColors} variant="underline" />
          <PublicationsSection publications={academicData.publications} colors={postdocColors} />
        </div>
      )}

      {academicData.grants && academicData.grants.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Grants & Fellowships" colors={postdocColors} variant="underline" />
          <GrantsSection grants={academicData.grants} colors={postdocColors} />
        </div>
      )}

      {academicData.presentations && academicData.presentations.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Presentations" colors={postdocColors} variant="underline" />
          <PresentationsSection presentations={academicData.presentations} colors={postdocColors} />
        </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Research Skills & Techniques" colors={postdocColors} variant="underline" />
          <SkillsSection skills={data.skills} colors={postdocColors} layout="grid" columns={2} />
        </div>
      )}

      {data.awards && data.awards.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Awards & Honors" colors={postdocColors} variant="underline" />
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            {data.awards.map((award, index) => (
              <li key={index} style={{ marginBottom: 4, color: postdocColors.textLight }}>
                {typeof award === 'string' ? award : `${award.name}${award.issuer ? ' - ' + award.issuer : ''}${award.date ? ' (' + award.date + ')' : ''}`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.languages && data.languages.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Languages" colors={postdocColors} variant="underline" />
          <div style={{ color: postdocColors.textLight }}>
            {data.languages.join(', ')}
          </div>
        </div>
      )}
    </div>
  );
};

export const PostdocProfessional: ReactTemplate = {
  id: 'postdoc-professional',
  name: 'Postdoc Professional',

  metadata: {
    id: 'postdoc-professional',
    name: 'Postdoc Professional',
    description: 'Professional CV for postdoctoral researchers with publication and grant emphasis',
    category: 'academic',
    primaryCategory: 'academic-research',
    previewImage: '/templates/postdoc-professional.png',
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
    atsScore: 94,
    atsCompatibility: 'ats-friendly',
    designStyle: 'traditional',
    pageLength: 'cv-length',
    industryTags: ['science-research'],
    experienceLevel: ['junior', 'mid-level'],
    bestFor: ['Postdoctoral Researcher', 'Research Fellow', 'Postdoc', 'Research Associate'],
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  PDFComponent: PostdocProfessionalPDF,

  generateDOCX: (data: ParsedResumeData, colors: ColorPalette) => {
    return generateAcademicDOCX(data, colors, '#166534');
  },
};

export default PostdocProfessional;

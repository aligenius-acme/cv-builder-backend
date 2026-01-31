/**
 * Tech Executive Template
 *
 * Executive-style template for technical leaders
 * Single-column with emphasis on leadership and impact
 * Perfect for CTOs, VPs of Engineering, Tech Directors
 *
 * ATS Score: 85/100 (ATS-friendly)
 */

import React from 'react';
import { TemplatePDFProps, createTemplateMetadata } from '../index';
import { Header } from '../shared/components/Header';
import { SectionHeader } from '../shared/components/SectionHeader';
import { SkillsSection } from '../shared/components/SkillsSection';
import { ExperienceSection } from '../shared/components/ExperienceSection';
import { EducationSection } from '../shared/components/EducationSection';
import { ProjectsSection } from '../shared/components/ProjectsSection';
import { CertificationsSection } from '../shared/components/CertificationsSection';
import { getColorPalette } from '../shared/styles/colors';

/**
 * PDF Component
 */
export const TechExecutivePDF: React.FC<TemplatePDFProps> = ({ data, colors, options }) => {
  const palette = colors || getColorPalette('executive');

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        padding: '48px',
        backgroundColor: palette.background,
        color: palette.text,
        maxWidth: '800px',
        margin: '0 auto',
      }}
    >
      {/* Header - Centered executive style */}
      <div style={{ textAlign: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: `2px solid ${palette.primary}` }}>
        <h1
          style={{
            fontSize: '22pt',
            fontWeight: 700,
            color: palette.primary,
            margin: '0 0 12px 0',
          }}
        >
          {data.contact.name || 'Your Name'}
        </h1>
        <div
          style={{
            fontSize: '10pt',
            color: palette.textLight,
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          {data.contact.email && <span>{data.contact.email}</span>}
          {data.contact.phone && <span>|</span>}
          {data.contact.phone && <span>{data.contact.phone}</span>}
          {data.contact.location && <span>|</span>}
          {data.contact.location && <span>{data.contact.location}</span>}
        </div>
        {(data.contact.linkedin || data.contact.github || data.contact.website) && (
          <div
            style={{
              fontSize: '9pt',
              color: palette.primary,
              marginTop: 8,
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
            }}
          >
            {data.contact.linkedin && <span>{data.contact.linkedin}</span>}
            {data.contact.website && <span>•</span>}
            {data.contact.website && <span>{data.contact.website}</span>}
          </div>
        )}
      </div>

      {/* Executive Summary */}
      {data.summary && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="EXECUTIVE SUMMARY" colors={palette} variant="filled" uppercase={true} />
          <p
            style={{
              margin: '12px 0 0 0',
              lineHeight: 1.6,
              color: palette.textLight,
              fontSize: '10pt',
            }}
          >
            {data.summary}
          </p>
        </div>
      )}

      {/* Core Competencies */}
      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader
            title="CORE COMPETENCIES"
            colors={palette}
            variant="filled"
            uppercase={true}
          />
          <SkillsSection skills={data.skills} colors={palette} layout="inline" />
        </div>
      )}

      {/* Leadership Experience */}
      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader
            title="LEADERSHIP EXPERIENCE"
            colors={palette}
            variant="filled"
            uppercase={true}
          />
          <ExperienceSection
            experiences={data.experience}
            colors={palette}
            showDuration={true}
            layout="detailed"
          />
        </div>
      )}

      {/* Key Initiatives */}
      {data.projects && data.projects.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="KEY INITIATIVES" colors={palette} variant="filled" uppercase={true} />
          <ProjectsSection
            projects={data.projects}
            colors={palette}
            showTechnologies={false}
            showLinks={false}
            layout="detailed"
          />
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="EDUCATION" colors={palette} variant="filled" uppercase={true} />
          <EducationSection education={data.education} colors={palette} layout="default" />
        </div>
      )}

      {/* Professional Development */}
      {data.certifications && data.certifications.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader
            title="PROFESSIONAL DEVELOPMENT"
            colors={palette}
            variant="filled"
            uppercase={true}
          />
          <CertificationsSection certifications={data.certifications} colors={palette} layout="default" />
        </div>
      )}
    </div>
  );
};

/**
 * Template Metadata
 */
export const TechExecutiveMetadata = createTemplateMetadata({
  id: 'tech-executive',
  name: 'Tech Executive',
  category: 'executive',
  description: 'Executive-style template for technical leaders with emphasis on leadership and impact',
  colorPalettes: ['executive', 'professional', 'modern'],
  atsScore: 85,
  bestFor: [
    'CTOs',
    'VP of Engineering',
    'Engineering Directors',
    'Technical Directors',
    'Engineering Managers',
  ],
  features: {
    twoColumn: false,
    headerImage: false,
    colorCustomization: true,
    sectionIcons: false,
    skillBars: false,
    timeline: false,
    portfolio: false,
    publications: false,
    languages: false,
    certifications: true,
  },
});

export default TechExecutivePDF;

/**
 * Engineer Clean Template
 *
 * Professional, clean design for engineers
 * Single-column with emphasis on technical achievements
 * Optimized for engineering roles
 *
 * ATS Score: 90/100 (ATS-safe)
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
export const EngineerCleanPDF: React.FC<TemplatePDFProps> = ({ data, colors, options }) => {
  const palette = colors || getColorPalette('professional');

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
      {/* Header - Left Aligned */}
      <Header contact={data.contact} colors={palette} variant="left" showLinks={true} />

      {/* Summary */}
      {data.summary && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="Professional Summary" colors={palette} variant="default" uppercase={false} />
          <p
            style={{
              margin: '8px 0 0 0',
              lineHeight: 1.6,
              color: palette.textLight,
              fontSize: '10pt',
            }}
          >
            {data.summary}
          </p>
        </div>
      )}

      {/* Core Technical Skills */}
      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader
            title="Core Technical Skills"
            colors={palette}
            variant="sidebar"
            uppercase={true}
          />
          <SkillsSection skills={data.skills} colors={palette} layout="columns" columns={3} />
        </div>
      )}

      {/* Professional Experience */}
      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader
            title="Professional Experience"
            colors={palette}
            variant="sidebar"
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

      {/* Technical Projects */}
      {data.projects && data.projects.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="Technical Projects" colors={palette} variant="sidebar" uppercase={true} />
          <ProjectsSection
            projects={data.projects}
            colors={palette}
            showTechnologies={true}
            showLinks={true}
            layout="detailed"
          />
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="Education" colors={palette} variant="sidebar" uppercase={true} />
          <EducationSection education={data.education} colors={palette} layout="default" showGPA={true} />
        </div>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader
            title="Certifications & Training"
            colors={palette}
            variant="sidebar"
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
export const EngineerCleanMetadata = createTemplateMetadata({
  id: 'engineer-clean',
  name: 'Engineer Clean',
  category: 'technical',
  description: 'Professional, clean design optimized for engineering roles with technical focus',
  colorPalettes: ['professional', 'modern', 'executive'],
  atsScore: 90,
  bestFor: [
    'Software Engineers',
    'System Engineers',
    'DevOps Engineers',
    'Site Reliability Engineers',
    'Platform Engineers',
  ],
  features: {
    twoColumn: false,
    headerImage: false,
    colorCustomization: true,
    sectionIcons: false,
    skillBars: false,
    timeline: false,
    portfolio: true,
    publications: false,
    languages: false,
    certifications: true,
  },
});

export default EngineerCleanPDF;

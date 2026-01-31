/**
 * Developer Minimal Template
 *
 * Clean, minimalist template for developers
 * Single-column layout with prominent skills section
 * Perfect for software developers and engineers
 *
 * ATS Score: 90/100 (ATS-safe, single column)
 */

import React from 'react';
import { TemplatePDFProps, createTemplateMetadata } from '../index';
import { Header } from '../shared/components/Header';
import { SectionHeader } from '../shared/components/SectionHeader';
import { SkillsSection, CategorizedSkills } from '../shared/components/SkillsSection';
import { ExperienceSection } from '../shared/components/ExperienceSection';
import { EducationSection } from '../shared/components/EducationSection';
import { ProjectsSection } from '../shared/components/ProjectsSection';
import { CertificationsSection } from '../shared/components/CertificationsSection';
import { getColorPalette } from '../shared/styles/colors';

/**
 * PDF Component
 */
export const DeveloperMinimalPDF: React.FC<TemplatePDFProps> = ({ data, colors, options }) => {
  const palette = colors || getColorPalette('minimal');

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
      {/* Header */}
      <Header contact={data.contact} colors={palette} variant="left" showLinks={true} />

      {/* Summary */}
      {data.summary && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="About" colors={palette} variant="minimal" uppercase={false} />
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

      {/* Technical Skills - Prominent */}
      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader
            title="Technical Skills"
            colors={palette}
            variant="underline"
            uppercase={true}
          />
          <SkillsSection skills={data.skills} colors={palette} layout="grid" columns={3} />
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader
            title="Experience"
            colors={palette}
            variant="underline"
            uppercase={true}
          />
          <ExperienceSection
            experiences={data.experience}
            colors={palette}
            showDuration={true}
            layout="compact"
          />
        </div>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="Projects" colors={palette} variant="underline" uppercase={true} />
          <ProjectsSection
            projects={data.projects}
            colors={palette}
            showTechnologies={true}
            showLinks={true}
            layout="default"
          />
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="Education" colors={palette} variant="underline" uppercase={true} />
          <EducationSection education={data.education} colors={palette} layout="compact" />
        </div>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader
            title="Certifications"
            colors={palette}
            variant="underline"
            uppercase={true}
          />
          <CertificationsSection certifications={data.certifications} colors={palette} layout="list" />
        </div>
      )}
    </div>
  );
};

/**
 * Template Metadata
 */
export const DeveloperMinimalMetadata = createTemplateMetadata({
  id: 'developer-minimal',
  name: 'Developer Minimal',
  category: 'technical',
  description: 'Clean, minimalist template for developers with ATS-safe single-column layout',
  colorPalettes: ['minimal', 'modern', 'professional'],
  atsScore: 90,
  bestFor: [
    'Software Developers',
    'Software Engineers',
    'Backend Engineers',
    'Frontend Engineers',
    'Full-Stack Developers',
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

export default DeveloperMinimalPDF;

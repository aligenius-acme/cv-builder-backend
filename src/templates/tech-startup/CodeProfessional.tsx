/**
 * Code Professional Template
 *
 * Professional template with monospace accents
 * Single-column with categorized technical skills
 * Ideal for serious coding positions
 *
 * ATS Score: 90/100 (ATS-safe)
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
export const CodeProfessionalPDF: React.FC<TemplatePDFProps> = ({ data, colors, options }) => {
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
      {/* Header with border accent */}
      <div style={{ borderBottom: `3px solid ${palette.primary}`, paddingBottom: 16, marginBottom: 24 }}>
        <Header contact={data.contact} colors={palette} variant="left" showLinks={true} />
      </div>

      {/* Summary */}
      {data.summary && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="// About Me" colors={palette} variant="minimal" uppercase={false} />
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

      {/* Technical Stack - Categorized */}
      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader
            title="// Technical Stack"
            colors={palette}
            variant="sidebar"
            uppercase={false}
          />
          <div
            style={{
              padding: '12px',
              backgroundColor: palette.backgroundAlt,
              borderLeft: `3px solid ${palette.accent}`,
            }}
          >
            <SkillsSection skills={data.skills} colors={palette} layout="grid" columns={3} />
          </div>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader
            title="// Work Experience"
            colors={palette}
            variant="sidebar"
            uppercase={false}
          />
          <ExperienceSection
            experiences={data.experience}
            colors={palette}
            showDuration={true}
            layout="default"
          />
        </div>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="// Projects" colors={palette} variant="sidebar" uppercase={false} />
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
          <SectionHeader title="// Education" colors={palette} variant="sidebar" uppercase={false} />
          <EducationSection education={data.education} colors={palette} layout="default" />
        </div>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader
            title="// Certifications"
            colors={palette}
            variant="sidebar"
            uppercase={false}
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
export const CodeProfessionalMetadata = createTemplateMetadata({
  id: 'code-professional',
  name: 'Code Professional',
  category: 'technical',
  description: 'Professional template with code-style accents and categorized technical skills',
  colorPalettes: ['professional', 'minimal', 'modern'],
  atsScore: 90,
  bestFor: [
    'Software Engineers',
    'Backend Developers',
    'Systems Programmers',
    'Algorithm Engineers',
    'Technical Architects',
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

export default CodeProfessionalPDF;

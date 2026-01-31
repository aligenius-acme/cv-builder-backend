/**
 * Tech Modern Template
 *
 * Modern, clean design with cyan/teal color scheme
 * Single-column layout with grid-based skills
 * Ideal for modern tech companies
 *
 * ATS Score: 88/100 (ATS-friendly)
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
export const TechModernPDF: React.FC<TemplatePDFProps> = ({ data, colors, options }) => {
  const palette = colors || getColorPalette('modern');

  return (
    <div
      style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
        padding: '48px',
        backgroundColor: palette.background,
        color: palette.text,
        maxWidth: '800px',
        margin: '0 auto',
      }}
    >
      {/* Header - Centered */}
      <Header contact={data.contact} colors={palette} variant="centered" showLinks={true} />

      {/* Summary */}
      {data.summary && (
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: palette.backgroundAlt,
              borderLeft: `4px solid ${palette.primary}`,
              marginBottom: 16,
            }}
          >
            <p
              style={{
                margin: 0,
                lineHeight: 1.6,
                color: palette.textLight,
                fontSize: '10pt',
              }}
            >
              {data.summary}
            </p>
          </div>
        </div>
      )}

      {/* Technical Skills - Grid Layout */}
      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="Technical Skills" colors={palette} variant="filled" uppercase={true} />
          <SkillsSection skills={data.skills} colors={palette} layout="grid" columns={4} />
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="Experience" colors={palette} variant="filled" uppercase={true} />
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
          <SectionHeader title="Projects" colors={palette} variant="filled" uppercase={true} />
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
          <SectionHeader title="Education" colors={palette} variant="filled" uppercase={true} />
          <EducationSection education={data.education} colors={palette} layout="default" />
        </div>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="Certifications" colors={palette} variant="filled" uppercase={true} />
          <CertificationsSection certifications={data.certifications} colors={palette} layout="default" />
        </div>
      )}
    </div>
  );
};

/**
 * Template Metadata
 */
export const TechModernMetadata = createTemplateMetadata({
  id: 'tech-modern',
  name: 'Tech Modern',
  category: 'technical',
  description: 'Modern design with cyan/teal color scheme, perfect for contemporary tech roles',
  colorPalettes: ['modern', 'professional', 'minimal'],
  atsScore: 88,
  bestFor: [
    'Software Engineers',
    'Web Developers',
    'Mobile Developers',
    'Tech Startups',
    'Modern Companies',
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

export default TechModernPDF;

/**
 * Data Science Template
 *
 * Specialized template for data scientists and analysts
 * Single-column with emphasis on technical skills and projects
 * Optimized for data-related roles
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
export const DataSciencePDF: React.FC<TemplatePDFProps> = ({ data, colors, options }) => {
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
      {/* Header */}
      <Header contact={data.contact} colors={palette} variant="centered" showLinks={true} />

      {/* Summary */}
      {data.summary && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="Profile" colors={palette} variant="default" uppercase={false} />
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

      {/* Technical Skills - Grid layout */}
      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader
            title="Technical Skills & Tools"
            colors={palette}
            variant="underline"
            uppercase={true}
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
              marginTop: 8,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '9pt',
                  fontWeight: 600,
                  color: palette.primary,
                  marginBottom: 8,
                }}
              >
                Languages & Libraries:
              </div>
              <SkillsSection
                skills={data.skills.slice(0, Math.ceil(data.skills.length / 2))}
                colors={palette}
                layout="list"
                showBullets={true}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: '9pt',
                  fontWeight: 600,
                  color: palette.primary,
                  marginBottom: 8,
                }}
              >
                Tools & Platforms:
              </div>
              <SkillsSection
                skills={data.skills.slice(Math.ceil(data.skills.length / 2))}
                colors={palette}
                layout="list"
                showBullets={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader
            title="Professional Experience"
            colors={palette}
            variant="underline"
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

      {/* Projects - Emphasized for data science */}
      {data.projects && data.projects.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="Data Science Projects" colors={palette} variant="underline" uppercase={true} />
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
          <SectionHeader title="Education" colors={palette} variant="underline" uppercase={true} />
          <EducationSection education={data.education} colors={palette} layout="detailed" showGPA={true} />
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
          <CertificationsSection certifications={data.certifications} colors={palette} layout="default" />
        </div>
      )}
    </div>
  );
};

/**
 * Template Metadata
 */
export const DataScienceMetadata = createTemplateMetadata({
  id: 'data-science',
  name: 'Data Science',
  category: 'technical',
  description: 'Specialized template for data scientists with emphasis on technical skills and projects',
  colorPalettes: ['modern', 'professional', 'minimal'],
  atsScore: 88,
  bestFor: [
    'Data Scientists',
    'Machine Learning Engineers',
    'Data Analysts',
    'Research Scientists',
    'AI Engineers',
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

export default DataSciencePDF;

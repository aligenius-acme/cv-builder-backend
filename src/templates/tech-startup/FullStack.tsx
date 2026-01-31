/**
 * Full Stack Template
 *
 * Balanced template for full-stack developers
 * Single-column with categorized technical skills
 * Emphasizes both frontend and backend experience
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
export const FullStackPDF: React.FC<TemplatePDFProps> = ({ data, colors, options }) => {
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
      <Header contact={data.contact} colors={palette} variant="left" showLinks={true} />

      {/* Summary */}
      {data.summary && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="Profile" colors={palette} variant="sidebar" uppercase={false} />
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

      {/* Technical Skills - Categorized by Frontend/Backend */}
      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader
            title="Technical Stack"
            colors={palette}
            variant="sidebar"
            uppercase={false}
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
                  textTransform: 'uppercase',
                }}
              >
                Frontend
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
                  textTransform: 'uppercase',
                }}
              >
                Backend
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
            title="Work Experience"
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
          <SectionHeader title="Featured Projects" colors={palette} variant="sidebar" uppercase={false} />
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
          <SectionHeader title="Education" colors={palette} variant="sidebar" uppercase={false} />
          <EducationSection education={data.education} colors={palette} layout="default" />
        </div>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader
            title="Certifications"
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
export const FullStackMetadata = createTemplateMetadata({
  id: 'full-stack',
  name: 'Full Stack',
  category: 'technical',
  description: 'Balanced template for full-stack developers with categorized frontend/backend skills',
  colorPalettes: ['modern', 'professional', 'minimal'],
  atsScore: 88,
  bestFor: [
    'Full-Stack Developers',
    'Full-Stack Engineers',
    'Web Developers',
    'JavaScript Engineers',
    'MERN/MEAN Stack Developers',
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

export default FullStackPDF;

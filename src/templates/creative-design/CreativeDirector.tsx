/**
 * Creative Director Template
 *
 * Executive creative style with banner header
 * Single-column body for better ATS compatibility
 * Leadership-focused design
 *
 * ATS Score: 72/100 (balanced)
 */

import React from 'react';
import { TemplatePDFProps, createTemplateMetadata } from '../index';
import { SectionHeader } from '../shared/components/SectionHeader';
import { SkillsSection } from '../shared/components/SkillsSection';
import { ExperienceSection } from '../shared/components/ExperienceSection';
import { EducationSection } from '../shared/components/EducationSection';
import { ProjectsSection } from '../shared/components/ProjectsSection';
import { getColorPalette } from '../shared/styles/colors';

/**
 * PDF Component
 */
export const CreativeDirectorPDF: React.FC<TemplatePDFProps> = ({ data, colors, options }) => {
  const palette = colors || getColorPalette('modern');

  return (
    <div
      style={{
        fontFamily: 'Helvetica, Arial, sans-serif',
        backgroundColor: palette.background,
        color: palette.text,
        minHeight: '100vh',
      }}
    >
      {/* Banner Header */}
      <div
        style={{
          backgroundColor: palette.primary,
          padding: '40px 48px',
          color: '#FFFFFF',
          marginBottom: 36,
        }}
      >
        <h1
          style={{
            fontSize: '28pt',
            fontWeight: 900,
            color: '#FFFFFF',
            margin: '0 0 14px 0',
            lineHeight: 1.1,
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          {data.contact.name || 'Your Name'}
        </h1>
        <div
          style={{
            fontSize: '14pt',
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.95)',
            marginBottom: 20,
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}
        >
          Creative Director
        </div>
        <div
          style={{
            display: 'flex',
            gap: 24,
            fontSize: '10pt',
            color: 'rgba(255, 255, 255, 0.95)',
            flexWrap: 'wrap',
          }}
        >
          {data.contact.email && <div>{data.contact.email}</div>}
          {data.contact.phone && <div>{data.contact.phone}</div>}
          {data.contact.location && <div>{data.contact.location}</div>}
          {data.contact.website && (
            <div style={{ fontWeight: 700 }}>{data.contact.website}</div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '0 48px 48px 48px', maxWidth: '800px', margin: '0 auto' }}>
        {/* Summary */}
        {data.summary && (
          <div style={{ marginBottom: 32 }}>
            <SectionHeader
              title="Executive Summary"
              colors={palette}
              variant="boxed"
              uppercase={true}
            />
            <p
              style={{
                margin: '12px 0 0 0',
                lineHeight: 1.7,
                color: palette.text,
                fontSize: '11pt',
              }}
            >
              {data.summary}
            </p>
          </div>
        )}

        {/* Core Competencies */}
        {data.skills && data.skills.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <SectionHeader
              title="Core Competencies"
              colors={palette}
              variant="boxed"
              uppercase={true}
            />
            <SkillsSection
              skills={data.skills}
              colors={palette}
              layout="grid"
              columns={3}
            />
          </div>
        )}

        {/* Leadership Experience */}
        {data.experience && data.experience.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <SectionHeader
              title="Leadership Experience"
              colors={palette}
              variant="boxed"
              uppercase={true}
            />
            <ExperienceSection
              experiences={data.experience}
              colors={palette}
              showDuration={true}
              layout="default"
            />
          </div>
        )}

        {/* Notable Projects */}
        {data.projects && data.projects.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <SectionHeader
              title="Notable Projects"
              colors={palette}
              variant="boxed"
              uppercase={true}
            />
            <ProjectsSection
              projects={data.projects}
              colors={palette}
              showTechnologies={false}
              showLinks={true}
              layout="default"
            />
          </div>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <SectionHeader
              title="Education"
              colors={palette}
              variant="boxed"
              uppercase={true}
            />
            <EducationSection
              education={data.education}
              colors={palette}
              layout="default"
            />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Template Metadata
 */
export const CreativeDirectorMetadata = createTemplateMetadata({
  id: 'creative-director',
  name: 'Creative Director',
  category: 'creative',
  description: 'Executive-style template for creative directors with banner header and single-column layout',
  colorPalettes: ['modern', 'professional', 'creative'],
  atsScore: 72,
  bestFor: [
    'Creative Directors',
    'Art Directors',
    'Design Directors',
    'Creative Leaders',
    'Executive Creatives',
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
    certifications: false,
  },
});

export default CreativeDirectorPDF;

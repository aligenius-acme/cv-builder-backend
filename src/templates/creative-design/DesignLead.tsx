/**
 * Design Lead Template
 *
 * Leadership-focused design template with banner header
 * Single-column body for ATS optimization
 * Professional yet creative
 *
 * ATS Score: 73/100 (balanced)
 */

import React from 'react';
import { TemplatePDFProps, createTemplateMetadata } from '../index';
import { SectionHeader } from '../shared/components/SectionHeader';
import { SkillsSection } from '../shared/components/SkillsSection';
import { ExperienceSection } from '../shared/components/ExperienceSection';
import { EducationSection } from '../shared/components/EducationSection';
import { ProjectsSection } from '../shared/components/ProjectsSection';
import { getColorPalette } from '../shared/styles/colors';

export const DesignLeadPDF: React.FC<TemplatePDFProps> = ({ data, colors, options }) => {
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
          backgroundColor: palette.backgroundAlt,
          padding: '38px 48px',
          marginBottom: 34,
          borderLeft: `8px solid ${palette.primary}`,
        }}
      >
        <h1
          style={{
            fontSize: '27pt',
            fontWeight: 800,
            color: palette.primary,
            margin: '0 0 12px 0',
            lineHeight: 1.1,
          }}
        >
          {data.contact.name || 'Your Name'}
        </h1>
        <div
          style={{
            fontSize: '13pt',
            fontWeight: 700,
            color: palette.text,
            marginBottom: 16,
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
          }}
        >
          Design Lead
        </div>
        <div
          style={{
            display: 'flex',
            gap: 22,
            fontSize: '10pt',
            color: palette.textLight,
            flexWrap: 'wrap',
          }}
        >
          {data.contact.email && <div>{data.contact.email}</div>}
          {data.contact.phone && <div>{data.contact.phone}</div>}
          {data.contact.location && <div>{data.contact.location}</div>}
          {data.contact.website && (
            <div style={{ color: palette.primary, fontWeight: 700 }}>
              {data.contact.website}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '0 48px 48px 48px', maxWidth: '800px', margin: '0 auto' }}>
        {/* Summary */}
        {data.summary && (
          <div style={{ marginBottom: 30 }}>
            <SectionHeader title="Leadership Profile" colors={palette} variant="boxed" uppercase={true} />
            <p style={{ margin: '12px 0 0 0', lineHeight: 1.7, fontSize: '10.5pt' }}>
              {data.summary}
            </p>
          </div>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <div style={{ marginBottom: 30 }}>
            <SectionHeader title="Expertise" colors={palette} variant="boxed" uppercase={true} />
            <SkillsSection skills={data.skills} colors={palette} layout="grid" columns={3} />
          </div>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <div style={{ marginBottom: 30 }}>
            <SectionHeader title="Leadership Experience" colors={palette} variant="boxed" uppercase={true} />
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
          <div style={{ marginBottom: 30 }}>
            <SectionHeader title="Key Initiatives" colors={palette} variant="boxed" uppercase={true} />
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
          <div style={{ marginBottom: 30 }}>
            <SectionHeader title="Education" colors={palette} variant="boxed" uppercase={true} />
            <EducationSection education={data.education} colors={palette} layout="default" />
          </div>
        )}
      </div>
    </div>
  );
};

export const DesignLeadMetadata = createTemplateMetadata({
  id: 'design-lead',
  name: 'Design Lead',
  category: 'creative',
  description: 'Leadership-focused template for design leads and managers with professional styling',
  colorPalettes: ['modern', 'professional', 'creative'],
  atsScore: 73,
  bestFor: [
    'Design Leads',
    'Design Managers',
    'UX Leads',
    'Design Team Leads',
    'Senior Designers',
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

export default DesignLeadPDF;

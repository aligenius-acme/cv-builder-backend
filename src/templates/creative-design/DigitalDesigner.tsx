/**
 * Digital Designer Template
 *
 * Digital design focused template with banner header
 * Single-column body with portfolio emphasis
 * Modern and professional
 *
 * ATS Score: 70/100 (balanced)
 */

import React from 'react';
import { TemplatePDFProps, createTemplateMetadata } from '../index';
import { SectionHeader } from '../shared/components/SectionHeader';
import { SkillsSection } from '../shared/components/SkillsSection';
import { ExperienceSection } from '../shared/components/ExperienceSection';
import { EducationSection } from '../shared/components/EducationSection';
import { ProjectsSection } from '../shared/components/ProjectsSection';
import { getColorPalette } from '../shared/styles/colors';

export const DigitalDesignerPDF: React.FC<TemplatePDFProps> = ({ data, colors, options }) => {
  const palette = colors || getColorPalette('modern');

  return (
    <div style={{ fontFamily: 'Arial, Helvetica, sans-serif', backgroundColor: palette.background, color: palette.text, minHeight: '100vh' }}>
      {/* Banner Header */}
      <div style={{ backgroundColor: palette.backgroundAlt, padding: '38px 48px', marginBottom: 32, borderBottom: `6px solid ${palette.primary}` }}>
        <h1 style={{ fontSize: '26pt', fontWeight: 800, color: palette.primary, margin: '0 0 12px 0', lineHeight: 1.1 }}>
          {data.contact.name || 'Your Name'}
        </h1>
        <div style={{ fontSize: '13pt', fontWeight: 700, color: palette.text, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '1.5px' }}>
          Digital Designer
        </div>
        <div style={{ display: 'flex', gap: 20, fontSize: '10pt', color: palette.textLight, flexWrap: 'wrap' }}>
          {data.contact.email && <div>{data.contact.email}</div>}
          {data.contact.phone && <div>{data.contact.phone}</div>}
          {data.contact.location && <div>{data.contact.location}</div>}
          {data.contact.website && <div style={{ color: palette.primary, fontWeight: 700 }}>{data.contact.website}</div>}
        </div>
      </div>

      <div style={{ padding: '0 48px 48px 48px', maxWidth: '800px', margin: '0 auto' }}>
        {data.summary && (
          <div style={{ marginBottom: 30 }}>
            <SectionHeader title="Profile" colors={palette} variant="boxed" uppercase={true} />
            <p style={{ margin: '12px 0 0 0', lineHeight: 1.7, fontSize: '10.5pt' }}>{data.summary}</p>
          </div>
        )}

        {data.skills && data.skills.length > 0 && (
          <div style={{ marginBottom: 30 }}>
            <SectionHeader title="Design Skills" colors={palette} variant="boxed" uppercase={true} />
            <SkillsSection skills={data.skills} colors={palette} layout="grid" columns={3} />
          </div>
        )}

        {data.projects && data.projects.length > 0 && (
          <div style={{ marginBottom: 30 }}>
            <SectionHeader title="Design Portfolio" colors={palette} variant="boxed" uppercase={true} />
            <ProjectsSection projects={data.projects} colors={palette} showTechnologies={true} showLinks={true} layout="detailed" />
          </div>
        )}

        {data.experience && data.experience.length > 0 && (
          <div style={{ marginBottom: 30 }}>
            <SectionHeader title="Professional Experience" colors={palette} variant="boxed" uppercase={true} />
            <ExperienceSection experiences={data.experience} colors={palette} showDuration={true} layout="default" />
          </div>
        )}

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

export const DigitalDesignerMetadata = createTemplateMetadata({
  id: 'digital-designer',
  name: 'Digital Designer',
  category: 'creative',
  description: 'Professional template for digital designers with portfolio showcase and clean layout',
  colorPalettes: ['modern', 'professional', 'creative'],
  atsScore: 70,
  bestFor: ['Digital Designers', 'Web Designers', 'UI Designers', 'Visual Designers', 'Interface Designers'],
  features: { twoColumn: false, headerImage: false, colorCustomization: true, sectionIcons: false, skillBars: false, timeline: false, portfolio: true, publications: false, languages: false, certifications: false },
});

export default DigitalDesignerPDF;

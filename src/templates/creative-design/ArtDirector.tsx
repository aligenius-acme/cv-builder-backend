/**
 * Art Director Template
 *
 * High-level creative leadership template with banner header
 * Single-column body with executive styling
 * Perfect for art directors and creative executives
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

export const ArtDirectorPDF: React.FC<TemplatePDFProps> = ({ data, colors, options }) => {
  const palette = colors || getColorPalette('professional');

  return (
    <div style={{ fontFamily: 'Helvetica, Arial, sans-serif', backgroundColor: palette.background, color: palette.text, minHeight: '100vh' }}>
      {/* Executive Banner Header */}
      <div style={{ backgroundColor: palette.primary, padding: '42px 48px', color: '#FFFFFF', marginBottom: 36 }}>
        <h1 style={{ fontSize: '30pt', fontWeight: 900, color: '#FFFFFF', margin: '0 0 14px 0', lineHeight: 1.05, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {data.contact.name || 'Your Name'}
        </h1>
        <div style={{ fontSize: '14pt', fontWeight: 700, color: 'rgba(255, 255, 255, 0.95)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '2px' }}>
          Art Director
        </div>
        <div style={{ display: 'flex', gap: 24, fontSize: '10pt', color: 'rgba(255, 255, 255, 0.95)', flexWrap: 'wrap' }}>
          {data.contact.email && <div>{data.contact.email}</div>}
          {data.contact.phone && <div>{data.contact.phone}</div>}
          {data.contact.location && <div>{data.contact.location}</div>}
          {data.contact.website && <div style={{ fontWeight: 800 }}>Portfolio: {data.contact.website}</div>}
        </div>
      </div>

      <div style={{ padding: '0 48px 48px 48px', maxWidth: '800px', margin: '0 auto' }}>
        {data.summary && (
          <div style={{ marginBottom: 32 }}>
            <SectionHeader title="Creative Vision" colors={palette} variant="boxed" uppercase={true} />
            <p style={{ margin: '12px 0 0 0', lineHeight: 1.7, fontSize: '11pt' }}>{data.summary}</p>
          </div>
        )}

        {data.skills && data.skills.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <SectionHeader title="Creative Expertise" colors={palette} variant="boxed" uppercase={true} />
            <SkillsSection skills={data.skills} colors={palette} layout="grid" columns={3} />
          </div>
        )}

        {data.experience && data.experience.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <SectionHeader title="Leadership Experience" colors={palette} variant="boxed" uppercase={true} />
            <ExperienceSection experiences={data.experience} colors={palette} showDuration={true} layout="default" />
          </div>
        )}

        {data.projects && data.projects.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <SectionHeader title="Signature Work" colors={palette} variant="boxed" uppercase={true} />
            <ProjectsSection projects={data.projects} colors={palette} showTechnologies={false} showLinks={true} layout="default" />
          </div>
        )}

        {data.education && data.education.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <SectionHeader title="Education & Training" colors={palette} variant="boxed" uppercase={true} />
            <EducationSection education={data.education} colors={palette} layout="default" />
          </div>
        )}
      </div>
    </div>
  );
};

export const ArtDirectorMetadata = createTemplateMetadata({
  id: 'art-director',
  name: 'Art Director',
  category: 'creative',
  description: 'Executive-level template for art directors and creative leaders with bold styling',
  colorPalettes: ['professional', 'modern', 'creative'],
  atsScore: 72,
  bestFor: ['Art Directors', 'Creative Directors', 'Senior Art Directors', 'Associate Creative Directors', 'Executive Creative Directors'],
  features: { twoColumn: false, headerImage: false, colorCustomization: true, sectionIcons: false, skillBars: false, timeline: false, portfolio: true, publications: false, languages: false, certifications: false },
});

export default ArtDirectorPDF;

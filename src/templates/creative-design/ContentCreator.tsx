/**
 * Content Creator Template
 *
 * Modern content creator style with banner header
 * Single-column body optimized for content professionals
 * Social media and digital content focus
 *
 * ATS Score: 68/100 (visual-first)
 */

import React from 'react';
import { TemplatePDFProps, createTemplateMetadata } from '../index';
import { SectionHeader } from '../shared/components/SectionHeader';
import { SkillsSection } from '../shared/components/SkillsSection';
import { ExperienceSection } from '../shared/components/ExperienceSection';
import { EducationSection } from '../shared/components/EducationSection';
import { ProjectsSection } from '../shared/components/ProjectsSection';
import { getColorPalette } from '../shared/styles/colors';

export const ContentCreatorPDF: React.FC<TemplatePDFProps> = ({ data, colors, options }) => {
  const palette = colors || getColorPalette('modern');

  return (
    <div style={{ fontFamily: 'Arial, Helvetica, sans-serif', backgroundColor: palette.background, color: palette.text, minHeight: '100vh' }}>
      {/* Banner Header */}
      <div style={{ backgroundColor: palette.primary, padding: '36px 48px', color: '#FFFFFF', marginBottom: 30 }}>
        <h1 style={{ fontSize: '26pt', fontWeight: 800, color: '#FFFFFF', margin: '0 0 10px 0', lineHeight: 1.1, letterSpacing: '0.3px' }}>
          {data.contact.name || 'Your Name'}
        </h1>
        <div style={{ fontSize: '12.5pt', fontWeight: 700, color: 'rgba(255, 255, 255, 0.95)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '1.5px' }}>
          Content Creator
        </div>
        <div style={{ display: 'flex', gap: 18, fontSize: '9.5pt', color: 'rgba(255, 255, 255, 0.95)', flexWrap: 'wrap' }}>
          {data.contact.email && <div>{data.contact.email}</div>}
          {data.contact.phone && <div>{data.contact.phone}</div>}
          {data.contact.website && <div style={{ fontWeight: 700 }}>{data.contact.website}</div>}
          {data.contact.linkedin && <div>LinkedIn: {data.contact.linkedin}</div>}
        </div>
      </div>

      <div style={{ padding: '0 48px 48px 48px', maxWidth: '780px', margin: '0 auto' }}>
        {data.summary && (
          <div style={{ marginBottom: 28 }}>
            <SectionHeader title="About" colors={palette} variant="underline" uppercase={true} />
            <p style={{ margin: '10px 0 0 0', lineHeight: 1.7, fontSize: '10.5pt' }}>{data.summary}</p>
          </div>
        )}

        {data.skills && data.skills.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <SectionHeader title="Skills & Platforms" colors={palette} variant="underline" uppercase={true} />
            <SkillsSection skills={data.skills} colors={palette} layout="pills" />
          </div>
        )}

        {data.experience && data.experience.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <SectionHeader title="Experience" colors={palette} variant="underline" uppercase={true} />
            <ExperienceSection experiences={data.experience} colors={palette} showDuration={true} layout="default" />
          </div>
        )}

        {data.projects && data.projects.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <SectionHeader title="Content Portfolio" colors={palette} variant="underline" uppercase={true} />
            <ProjectsSection projects={data.projects} colors={palette} showTechnologies={true} showLinks={true} layout="default" />
          </div>
        )}

        {data.education && data.education.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <SectionHeader title="Education" colors={palette} variant="underline" uppercase={true} />
            <EducationSection education={data.education} colors={palette} layout="compact" />
          </div>
        )}
      </div>
    </div>
  );
};

export const ContentCreatorMetadata = createTemplateMetadata({
  id: 'content-creator',
  name: 'Content Creator',
  category: 'creative',
  description: 'Modern template for content creators and digital media professionals',
  colorPalettes: ['modern', 'vibrant', 'creative'],
  atsScore: 68,
  bestFor: ['Content Creators', 'Social Media Creators', 'Video Creators', 'Digital Content Producers', 'Influencer Marketers'],
  features: { twoColumn: false, headerImage: false, colorCustomization: true, sectionIcons: false, skillBars: false, timeline: false, portfolio: true, publications: false, languages: false, certifications: false },
});

export default ContentCreatorPDF;

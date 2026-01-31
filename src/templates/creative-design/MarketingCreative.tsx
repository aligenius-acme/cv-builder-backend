/**
 * Marketing Creative Template
 *
 * Dynamic marketing-focused template with banner header
 * Single-column body with creative flair
 * Perfect for creative marketing roles
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

export const MarketingCreativePDF: React.FC<TemplatePDFProps> = ({ data, colors, options }) => {
  const palette = colors || getColorPalette('vibrant');

  return (
    <div
      style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
        backgroundColor: palette.background,
        color: palette.text,
        minHeight: '100vh',
      }}
    >
      {/* Bold Banner Header */}
      <div
        style={{
          backgroundColor: palette.primary,
          padding: '38px 48px 32px 48px',
          color: '#FFFFFF',
          marginBottom: 32,
        }}
      >
        <h1
          style={{
            fontSize: '28pt',
            fontWeight: 900,
            color: '#FFFFFF',
            margin: '0 0 10px 0',
            lineHeight: 1.05,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {data.contact.name || 'Your Name'}
        </h1>
        <div
          style={{
            fontSize: '13pt',
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.95)',
            marginBottom: 18,
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}
        >
          Marketing Creative
        </div>
        <div
          style={{
            display: 'flex',
            gap: 20,
            fontSize: '10pt',
            color: 'rgba(255, 255, 255, 0.95)',
            flexWrap: 'wrap',
            fontWeight: 500,
          }}
        >
          {data.contact.email && <div>{data.contact.email}</div>}
          {data.contact.phone && <div>{data.contact.phone}</div>}
          {data.contact.location && <div>{data.contact.location}</div>}
          {data.contact.website && (
            <div style={{ fontWeight: 800 }}>{data.contact.website}</div>
          )}
        </div>
      </div>

      <div style={{ padding: '0 48px 48px 48px', maxWidth: '800px', margin: '0 auto' }}>
        {/* Summary with colored background */}
        {data.summary && (
          <div
            style={{
              marginBottom: 30,
              padding: '20px',
              backgroundColor: palette.backgroundAlt,
              borderLeft: `5px solid ${palette.primary}`,
            }}
          >
            <div
              style={{
                fontSize: '11pt',
                fontWeight: 800,
                color: palette.primary,
                marginBottom: 10,
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              About Me
            </div>
            <p style={{ margin: '0', lineHeight: 1.7, fontSize: '10.5pt' }}>
              {data.summary}
            </p>
          </div>
        )}

        {/* Skills - Pills */}
        {data.skills && data.skills.length > 0 && (
          <div style={{ marginBottom: 30 }}>
            <SectionHeader title="Skills & Tools" colors={palette} variant="filled" uppercase={true} />
            <SkillsSection skills={data.skills} colors={palette} layout="pills" />
          </div>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <div style={{ marginBottom: 30 }}>
            <SectionHeader title="Experience" colors={palette} variant="filled" uppercase={true} />
            <ExperienceSection
              experiences={data.experience}
              colors={palette}
              showDuration={true}
              layout="default"
            />
          </div>
        )}

        {/* Campaigns/Projects */}
        {data.projects && data.projects.length > 0 && (
          <div style={{ marginBottom: 30 }}>
            <SectionHeader title="Campaigns & Projects" colors={palette} variant="filled" uppercase={true} />
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
            <SectionHeader title="Education" colors={palette} variant="filled" uppercase={true} />
            <EducationSection education={data.education} colors={palette} layout="compact" />
          </div>
        )}
      </div>
    </div>
  );
};

export const MarketingCreativeMetadata = createTemplateMetadata({
  id: 'marketing-creative',
  name: 'Marketing Creative',
  category: 'creative',
  description: 'Dynamic template for creative marketing professionals with bold banner header',
  colorPalettes: ['vibrant', 'modern', 'creative'],
  atsScore: 70,
  bestFor: [
    'Marketing Creatives',
    'Content Marketers',
    'Campaign Managers',
    'Marketing Specialists',
    'Growth Marketers',
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

export default MarketingCreativePDF;

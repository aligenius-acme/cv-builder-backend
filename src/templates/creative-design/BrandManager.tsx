/**
 * Brand Manager Template
 *
 * Professional yet creative with banner header
 * Single-column for better ATS compatibility
 * Perfect for brand and marketing managers
 *
 * ATS Score: 75/100 (balanced)
 */

import React from 'react';
import { TemplatePDFProps, createTemplateMetadata } from '../index';
import { SectionHeader } from '../shared/components/SectionHeader';
import { SkillsSection } from '../shared/components/SkillsSection';
import { ExperienceSection } from '../shared/components/ExperienceSection';
import { EducationSection } from '../shared/components/EducationSection';
import { ProjectsSection } from '../shared/components/ProjectsSection';
import { CertificationsSection } from '../shared/components/CertificationsSection';
import { getColorPalette } from '../shared/styles/colors';

export const BrandManagerPDF: React.FC<TemplatePDFProps> = ({ data, colors, options }) => {
  const palette = colors || getColorPalette('professional');

  return (
    <div
      style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
        backgroundColor: palette.background,
        color: palette.text,
        minHeight: '100vh',
      }}
    >
      {/* Banner Header with gradient-like effect */}
      <div
        style={{
          backgroundColor: palette.primary,
          padding: '36px 48px',
          color: '#FFFFFF',
          marginBottom: 32,
          borderBottom: `5px solid ${palette.primaryDark || palette.primary}`,
        }}
      >
        <h1
          style={{
            fontSize: '26pt',
            fontWeight: 800,
            color: '#FFFFFF',
            margin: '0 0 12px 0',
            lineHeight: 1.1,
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
            letterSpacing: '1.5px',
          }}
        >
          Brand Manager
        </div>
        <div
          style={{
            display: 'flex',
            gap: 20,
            fontSize: '9.5pt',
            color: 'rgba(255, 255, 255, 0.95)',
            flexWrap: 'wrap',
          }}
        >
          {data.contact.email && <div>{data.contact.email}</div>}
          {data.contact.phone && <div>{data.contact.phone}</div>}
          {data.contact.location && <div>{data.contact.location}</div>}
          {data.contact.website && (
            <div style={{ fontWeight: 700 }}>Portfolio: {data.contact.website}</div>
          )}
        </div>
      </div>

      <div style={{ padding: '0 48px 48px 48px', maxWidth: '780px', margin: '0 auto' }}>
        {/* Professional Summary */}
        {data.summary && (
          <div style={{ marginBottom: 28 }}>
            <SectionHeader
              title="Professional Summary"
              colors={palette}
              variant="underline"
              uppercase={true}
            />
            <p style={{ margin: '10px 0 0 0', lineHeight: 1.7, fontSize: '10.5pt' }}>
              {data.summary}
            </p>
          </div>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <SectionHeader
              title="Core Skills"
              colors={palette}
              variant="underline"
              uppercase={true}
            />
            <SkillsSection skills={data.skills} colors={palette} layout="pills" />
          </div>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <div style={{ marginBottom: 28 }}>
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
              layout="default"
            />
          </div>
        )}

        {/* Brand Projects */}
        {data.projects && data.projects.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <SectionHeader
              title="Key Projects"
              colors={palette}
              variant="underline"
              uppercase={true}
            />
            <ProjectsSection
              projects={data.projects}
              colors={palette}
              showTechnologies={true}
              showLinks={true}
              layout="default"
            />
          </div>
        )}

        {/* Education & Certifications */}
        <div style={{ display: 'flex', gap: 32, marginBottom: 28 }}>
          {data.education && data.education.length > 0 && (
            <div style={{ flex: 1 }}>
              <SectionHeader
                title="Education"
                colors={palette}
                variant="underline"
                uppercase={true}
              />
              <EducationSection education={data.education} colors={palette} layout="compact" />
            </div>
          )}
          {data.certifications && data.certifications.length > 0 && (
            <div style={{ flex: 1 }}>
              <SectionHeader
                title="Certifications"
                colors={palette}
                variant="underline"
                uppercase={true}
              />
              <CertificationsSection
                certifications={data.certifications}
                colors={palette}
                layout="list"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const BrandManagerMetadata = createTemplateMetadata({
  id: 'brand-manager',
  name: 'Brand Manager',
  category: 'creative',
  description: 'Professional template with banner header, perfect for brand and marketing managers',
  colorPalettes: ['professional', 'modern', 'creative'],
  atsScore: 75,
  bestFor: [
    'Brand Managers',
    'Marketing Managers',
    'Product Marketing Managers',
    'Brand Strategists',
    'Marketing Directors',
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

export default BrandManagerPDF;

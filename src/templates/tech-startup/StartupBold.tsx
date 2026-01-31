/**
 * Startup Bold Template
 *
 * Bold, energetic design for startup environments
 * Two-column sidebar layout with skills and contact
 * Perfect for fast-paced startup culture
 *
 * ATS Score: 80/100 (ATS-friendly, two-column)
 */

import React from 'react';
import { TemplatePDFProps, createTemplateMetadata } from '../index';
import { ContactInfo } from '../shared/components/ContactInfo';
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
export const StartupBoldPDF: React.FC<TemplatePDFProps> = ({ data, colors, options }) => {
  const palette = colors || getColorPalette('modern');

  return (
    <div
      style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
        display: 'flex',
        backgroundColor: palette.background,
        color: palette.text,
        minHeight: '100vh',
      }}
    >
      {/* Sidebar - 35% */}
      <div
        style={{
          width: '35%',
          backgroundColor: palette.backgroundAlt,
          padding: '32px 24px',
          borderRight: `3px solid ${palette.primary}`,
        }}
      >
        {/* Name & Title */}
        <div style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontSize: '20pt',
              fontWeight: 700,
              color: palette.primary,
              margin: '0 0 8px 0',
              lineHeight: 1.2,
            }}
          >
            {data.contact.name || 'Your Name'}
          </h1>
          <div
            style={{
              fontSize: '11pt',
              fontWeight: 600,
              color: palette.text,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Developer
          </div>
        </div>

        {/* Contact Info */}
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="Contact" colors={palette} variant="minimal" uppercase={true} />
          <ContactInfo contact={data.contact} colors={palette} layout="vertical" showIcons={false} />
        </div>

        {/* Skills - Pills */}
        {data.skills && data.skills.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionHeader title="Skills" colors={palette} variant="minimal" uppercase={true} />
            <SkillsSection skills={data.skills} colors={palette} layout="pills" />
          </div>
        )}

        {/* Education (compact in sidebar) */}
        {data.education && data.education.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionHeader title="Education" colors={palette} variant="minimal" uppercase={true} />
            <EducationSection education={data.education} colors={palette} layout="compact" />
          </div>
        )}

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionHeader title="Certifications" colors={palette} variant="minimal" uppercase={true} />
            <CertificationsSection certifications={data.certifications} colors={palette} layout="list" />
          </div>
        )}
      </div>

      {/* Main Content - 65% */}
      <div
        style={{
          width: '65%',
          padding: '32px 40px',
        }}
      >
        {/* Summary */}
        {data.summary && (
          <div style={{ marginBottom: 24 }}>
            <SectionHeader title="About" colors={palette} variant="underline" uppercase={true} />
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

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionHeader title="Experience" colors={palette} variant="underline" uppercase={true} />
            <ExperienceSection
              experiences={data.experience}
              colors={palette}
              showDuration={false}
              layout="compact"
            />
          </div>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionHeader title="Projects" colors={palette} variant="underline" uppercase={true} />
            <ProjectsSection
              projects={data.projects}
              colors={palette}
              showTechnologies={true}
              showLinks={true}
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
export const StartupBoldMetadata = createTemplateMetadata({
  id: 'startup-bold',
  name: 'Startup Bold',
  category: 'technical',
  description: 'Bold two-column design perfect for startup environments and creative tech roles',
  colorPalettes: ['modern', 'creative', 'professional'],
  atsScore: 80,
  bestFor: [
    'Startup Engineers',
    'Early-Stage Developers',
    'Founding Engineers',
    'Tech Entrepreneurs',
    'Growth Engineers',
  ],
  features: {
    twoColumn: true,
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

export default StartupBoldPDF;

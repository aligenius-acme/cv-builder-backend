/**
 * Developer Pro Template
 *
 * Professional two-column layout for experienced developers
 * Sidebar with categorized skills and contact
 * Clean, modern design with technical focus
 *
 * ATS Score: 82/100 (ATS-friendly, two-column)
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
export const DeveloperProPDF: React.FC<TemplatePDFProps> = ({ data, colors, options }) => {
  const palette = colors || getColorPalette('professional');

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
        backgroundColor: palette.background,
        color: palette.text,
        minHeight: '100vh',
      }}
    >
      {/* Sidebar - 32% */}
      <div
        style={{
          width: '32%',
          backgroundColor: palette.backgroundAlt,
          padding: '32px 24px',
          borderRight: `2px solid ${palette.border}`,
        }}
      >
        {/* Name & Title */}
        <div style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontSize: '18pt',
              fontWeight: 700,
              color: palette.primary,
              margin: '0 0 4px 0',
              lineHeight: 1.2,
            }}
          >
            {data.contact.name || 'Your Name'}
          </h1>
          <div
            style={{
              fontSize: '10pt',
              color: palette.textLight,
              fontWeight: 600,
            }}
          >
            Software Developer
          </div>
        </div>

        {/* Contact */}
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="CONTACT" colors={palette} variant="minimal" uppercase={true} />
          <ContactInfo contact={data.contact} colors={palette} layout="vertical" showIcons={false} />
        </div>

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionHeader title="SKILLS" colors={palette} variant="minimal" uppercase={true} />
            <SkillsSection skills={data.skills} colors={palette} layout="list" showBullets={true} />
          </div>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionHeader title="EDUCATION" colors={palette} variant="minimal" uppercase={true} />
            <EducationSection education={data.education} colors={palette} layout="compact" />
          </div>
        )}

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionHeader title="CERTIFICATIONS" colors={palette} variant="minimal" uppercase={true} />
            <CertificationsSection certifications={data.certifications} colors={palette} layout="compact" />
          </div>
        )}
      </div>

      {/* Main Content - 68% */}
      <div
        style={{
          width: '68%',
          padding: '32px 36px',
        }}
      >
        {/* Summary */}
        {data.summary && (
          <div style={{ marginBottom: 24 }}>
            <SectionHeader title="PROFESSIONAL SUMMARY" colors={palette} variant="underline" uppercase={true} />
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
            <SectionHeader title="WORK EXPERIENCE" colors={palette} variant="underline" uppercase={true} />
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
            <SectionHeader title="NOTABLE PROJECTS" colors={palette} variant="underline" uppercase={true} />
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
export const DeveloperProMetadata = createTemplateMetadata({
  id: 'developer-pro',
  name: 'Developer Pro',
  category: 'technical',
  description: 'Professional two-column layout for experienced developers with sidebar organization',
  colorPalettes: ['professional', 'modern', 'minimal'],
  atsScore: 82,
  bestFor: [
    'Senior Developers',
    'Lead Engineers',
    'Principal Engineers',
    'Staff Engineers',
    'Experienced Developers',
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

export default DeveloperProPDF;

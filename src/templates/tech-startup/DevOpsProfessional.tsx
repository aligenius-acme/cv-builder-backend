/**
 * DevOps Professional Template
 *
 * Professional template for DevOps engineers
 * Two-column layout with infrastructure and automation focus
 * Sidebar with technical tools and certifications
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
export const DevOpsProfessionalPDF: React.FC<TemplatePDFProps> = ({ data, colors, options }) => {
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
      {/* Sidebar - 33% */}
      <div
        style={{
          width: '33%',
          backgroundColor: palette.backgroundAlt,
          padding: '32px 24px',
          borderRight: `3px solid ${palette.primary}`,
        }}
      >
        {/* Name & Role */}
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
              fontWeight: 600,
              color: palette.text,
              textTransform: 'uppercase',
            }}
          >
            DevOps Engineer
          </div>
        </div>

        {/* Contact */}
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="CONTACT" colors={palette} variant="minimal" uppercase={true} />
          <ContactInfo contact={data.contact} colors={palette} layout="vertical" showIcons={false} />
        </div>

        {/* Technical Skills */}
        {data.skills && data.skills.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionHeader title="TECHNICAL SKILLS" colors={palette} variant="minimal" uppercase={true} />
            <div style={{ fontSize: '9pt' }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 600, color: palette.primary, marginBottom: 4 }}>
                  Infrastructure & Cloud
                </div>
                <SkillsSection
                  skills={data.skills.slice(0, Math.ceil(data.skills.length / 3))}
                  colors={palette}
                  layout="list"
                  showBullets={false}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 600, color: palette.primary, marginBottom: 4 }}>
                  CI/CD & Automation
                </div>
                <SkillsSection
                  skills={data.skills.slice(Math.ceil(data.skills.length / 3), Math.ceil(2 * data.skills.length / 3))}
                  colors={palette}
                  layout="list"
                  showBullets={false}
                />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: palette.primary, marginBottom: 4 }}>
                  Monitoring & Tools
                </div>
                <SkillsSection
                  skills={data.skills.slice(Math.ceil(2 * data.skills.length / 3))}
                  colors={palette}
                  layout="list"
                  showBullets={false}
                />
              </div>
            </div>
          </div>
        )}

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionHeader title="CERTIFICATIONS" colors={palette} variant="minimal" uppercase={true} />
            <CertificationsSection certifications={data.certifications} colors={palette} layout="compact" />
          </div>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionHeader title="EDUCATION" colors={palette} variant="minimal" uppercase={true} />
            <EducationSection education={data.education} colors={palette} layout="compact" />
          </div>
        )}
      </div>

      {/* Main Content - 67% */}
      <div
        style={{
          width: '67%',
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
            <SectionHeader title="PROFESSIONAL EXPERIENCE" colors={palette} variant="underline" uppercase={true} />
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
            <SectionHeader title="KEY PROJECTS" colors={palette} variant="underline" uppercase={true} />
            <ProjectsSection
              projects={data.projects}
              colors={palette}
              showTechnologies={true}
              showLinks={false}
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
export const DevOpsProfessionalMetadata = createTemplateMetadata({
  id: 'devops-professional',
  name: 'DevOps Professional',
  category: 'technical',
  description: 'Professional two-column template for DevOps engineers with infrastructure focus',
  colorPalettes: ['professional', 'modern', 'minimal'],
  atsScore: 82,
  bestFor: [
    'DevOps Engineers',
    'Site Reliability Engineers',
    'Platform Engineers',
    'Infrastructure Engineers',
    'Cloud Engineers',
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

export default DevOpsProfessionalPDF;

/**
 * Startup Casual Template
 *
 * Casual, approachable two-column design
 * Perfect for early-stage startups and relaxed tech environments
 * Sidebar with skills and contact
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
export const StartupCasualPDF: React.FC<TemplatePDFProps> = ({ data, colors, options }) => {
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
      {/* Sidebar - 30% */}
      <div
        style={{
          width: '30%',
          backgroundColor: palette.primary,
          padding: '32px 20px',
          color: '#ffffff',
        }}
      >
        {/* Name */}
        <div style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontSize: '18pt',
              fontWeight: 700,
              color: '#ffffff',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {data.contact.name || 'Your Name'}
          </h1>
        </div>

        {/* Contact */}
        <div style={{ marginBottom: 24 }}>
          <h3
            style={{
              fontSize: '11pt',
              fontWeight: 600,
              color: '#ffffff',
              margin: '0 0 8px 0',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Contact
          </h3>
          <div style={{ fontSize: '9pt', lineHeight: 1.6 }}>
            {data.contact.email && <div style={{ marginBottom: 4 }}>{data.contact.email}</div>}
            {data.contact.phone && <div style={{ marginBottom: 4 }}>{data.contact.phone}</div>}
            {data.contact.location && <div style={{ marginBottom: 4 }}>{data.contact.location}</div>}
            {data.contact.linkedin && <div style={{ marginBottom: 4 }}>{data.contact.linkedin}</div>}
            {data.contact.github && <div style={{ marginBottom: 4 }}>{data.contact.github}</div>}
            {data.contact.website && <div style={{ marginBottom: 4 }}>{data.contact.website}</div>}
          </div>
        </div>

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h3
              style={{
                fontSize: '11pt',
                fontWeight: 600,
                color: '#ffffff',
                margin: '0 0 8px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Skills
            </h3>
            <div style={{ fontSize: '9pt', lineHeight: 1.6 }}>
              {data.skills.map((skill, index) => (
                <div key={index} style={{ marginBottom: 4 }}>
                  • {skill}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h3
              style={{
                fontSize: '11pt',
                fontWeight: 600,
                color: '#ffffff',
                margin: '0 0 8px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Education
            </h3>
            <div style={{ fontSize: '9pt' }}>
              {data.education.map((edu, index) => (
                <div key={index} style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600 }}>{edu.degree}</div>
                  <div>{edu.institution}</div>
                  {edu.graduationDate && <div>{edu.graduationDate}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content - 70% */}
      <div
        style={{
          width: '70%',
          padding: '32px 40px',
        }}
      >
        {/* Summary */}
        {data.summary && (
          <div style={{ marginBottom: 24 }}>
            <SectionHeader title="About Me" colors={palette} variant="minimal" uppercase={false} />
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
            <SectionHeader title="Work Experience" colors={palette} variant="minimal" uppercase={false} />
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
            <SectionHeader title="Projects" colors={palette} variant="minimal" uppercase={false} />
            <ProjectsSection
              projects={data.projects}
              colors={palette}
              showTechnologies={true}
              showLinks={true}
              layout="default"
            />
          </div>
        )}

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionHeader title="Certifications" colors={palette} variant="minimal" uppercase={false} />
            <CertificationsSection certifications={data.certifications} colors={palette} layout="list" />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Template Metadata
 */
export const StartupCasualMetadata = createTemplateMetadata({
  id: 'startup-casual',
  name: 'Startup Casual',
  category: 'technical',
  description: 'Casual two-column design perfect for early-stage startups and relaxed environments',
  colorPalettes: ['modern', 'creative', 'professional'],
  atsScore: 82,
  bestFor: [
    'Startup Developers',
    'Early-Stage Engineers',
    'Tech Enthusiasts',
    'Indie Hackers',
    'Freelance Developers',
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

export default StartupCasualPDF;

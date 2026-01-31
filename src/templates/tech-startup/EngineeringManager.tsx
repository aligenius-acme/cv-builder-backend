/**
 * Engineering Manager Template
 *
 * Professional template for engineering managers
 * Two-column layout with leadership and team building emphasis
 * Sidebar with competencies and education
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
export const EngineeringManagerPDF: React.FC<TemplatePDFProps> = ({ data, colors, options }) => {
  const palette = colors || getColorPalette('executive');

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
      {/* Sidebar - 30% */}
      <div
        style={{
          width: '30%',
          backgroundColor: palette.primary,
          padding: '32px 20px',
          color: '#ffffff',
        }}
      >
        {/* Name & Role */}
        <div style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontSize: '18pt',
              fontWeight: 700,
              color: '#ffffff',
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
              color: '#ffffff',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Engineering Manager
          </div>
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
          </div>
        </div>

        {/* Leadership Competencies */}
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
              Competencies
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

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
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
              Certifications
            </h3>
            <div style={{ fontSize: '9pt', lineHeight: 1.6 }}>
              {data.certifications.map((cert, index) => {
                const certName = typeof cert === 'string' ? cert : cert.name;
                return (
                  <div key={index} style={{ marginBottom: 4 }}>
                    • {certName}
                  </div>
                );
              })}
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
        {/* Executive Summary */}
        {data.summary && (
          <div style={{ marginBottom: 24 }}>
            <SectionHeader title="Executive Summary" colors={palette} variant="underline" uppercase={true} />
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

        {/* Leadership Experience */}
        {data.experience && data.experience.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionHeader title="Leadership Experience" colors={palette} variant="underline" uppercase={true} />
            <ExperienceSection
              experiences={data.experience}
              colors={palette}
              showDuration={true}
              layout="detailed"
            />
          </div>
        )}

        {/* Key Initiatives */}
        {data.projects && data.projects.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionHeader title="Key Initiatives & Impact" colors={palette} variant="underline" uppercase={true} />
            <ProjectsSection
              projects={data.projects}
              colors={palette}
              showTechnologies={false}
              showLinks={false}
              layout="detailed"
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
export const EngineeringManagerMetadata = createTemplateMetadata({
  id: 'engineering-manager',
  name: 'Engineering Manager',
  category: 'executive',
  description: 'Professional template for engineering managers with leadership and team building emphasis',
  colorPalettes: ['executive', 'professional', 'modern'],
  atsScore: 80,
  bestFor: [
    'Engineering Managers',
    'Development Managers',
    'Technical Managers',
    'Engineering Team Leads',
    'Software Development Managers',
  ],
  features: {
    twoColumn: true,
    headerImage: false,
    colorCustomization: true,
    sectionIcons: false,
    skillBars: false,
    timeline: false,
    portfolio: false,
    publications: false,
    languages: false,
    certifications: true,
  },
});

export default EngineeringManagerPDF;

/**
 * Media Pro Template
 *
 * Professional design for media professionals
 * Two-column layout with strong visual hierarchy
 * Perfect for media, content, and communications roles
 *
 * ATS Score: 68/100 (visual-first)
 */

import React from 'react';
import { TemplatePDFProps, createTemplateMetadata } from '../index';
import { ContactInfo } from '../shared/components/ContactInfo';
import { SectionHeader } from '../shared/components/SectionHeader';
import { SkillsSection } from '../shared/components/SkillsSection';
import { ExperienceSection } from '../shared/components/ExperienceSection';
import { EducationSection } from '../shared/components/EducationSection';
import { ProjectsSection } from '../shared/components/ProjectsSection';
import { getColorPalette } from '../shared/styles/colors';

/**
 * PDF Component
 */
export const MediaProPDF: React.FC<TemplatePDFProps> = ({ data, colors, options }) => {
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
      {/* Sidebar - 36% */}
      <div
        style={{
          width: '36%',
          backgroundColor: '#1a1a1a',
          padding: '36px 26px',
          color: '#FFFFFF',
        }}
      >
        {/* Name & Title */}
        <div style={{ marginBottom: 30 }}>
          <h1
            style={{
              fontSize: '23pt',
              fontWeight: 800,
              color: palette.primary,
              margin: '0 0 12px 0',
              lineHeight: 1.1,
              textTransform: 'uppercase',
            }}
          >
            {data.contact.name || 'Your Name'}
          </h1>
          <div
            style={{
              fontSize: '11.5pt',
              fontWeight: 600,
              color: '#FFFFFF',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              paddingTop: 10,
              borderTop: `3px solid ${palette.primary}`,
            }}
          >
            Media Professional
          </div>
        </div>

        {/* Contact */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: '10pt',
              fontWeight: 800,
              color: palette.primary,
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
            }}
          >
            Contact
          </div>
          <ContactInfo
            contact={data.contact}
            colors={{ ...palette, text: '#FFFFFF', textLight: 'rgba(255, 255, 255, 0.8)' }}
            layout="vertical"
            showIcons={false}
          />
        </div>

        {/* Skills - Pills */}
        {data.skills && data.skills.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                fontSize: '10pt',
                fontWeight: 800,
                color: palette.primary,
                marginBottom: 12,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
              }}
            >
              Skills
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {data.skills.slice(0, 14).map((skill, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: palette.primary,
                    color: '#FFFFFF',
                    padding: '6px 13px',
                    borderRadius: '18px',
                    fontSize: '8.5pt',
                    fontWeight: 700,
                  }}
                >
                  {typeof skill === 'string' ? skill : skill.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio/Website */}
        {data.contact.website && (
          <div
            style={{
              marginTop: 28,
              padding: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              border: `2px solid ${palette.primary}`,
            }}
          >
            <div
              style={{
                fontSize: '9pt',
                fontWeight: 700,
                color: palette.primary,
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Portfolio
            </div>
            <div
              style={{
                fontSize: '9pt',
                color: '#FFFFFF',
                wordBreak: 'break-all',
              }}
            >
              {data.contact.website}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <div
              style={{
                fontSize: '10pt',
                fontWeight: 800,
                color: palette.primary,
                marginBottom: 12,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
              }}
            >
              Education
            </div>
            <EducationSection
              education={data.education}
              colors={{ ...palette, text: '#FFFFFF', textLight: 'rgba(255, 255, 255, 0.8)' }}
              layout="compact"
            />
          </div>
        )}
      </div>

      {/* Main Content - 64% */}
      <div
        style={{
          width: '64%',
          padding: '36px 40px',
        }}
      >
        {/* Summary */}
        {data.summary && (
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                fontSize: '13pt',
                fontWeight: 800,
                color: palette.primary,
                marginBottom: 12,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                paddingBottom: 10,
                borderBottom: `3px solid ${palette.primary}`,
              }}
            >
              About
            </div>
            <p
              style={{
                margin: '12px 0 0 0',
                lineHeight: 1.7,
                color: palette.text,
                fontSize: '10.5pt',
              }}
            >
              {data.summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                fontSize: '13pt',
                fontWeight: 800,
                color: palette.primary,
                marginBottom: 12,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                paddingBottom: 10,
                borderBottom: `3px solid ${palette.primary}`,
              }}
            >
              Experience
            </div>
            <ExperienceSection
              experiences={data.experience}
              colors={palette}
              showDuration={true}
              layout="default"
            />
          </div>
        )}

        {/* Projects/Media Work */}
        {data.projects && data.projects.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                fontSize: '13pt',
                fontWeight: 800,
                color: palette.primary,
                marginBottom: 12,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                paddingBottom: 10,
                borderBottom: `3px solid ${palette.primary}`,
              }}
            >
              Notable Projects
            </div>
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
export const MediaProMetadata = createTemplateMetadata({
  id: 'media-pro',
  name: 'Media Pro',
  category: 'creative',
  description: 'Professional media template with dark sidebar and strong visual hierarchy',
  colorPalettes: ['modern', 'professional', 'creative'],
  atsScore: 68,
  bestFor: [
    'Media Professionals',
    'Content Producers',
    'Video Editors',
    'Broadcast Journalists',
    'Communications Specialists',
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
    certifications: false,
  },
});

export default MediaProPDF;

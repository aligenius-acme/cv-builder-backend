/**
 * Brand Showcase Template
 *
 * Bold template emphasizing brand work
 * Two-column layout with colored backgrounds
 * Perfect for brand designers and strategists
 *
 * ATS Score: 70/100 (visual-first)
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
export const BrandShowcasePDF: React.FC<TemplatePDFProps> = ({ data, colors, options }) => {
  const palette = colors || getColorPalette('vibrant');

  // Normalize skills to string array
  const normalizedSkills = Array.isArray(data.skills)
    ? data.skills.flatMap(skill =>
        typeof skill === 'string' ? skill : skill.items
      )
    : [];

  return (
    <div
      style={{
        fontFamily: 'Helvetica, Arial, sans-serif',
        display: 'flex',
        backgroundColor: palette.background,
        color: palette.text,
        minHeight: '100vh',
      }}
    >
      {/* Sidebar - 35% with gradient effect simulation */}
      <div
        style={{
          width: '35%',
          backgroundColor: palette.primary,
          padding: '38px 26px',
          color: '#FFFFFF',
        }}
      >
        {/* Name - Large and Bold */}
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontSize: '26pt',
              fontWeight: 900,
              color: '#FFFFFF',
              margin: '0 0 14px 0',
              lineHeight: 0.95,
              letterSpacing: '-1px',
            }}
          >
            {data.contact.name || 'Your Name'}
          </h1>
          <div
            style={{
              fontSize: '13pt',
              fontWeight: 700,
              color: 'rgba(255, 255, 255, 0.95)',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginTop: 14,
            }}
          >
            Brand Specialist
          </div>
        </div>

        {/* Contact - Clean List */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: '10pt',
              fontWeight: 800,
              color: '#FFFFFF',
              marginBottom: 10,
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              opacity: 0.9,
            }}
          >
            Connect
          </div>
          <ContactInfo
            contact={data.contact}
            colors={{ ...palette, text: '#FFFFFF', textLight: 'rgba(255, 255, 255, 0.85)' }}
            layout="vertical"
            showIcons={false}
          />
        </div>

        {/* Skills - White Pills */}
        {data.skills && data.skills.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                fontSize: '10pt',
                fontWeight: 800,
                color: '#FFFFFF',
                marginBottom: 10,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                opacity: 0.9,
              }}
            >
              Skills
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {normalizedSkills.slice(0, 12).map((skill, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    color: palette.primary,
                    padding: '7px 14px',
                    borderRadius: '4px',
                    fontSize: '8.5pt',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                  }}
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio - Emphasized Box */}
        {data.contact.website && (
          <div
            style={{
              marginTop: 28,
              padding: '18px',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '8px',
              border: '3px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <div
              style={{
                fontSize: '10pt',
                fontWeight: 900,
                color: '#FFFFFF',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
              }}
            >
              Portfolio
            </div>
            <div
              style={{
                fontSize: '9.5pt',
                color: '#FFFFFF',
                fontWeight: 600,
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
                color: '#FFFFFF',
                marginBottom: 10,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                opacity: 0.9,
              }}
            >
              Education
            </div>
            <EducationSection
              education={data.education}
              colors={{ ...palette, text: '#FFFFFF', textLight: 'rgba(255, 255, 255, 0.85)' }}
              layout="compact"
            />
          </div>
        )}
      </div>

      {/* Main Content - 65% */}
      <div
        style={{
          width: '65%',
          padding: '38px 42px',
        }}
      >
        {/* Summary with Background */}
        {data.summary && (
          <div
            style={{
              marginBottom: 28,
              padding: '22px',
              backgroundColor: palette.backgroundAlt,
              borderLeft: `6px solid ${palette.primary}`,
            }}
          >
            <div
              style={{
                fontSize: '12pt',
                fontWeight: 900,
                color: palette.primary,
                marginBottom: 12,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
              }}
            >
              Brand Story
            </div>
            <p
              style={{
                margin: '0',
                lineHeight: 1.7,
                color: palette.text,
                fontSize: '10.5pt',
              }}
            >
              {data.summary}
            </p>
          </div>
        )}

        {/* Brand Projects/Work */}
        {data.projects && data.projects.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                fontSize: '14pt',
                fontWeight: 900,
                color: palette.primary,
                marginBottom: 14,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                paddingBottom: 10,
                borderBottom: `4px solid ${palette.primary}`,
              }}
            >
              Brand Work
            </div>
            <ProjectsSection
              projects={data.projects}
              colors={palette}
              showTechnologies={true}
              showLinks={true}
              layout="detailed"
            />
          </div>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                fontSize: '14pt',
                fontWeight: 900,
                color: palette.primary,
                marginBottom: 14,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                paddingBottom: 10,
                borderBottom: `4px solid ${palette.primary}`,
              }}
            >
              Experience
            </div>
            <ExperienceSection
              experiences={data.experience}
              colors={palette}
              showDuration={false}
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
export const BrandShowcaseMetadata = createTemplateMetadata({
  id: 'brand-showcase',
  name: 'Brand Showcase',
  category: 'creative',
  description: 'Bold brand-focused template with colored sidebar and strong visual presence',
  colorPalettes: ['vibrant', 'creative', 'modern'],
  atsScore: 70,
  bestFor: [
    'Brand Designers',
    'Brand Strategists',
    'Brand Managers',
    'Identity Designers',
    'Brand Consultants',
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

export default BrandShowcasePDF;

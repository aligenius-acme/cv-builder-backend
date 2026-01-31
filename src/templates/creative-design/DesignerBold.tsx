/**
 * Designer Bold Template
 *
 * Bold, creative design perfect for designers
 * Two-column sidebar layout with portfolio emphasis
 * Strong use of color and visual hierarchy
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
export const DesignerBoldPDF: React.FC<TemplatePDFProps> = ({ data, colors, options }) => {
  const palette = colors || getColorPalette('creative');

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
      {/* Sidebar - 38% */}
      <div
        style={{
          width: '38%',
          backgroundColor: palette.primary,
          padding: '40px 28px',
          color: '#FFFFFF',
        }}
      >
        {/* Name & Title */}
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontSize: '24pt',
              fontWeight: 800,
              color: '#FFFFFF',
              margin: '0 0 12px 0',
              lineHeight: 1.1,
              letterSpacing: '-0.5px',
            }}
          >
            {data.contact.name || 'Your Name'}
          </h1>
          <div
            style={{
              fontSize: '13pt',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.95)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              borderTop: '3px solid rgba(255, 255, 255, 0.4)',
              paddingTop: '12px',
            }}
          >
            Designer
          </div>
        </div>

        {/* Contact Info */}
        <div style={{ marginBottom: 28 }}>
          <SectionHeader
            title="Contact"
            colors={{ ...palette, primary: '#FFFFFF', text: '#FFFFFF' }}
            variant="filled"
            uppercase={true}
          />
          <ContactInfo
            contact={data.contact}
            colors={{ ...palette, text: '#FFFFFF', textLight: 'rgba(255, 255, 255, 0.85)' }}
            layout="vertical"
            showIcons={false}
          />
        </div>

        {/* Skills - Pills with white background */}
        {data.skills && data.skills.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <SectionHeader
              title="Skills"
              colors={{ ...palette, primary: '#FFFFFF', text: '#FFFFFF' }}
              variant="filled"
              uppercase={true}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {data.skills.slice(0, 12).map((skill, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    color: palette.primary,
                    padding: '6px 12px',
                    borderRadius: '16px',
                    fontSize: '8.5pt',
                    fontWeight: 600,
                  }}
                >
                  {typeof skill === 'string' ? skill : skill.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio Link - Prominent */}
        {data.contact.website && (
          <div
            style={{
              marginTop: 28,
              padding: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <div
              style={{
                fontSize: '9pt',
                fontWeight: 700,
                color: '#FFFFFF',
                marginBottom: 6,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Portfolio
            </div>
            <div
              style={{
                fontSize: '9pt',
                color: 'rgba(255, 255, 255, 0.95)',
                wordBreak: 'break-all',
              }}
            >
              {data.contact.website}
            </div>
          </div>
        )}

        {/* Education (compact) */}
        {data.education && data.education.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <SectionHeader
              title="Education"
              colors={{ ...palette, primary: '#FFFFFF', text: '#FFFFFF' }}
              variant="filled"
              uppercase={true}
            />
            <EducationSection
              education={data.education}
              colors={{ ...palette, text: '#FFFFFF', textLight: 'rgba(255, 255, 255, 0.85)' }}
              layout="compact"
            />
          </div>
        )}
      </div>

      {/* Main Content - 62% */}
      <div
        style={{
          width: '62%',
          padding: '40px 44px',
        }}
      >
        {/* Summary */}
        {data.summary && (
          <div style={{ marginBottom: 28 }}>
            <SectionHeader title="About Me" colors={palette} variant="boxed" uppercase={true} />
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

        {/* Portfolio/Projects - Featured */}
        {data.projects && data.projects.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <SectionHeader title="Portfolio" colors={palette} variant="boxed" uppercase={true} />
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
            <SectionHeader title="Experience" colors={palette} variant="boxed" uppercase={true} />
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
export const DesignerBoldMetadata = createTemplateMetadata({
  id: 'designer-bold',
  name: 'Designer Bold',
  category: 'creative',
  description: 'Bold two-column design with colored sidebar, perfect for creative designers and visual professionals',
  colorPalettes: ['creative', 'vibrant', 'modern'],
  atsScore: 70,
  bestFor: [
    'Graphic Designers',
    'Visual Designers',
    'UI Designers',
    'Creative Professionals',
    'Brand Designers',
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

export default DesignerBoldPDF;

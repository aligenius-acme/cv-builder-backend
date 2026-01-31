/**
 * Graphic Designer Template
 *
 * Bold visual template for graphic designers
 * Two-column with color blocking and strong visuals
 * Maximum creative impact
 *
 * ATS Score: 65/100 (visual-first)
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
export const GraphicDesignerPDF: React.FC<TemplatePDFProps> = ({ data, colors, options }) => {
  const palette = colors || getColorPalette('vibrant');

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
      {/* Sidebar - 37% with bold color */}
      <div
        style={{
          width: '37%',
          backgroundColor: palette.primary,
          padding: '40px 28px',
          color: '#FFFFFF',
        }}
      >
        {/* Name - Extra Bold */}
        <div style={{ marginBottom: 34 }}>
          <h1
            style={{
              fontSize: '25pt',
              fontWeight: 900,
              color: '#FFFFFF',
              margin: '0 0 16px 0',
              lineHeight: 0.9,
              textTransform: 'uppercase',
              letterSpacing: '-0.5px',
            }}
          >
            {data.contact.name || 'Your Name'}
          </h1>
          <div
            style={{
              fontSize: '12pt',
              fontWeight: 800,
              color: 'rgba(255, 255, 255, 0.95)',
              textTransform: 'uppercase',
              letterSpacing: '2.5px',
              paddingTop: 12,
              borderTop: '4px solid rgba(255, 255, 255, 0.5)',
            }}
          >
            Graphic Designer
          </div>
        </div>

        {/* Contact - Bold Icons Style */}
        <div style={{ marginBottom: 30 }}>
          <div
            style={{
              fontSize: '11pt',
              fontWeight: 900,
              color: '#FFFFFF',
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              opacity: 0.9,
            }}
          >
            Contact
          </div>
          <ContactInfo
            contact={data.contact}
            colors={{ ...palette, text: '#FFFFFF', textLight: 'rgba(255, 255, 255, 0.85)' }}
            layout="vertical"
            showIcons={false}
          />
        </div>

        {/* Skills - Boxed Style */}
        {data.skills && data.skills.length > 0 && (
          <div style={{ marginBottom: 30 }}>
            <div
              style={{
                fontSize: '11pt',
                fontWeight: 900,
                color: '#FFFFFF',
                marginBottom: 12,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                opacity: 0.9,
              }}
            >
              Skills
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {data.skills.slice(0, 14).map((skill, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    color: palette.primary,
                    padding: '8px 14px',
                    borderRadius: '2px',
                    fontSize: '8.5pt',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {typeof skill === 'string' ? skill : skill.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio - Extra Prominent */}
        {data.contact.website && (
          <div
            style={{
              marginTop: 30,
              padding: '20px',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '0px',
              border: '4px solid rgba(255, 255, 255, 0.4)',
            }}
          >
            <div
              style={{
                fontSize: '11pt',
                fontWeight: 900,
                color: '#FFFFFF',
                marginBottom: 10,
                textTransform: 'uppercase',
                letterSpacing: '2px',
              }}
            >
              Portfolio
            </div>
            <div
              style={{
                fontSize: '9.5pt',
                color: '#FFFFFF',
                fontWeight: 700,
                wordBreak: 'break-all',
              }}
            >
              {data.contact.website}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <div style={{ marginTop: 30 }}>
            <div
              style={{
                fontSize: '11pt',
                fontWeight: 900,
                color: '#FFFFFF',
                marginBottom: 12,
                textTransform: 'uppercase',
                letterSpacing: '2px',
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

      {/* Main Content - 63% */}
      <div
        style={{
          width: '63%',
          padding: '40px 44px',
        }}
      >
        {/* Summary with Color Block */}
        {data.summary && (
          <div style={{ marginBottom: 30 }}>
            <div
              style={{
                fontSize: '15pt',
                fontWeight: 900,
                color: palette.primary,
                marginBottom: 14,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                paddingBottom: 12,
                borderBottom: `5px solid ${palette.primary}`,
              }}
            >
              About
            </div>
            <p
              style={{
                margin: '14px 0 0 0',
                lineHeight: 1.7,
                color: palette.text,
                fontSize: '10.5pt',
              }}
            >
              {data.summary}
            </p>
          </div>
        )}

        {/* Design Work/Portfolio */}
        {data.projects && data.projects.length > 0 && (
          <div style={{ marginBottom: 30 }}>
            <div
              style={{
                fontSize: '15pt',
                fontWeight: 900,
                color: palette.primary,
                marginBottom: 14,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                paddingBottom: 12,
                borderBottom: `5px solid ${palette.primary}`,
              }}
            >
              Design Work
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
          <div style={{ marginBottom: 30 }}>
            <div
              style={{
                fontSize: '15pt',
                fontWeight: 900,
                color: palette.primary,
                marginBottom: 14,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                paddingBottom: 12,
                borderBottom: `5px solid ${palette.primary}`,
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
export const GraphicDesignerMetadata = createTemplateMetadata({
  id: 'graphic-designer',
  name: 'Graphic Designer',
  category: 'creative',
  description: 'Bold, visually striking template for graphic designers with maximum creative impact',
  colorPalettes: ['vibrant', 'creative', 'modern'],
  atsScore: 65,
  bestFor: [
    'Graphic Designers',
    'Visual Designers',
    'Print Designers',
    'Digital Designers',
    'Freelance Designers',
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

export default GraphicDesignerPDF;

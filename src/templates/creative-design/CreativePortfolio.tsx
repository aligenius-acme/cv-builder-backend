/**
 * Creative Portfolio Template
 *
 * Portfolio-focused design with strong visual emphasis
 * Two-column layout with project showcase
 * Bold colors and creative typography
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
export const CreativePortfolioPDF: React.FC<TemplatePDFProps> = ({ data, colors, options }) => {
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
      {/* Sidebar - 36% */}
      <div
        style={{
          width: '36%',
          backgroundColor: palette.backgroundAlt,
          padding: '36px 26px',
          borderRight: `5px solid ${palette.primary}`,
        }}
      >
        {/* Name & Title with colored background */}
        <div
          style={{
            marginBottom: 28,
            padding: '20px 16px',
            backgroundColor: palette.primary,
            margin: '-36px -26px 28px -26px',
          }}
        >
          <h1
            style={{
              fontSize: '22pt',
              fontWeight: 800,
              color: '#FFFFFF',
              margin: '0 0 10px 0',
              lineHeight: 1.1,
            }}
          >
            {data.contact.name || 'Your Name'}
          </h1>
          <div
            style={{
              fontSize: '12pt',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.95)',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
            }}
          >
            Creative Professional
          </div>
        </div>

        {/* Contact Info with icons */}
        <div style={{ marginBottom: 26 }}>
          <div
            style={{
              fontSize: '11pt',
              fontWeight: 700,
              color: palette.primary,
              marginBottom: 10,
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Get in Touch
          </div>
          <ContactInfo
            contact={data.contact}
            colors={palette}
            layout="vertical"
            showIcons={false}
          />
        </div>

        {/* Portfolio Website - Very Prominent */}
        {data.contact.website && (
          <div
            style={{
              marginBottom: 26,
              padding: '18px',
              backgroundColor: palette.primary,
              borderRadius: '8px',
            }}
          >
            <div
              style={{
                fontSize: '10pt',
                fontWeight: 800,
                color: '#FFFFFF',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              View My Work
            </div>
            <div
              style={{
                fontSize: '9.5pt',
                color: 'rgba(255, 255, 255, 0.95)',
                fontWeight: 600,
                wordBreak: 'break-all',
              }}
            >
              {data.contact.website}
            </div>
          </div>
        )}

        {/* Skills - Visual Pills */}
        {data.skills && data.skills.length > 0 && (
          <div style={{ marginBottom: 26 }}>
            <div
              style={{
                fontSize: '11pt',
                fontWeight: 700,
                color: palette.primary,
                marginBottom: 10,
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Expertise
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 8 }}>
              {data.skills.slice(0, 15).map((skill, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: palette.primary,
                    color: '#FFFFFF',
                    padding: '7px 14px',
                    borderRadius: '20px',
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

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <div style={{ marginTop: 26 }}>
            <div
              style={{
                fontSize: '11pt',
                fontWeight: 700,
                color: palette.primary,
                marginBottom: 10,
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Education
            </div>
            <EducationSection
              education={data.education}
              colors={palette}
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
        {/* Summary with accent */}
        {data.summary && (
          <div style={{ marginBottom: 26 }}>
            <div
              style={{
                fontSize: '14pt',
                fontWeight: 800,
                color: palette.primary,
                marginBottom: 12,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                borderBottom: `4px solid ${palette.primary}`,
                paddingBottom: 8,
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

        {/* Featured Projects/Portfolio */}
        {data.projects && data.projects.length > 0 && (
          <div style={{ marginBottom: 26 }}>
            <div
              style={{
                fontSize: '14pt',
                fontWeight: 800,
                color: palette.primary,
                marginBottom: 12,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                borderBottom: `4px solid ${palette.primary}`,
                paddingBottom: 8,
              }}
            >
              Featured Work
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
          <div style={{ marginBottom: 26 }}>
            <div
              style={{
                fontSize: '14pt',
                fontWeight: 800,
                color: palette.primary,
                marginBottom: 12,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                borderBottom: `4px solid ${palette.primary}`,
                paddingBottom: 8,
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
export const CreativePortfolioMetadata = createTemplateMetadata({
  id: 'creative-portfolio',
  name: 'Creative Portfolio',
  category: 'creative',
  description: 'Portfolio-focused template with bold visual design, perfect for showcasing creative work',
  colorPalettes: ['vibrant', 'creative', 'modern'],
  atsScore: 65,
  bestFor: [
    'Portfolio Designers',
    'Creative Directors',
    'Visual Artists',
    'UX/UI Designers',
    'Digital Creatives',
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

export default CreativePortfolioPDF;

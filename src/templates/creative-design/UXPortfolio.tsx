/**
 * UX Portfolio Template
 *
 * Clean yet creative design for UX designers
 * Two-column layout with portfolio emphasis
 * Balance of professionalism and creativity
 *
 * ATS Score: 75/100 (balanced)
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
export const UXPortfolioPDF: React.FC<TemplatePDFProps> = ({ data, colors, options }) => {
  const palette = colors || getColorPalette('modern');

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
      {/* Sidebar - 33% */}
      <div
        style={{
          width: '33%',
          backgroundColor: palette.backgroundAlt,
          padding: '36px 24px',
          borderRight: `3px solid ${palette.primary}`,
        }}
      >
        {/* Name & Title */}
        <div style={{ marginBottom: 28 }}>
          <h1
            style={{
              fontSize: '20pt',
              fontWeight: 700,
              color: palette.primary,
              margin: '0 0 10px 0',
              lineHeight: 1.2,
            }}
          >
            {data.contact.name || 'Your Name'}
          </h1>
          <div
            style={{
              fontSize: '11.5pt',
              fontWeight: 600,
              color: palette.text,
              paddingTop: 8,
              borderTop: `2px solid ${palette.primary}`,
            }}
          >
            UX Designer
          </div>
        </div>

        {/* Contact */}
        <div style={{ marginBottom: 24 }}>
          <SectionHeader
            title="Contact"
            colors={palette}
            variant="minimal"
            uppercase={true}
          />
          <ContactInfo
            contact={data.contact}
            colors={palette}
            layout="vertical"
            showIcons={false}
          />
        </div>

        {/* Skills - Clean Grid */}
        {data.skills && data.skills.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionHeader
              title="Skills"
              colors={palette}
              variant="minimal"
              uppercase={true}
            />
            <SkillsSection
              skills={data.skills}
              colors={palette}
              layout="list"
            />
          </div>
        )}

        {/* Portfolio Link */}
        {data.contact.website && (
          <div
            style={{
              marginBottom: 24,
              padding: '14px',
              backgroundColor: palette.primary,
              borderRadius: '6px',
            }}
          >
            <div
              style={{
                fontSize: '9pt',
                fontWeight: 700,
                color: '#FFFFFF',
                marginBottom: 6,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
              }}
            >
              View Portfolio
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
          <div style={{ marginBottom: 24 }}>
            <SectionHeader
              title="Education"
              colors={palette}
              variant="minimal"
              uppercase={true}
            />
            <EducationSection
              education={data.education}
              colors={palette}
              layout="compact"
            />
          </div>
        )}

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <SectionHeader
              title="Certifications"
              colors={palette}
              variant="minimal"
              uppercase={true}
            />
            <CertificationsSection
              certifications={data.certifications}
              colors={palette}
              layout="list"
            />
          </div>
        )}
      </div>

      {/* Main Content - 67% */}
      <div
        style={{
          width: '67%',
          padding: '36px 40px',
        }}
      >
        {/* Summary */}
        {data.summary && (
          <div style={{ marginBottom: 26 }}>
            <SectionHeader
              title="About"
              colors={palette}
              variant="underline"
              uppercase={true}
            />
            <p
              style={{
                margin: '10px 0 0 0',
                lineHeight: 1.7,
                color: palette.text,
                fontSize: '10.5pt',
              }}
            >
              {data.summary}
            </p>
          </div>
        )}

        {/* UX Projects - Featured */}
        {data.projects && data.projects.length > 0 && (
          <div style={{ marginBottom: 26 }}>
            <SectionHeader
              title="UX Projects"
              colors={palette}
              variant="underline"
              uppercase={true}
            />
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
            <SectionHeader
              title="Experience"
              colors={palette}
              variant="underline"
              uppercase={true}
            />
            <ExperienceSection
              experiences={data.experience}
              colors={palette}
              showDuration={true}
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
export const UXPortfolioMetadata = createTemplateMetadata({
  id: 'ux-portfolio',
  name: 'UX Portfolio',
  category: 'creative',
  description: 'Clean, professional template for UX designers with portfolio showcase',
  colorPalettes: ['modern', 'professional', 'creative'],
  atsScore: 75,
  bestFor: [
    'UX Designers',
    'UI/UX Designers',
    'Product Designers',
    'Interaction Designers',
    'User Researchers',
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

export default UXPortfolioPDF;

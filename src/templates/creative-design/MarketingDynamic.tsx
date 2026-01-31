/**
 * Marketing Dynamic Template
 *
 * Dynamic design for marketing professionals
 * Two-column layout with colored sections and energy
 * Perfect for marketing and brand roles
 *
 * ATS Score: 72/100 (visual-first)
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
export const MarketingDynamicPDF: React.FC<TemplatePDFProps> = ({ data, colors, options }) => {
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
      {/* Sidebar - 34% */}
      <div
        style={{
          width: '34%',
          backgroundColor: palette.backgroundAlt,
          padding: '40px 24px',
          borderRight: `4px solid ${palette.primary}`,
        }}
      >
        {/* Name & Title */}
        <div style={{ marginBottom: 28 }}>
          <h1
            style={{
              fontSize: '21pt',
              fontWeight: 800,
              color: palette.primary,
              margin: '0 0 10px 0',
              lineHeight: 1.2,
            }}
          >
            {data.contact.name || 'Your Name'}
          </h1>
          <div
            style={{
              fontSize: '12pt',
              fontWeight: 700,
              color: palette.text,
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
              paddingTop: 8,
              borderTop: `3px solid ${palette.primary}`,
            }}
          >
            Marketing Professional
          </div>
        </div>

        {/* Contact Info */}
        <div style={{ marginBottom: 26 }}>
          <SectionHeader
            title="Contact"
            colors={palette}
            variant="filled"
            uppercase={true}
          />
          <ContactInfo
            contact={data.contact}
            colors={palette}
            layout="vertical"
            showIcons={false}
          />
        </div>

        {/* Skills - Grid Layout */}
        {data.skills && data.skills.length > 0 && (
          <div style={{ marginBottom: 26 }}>
            <SectionHeader
              title="Skills"
              colors={palette}
              variant="filled"
              uppercase={true}
            />
            <SkillsSection
              skills={data.skills}
              colors={palette}
              layout="grid"
              columns={2}
            />
          </div>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <div style={{ marginBottom: 26 }}>
            <SectionHeader
              title="Education"
              colors={palette}
              variant="filled"
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
          <div style={{ marginTop: 26 }}>
            <SectionHeader
              title="Certifications"
              colors={palette}
              variant="filled"
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

      {/* Main Content - 66% */}
      <div
        style={{
          width: '66%',
          padding: '40px 42px',
        }}
      >
        {/* Summary with background */}
        {data.summary && (
          <div
            style={{
              marginBottom: 28,
              padding: '20px',
              backgroundColor: palette.backgroundAlt,
              borderLeft: `5px solid ${palette.primary}`,
            }}
          >
            <div
              style={{
                fontSize: '12pt',
                fontWeight: 800,
                color: palette.primary,
                marginBottom: 10,
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Profile
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

        {/* Experience - Prominent */}
        {data.experience && data.experience.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <SectionHeader
              title="Professional Experience"
              colors={palette}
              variant="boxed"
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

        {/* Projects/Campaigns */}
        {data.projects && data.projects.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <SectionHeader
              title="Key Projects"
              colors={palette}
              variant="boxed"
              uppercase={true}
            />
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
export const MarketingDynamicMetadata = createTemplateMetadata({
  id: 'marketing-dynamic',
  name: 'Marketing Dynamic',
  category: 'creative',
  description: 'Dynamic two-column design for marketing professionals with strong visual appeal',
  colorPalettes: ['modern', 'vibrant', 'professional'],
  atsScore: 72,
  bestFor: [
    'Marketing Managers',
    'Brand Managers',
    'Marketing Coordinators',
    'Digital Marketing Specialists',
    'Content Marketers',
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

export default MarketingDynamicPDF;

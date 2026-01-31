/**
 * Product Manager Template
 *
 * Professional template designed for Product Managers
 * Single-column with emphasis on impact and results
 * Balanced technical and business focus
 *
 * ATS Score: 88/100 (ATS-friendly)
 */

import React from 'react';
import { TemplatePDFProps, createTemplateMetadata } from '../index';
import { Header } from '../shared/components/Header';
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
export const ProductManagerPDF: React.FC<TemplatePDFProps> = ({ data, colors, options }) => {
  const palette = colors || getColorPalette('professional');

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        padding: '48px',
        backgroundColor: palette.background,
        color: palette.text,
        maxWidth: '800px',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <Header contact={data.contact} colors={palette} variant="centered" showLinks={true} />

      {/* Summary - Emphasis on impact */}
      {data.summary && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="Executive Summary" colors={palette} variant="default" uppercase={false} />
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

      {/* Core Competencies */}
      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader
            title="Core Competencies"
            colors={palette}
            variant="filled"
            uppercase={true}
          />
          <SkillsSection skills={data.skills} colors={palette} layout="inline" />
        </div>
      )}

      {/* Professional Experience */}
      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader
            title="Professional Experience"
            colors={palette}
            variant="filled"
            uppercase={true}
          />
          <ExperienceSection
            experiences={data.experience}
            colors={palette}
            showDuration={true}
            layout="detailed"
          />
        </div>
      )}

      {/* Key Projects & Initiatives */}
      {data.projects && data.projects.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="Key Projects & Initiatives" colors={palette} variant="filled" uppercase={true} />
          <ProjectsSection
            projects={data.projects}
            colors={palette}
            showTechnologies={true}
            showLinks={false}
            layout="detailed"
          />
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="Education" colors={palette} variant="filled" uppercase={true} />
          <EducationSection education={data.education} colors={palette} layout="default" />
        </div>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader
            title="Certifications & Professional Development"
            colors={palette}
            variant="filled"
            uppercase={true}
          />
          <CertificationsSection certifications={data.certifications} colors={palette} layout="default" />
        </div>
      )}
    </div>
  );
};

/**
 * Template Metadata
 */
export const ProductManagerMetadata = createTemplateMetadata({
  id: 'product-manager',
  name: 'Product Manager',
  category: 'technical',
  description: 'Professional template for Product Managers with emphasis on impact and results',
  colorPalettes: ['professional', 'executive', 'modern'],
  atsScore: 88,
  bestFor: [
    'Product Managers',
    'Senior Product Managers',
    'Technical Product Managers',
    'Product Owners',
    'Product Leaders',
  ],
  features: {
    twoColumn: false,
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

export default ProductManagerPDF;

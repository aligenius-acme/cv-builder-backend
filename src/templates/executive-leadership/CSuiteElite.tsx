/**
 * C-Suite Elite Template
 * Sophisticated single-column template for C-level executives
 *
 * Features:
 * - Centered authoritative header
 * - Executive summary with distinguished styling
 * - Burgundy/wine color scheme
 * - Elegant serif typography
 * - Two-page optimized layout
 *
 * ATS Score: 88/100
 * Best for: CFO, COO, CTO, CMO, C-Level Positions
 */

import React from 'react';
import { Document } from 'docx';
import { ReactTemplate, TemplatePDFProps, createTemplateMetadata } from '../index';
import { ParsedResumeData } from '../../types';
import { ColorPalette, createCustomPalette } from '../shared/styles/colors';
import { SectionHeader } from '../shared/components/SectionHeader';
import { ExperienceSection } from '../shared/components/ExperienceSection';
import { EducationSection } from '../shared/components/EducationSection';
import { SkillsSection } from '../shared/components/SkillsSection';
import { generateExecutiveDOCX } from './generateDOCX';

const CSuiteElitePDF: React.FC<TemplatePDFProps> = ({ data, colors }) => {
  const palette = colors || createCustomPalette('#7c2d12', '#991b1b'); // Deep burgundy/wine

  return (
    <div
      style={{
        fontFamily: 'Garamond, Georgia, "Times New Roman", serif',
        fontSize: 11,
        color: palette.text,
        backgroundColor: '#ffffff',
        padding: '50px 65px',
        lineHeight: 1.65,
        maxWidth: '850px',
        margin: '0 auto',
      }}
    >
      {/* Header - Centered Authoritative */}
      <div style={{ textAlign: 'center', marginBottom: 32, paddingBottom: 20, borderBottom: `2px double ${palette.primary}` }}>
        <h1
          style={{
            fontSize: 26,
            margin: '0 0 12px 0',
            color: palette.primary,
            fontWeight: 700,
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}
        >
          {data.contact.name || 'Executive Name'}
        </h1>
        <div style={{ fontSize: 10.5, color: palette.textLight, marginBottom: 8, fontWeight: 500 }}>
          {[data.contact.email, data.contact.phone, data.contact.location].filter(Boolean).join(' | ')}
        </div>
        {(data.contact.linkedin || data.contact.website) && (
          <div style={{ fontSize: 9.5, color: palette.secondary }}>
            {[data.contact.linkedin, data.contact.website].filter(Boolean).join(' | ')}
          </div>
        )}
      </div>

      {/* Executive Summary - Distinguished Box */}
      {data.summary && (
        <div
          style={{
            marginBottom: 26,
            padding: '18px 24px',
            backgroundColor: '#fafaf9',
            borderLeft: `4px solid ${palette.primary}`,
          }}
        >
          <h2
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: palette.primary,
              margin: '0 0 10px 0',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
            }}
          >
            Executive Summary
          </h2>
          <p
            style={{
              margin: 0,
              lineHeight: 1.7,
              color: palette.textLight,
              textAlign: 'justify',
              fontSize: 11,
            }}
          >
            {data.summary}
          </p>
        </div>
      )}

      {/* Executive Competencies */}
      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="Executive Competencies" colors={palette} variant="underline" uppercase />
          <SkillsSection skills={data.skills} colors={palette} layout="inline" />
        </div>
      )}

      {/* Professional Experience */}
      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="Professional Experience" colors={palette} variant="underline" uppercase />
          <ExperienceSection
            experiences={data.experience}
            colors={palette}
            bulletStyle="bullet"
            showDuration
            layout="detailed"
          />
        </div>
      )}

      {/* Key Achievements / Projects */}
      {data.projects && data.projects.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="Key Achievements & Initiatives" colors={palette} variant="underline" uppercase />
          {data.projects.map((project, index) => (
            <div key={index} style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 700, color: palette.primary, marginBottom: 5, fontSize: 11.5 }}>
                {project.name}
              </div>
              {project.description && (
                <p style={{ margin: '0 0 4px 0', color: palette.textLight, lineHeight: 1.65 }}>
                  {project.description}
                </p>
              )}
              {project.technologies && project.technologies.length > 0 && (
                <div style={{ fontSize: 10, color: palette.textMuted, fontStyle: 'italic' }}>
                  {project.technologies.join(' • ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="Education & Executive Programs" colors={palette} variant="underline" uppercase />
          <EducationSection education={data.education} colors={palette} layout="default" />
        </div>
      )}

      {/* Board Positions & Affiliations */}
      {data.certifications && data.certifications.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Board Positions & Professional Affiliations" colors={palette} variant="underline" uppercase />
          <div style={{ marginTop: 10 }}>
            {data.certifications.map((cert, index) => {
              const certText = typeof cert === 'string' ? cert : `${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ''}${cert.date ? ` (${cert.date})` : ''}`;
              return (
                <div key={index} style={{ marginBottom: 8, color: palette.textLight, lineHeight: 1.5, paddingLeft: 12 }}>
                  <span style={{ color: palette.primary, marginRight: 8 }}>▪</span>
                  {certText}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const CSuiteElite: ReactTemplate = {
  id: 'c-suite-elite',
  name: 'C-Suite Elite',

  metadata: createTemplateMetadata({
    id: 'c-suite-elite',
    name: 'C-Suite Elite',
    category: 'executive',
    description: 'Sophisticated template for C-level executives with distinguished burgundy styling and elegant typography',
    colorPalettes: ['executive', 'professional', 'creative'],
    atsScore: 88,
    bestFor: ['CFO', 'COO', 'CTO', 'CMO', 'C-Level Executive', 'Chief Officer'],
    features: {
      twoColumn: false,
      headerImage: false,
      colorCustomization: true,
      sectionIcons: false,
      skillBars: false,
      timeline: false,
      portfolio: false,
      publications: true,
      languages: false,
      certifications: true,
    },
  }),

  PDFComponent: CSuiteElitePDF,

  generateDOCX: (data: ParsedResumeData, colors: ColorPalette) => {
    return generateExecutiveDOCX(data, colors, 'c-suite-elite');
  },
};

export default CSuiteElite;

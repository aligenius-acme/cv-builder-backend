/**
 * Executive Impact Template
 * Premium single-column template for senior executives
 *
 * Features:
 * - Prominent executive summary at top
 * - Impact metrics and achievements
 * - Deep navy color scheme
 * - Georgia/serif font family
 * - Two-page optimized layout
 *
 * ATS Score: 90/100
 * Best for: CEOs, Presidents, C-Suite Executives
 */

import React from 'react';
import { Document } from 'docx';
import { ReactTemplate, TemplatePDFProps, createTemplateMetadata } from '../index';
import { ParsedResumeData } from '../../types';
import { ColorPalette, createCustomPalette } from '../shared/styles/colors';
import { Header } from '../shared/components/Header';
import { SectionHeader } from '../shared/components/SectionHeader';
import { ExperienceSection } from '../shared/components/ExperienceSection';
import { EducationSection } from '../shared/components/EducationSection';
import { SkillsSection } from '../shared/components/SkillsSection';
import { generateExecutiveDOCX } from './generateDOCX';

const ExecutiveImpactPDF: React.FC<TemplatePDFProps> = ({ data, colors }) => {
  const palette = colors || createCustomPalette('#1e3a8a', '#1e40af'); // Deep navy

  return (
    <div
      style={{
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: 11,
        color: palette.text,
        backgroundColor: '#ffffff',
        padding: '48px 60px',
        lineHeight: 1.6,
        maxWidth: '850px',
        margin: '0 auto',
      }}
    >
      {/* Header - Centered Executive Style */}
      <div style={{ textAlign: 'center', marginBottom: 28, paddingBottom: 16, borderBottom: `3px solid ${palette.primary}` }}>
        <h1
          style={{
            fontSize: 24,
            margin: '0 0 10px 0',
            color: palette.primary,
            fontWeight: 700,
            letterSpacing: '0.5px',
          }}
        >
          {data.contact.name || 'Executive Name'}
        </h1>
        <div style={{ fontSize: 10, color: palette.textLight, marginBottom: 6 }}>
          {[data.contact.email, data.contact.phone, data.contact.location].filter(Boolean).join(' • ')}
        </div>
        {(data.contact.linkedin || data.contact.website) && (
          <div style={{ fontSize: 9, color: palette.primary }}>
            {[data.contact.linkedin, data.contact.website].filter(Boolean).join(' • ')}
          </div>
        )}
      </div>

      {/* Executive Summary - Prominent */}
      {data.summary && (
        <div style={{ marginBottom: 24, padding: '16px 20px', backgroundColor: palette.backgroundAlt, border: `1px solid ${palette.borderLight}` }}>
          <SectionHeader title="Executive Profile" colors={palette} variant="minimal" uppercase />
          <p
            style={{
              margin: '8px 0 0 0',
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

      {/* Core Competencies */}
      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="Core Competencies" colors={palette} variant="underline" uppercase />
          <SkillsSection skills={data.skills} colors={palette} layout="inline" />
        </div>
      )}

      {/* Leadership Experience */}
      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="Executive Leadership Experience" colors={palette} variant="underline" uppercase />
          <ExperienceSection
            experiences={data.experience}
            colors={palette}
            bulletStyle="bullet"
            showDuration
            layout="detailed"
          />
        </div>
      )}

      {/* Strategic Initiatives / Projects */}
      {data.projects && data.projects.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="Strategic Initiatives" colors={palette} variant="underline" uppercase />
          {data.projects.map((project, index) => (
            <div key={index} style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: palette.primary, marginBottom: 4, fontSize: 11 }}>
                {project.name}
              </div>
              {project.description && (
                <p style={{ margin: '4px 0', color: palette.textLight, lineHeight: 1.6 }}>
                  {project.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="Education & Executive Development" colors={palette} variant="underline" uppercase />
          <EducationSection education={data.education} colors={palette} layout="default" />
        </div>
      )}

      {/* Board Memberships & Professional Affiliations */}
      {data.certifications && data.certifications.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Board Memberships & Professional Affiliations" colors={palette} variant="underline" uppercase />
          <ul style={{ margin: '8px 0', paddingLeft: 20, listStyleType: 'square' }}>
            {data.certifications.map((cert, index) => {
              const certText = typeof cert === 'string' ? cert : `${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ''}${cert.date ? ` (${cert.date})` : ''}`;
              return (
                <li key={index} style={{ marginBottom: 6, color: palette.textLight, lineHeight: 1.5 }}>
                  {certText}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export const ExecutiveImpact: ReactTemplate = {
  id: 'executive-impact',
  name: 'Executive Impact',

  metadata: createTemplateMetadata({
    id: 'executive-impact',
    name: 'Executive Impact',
    category: 'executive',
    description: 'Premium single-column template for senior executives with prominent executive summary and impact focus',
    colorPalettes: ['executive', 'professional', 'minimal'],
    atsScore: 90,
    bestFor: ['CEO', 'President', 'C-Suite Executive', 'Senior VP', 'Managing Partner'],
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

  PDFComponent: ExecutiveImpactPDF,

  generateDOCX: (data: ParsedResumeData, colors: ColorPalette) => {
    return generateExecutiveDOCX(data, colors, 'executive-impact');
  },
};

export default ExecutiveImpact;

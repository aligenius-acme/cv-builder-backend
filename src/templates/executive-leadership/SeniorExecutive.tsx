/**
 * Senior Executive Template
 * Authoritative single-column template for senior executives
 *
 * Features:
 * - Prominent executive profile
 * - Impact-focused sections
 * - Navy blue professional color scheme
 * - Elegant serif typography
 * - Two-page optimized layout
 *
 * ATS Score: 89/100
 * Best for: Senior VPs, Executive Directors, Senior Executives
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

const SeniorExecutivePDF: React.FC<TemplatePDFProps> = ({ data, colors }) => {
  const palette = colors || createCustomPalette('#1e40af', '#1e3a8a'); // Navy blue

  return (
    <div
      style={{
        fontFamily: 'Baskerville, Georgia, "Times New Roman", serif',
        fontSize: 11,
        color: palette.text,
        backgroundColor: '#ffffff',
        padding: '48px 60px',
        lineHeight: 1.65,
        maxWidth: '850px',
        margin: '0 auto',
      }}
    >
      {/* Header - Centered Executive */}
      <div style={{ textAlign: 'center', marginBottom: 28, paddingBottom: 16 }}>
        <h1
          style={{
            fontSize: 24,
            margin: '0 0 12px 0',
            color: palette.primary,
            fontWeight: 700,
            letterSpacing: '0.8px',
          }}
        >
          {data.contact.name || 'Executive Name'}
        </h1>
        <div
          style={{
            fontSize: 10,
            color: palette.textLight,
            marginBottom: 8,
            paddingBottom: 8,
            borderBottom: `1px solid ${palette.borderLight}`,
          }}
        >
          {[data.contact.email, data.contact.phone, data.contact.location].filter(Boolean).join(' • ')}
        </div>
        {(data.contact.linkedin || data.contact.website) && (
          <div style={{ fontSize: 9.5, color: palette.primary }}>
            {[data.contact.linkedin, data.contact.website].filter(Boolean).join(' • ')}
          </div>
        )}
      </div>

      {/* Executive Profile - Highlighted */}
      {data.summary && (
        <div
          style={{
            marginBottom: 26,
            padding: '20px 24px',
            border: `2px solid ${palette.primary}`,
            backgroundColor: palette.backgroundAlt,
          }}
        >
          <h2
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: palette.primary,
              margin: '0 0 12px 0',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              textAlign: 'center',
            }}
          >
            Executive Profile
          </h2>
          <p
            style={{
              margin: 0,
              lineHeight: 1.75,
              color: palette.text,
              textAlign: 'justify',
              fontSize: 11,
            }}
          >
            {data.summary}
          </p>
        </div>
      )}

      {/* Areas of Expertise */}
      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="Areas of Expertise" colors={palette} variant="underline" uppercase />
          <SkillsSection skills={data.skills} colors={palette} layout="inline" />
        </div>
      )}

      {/* Executive Leadership Experience */}
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

      {/* Strategic Impact & Achievements */}
      {data.projects && data.projects.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="Strategic Impact & Achievements" colors={palette} variant="underline" uppercase />
          {data.projects.map((project, index) => (
            <div key={index} style={{ marginBottom: 14, paddingLeft: 4 }}>
              <div
                style={{
                  fontWeight: 700,
                  color: palette.primary,
                  marginBottom: 5,
                  fontSize: 11.5,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <span style={{ marginRight: 8, fontSize: 8 }}>◆</span>
                {project.name}
              </div>
              {project.description && (
                <p style={{ margin: '0 0 0 20px', color: palette.textLight, lineHeight: 1.65 }}>
                  {project.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education & Executive Development */}
      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="Education & Executive Development" colors={palette} variant="underline" uppercase />
          <EducationSection education={data.education} colors={palette} layout="default" />
        </div>
      )}

      {/* Board Memberships & Professional Organizations */}
      {data.certifications && data.certifications.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader
            title="Board Memberships & Professional Organizations"
            colors={palette}
            variant="underline"
            uppercase
          />
          <div style={{ marginTop: 10 }}>
            {data.certifications.map((cert, index) => {
              const certText = typeof cert === 'string' ? cert : `${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ''}${cert.date ? ` (${cert.date})` : ''}`;
              return (
                <div key={index} style={{ marginBottom: 8, color: palette.textLight, lineHeight: 1.6, paddingLeft: 8 }}>
                  <span style={{ color: palette.primary, marginRight: 10, fontWeight: 700 }}>▸</span>
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

export const SeniorExecutive: ReactTemplate = {
  id: 'senior-executive',
  name: 'Senior Executive',

  metadata: createTemplateMetadata({
    id: 'senior-executive',
    name: 'Senior Executive',
    category: 'executive',
    description: 'Authoritative template for senior executives with prominent executive profile and impact focus',
    colorPalettes: ['executive', 'professional', 'modern'],
    atsScore: 89,
    bestFor: ['Senior VP', 'Executive Director', 'Senior Executive', 'Senior Leader', 'Executive VP'],
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

  PDFComponent: SeniorExecutivePDF,

  generateDOCX: (data: ParsedResumeData, colors: ColorPalette) => {
    return generateExecutiveDOCX(data, colors, 'senior-executive');
  },
};

export default SeniorExecutive;

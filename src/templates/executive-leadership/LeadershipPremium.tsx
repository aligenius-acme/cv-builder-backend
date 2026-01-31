/**
 * Leadership Premium Template
 * Premium single-column template with banner header
 *
 * Features:
 * - Bold banner-style header
 * - Executive summary prominent
 * - Charcoal/dark gray color scheme
 * - Classic Times font family
 * - Two-page optimized layout
 *
 * ATS Score: 91/100
 * Best for: Senior Leaders, VPs, Directors, General Managers
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

const LeadershipPremiumPDF: React.FC<TemplatePDFProps> = ({ data, colors }) => {
  const palette = colors || createCustomPalette('#262626', '#404040'); // Charcoal/dark gray

  return (
    <div
      style={{
        fontFamily: '"Times New Roman", Times, Georgia, serif',
        fontSize: 11,
        color: palette.text,
        backgroundColor: '#ffffff',
        padding: '0',
        lineHeight: 1.6,
        maxWidth: '850px',
        margin: '0 auto',
      }}
    >
      {/* Banner Header */}
      <div
        style={{
          backgroundColor: palette.primary,
          color: '#ffffff',
          padding: '24px 60px',
          marginBottom: 32,
        }}
      >
        <h1
          style={{
            fontSize: 26,
            margin: '0 0 10px 0',
            fontWeight: 700,
            letterSpacing: '0.5px',
          }}
        >
          {data.contact.name || 'Executive Name'}
        </h1>
        <div style={{ fontSize: 11, opacity: 0.95, marginBottom: 6 }}>
          {[data.contact.email, data.contact.phone, data.contact.location].filter(Boolean).join(' • ')}
        </div>
        {(data.contact.linkedin || data.contact.website) && (
          <div style={{ fontSize: 10, opacity: 0.9 }}>
            {[data.contact.linkedin, data.contact.website].filter(Boolean).join(' • ')}
          </div>
        )}
      </div>

      <div style={{ padding: '0 60px 48px 60px' }}>
        {/* Executive Summary */}
        {data.summary && (
          <div style={{ marginBottom: 26 }}>
            <h2
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: palette.primary,
                margin: '0 0 12px 0',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                borderBottom: `2px solid ${palette.primary}`,
                paddingBottom: 6,
              }}
            >
              Executive Profile
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

        {/* Leadership Competencies */}
        {data.skills && data.skills.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionHeader title="Leadership Competencies" colors={palette} variant="underline" uppercase />
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

        {/* Strategic Leadership Initiatives */}
        {data.projects && data.projects.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionHeader title="Strategic Leadership Initiatives" colors={palette} variant="underline" uppercase />
            {data.projects.map((project, index) => (
              <div key={index} style={{ marginBottom: 12, paddingLeft: 8 }}>
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
            <SectionHeader title="Education & Professional Development" colors={palette} variant="underline" uppercase />
            <EducationSection education={data.education} colors={palette} layout="default" />
          </div>
        )}

        {/* Professional Affiliations */}
        {data.certifications && data.certifications.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <SectionHeader title="Professional Affiliations & Board Positions" colors={palette} variant="underline" uppercase />
            <ul style={{ margin: '8px 0', paddingLeft: 20, listStyleType: 'disc' }}>
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
    </div>
  );
};

export const LeadershipPremium: ReactTemplate = {
  id: 'leadership-premium',
  name: 'Leadership Premium',

  metadata: createTemplateMetadata({
    id: 'leadership-premium',
    name: 'Leadership Premium',
    category: 'executive',
    description: 'Premium template with bold banner header and classic styling for senior leadership positions',
    colorPalettes: ['minimal', 'professional', 'executive'],
    atsScore: 91,
    bestFor: ['VP', 'Senior Director', 'General Manager', 'Senior Leader', 'Division Head'],
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

  PDFComponent: LeadershipPremiumPDF,

  generateDOCX: (data: ParsedResumeData, colors: ColorPalette) => {
    return generateExecutiveDOCX(data, colors, 'leadership-premium');
  },
};

export default LeadershipPremium;

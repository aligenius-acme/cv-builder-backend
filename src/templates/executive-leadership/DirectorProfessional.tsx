/**
 * Director Professional Template
 * Professional single-column template for directors
 *
 * Features:
 * - Formal, professional layout
 * - Executive summary section
 * - Forest green color scheme
 * - Traditional serif typography
 * - Two-page optimized layout
 *
 * ATS Score: 92/100
 * Best for: Directors, Department Heads, Senior Managers
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

const DirectorProfessionalPDF: React.FC<TemplatePDFProps> = ({ data, colors }) => {
  const palette = colors || createCustomPalette('#14532d', '#166534'); // Forest green

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
      {/* Header - Professional Left-Aligned */}
      <div style={{ marginBottom: 26, paddingBottom: 14, borderBottom: `2px solid ${palette.primary}` }}>
        <h1
          style={{
            fontSize: 22,
            margin: '0 0 10px 0',
            color: palette.primary,
            fontWeight: 700,
            letterSpacing: '0.3px',
          }}
        >
          {data.contact.name || 'Director Name'}
        </h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: palette.textLight }}>
          <div>
            {data.contact.email && <div>{data.contact.email}</div>}
            {data.contact.phone && <div>{data.contact.phone}</div>}
          </div>
          <div style={{ textAlign: 'right' }}>
            {data.contact.location && <div>{data.contact.location}</div>}
            {data.contact.linkedin && <div style={{ color: palette.primary }}>{data.contact.linkedin}</div>}
          </div>
        </div>
      </div>

      {/* Professional Summary */}
      {data.summary && (
        <div style={{ marginBottom: 24 }}>
          <h2
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: palette.primary,
              margin: '0 0 10px 0',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            Professional Summary
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

      {/* Core Competencies */}
      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: palette.primary,
              margin: '0 0 10px 0',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            Core Competencies
          </h2>
          <SkillsSection skills={data.skills} colors={palette} layout="inline" />
        </div>
      )}

      {/* Professional Experience */}
      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: palette.primary,
              margin: '0 0 12px 0',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            Professional Experience
          </h2>
          <ExperienceSection
            experiences={data.experience}
            colors={palette}
            bulletStyle="bullet"
            showDuration
            layout="detailed"
          />
        </div>
      )}

      {/* Key Accomplishments */}
      {data.projects && data.projects.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: palette.primary,
              margin: '0 0 12px 0',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            Key Accomplishments
          </h2>
          {data.projects.map((project, index) => (
            <div key={index} style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: palette.textLight, marginBottom: 4, fontSize: 11 }}>
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
          <h2
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: palette.primary,
              margin: '0 0 12px 0',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            Education
          </h2>
          <EducationSection education={data.education} colors={palette} layout="default" />
        </div>
      )}

      {/* Professional Affiliations */}
      {data.certifications && data.certifications.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h2
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: palette.primary,
              margin: '0 0 12px 0',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            Professional Affiliations
          </h2>
          <ul style={{ margin: '8px 0', paddingLeft: 20, listStyleType: 'circle' }}>
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

export const DirectorProfessional: ReactTemplate = {
  id: 'director-professional',
  name: 'Director Professional',

  metadata: createTemplateMetadata({
    id: 'director-professional',
    name: 'Director Professional',
    category: 'executive',
    description: 'Professional template for directors with forest green color scheme and traditional layout',
    colorPalettes: ['executive', 'professional', 'minimal'],
    atsScore: 92,
    bestFor: ['Director', 'Department Head', 'Senior Manager', 'Division Director', 'Regional Director'],
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

  PDFComponent: DirectorProfessionalPDF,

  generateDOCX: (data: ParsedResumeData, colors: ColorPalette) => {
    return generateExecutiveDOCX(data, colors, 'director-professional');
  },
};

export default DirectorProfessional;

/**
 * Chief Officer Template
 * Two-column template for Chief Officers (CFO, COO, CTO, etc.)
 *
 * Features:
 * - Two-column layout with achievements sidebar
 * - Executive summary prominent
 * - Burgundy/wine color scheme
 * - Professional serif typography
 * - Two-page optimized layout
 *
 * ATS Score: 87/100
 * Best for: CFO, COO, CTO, CMO, Chief Officers
 */

import React from 'react';
import { Document } from 'docx';
import { ReactTemplate, TemplatePDFProps, createTemplateMetadata } from '../index';
import { ParsedResumeData } from '../../types';
import { ColorPalette, createCustomPalette } from '../shared/styles/colors';
import { SectionHeader } from '../shared/components/SectionHeader';
import { ExperienceSection } from '../shared/components/ExperienceSection';
import { EducationSection } from '../shared/components/EducationSection';
import { generateExecutiveDOCX } from './generateDOCX';

const ChiefOfficerPDF: React.FC<TemplatePDFProps> = ({ data, colors }) => {
  const palette = colors || createCustomPalette('#881337', '#9f1239'); // Deep burgundy

  return (
    <div
      style={{
        fontFamily: 'Georgia, Garamond, "Times New Roman", serif',
        fontSize: 10.5,
        color: palette.text,
        backgroundColor: '#ffffff',
        padding: '40px 50px',
        lineHeight: 1.6,
        maxWidth: '900px',
        margin: '0 auto',
      }}
    >
      {/* Header - Full Width with Background */}
      <div
        style={{
          backgroundColor: palette.primary,
          color: '#ffffff',
          padding: '20px 30px',
          marginLeft: -50,
          marginRight: -50,
          marginTop: -40,
          marginBottom: 28,
        }}
      >
        <h1
          style={{
            fontSize: 26,
            margin: '0 0 8px 0',
            fontWeight: 700,
            letterSpacing: '0.8px',
          }}
        >
          {data.contact.name || 'Chief Officer'}
        </h1>
        <div style={{ fontSize: 10.5, opacity: 0.95 }}>
          {[data.contact.email, data.contact.phone, data.contact.location].filter(Boolean).join(' • ')}
        </div>
        {(data.contact.linkedin || data.contact.website) && (
          <div style={{ fontSize: 9.5, opacity: 0.9, marginTop: 4 }}>
            {[data.contact.linkedin, data.contact.website].filter(Boolean).join(' • ')}
          </div>
        )}
      </div>

      {/* Two-Column Layout */}
      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Main Content - Left Column (68%) */}
        <div style={{ width: '68%' }}>
          {/* Executive Summary */}
          {data.summary && (
            <div style={{ marginBottom: 22 }}>
              <h2
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: palette.primary,
                  margin: '0 0 10px 0',
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                  borderBottom: `2px solid ${palette.primary}`,
                  paddingBottom: 6,
                }}
              >
                Executive Summary
              </h2>
              <p style={{ margin: '8px 0 0 0', lineHeight: 1.7, color: palette.textLight, textAlign: 'justify' }}>
                {data.summary}
              </p>
            </div>
          )}

          {/* Professional Experience */}
          {data.experience && data.experience.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <h2
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: palette.primary,
                  margin: '0 0 12px 0',
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                  borderBottom: `2px solid ${palette.primary}`,
                  paddingBottom: 6,
                }}
              >
                Leadership Experience
              </h2>
              {data.experience.map((exp, index) => (
                <div key={index} style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, color: palette.primary, fontSize: 11.5 }}>{exp.title}</div>
                    <div style={{ fontSize: 9, color: palette.textMuted, whiteSpace: 'nowrap', marginLeft: 10 }}>
                      {exp.current
                        ? `${exp.startDate || 'Present'} – Present`
                        : `${exp.startDate || ''} – ${exp.endDate || ''}`.trim()}
                    </div>
                  </div>
                  <div style={{ fontSize: 10.5, color: palette.textLight, marginBottom: 6, fontWeight: 600 }}>
                    {exp.company}
                    {exp.location && ` • ${exp.location}`}
                  </div>
                  {exp.description && exp.description.length > 0 && (
                    <ul style={{ margin: '6px 0', paddingLeft: 18, listStyleType: 'square' }}>
                      {exp.description.map((item, i) => (
                        <li key={i} style={{ marginBottom: 4, color: palette.textLight, lineHeight: 1.6 }}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar - Right Column (32%) */}
        <div style={{ width: '32%', paddingLeft: 20, borderLeft: `3px solid ${palette.primary}` }}>
          {/* Core Expertise */}
          {data.skills && data.skills.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <h3
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: palette.primary,
                  margin: '0 0 10px 0',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                Core Expertise
              </h3>
              <div>
                {data.skills.map((skill, index) => (
                  <div
                    key={index}
                    style={{
                      fontSize: 9.5,
                      color: palette.textLight,
                      marginBottom: 7,
                      lineHeight: 1.4,
                      paddingLeft: 8,
                      borderLeft: `2px solid ${palette.borderLight}`,
                    }}
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Achievements */}
          {data.projects && data.projects.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <h3
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: palette.primary,
                  margin: '0 0 10px 0',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                Key Achievements
              </h3>
              {data.projects.slice(0, 4).map((project, index) => (
                <div key={index} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${palette.borderLight}` }}>
                  <div style={{ fontWeight: 700, color: palette.secondary, fontSize: 9.5, marginBottom: 4 }}>
                    {project.name}
                  </div>
                  {project.description && (
                    <p style={{ margin: 0, color: palette.textLight, fontSize: 9, lineHeight: 1.5 }}>
                      {project.description.substring(0, 120)}
                      {project.description.length > 120 ? '...' : ''}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <h3
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: palette.primary,
                  margin: '0 0 10px 0',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                Education
              </h3>
              {data.education.map((edu, index) => (
                <div key={index} style={{ marginBottom: 12, fontSize: 9.5 }}>
                  <div style={{ fontWeight: 700, color: palette.textLight, marginBottom: 2 }}>{edu.degree}</div>
                  <div style={{ color: palette.textMuted, lineHeight: 1.4 }}>{edu.institution}</div>
                  {edu.graduationDate && <div style={{ color: palette.textMuted, fontSize: 9 }}>{edu.graduationDate}</div>}
                </div>
              ))}
            </div>
          )}

          {/* Affiliations */}
          {data.certifications && data.certifications.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h3
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: palette.primary,
                  margin: '0 0 10px 0',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                Affiliations
              </h3>
              <div style={{ fontSize: 9 }}>
                {data.certifications.slice(0, 5).map((cert, index) => {
                  const certText = typeof cert === 'string' ? cert : cert.name;
                  return (
                    <div key={index} style={{ marginBottom: 6, color: palette.textLight, lineHeight: 1.4 }}>
                      • {certText}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ChiefOfficer: ReactTemplate = {
  id: 'chief-officer',
  name: 'Chief Officer',

  metadata: createTemplateMetadata({
    id: 'chief-officer',
    name: 'Chief Officer',
    category: 'executive',
    description: 'Two-column template for Chief Officers with achievements sidebar and burgundy color scheme',
    colorPalettes: ['executive', 'professional', 'creative'],
    atsScore: 87,
    bestFor: ['CFO', 'COO', 'CTO', 'CMO', 'Chief Officer', 'Chief Executive'],
    features: {
      twoColumn: true,
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

  PDFComponent: ChiefOfficerPDF,

  generateDOCX: (data: ParsedResumeData, colors: ColorPalette) => {
    return generateExecutiveDOCX(data, colors, 'chief-officer');
  },
};

export default ChiefOfficer;

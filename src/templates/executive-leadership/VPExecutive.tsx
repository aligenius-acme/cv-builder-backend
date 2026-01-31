/**
 * VP Executive Template
 * Two-column template for Vice Presidents and executives
 *
 * Features:
 * - Two-column layout with sidebar
 * - Key metrics and achievements in sidebar
 * - Dark blue professional color scheme
 * - Executive summary prominent
 * - Two-page optimized layout
 *
 * ATS Score: 85/100
 * Best for: Vice Presidents, SVPs, Executive VPs
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

const VPExecutivePDF: React.FC<TemplatePDFProps> = ({ data, colors }) => {
  const palette = colors || createCustomPalette('#1e3a8a', '#1e40af'); // Dark blue

  return (
    <div
      style={{
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: 10.5,
        color: palette.text,
        backgroundColor: '#ffffff',
        padding: '40px 50px',
        lineHeight: 1.6,
        maxWidth: '900px',
        margin: '0 auto',
      }}
    >
      {/* Header - Full Width */}
      <div style={{ marginBottom: 24, paddingBottom: 12, borderBottom: `3px solid ${palette.primary}` }}>
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
        <div style={{ fontSize: 10, color: palette.textLight }}>
          {[data.contact.email, data.contact.phone, data.contact.location, data.contact.linkedin]
            .filter(Boolean)
            .join(' • ')}
        </div>
      </div>

      {/* Two-Column Layout */}
      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Sidebar - Left Column (30%) */}
        <div style={{ width: '30%', paddingRight: 16, borderRight: `2px solid ${palette.borderLight}` }}>
          {/* Core Competencies */}
          {data.skills && data.skills.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SectionHeader title="Core Competencies" colors={palette} variant="sidebar" />
              <div style={{ marginTop: 10 }}>
                {data.skills.slice(0, 10).map((skill, index) => (
                  <div
                    key={index}
                    style={{
                      fontSize: 9.5,
                      color: palette.textLight,
                      marginBottom: 6,
                      paddingLeft: 8,
                      lineHeight: 1.4,
                    }}
                  >
                    • {skill}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SectionHeader title="Education" colors={palette} variant="sidebar" />
              <div style={{ marginTop: 10, fontSize: 9.5 }}>
                {data.education.map((edu, index) => (
                  <div key={index} style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, color: palette.primary, marginBottom: 2 }}>{edu.degree}</div>
                    <div style={{ color: palette.textLight, marginBottom: 1 }}>{edu.institution}</div>
                    {edu.graduationDate && (
                      <div style={{ color: palette.textMuted, fontSize: 9 }}>{edu.graduationDate}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Professional Affiliations */}
          {data.certifications && data.certifications.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SectionHeader title="Affiliations" colors={palette} variant="sidebar" />
              <div style={{ marginTop: 10, fontSize: 9 }}>
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

        {/* Main Content - Right Column (70%) */}
        <div style={{ width: '70%' }}>
          {/* Executive Summary */}
          {data.summary && (
            <div style={{ marginBottom: 20 }}>
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
                Executive Summary
              </h2>
              <p style={{ margin: 0, lineHeight: 1.65, color: palette.textLight, textAlign: 'justify' }}>
                {data.summary}
              </p>
            </div>
          )}

          {/* Professional Experience */}
          {data.experience && data.experience.length > 0 && (
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
                Professional Experience
              </h2>
              {data.experience.map((exp, index) => (
                <div key={index} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, color: palette.primary, fontSize: 11 }}>{exp.title}</div>
                    <div style={{ fontSize: 9, color: palette.textMuted }}>
                      {exp.current
                        ? `${exp.startDate || 'Present'} – Present`
                        : `${exp.startDate || ''} – ${exp.endDate || ''}`.trim()}
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: palette.textLight, marginBottom: 6, fontStyle: 'italic' }}>
                    {exp.company}
                    {exp.location && ` • ${exp.location}`}
                  </div>
                  {exp.description && exp.description.length > 0 && (
                    <ul style={{ margin: '6px 0', paddingLeft: 18, listStyleType: 'disc' }}>
                      {exp.description.map((item, i) => (
                        <li key={i} style={{ marginBottom: 3, color: palette.textLight, lineHeight: 1.5, fontSize: 10 }}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Key Achievements */}
          {data.projects && data.projects.length > 0 && (
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
                Key Achievements
              </h2>
              {data.projects.map((project, index) => (
                <div key={index} style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, color: palette.textLight, fontSize: 10.5, marginBottom: 3 }}>
                    {project.name}
                  </div>
                  {project.description && (
                    <p style={{ margin: 0, color: palette.textLight, fontSize: 10, lineHeight: 1.5 }}>
                      {project.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const VPExecutive: ReactTemplate = {
  id: 'vp-executive',
  name: 'VP Executive',

  metadata: createTemplateMetadata({
    id: 'vp-executive',
    name: 'VP Executive',
    category: 'executive',
    description: 'Two-column executive template for Vice Presidents with sidebar for key competencies',
    colorPalettes: ['executive', 'professional', 'modern'],
    atsScore: 85,
    bestFor: ['Vice President', 'SVP', 'Executive VP', 'VP of Operations', 'VP of Sales'],
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

  PDFComponent: VPExecutivePDF,

  generateDOCX: (data: ParsedResumeData, colors: ColorPalette) => {
    return generateExecutiveDOCX(data, colors, 'vp-executive');
  },
};

export default VPExecutive;

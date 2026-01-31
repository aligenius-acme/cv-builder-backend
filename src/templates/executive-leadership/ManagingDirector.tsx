/**
 * Managing Director Template
 * Premium two-column PDF-only template with complex visual design
 *
 * Features:
 * - Complex two-column layout with visual elements
 * - Gold accent colors with navy base
 * - Premium executive styling
 * - Visual impact elements (no DOCX support)
 * - Two-page optimized layout
 *
 * ATS Score: 85/100
 * Best for: Managing Directors, Regional Directors, Country Managers
 * Note: PDF-only template - no DOCX export available
 */

import React from 'react';
import { Document } from 'docx';
import { ReactTemplate, TemplatePDFProps, createTemplateMetadata } from '../index';
import { ParsedResumeData } from '../../types';
import { ColorPalette, createCustomPalette } from '../shared/styles/colors';
import { SectionHeader } from '../shared/components/SectionHeader';

const ManagingDirectorPDF: React.FC<TemplatePDFProps> = ({ data, colors }) => {
  const palette = colors || createCustomPalette('#1e3a8a', '#1e40af'); // Navy blue
  const goldAccent = '#d97706'; // Gold accent

  return (
    <div
      style={{
        fontFamily: 'Georgia, Garamond, serif',
        fontSize: 10.5,
        color: palette.text,
        backgroundColor: '#ffffff',
        padding: '0',
        lineHeight: 1.6,
        maxWidth: '900px',
        margin: '0 auto',
      }}
    >
      {/* Premium Header with Gold Accent */}
      <div
        style={{
          background: `linear-gradient(135deg, ${palette.primary} 0%, ${palette.secondary} 100%)`,
          color: '#ffffff',
          padding: '32px 50px',
          marginBottom: 0,
          position: 'relative',
        }}
      >
        <div style={{ borderLeft: `4px solid ${goldAccent}`, paddingLeft: 20 }}>
          <h1
            style={{
              fontSize: 28,
              margin: '0 0 10px 0',
              fontWeight: 700,
              letterSpacing: '0.5px',
            }}
          >
            {data.contact.name || 'Managing Director'}
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
      </div>

      {/* Two-Column Layout with Visual Elements */}
      <div style={{ display: 'flex', gap: '0' }}>
        {/* Sidebar - Left Column (28%) with Background */}
        <div
          style={{
            width: '28%',
            backgroundColor: '#f8fafc',
            padding: '28px 20px',
            borderRight: `3px solid ${goldAccent}`,
          }}
        >
          {/* Executive Highlights */}
          {data.skills && data.skills.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: palette.primary,
                  marginBottom: 12,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  borderBottom: `2px solid ${goldAccent}`,
                  paddingBottom: 6,
                }}
              >
                Core Expertise
              </div>
              <div>
                {data.skills.slice(0, 10).map((skill, index) => (
                  <div
                    key={index}
                    style={{
                      fontSize: 9.5,
                      color: palette.text,
                      marginBottom: 8,
                      paddingLeft: 12,
                      borderLeft: `2px solid ${goldAccent}`,
                      lineHeight: 1.4,
                      fontWeight: 500,
                    }}
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: palette.primary,
                  marginBottom: 12,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  borderBottom: `2px solid ${goldAccent}`,
                  paddingBottom: 6,
                }}
              >
                Education
              </div>
              {data.education.map((edu, index) => (
                <div key={index} style={{ marginBottom: 14, fontSize: 9.5 }}>
                  <div style={{ fontWeight: 700, color: palette.primary, marginBottom: 3, lineHeight: 1.3 }}>
                    {edu.degree}
                  </div>
                  <div style={{ color: palette.textLight, lineHeight: 1.3, marginBottom: 2 }}>{edu.institution}</div>
                  {edu.graduationDate && (
                    <div style={{ color: palette.textMuted, fontSize: 9 }}>{edu.graduationDate}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Certifications & Boards */}
          {data.certifications && data.certifications.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: palette.primary,
                  marginBottom: 12,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  borderBottom: `2px solid ${goldAccent}`,
                  paddingBottom: 6,
                }}
              >
                Affiliations
              </div>
              <div style={{ fontSize: 9 }}>
                {data.certifications.slice(0, 6).map((cert, index) => {
                  const certText = typeof cert === 'string' ? cert : cert.name;
                  return (
                    <div key={index} style={{ marginBottom: 8, color: palette.textLight, lineHeight: 1.4 }}>
                      <span style={{ color: goldAccent, marginRight: 6 }}>■</span>
                      {certText}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Main Content - Right Column (72%) */}
        <div style={{ width: '72%', padding: '28px 40px' }}>
          {/* Executive Summary with Gold Border */}
          {data.summary && (
            <div
              style={{
                marginBottom: 24,
                padding: '18px 22px',
                borderLeft: `4px solid ${goldAccent}`,
                backgroundColor: '#fefce8',
              }}
            >
              <h2
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: palette.primary,
                  margin: '0 0 10px 0',
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                }}
              >
                Executive Profile
              </h2>
              <p style={{ margin: 0, lineHeight: 1.7, color: palette.text, textAlign: 'justify' }}>
                {data.summary}
              </p>
            </div>
          )}

          {/* Leadership Experience */}
          {data.experience && data.experience.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h2
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: palette.primary,
                  margin: '0 0 14px 0',
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                  borderBottom: `2px solid ${palette.primary}`,
                  paddingBottom: 6,
                }}
              >
                Leadership Experience
              </h2>
              {data.experience.map((exp, index) => (
                <div key={index} style={{ marginBottom: 20, position: 'relative', paddingLeft: 16 }}>
                  {/* Gold accent bar */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 3,
                      backgroundColor: goldAccent,
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, color: palette.primary, fontSize: 11.5 }}>{exp.title}</div>
                    <div style={{ fontSize: 9, color: palette.textMuted, whiteSpace: 'nowrap', marginLeft: 12 }}>
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
                    <ul style={{ margin: '6px 0', paddingLeft: 18, listStyleType: 'disc' }}>
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

          {/* Key Achievements */}
          {data.projects && data.projects.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h2
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: palette.primary,
                  margin: '0 0 14px 0',
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                  borderBottom: `2px solid ${palette.primary}`,
                  paddingBottom: 6,
                }}
              >
                Key Achievements
              </h2>
              {data.projects.map((project, index) => (
                <div key={index} style={{ marginBottom: 12, paddingLeft: 16, borderLeft: `2px solid ${goldAccent}` }}>
                  <div style={{ fontWeight: 700, color: palette.textLight, fontSize: 11, marginBottom: 4 }}>
                    {project.name}
                  </div>
                  {project.description && (
                    <p style={{ margin: 0, color: palette.textLight, fontSize: 10, lineHeight: 1.6 }}>
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

export const ManagingDirector: ReactTemplate = {
  id: 'managing-director',
  name: 'Managing Director',

  metadata: createTemplateMetadata({
    id: 'managing-director',
    name: 'Managing Director',
    category: 'executive',
    description: 'Premium PDF-only template with complex visual design, gold accents, and executive styling',
    colorPalettes: ['executive', 'professional', 'modern'],
    atsScore: 85,
    bestFor: ['Managing Director', 'Regional Director', 'Country Manager', 'General Manager', 'MD'],
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

  PDFComponent: ManagingDirectorPDF,

  // PDF-only template - no DOCX support due to complex visual design
  generateDOCX: (data: ParsedResumeData, colors: ColorPalette) => {
    throw new Error('DOCX export not available for Managing Director template. This template uses complex visual elements that are only supported in PDF format.');
  },
};

export default ManagingDirector;

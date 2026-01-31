/**
 * Executive Leader Template
 * Ultra-premium two-column PDF-only template with sophisticated design
 *
 * Features:
 * - Complex two-column layout with premium visual elements
 * - Deep blue color scheme with sophisticated styling
 * - High-impact executive presentation
 * - Visual design elements (no DOCX support)
 * - Two-page optimized layout
 *
 * ATS Score: 85/100
 * Best for: CEOs, Presidents, Executive Leaders, C-Suite Positions
 * Note: PDF-only template - no DOCX export available
 */

import React from 'react';
import { Document } from 'docx';
import { ReactTemplate, TemplatePDFProps, createTemplateMetadata } from '../index';
import { ParsedResumeData } from '../../types';
import { ColorPalette, createCustomPalette } from '../shared/styles/colors';

const ExecutiveLeaderPDF: React.FC<TemplatePDFProps> = ({ data, colors }) => {
  const palette = colors || createCustomPalette('#0f172a', '#1e293b'); // Deep slate blue
  const accentColor = '#3b82f6'; // Bright blue accent

  return (
    <div
      style={{
        fontFamily: 'Baskerville, Georgia, "Times New Roman", serif',
        fontSize: 10.5,
        color: palette.text,
        backgroundColor: '#ffffff',
        padding: '0',
        lineHeight: 1.65,
        maxWidth: '900px',
        margin: '0 auto',
      }}
    >
      {/* Premium Header with Gradient and Border */}
      <div
        style={{
          background: `linear-gradient(to right, ${palette.primary} 0%, ${palette.secondary} 50%, ${palette.primary} 100%)`,
          color: '#ffffff',
          padding: '36px 50px 32px 50px',
          marginBottom: 0,
          borderBottom: `4px solid ${accentColor}`,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h1
            style={{
              fontSize: 30,
              margin: '0 0 12px 0',
              fontWeight: 700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
            }}
          >
            {data.contact.name || 'Executive Leader'}
          </h1>
          <div
            style={{
              fontSize: 11,
              opacity: 0.95,
              marginBottom: 8,
              letterSpacing: '0.5px',
            }}
          >
            {[data.contact.email, data.contact.phone, data.contact.location].filter(Boolean).join('  •  ')}
          </div>
          {(data.contact.linkedin || data.contact.website) && (
            <div style={{ fontSize: 10, opacity: 0.9, letterSpacing: '0.3px' }}>
              {[data.contact.linkedin, data.contact.website].filter(Boolean).join('  •  ')}
            </div>
          )}
        </div>
      </div>

      {/* Executive Summary - Full Width with Premium Styling */}
      {data.summary && (
        <div
          style={{
            padding: '28px 50px',
            backgroundColor: '#f1f5f9',
            borderBottom: `3px solid ${accentColor}`,
          }}
        >
          <div
            style={{
              textAlign: 'center',
              marginBottom: 12,
              fontSize: 14,
              fontWeight: 700,
              color: palette.primary,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
            }}
          >
            Executive Profile
          </div>
          <p
            style={{
              margin: 0,
              lineHeight: 1.8,
              color: palette.text,
              textAlign: 'center',
              fontSize: 11,
              maxWidth: '750px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {data.summary}
          </p>
        </div>
      )}

      {/* Two-Column Layout with Premium Design */}
      <div style={{ display: 'flex', gap: '0' }}>
        {/* Sidebar - Left Column (32%) */}
        <div
          style={{
            width: '32%',
            backgroundColor: palette.primary,
            color: '#ffffff',
            padding: '32px 24px',
          }}
        >
          {/* Core Leadership Competencies */}
          {data.skills && data.skills.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  marginBottom: 14,
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                  paddingBottom: 8,
                  borderBottom: `2px solid ${accentColor}`,
                }}
              >
                Core Competencies
              </div>
              <div>
                {data.skills.map((skill, index) => (
                  <div
                    key={index}
                    style={{
                      fontSize: 9.5,
                      marginBottom: 10,
                      paddingLeft: 14,
                      borderLeft: `3px solid ${accentColor}`,
                      paddingTop: 4,
                      paddingBottom: 4,
                      lineHeight: 1.4,
                      opacity: 0.95,
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
            <div style={{ marginBottom: 28 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  marginBottom: 14,
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                  paddingBottom: 8,
                  borderBottom: `2px solid ${accentColor}`,
                }}
              >
                Education
              </div>
              {data.education.map((edu, index) => (
                <div key={index} style={{ marginBottom: 16, fontSize: 9.5, opacity: 0.95 }}>
                  <div style={{ fontWeight: 700, marginBottom: 4, lineHeight: 1.3, fontSize: 10 }}>
                    {edu.degree}
                  </div>
                  <div style={{ lineHeight: 1.3, marginBottom: 2, opacity: 0.9 }}>{edu.institution}</div>
                  {edu.graduationDate && (
                    <div style={{ fontSize: 9, opacity: 0.85 }}>{edu.graduationDate}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Professional Affiliations */}
          {data.certifications && data.certifications.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  marginBottom: 14,
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                  paddingBottom: 8,
                  borderBottom: `2px solid ${accentColor}`,
                }}
              >
                Affiliations
              </div>
              <div style={{ fontSize: 9 }}>
                {data.certifications.map((cert, index) => {
                  const certText = typeof cert === 'string' ? cert : cert.name;
                  return (
                    <div key={index} style={{ marginBottom: 10, lineHeight: 1.4, opacity: 0.95 }}>
                      <span style={{ marginRight: 8, color: accentColor }}>▸</span>
                      {certText}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Main Content - Right Column (68%) */}
        <div style={{ width: '68%', padding: '32px 40px' }}>
          {/* Executive Leadership Experience */}
          {data.experience && data.experience.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <h2
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: palette.primary,
                  margin: '0 0 16px 0',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  paddingBottom: 8,
                  borderBottom: `3px solid ${accentColor}`,
                }}
              >
                Executive Leadership Experience
              </h2>
              {data.experience.map((exp, index) => (
                <div key={index} style={{ marginBottom: 22, position: 'relative' }}>
                  {/* Decorative element */}
                  <div
                    style={{
                      position: 'absolute',
                      left: -40,
                      top: 0,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: accentColor,
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                    <div style={{ fontWeight: 700, color: palette.primary, fontSize: 12 }}>{exp.title}</div>
                    <div style={{ fontSize: 9, color: palette.textMuted, whiteSpace: 'nowrap', marginLeft: 12 }}>
                      {exp.current
                        ? `${exp.startDate || 'Present'} – Present`
                        : `${exp.startDate || ''} – ${exp.endDate || ''}`.trim()}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: palette.textLight,
                      marginBottom: 8,
                      fontWeight: 600,
                      fontStyle: 'italic',
                    }}
                  >
                    {exp.company}
                    {exp.location && ` • ${exp.location}`}
                  </div>
                  {exp.description && exp.description.length > 0 && (
                    <ul style={{ margin: '6px 0', paddingLeft: 20, listStyleType: 'square' }}>
                      {exp.description.map((item, i) => (
                        <li key={i} style={{ marginBottom: 5, color: palette.textLight, lineHeight: 1.65 }}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Strategic Impact & Achievements */}
          {data.projects && data.projects.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h2
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: palette.primary,
                  margin: '0 0 16px 0',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  paddingBottom: 8,
                  borderBottom: `3px solid ${accentColor}`,
                }}
              >
                Strategic Impact
              </h2>
              {data.projects.map((project, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: 14,
                    paddingLeft: 16,
                    borderLeft: `3px solid ${accentColor}`,
                    paddingTop: 2,
                    paddingBottom: 2,
                  }}
                >
                  <div style={{ fontWeight: 700, color: palette.primary, fontSize: 11, marginBottom: 5 }}>
                    {project.name}
                  </div>
                  {project.description && (
                    <p style={{ margin: 0, color: palette.textLight, fontSize: 10, lineHeight: 1.65 }}>
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

export const ExecutiveLeader: ReactTemplate = {
  id: 'executive-leader',
  name: 'Executive Leader',

  metadata: createTemplateMetadata({
    id: 'executive-leader',
    name: 'Executive Leader',
    category: 'executive',
    description: 'Ultra-premium PDF-only template with sophisticated two-column design and visual impact elements',
    colorPalettes: ['executive', 'professional', 'modern'],
    atsScore: 85,
    bestFor: ['CEO', 'President', 'Executive Leader', 'C-Suite Executive', 'Chief Executive'],
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

  PDFComponent: ExecutiveLeaderPDF,

  // PDF-only template - no DOCX support due to complex visual design
  generateDOCX: (data: ParsedResumeData, colors: ColorPalette) => {
    throw new Error('DOCX export not available for Executive Leader template. This template uses complex visual elements that are only supported in PDF format.');
  },
};

export default ExecutiveLeader;

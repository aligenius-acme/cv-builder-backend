/**
 * Board Member Template
 * Two-column template for Board Members and Directors
 *
 * Features:
 * - Two-column layout with board positions sidebar
 * - Executive summary and governance focus
 * - Charcoal/gray professional color scheme
 * - Distinguished serif typography
 * - Two-page optimized layout
 *
 * ATS Score: 86/100
 * Best for: Board Members, Board Directors, Advisory Board Members
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

const BoardMemberPDF: React.FC<TemplatePDFProps> = ({ data, colors }) => {
  const palette = colors || createCustomPalette('#374151', '#4b5563'); // Charcoal gray

  return (
    <div
      style={{
        fontFamily: 'Georgia, Baskerville, "Times New Roman", serif',
        fontSize: 10.5,
        color: palette.text,
        backgroundColor: '#ffffff',
        padding: '42px 52px',
        lineHeight: 1.65,
        maxWidth: '900px',
        margin: '0 auto',
      }}
    >
      {/* Header - Centered Distinguished */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: 26,
          paddingBottom: 18,
          borderBottom: `3px double ${palette.primary}`,
        }}
      >
        <h1
          style={{
            fontSize: 25,
            margin: '0 0 10px 0',
            color: palette.primary,
            fontWeight: 700,
            letterSpacing: '1px',
          }}
        >
          {data.contact.name || 'Board Member Name'}
        </h1>
        <div style={{ fontSize: 10.5, color: palette.textLight, marginBottom: 6 }}>
          {[data.contact.email, data.contact.phone, data.contact.location].filter(Boolean).join(' | ')}
        </div>
        {(data.contact.linkedin || data.contact.website) && (
          <div style={{ fontSize: 9.5, color: palette.secondary }}>
            {[data.contact.linkedin, data.contact.website].filter(Boolean).join(' | ')}
          </div>
        )}
      </div>

      {/* Two-Column Layout */}
      <div style={{ display: 'flex', gap: '26px' }}>
        {/* Sidebar - Left Column (35%) */}
        <div style={{ width: '35%' }}>
          {/* Board Positions */}
          {data.certifications && data.certifications.length > 0 && (
            <div style={{ marginBottom: 22, padding: '16px', backgroundColor: palette.backgroundAlt }}>
              <h3
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: palette.primary,
                  margin: '0 0 12px 0',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  textAlign: 'center',
                }}
              >
                Board Positions
              </h3>
              <div>
                {data.certifications.map((cert, index) => {
                  const certText = typeof cert === 'string' ? cert : cert.name;
                  return (
                    <div
                      key={index}
                      style={{
                        fontSize: 9.5,
                        color: palette.textLight,
                        marginBottom: 10,
                        paddingBottom: 10,
                        borderBottom: index < data.certifications!.length - 1 ? `1px solid ${palette.borderLight}` : 'none',
                        lineHeight: 1.5,
                      }}
                    >
                      {certText}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Areas of Expertise */}
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
                  borderBottom: `2px solid ${palette.primary}`,
                  paddingBottom: 6,
                }}
              >
                Areas of Expertise
              </h3>
              <div>
                {data.skills.slice(0, 12).map((skill, index) => (
                  <div
                    key={index}
                    style={{
                      fontSize: 9.5,
                      color: palette.textLight,
                      marginBottom: 6,
                      paddingLeft: 10,
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
            <div style={{ marginBottom: 22 }}>
              <h3
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: palette.primary,
                  margin: '0 0 10px 0',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  borderBottom: `2px solid ${palette.primary}`,
                  paddingBottom: 6,
                }}
              >
                Education
              </h3>
              {data.education.map((edu, index) => (
                <div key={index} style={{ marginBottom: 12, fontSize: 9.5 }}>
                  <div style={{ fontWeight: 700, color: palette.textLight, marginBottom: 2, lineHeight: 1.3 }}>
                    {edu.degree}
                  </div>
                  <div style={{ color: palette.textMuted, lineHeight: 1.3 }}>{edu.institution}</div>
                  {edu.graduationDate && <div style={{ color: palette.textMuted, fontSize: 9 }}>{edu.graduationDate}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Content - Right Column (65%) */}
        <div style={{ width: '65%' }}>
          {/* Executive Summary */}
          {data.summary && (
            <div style={{ marginBottom: 22 }}>
              <h2
                style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: palette.primary,
                  margin: '0 0 10px 0',
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                }}
              >
                Executive Profile
              </h2>
              <p style={{ margin: 0, lineHeight: 1.75, color: palette.textLight, textAlign: 'justify' }}>
                {data.summary}
              </p>
            </div>
          )}

          {/* Executive & Board Experience */}
          {data.experience && data.experience.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <h2
                style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: palette.primary,
                  margin: '0 0 12px 0',
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                }}
              >
                Executive & Board Experience
              </h2>
              {data.experience.map((exp, index) => (
                <div key={index} style={{ marginBottom: 18 }}>
                  <div style={{ marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, color: palette.primary, fontSize: 11.5, marginBottom: 2 }}>
                      {exp.title}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                      <div style={{ color: palette.textLight, fontWeight: 600 }}>
                        {exp.company}
                        {exp.location && ` • ${exp.location}`}
                      </div>
                      <div style={{ color: palette.textMuted, fontSize: 9.5, whiteSpace: 'nowrap', marginLeft: 10 }}>
                        {exp.current
                          ? `${exp.startDate || 'Present'} – Present`
                          : `${exp.startDate || ''} – ${exp.endDate || ''}`.trim()}
                      </div>
                    </div>
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

          {/* Strategic Contributions */}
          {data.projects && data.projects.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h2
                style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: palette.primary,
                  margin: '0 0 12px 0',
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                }}
              >
                Strategic Contributions
              </h2>
              {data.projects.map((project, index) => (
                <div key={index} style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, color: palette.textLight, fontSize: 10.5, marginBottom: 4 }}>
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

export const BoardMember: ReactTemplate = {
  id: 'board-member',
  name: 'Board Member',

  metadata: createTemplateMetadata({
    id: 'board-member',
    name: 'Board Member',
    category: 'executive',
    description: 'Two-column template for board members with dedicated board positions sidebar',
    colorPalettes: ['minimal', 'professional', 'executive'],
    atsScore: 86,
    bestFor: ['Board Member', 'Board Director', 'Advisory Board', 'Non-Executive Director', 'Board Chair'],
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

  PDFComponent: BoardMemberPDF,

  generateDOCX: (data: ParsedResumeData, colors: ColorPalette) => {
    return generateExecutiveDOCX(data, colors, 'board-member');
  },
};

export default BoardMember;

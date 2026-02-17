/**
 * ExecutiveLayout - Traditional, formal, conservative design
 *
 * Structure: Classic serif typography, formal spacing, traditional styling
 * Suitable for: Executive, leadership, finance, legal roles
 */

import * as React from 'react';
import { LayoutProps } from './types';
import { PhotoCircle } from '../shared/components/PhotoCircle';

export const ExecutiveLayout: React.FC<LayoutProps> = ({ data, config }) => {
  const { contact, summary, experience, education, skills, certifications, awards } = data;
  const {
    primaryColor,
    textColor,
    mutedColor,
    backgroundColor,
    fontSize,
    margins,
  } = config;

  return (
    <div
      style={{
        fontFamily: "'Georgia', 'Times New Roman', serif",
        fontSize: `${fontSize.body}px`,
        color: textColor,
        backgroundColor: backgroundColor,
        padding: `${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px`,
        maxWidth: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
      }}
    >
      {/* Header - Traditional & Formal */}
      <div style={{
        borderBottom: `3px solid ${primaryColor}`,
        paddingBottom: '20px',
        marginBottom: '30px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontSize: `${fontSize.header + 4}px`,
              color: primaryColor,
              margin: 0,
              fontWeight: 700,
              marginBottom: '8px',
              fontFamily: "'Georgia', serif",
            }}>
              {contact.name || 'Your Name'}
            </h1>
            <div style={{
              fontSize: `${fontSize.body}px`,
              color: mutedColor,
              lineHeight: 1.6,
            }}>
              {contact.email && <div>{contact.email}</div>}
              {contact.phone && <div>{contact.phone}</div>}
              {contact.location && <div>{contact.location}</div>}
            </div>
          </div>
          {contact.photoUrl && (
            <div style={{ marginLeft: '30px' }}>
              <PhotoCircle
                photoUrl={contact.photoUrl}
                name={contact.name || 'User'}
                size="large"
                position="right"
                primaryColor={primaryColor}
              />
            </div>
          )}
        </div>
      </div>

      {/* Executive Summary */}
      {summary && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: `${fontSize.subheader + 2}px`,
            color: primaryColor,
            fontWeight: 700,
            marginBottom: '16px',
            fontFamily: "'Georgia', serif",
            borderBottom: `2px solid ${mutedColor}`,
            paddingBottom: '8px',
          }}>
            EXECUTIVE SUMMARY
          </h2>
          <p style={{
            fontSize: `${fontSize.body}px`,
            color: textColor,
            lineHeight: 1.8,
            margin: 0,
            textAlign: 'justify',
          }}>
            {summary}
          </p>
        </div>
      )}

      {/* Professional Experience */}
      {experience && experience.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: `${fontSize.subheader + 2}px`,
            color: primaryColor,
            fontWeight: 700,
            marginBottom: '16px',
            fontFamily: "'Georgia', serif",
            borderBottom: `2px solid ${mutedColor}`,
            paddingBottom: '8px',
          }}>
            PROFESSIONAL EXPERIENCE
          </h2>
          {experience.map((exp, index) => (
            <div key={index} style={{ marginBottom: '24px' }}>
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 style={{
                    fontSize: `${fontSize.subheader + 1}px`,
                    color: textColor,
                    fontWeight: 700,
                    margin: 0,
                    fontFamily: "'Georgia', serif",
                  }}>
                    {exp.title}
                  </h3>
                  <span style={{
                    fontSize: `${fontSize.body - 1}px`,
                    color: mutedColor,
                    fontStyle: 'italic',
                    whiteSpace: 'nowrap',
                  }}>
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <div style={{
                  fontSize: `${fontSize.body}px`,
                  color: primaryColor,
                  fontWeight: 600,
                  marginTop: '4px',
                }}>
                  {exp.company}
                  {exp.location && ` | ${exp.location}`}
                </div>
              </div>
              <ul style={{
                margin: 0,
                paddingLeft: '24px',
                listStyleType: 'square',
              }}>
                {exp.description?.map((desc, i) => (
                  <li key={i} style={{
                    fontSize: `${fontSize.body}px`,
                    color: textColor,
                    lineHeight: 1.7,
                    marginBottom: '6px',
                  }}>
                    {desc}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: `${fontSize.subheader + 2}px`,
            color: primaryColor,
            fontWeight: 700,
            marginBottom: '16px',
            fontFamily: "'Georgia', serif",
            borderBottom: `2px solid ${mutedColor}`,
            paddingBottom: '8px',
          }}>
            EDUCATION
          </h2>
          {education.map((edu, index) => (
            <div key={index} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h3 style={{
                  fontSize: `${fontSize.subheader}px`,
                  color: textColor,
                  fontWeight: 700,
                  margin: 0,
                  fontFamily: "'Georgia', serif",
                }}>
                  {edu.degree}
                </h3>
                <span style={{
                  fontSize: `${fontSize.body - 1}px`,
                  color: mutedColor,
                  fontStyle: 'italic',
                }}>
                  {edu.graduationDate}
                </span>
              </div>
              <div style={{
                fontSize: `${fontSize.body}px`,
                color: mutedColor,
                marginTop: '4px',
              }}>
                {edu.institution}
                {edu.location && ` | ${edu.location}`}
                {edu.gpa && ` | GPA: ${edu.gpa}`}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Core Competencies / Skills */}
      {skills && skills.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: `${fontSize.subheader + 2}px`,
            color: primaryColor,
            fontWeight: 700,
            marginBottom: '16px',
            fontFamily: "'Georgia', serif",
            borderBottom: `2px solid ${mutedColor}`,
            paddingBottom: '8px',
          }}>
            CORE COMPETENCIES
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px 20px',
          }}>
            {skills.map((skill, index) => {
              const skillText = typeof skill === 'string' ? skill : (skill as any).category || (skill as any).name || String(skill);
              return (
                <div
                  key={index}
                  style={{
                    fontSize: `${fontSize.body}px`,
                    color: textColor,
                  }}
                >
                  • {skillText}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Professional Certifications */}
      {certifications && certifications.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: `${fontSize.subheader + 2}px`,
            color: primaryColor,
            fontWeight: 700,
            marginBottom: '16px',
            fontFamily: "'Georgia', serif",
            borderBottom: `2px solid ${mutedColor}`,
            paddingBottom: '8px',
          }}>
            PROFESSIONAL CERTIFICATIONS
          </h2>
          {certifications.map((cert, index) => (
            <div key={index} style={{
              fontSize: `${fontSize.body}px`,
              color: textColor,
              marginBottom: '8px',
            }}>
              • {typeof cert === 'string' ? cert : `${cert.name}${cert.issuer ? ` | ${cert.issuer}` : ''}${cert.date ? ` | ${cert.date}` : ''}`}
            </div>
          ))}
        </div>
      )}

      {/* Awards & Honors */}
      {awards && awards.length > 0 && (
        <div>
          <h2 style={{
            fontSize: `${fontSize.subheader + 2}px`,
            color: primaryColor,
            fontWeight: 700,
            marginBottom: '16px',
            fontFamily: "'Georgia', serif",
            borderBottom: `2px solid ${mutedColor}`,
            paddingBottom: '8px',
          }}>
            AWARDS & HONORS
          </h2>
          {awards.map((award, index) => (
            <div key={index} style={{
              fontSize: `${fontSize.body}px`,
              color: textColor,
              marginBottom: '8px',
            }}>
              • {typeof award === 'string' ? award : award.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const metadata = {
  id: 'ExecutiveLayout' as const,
  name: 'Executive',
  description: 'Traditional, formal layout with serif typography for senior roles',
  suitableFor: ['executive-leadership', 'finance-banking', 'legal-law'],
  complexity: 'simple' as const,
  atsCompatibility: 'high' as const,
  isUnique: true,
};

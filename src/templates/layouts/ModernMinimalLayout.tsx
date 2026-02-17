/**
 * ModernMinimalLayout - Ultra-clean, spacious minimal design
 *
 * Structure: Generous whitespace, large typography, minimal styling
 * Suitable for: Creative, design, tech roles
 */

import * as React from 'react';
import { LayoutProps } from './types';
import { PhotoCircle } from '../shared/components/PhotoCircle';

export const ModernMinimalLayout: React.FC<LayoutProps> = ({ data, config }) => {
  const { contact, summary, experience, education, skills, certifications } = data;
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
        fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
        fontSize: `${fontSize.body}px`,
        color: textColor,
        backgroundColor: backgroundColor,
        padding: `${margins.top + 20}px ${margins.right + 20}px ${margins.bottom + 20}px ${margins.left + 20}px`,
        maxWidth: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
      }}
    >
      {/* Header - Centered, Spacious */}
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        {contact.photoUrl && (
          <div style={{ marginBottom: '30px' }}>
            <PhotoCircle
              photoUrl={contact.photoUrl}
              name={contact.name || 'User'}
              size="large"
              position="center"
              primaryColor={primaryColor}
            />
          </div>
        )}
        <h1 style={{
          fontSize: `${fontSize.header + 8}px`,
          color: textColor,
          margin: 0,
          fontWeight: 300,
          letterSpacing: '2px',
          marginBottom: '16px',
        }}>
          {contact.name || 'YOUR NAME'}
        </h1>
        <div style={{
          fontSize: `${fontSize.body}px`,
          color: mutedColor,
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          marginTop: '20px',
        }}>
          {contact.email && <span>{contact.email}</span>}
          {contact.phone && <span>{contact.phone}</span>}
          {contact.location && <span>{contact.location}</span>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div style={{ marginBottom: '50px', textAlign: 'center', maxWidth: '600px', margin: '0 auto 50px' }}>
          <p style={{
            fontSize: `${fontSize.body + 2}px`,
            color: textColor,
            lineHeight: 1.8,
            fontWeight: 300,
            margin: 0,
          }}>
            {summary}
          </p>
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div style={{ marginBottom: '50px' }}>
          <h2 style={{
            fontSize: `${fontSize.subheader}px`,
            color: primaryColor,
            fontWeight: 300,
            textTransform: 'uppercase',
            letterSpacing: '3px',
            marginBottom: '30px',
            textAlign: 'center',
          }}>
            Experience
          </h2>
          {experience.map((exp, index) => (
            <div key={index} style={{ marginBottom: '40px' }}>
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{
                  fontSize: `${fontSize.subheader + 2}px`,
                  color: textColor,
                  fontWeight: 500,
                  margin: 0,
                  marginBottom: '8px',
                }}>
                  {exp.title}
                </h3>
                <div style={{
                  fontSize: `${fontSize.body}px`,
                  color: primaryColor,
                  fontWeight: 500,
                  marginBottom: '4px',
                }}>
                  {exp.company}
                </div>
                <div style={{
                  fontSize: `${fontSize.body - 1}px`,
                  color: mutedColor,
                }}>
                  {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  {exp.location && ` • ${exp.location}`}
                </div>
              </div>
              <div style={{
                fontSize: `${fontSize.body}px`,
                color: textColor,
                lineHeight: 1.8,
                paddingLeft: '20px',
                borderLeft: `1px solid ${mutedColor}`,
              }}>
                {exp.description?.map((desc, i) => (
                  <p key={i} style={{ margin: '0 0 12px 0' }}>
                    {desc}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div style={{ marginBottom: '50px' }}>
          <h2 style={{
            fontSize: `${fontSize.subheader}px`,
            color: primaryColor,
            fontWeight: 300,
            textTransform: 'uppercase',
            letterSpacing: '3px',
            marginBottom: '30px',
            textAlign: 'center',
          }}>
            Skills
          </h2>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            justifyContent: 'center',
          }}>
            {skills.map((skill, index) => {
              const skillText = typeof skill === 'string' ? skill : (skill as any).category || (skill as any).name || String(skill);
              return (
                <span
                  key={index}
                  style={{
                    fontSize: `${fontSize.body}px`,
                    color: textColor,
                    padding: '8px 20px',
                    border: `1px solid ${mutedColor}`,
                    borderRadius: '4px',
                    fontWeight: 300,
                  }}
                >
                  {skillText}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div style={{ marginBottom: '50px' }}>
          <h2 style={{
            fontSize: `${fontSize.subheader}px`,
            color: primaryColor,
            fontWeight: 300,
            textTransform: 'uppercase',
            letterSpacing: '3px',
            marginBottom: '30px',
            textAlign: 'center',
          }}>
            Education
          </h2>
          {education.map((edu, index) => (
            <div key={index} style={{ marginBottom: '24px', textAlign: 'center' }}>
              <h3 style={{
                fontSize: `${fontSize.subheader}px`,
                color: textColor,
                fontWeight: 500,
                margin: 0,
                marginBottom: '8px',
              }}>
                {edu.degree}
              </h3>
              <div style={{
                fontSize: `${fontSize.body}px`,
                color: mutedColor,
              }}>
                {edu.institution}
                {edu.graduationDate && ` • ${edu.graduationDate}`}
                {edu.gpa && ` • GPA: ${edu.gpa}`}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <div>
          <h2 style={{
            fontSize: `${fontSize.subheader}px`,
            color: primaryColor,
            fontWeight: 300,
            textTransform: 'uppercase',
            letterSpacing: '3px',
            marginBottom: '30px',
            textAlign: 'center',
          }}>
            Certifications
          </h2>
          <div style={{ textAlign: 'center' }}>
            {certifications.map((cert, index) => (
              <div key={index} style={{
                fontSize: `${fontSize.body}px`,
                color: textColor,
                marginBottom: '12px',
              }}>
                {typeof cert === 'string' ? cert : cert.name}
                {typeof cert === 'object' && cert.date && ` • ${cert.date}`}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const metadata = {
  id: 'ModernMinimalLayout' as const,
  name: 'Modern Minimal',
  description: 'Ultra-clean design with generous whitespace and large typography',
  suitableFor: ['creative-design', 'tech-startup', 'entry-student'],
  complexity: 'simple' as const,
  atsCompatibility: 'medium' as const,
  isUnique: true,
};

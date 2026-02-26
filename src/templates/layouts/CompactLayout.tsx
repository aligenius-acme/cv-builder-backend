/**
 * CompactLayout - Dense, one-page optimized layout
 *
 * Structure: Minimal spacing, condensed information, fits more content
 * Suitable for: Experienced professionals, one-page resumes
 */

import * as React from 'react';
import { LayoutProps } from './types';
import { PhotoCircle } from '../shared/components/PhotoCircle';

export const CompactLayout: React.FC<LayoutProps> = ({ data, config }) => {
  const { contact, summary, experience, education, skills, certifications, languages, projects, awards, volunteerWork } = data;
  const {
    primaryColor,
    textColor,
    mutedColor,
    backgroundColor,
    fontSize,
    margins,
  } = config;

  // Reduce spacing for compact design
  const compactFontSize = {
    header: fontSize.header - 4,
    subheader: fontSize.subheader - 2,
    body: fontSize.body - 1,
  };

  return (
    <div
      style={{
        fontFamily: config.fontFamily || 'Helvetica, Arial, sans-serif',
        fontSize: `${compactFontSize.body}px`,
        color: textColor,
        backgroundColor: backgroundColor,
        padding: `${margins.top - 10}px ${margins.right - 10}px ${margins.bottom - 10}px ${margins.left - 10}px`,
        maxWidth: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
      }}
    >
      {/* Compact Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: `2px solid ${primaryColor}`,
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: `${compactFontSize.header}px`,
            color: primaryColor,
            margin: 0,
            fontWeight: 700,
            marginBottom: '6px',
          }}>
            {contact.name || 'Your Name'}
          </h1>
          <div style={{
            fontSize: `${compactFontSize.body}px`,
            color: mutedColor,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            {contact.email && <span>{contact.email}</span>}
            {contact.phone && <span>|</span>}
            {contact.phone && <span>{contact.phone}</span>}
            {contact.location && <span>|</span>}
            {contact.location && <span>{contact.location}</span>}
            {contact.linkedin && <span>|</span>}
            {contact.linkedin && <span>{contact.linkedin}</span>}
          </div>
        </div>
        {contact.photoUrl && (
          <PhotoCircle
            photoUrl={contact.photoUrl}
            name={contact.name || 'User'}
            size="small"
            position="right"
            primaryColor={primaryColor}
          />
        )}
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Main Content - 70% */}
        <div style={{ flex: '0 0 70%' }}>
          {/* Summary */}
          {summary && (
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{
                fontSize: `${compactFontSize.subheader}px`,
                color: primaryColor,
                fontWeight: 700,
                margin: 0,
                marginBottom: '6px',
              }}>
                SUMMARY
              </h2>
              <p style={{
                fontSize: `${compactFontSize.body}px`,
                color: textColor,
                lineHeight: 1.4,
                margin: 0,
              }}>
                {summary}
              </p>
            </div>
          )}

          {/* Experience */}
          {experience && experience.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{
                fontSize: `${compactFontSize.subheader}px`,
                color: primaryColor,
                fontWeight: 700,
                margin: 0,
                marginBottom: '8px',
              }}>
                EXPERIENCE
              </h2>
              {experience.map((exp, index) => (
                <div key={index} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3 style={{
                      fontSize: `${compactFontSize.subheader - 1}px`,
                      color: textColor,
                      fontWeight: 700,
                      margin: 0,
                    }}>
                      {exp.title}
                    </h3>
                    <span style={{
                      fontSize: `${compactFontSize.body - 1}px`,
                      color: mutedColor,
                      whiteSpace: 'nowrap',
                    }}>
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div style={{
                    fontSize: `${compactFontSize.body}px`,
                    color: mutedColor,
                    marginTop: '2px',
                    marginBottom: '4px',
                  }}>
                    {exp.company}
                    {exp.location && ` • ${exp.location}`}
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '16px', listStyle: 'disc' }}>
                    {exp.description?.map((desc, i) => (
                      <li key={i} style={{
                        fontSize: `${compactFontSize.body}px`,
                        color: textColor,
                        lineHeight: 1.3,
                        marginBottom: '2px',
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
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{
                fontSize: `${compactFontSize.subheader}px`,
                color: primaryColor,
                fontWeight: 700,
                margin: 0,
                marginBottom: '8px',
              }}>
                EDUCATION
              </h2>
              {education.map((edu, index) => (
                <div key={index} style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h3 style={{
                      fontSize: `${compactFontSize.subheader - 1}px`,
                      color: textColor,
                      fontWeight: 700,
                      margin: 0,
                    }}>
                      {edu.degree}
                    </h3>
                    <span style={{
                      fontSize: `${compactFontSize.body - 1}px`,
                      color: mutedColor,
                    }}>
                      {edu.graduationDate}
                    </span>
                  </div>
                  <div style={{
                    fontSize: `${compactFontSize.body}px`,
                    color: mutedColor,
                  }}>
                    {edu.institution}
                    {edu.gpa && ` • GPA: ${edu.gpa}`}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{
                fontSize: `${compactFontSize.subheader}px`,
                color: primaryColor,
                fontWeight: 700,
                margin: 0,
                marginBottom: '8px',
              }}>
                PROJECTS
              </h2>
              {projects.map((project, index) => (
                <div key={index} style={{ marginBottom: '8px' }}>
                  <h3 style={{
                    fontSize: `${compactFontSize.subheader - 1}px`,
                    color: textColor,
                    fontWeight: 700,
                    margin: 0,
                    marginBottom: '2px',
                  }}>
                    {project.name}
                  </h3>
                  <p style={{ fontSize: `${compactFontSize.body}px`, color: textColor, lineHeight: 1.3, margin: '0 0 2px 0' }}>
                    {project.description}
                  </p>
                  {project.technologies && project.technologies.length > 0 && (
                    <div style={{ fontSize: `${compactFontSize.body - 1}px`, color: mutedColor }}>
                      {project.technologies.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Volunteer Work */}
          {volunteerWork && volunteerWork.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{
                fontSize: `${compactFontSize.subheader}px`,
                color: primaryColor,
                fontWeight: 700,
                margin: 0,
                marginBottom: '8px',
              }}>
                VOLUNTEER
              </h2>
              {volunteerWork.map((vol, index) => (
                <div key={index} style={{ marginBottom: '6px' }}>
                  {typeof vol === 'string' ? (
                    <div style={{ fontSize: `${compactFontSize.body}px`, color: textColor }}>• {vol}</div>
                  ) : (
                    <div style={{ fontSize: `${compactFontSize.body}px`, color: textColor }}>
                      <strong>{vol.role}</strong>, {vol.organization}
                      {(vol.period || vol.startDate) && (
                        <span style={{ fontSize: `${compactFontSize.body - 1}px`, color: mutedColor, marginLeft: '4px' }}>
                          {vol.period || vol.startDate}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar - 30% */}
        <div style={{ flex: '0 0 30%' }}>
          {/* Skills */}
          {skills && skills.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{
                fontSize: `${compactFontSize.subheader}px`,
                color: primaryColor,
                fontWeight: 700,
                margin: 0,
                marginBottom: '8px',
              }}>
                SKILLS
              </h2>
              <div style={{
                fontSize: `${compactFontSize.body}px`,
                lineHeight: 1.4,
              }}>
                {skills.map((skill, index) => {
                  const skillText = typeof skill === 'string' ? skill : (skill as any).category || (skill as any).name || String(skill);
                  return (
                    <div key={index} style={{ marginBottom: '4px', color: textColor }}>
                      • {skillText}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{
                fontSize: `${compactFontSize.subheader}px`,
                color: primaryColor,
                fontWeight: 700,
                margin: 0,
                marginBottom: '8px',
              }}>
                LANGUAGES
              </h2>
              <div style={{ fontSize: `${compactFontSize.body}px` }}>
                {languages.map((lang, index) => (
                  <div key={index} style={{ marginBottom: '4px', color: textColor }}>
                    • {lang}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications && certifications.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{
                fontSize: `${compactFontSize.subheader}px`,
                color: primaryColor,
                fontWeight: 700,
                margin: 0,
                marginBottom: '8px',
              }}>
                CERTIFICATIONS
              </h2>
              <div style={{ fontSize: `${compactFontSize.body - 1}px` }}>
                {certifications.map((cert, index) => (
                  <div key={index} style={{ marginBottom: '6px', color: textColor, lineHeight: 1.3 }}>
                    • {typeof cert === 'string' ? cert : cert.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Awards */}
          {awards && awards.length > 0 && (
            <div>
              <h2 style={{
                fontSize: `${compactFontSize.subheader}px`,
                color: primaryColor,
                fontWeight: 700,
                margin: 0,
                marginBottom: '8px',
              }}>
                AWARDS
              </h2>
              <div style={{ fontSize: `${compactFontSize.body - 1}px` }}>
                {awards.map((award, index) => (
                  <div key={index} style={{ marginBottom: '6px', color: textColor, lineHeight: 1.3 }}>
                    • {typeof award === 'string' ? award : award.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const metadata = {
  id: 'CompactLayout' as const,
  name: 'Compact',
  description: 'Dense layout optimized for fitting maximum content on one page',
  suitableFor: ['all'],
  complexity: 'simple' as const,
  atsCompatibility: 'high' as const,
  isUnique: true,
};

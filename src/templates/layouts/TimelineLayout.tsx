/**
 * TimelineLayout - Vertical timeline with career progression focus
 *
 * Structure: Left timeline line with dates, right content area
 * Suitable for: All roles, emphasizes career progression
 */

import * as React from 'react';
import { LayoutProps } from './types';
import { PhotoCircle } from '../shared/components/PhotoCircle';

export const TimelineLayout: React.FC<LayoutProps> = ({ data, config }) => {
  const { contact, summary, experience, education, skills, certifications, projects, languages, awards, volunteerWork } = data;
  const {
    primaryColor,
    secondaryColor,
    textColor,
    mutedColor,
    backgroundColor,
    fontSize,
    margins,
  } = config;

  return (
    <div
      style={{
        fontFamily: config.fontFamily || 'Helvetica, Arial, sans-serif',
        fontSize: `${fontSize.body}px`,
        color: textColor,
        backgroundColor: backgroundColor,
        padding: `${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px`,
        maxWidth: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        {contact.photoUrl && (
          <div style={{ marginBottom: '20px' }}>
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
          fontSize: `${fontSize.header}px`,
          color: primaryColor,
          margin: 0,
          fontWeight: 700,
          marginBottom: '12px',
        }}>
          {contact.name || 'Your Name'}
        </h1>
        <div style={{
          fontSize: `${fontSize.body}px`,
          color: mutedColor,
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          {contact.email && <span>{contact.email}</span>}
          {contact.phone && <span>•</span>}
          {contact.phone && <span>{contact.phone}</span>}
          {contact.location && <span>•</span>}
          {contact.location && <span>{contact.location}</span>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div style={{
          marginBottom: '40px',
          padding: '20px',
          backgroundColor: `${primaryColor}15`,
          borderLeft: `4px solid ${primaryColor}`,
        }}>
          <p style={{
            fontSize: `${fontSize.body}px`,
            color: textColor,
            lineHeight: 1.7,
            margin: 0,
          }}>
            {summary}
          </p>
        </div>
      )}

      {/* Experience Timeline */}
      {experience && experience.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontSize: `${fontSize.subheader + 2}px`,
            color: primaryColor,
            fontWeight: 700,
            marginBottom: '30px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            Experience Timeline
          </h2>
          {experience.map((exp, index) => (
            <div key={index} style={{
              display: 'flex',
              gap: '30px',
              marginBottom: '30px',
              position: 'relative',
            }}>
              {/* Timeline Line */}
              <div style={{
                width: '150px',
                flexShrink: 0,
                position: 'relative',
              }}>
                <div style={{
                  fontSize: `${fontSize.body - 1}px`,
                  color: primaryColor,
                  fontWeight: 600,
                  marginBottom: '4px',
                }}>
                  {exp.startDate}
                </div>
                <div style={{
                  fontSize: `${fontSize.body - 1}px`,
                  color: mutedColor,
                }}>
                  {exp.current ? 'Present' : exp.endDate}
                </div>
                {/* Timeline dot */}
                <div style={{
                  position: 'absolute',
                  right: '-15px',
                  top: '5px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: primaryColor,
                  border: `3px solid ${backgroundColor}`,
                  boxShadow: `0 0 0 2px ${primaryColor}`,
                }}></div>
                {/* Timeline vertical line */}
                {index < experience.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    right: '-9px',
                    top: '20px',
                    bottom: '-30px',
                    width: '2px',
                    backgroundColor: `${primaryColor}30`,
                  }}></div>
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: `${fontSize.subheader}px`,
                  color: textColor,
                  fontWeight: 700,
                  margin: 0,
                  marginBottom: '4px',
                }}>
                  {exp.title}
                </h3>
                <div style={{
                  fontSize: `${fontSize.body}px`,
                  color: primaryColor,
                  fontWeight: 600,
                  marginBottom: '8px',
                }}>
                  {exp.company}
                  {exp.location && ` • ${exp.location}`}
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', listStyle: 'none' }}>
                  {exp.description?.map((desc, i) => (
                    <li key={i} style={{
                      fontSize: `${fontSize.body}px`,
                      color: textColor,
                      lineHeight: 1.6,
                      marginBottom: '4px',
                    }}>
                      → {desc}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: `${fontSize.subheader + 2}px`,
            color: primaryColor,
            fontWeight: 700,
            marginBottom: '20px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            Skills
          </h2>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
          }}>
            {skills.map((skill, index) => {
              const skillText = typeof skill === 'string' ? skill : (skill as any).category || (skill as any).name || String(skill);
              return (
                <span
                  key={index}
                  style={{
                    fontSize: `${fontSize.body}px`,
                    color: textColor,
                    backgroundColor: `${primaryColor}15`,
                    padding: '6px 14px',
                    borderRadius: '4px',
                    border: `1px solid ${primaryColor}30`,
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
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: `${fontSize.subheader + 2}px`,
            color: primaryColor,
            fontWeight: 700,
            marginBottom: '20px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            Education
          </h2>
          {education.map((edu, index) => (
            <div key={index} style={{ marginBottom: '16px' }}>
              <h3 style={{
                fontSize: `${fontSize.subheader}px`,
                color: textColor,
                fontWeight: 700,
                margin: 0,
              }}>
                {edu.degree}
              </h3>
              <div style={{
                fontSize: `${fontSize.body}px`,
                color: mutedColor,
                marginTop: '4px',
              }}>
                {edu.institution} • {edu.graduationDate}
                {edu.gpa && ` • GPA: ${edu.gpa}`}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: `${fontSize.subheader + 2}px`,
            color: primaryColor,
            fontWeight: 700,
            marginBottom: '20px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            Certifications
          </h2>
          {certifications.map((cert, index) => (
            <div key={index} style={{ fontSize: `${fontSize.body}px`, color: textColor, marginBottom: '8px' }}>
              • {typeof cert === 'string' ? cert : `${cert.name}${cert.date ? ` (${cert.date})` : ''}`}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: `${fontSize.subheader + 2}px`,
            color: primaryColor,
            fontWeight: 700,
            marginBottom: '20px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            Projects
          </h2>
          {projects.map((project, index) => (
            <div key={index} style={{ marginBottom: '16px', paddingLeft: '20px', borderLeft: `3px solid ${primaryColor}30` }}>
              <h3 style={{ fontSize: `${fontSize.subheader}px`, color: textColor, fontWeight: 700, margin: 0, marginBottom: '4px' }}>
                {project.name}
              </h3>
              <p style={{ fontSize: `${fontSize.body}px`, color: textColor, lineHeight: 1.6, margin: '0 0 6px 0' }}>
                {project.description}
              </p>
              {project.technologies && project.technologies.length > 0 && (
                <div style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor }}>
                  {project.technologies.join(' • ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Languages & Awards */}
      {((languages && languages.length > 0) || (awards && awards.length > 0)) && (
        <div style={{ display: 'flex', gap: '30px', marginBottom: '30px' }}>
          {languages && languages.length > 0 && (
            <div style={{ flex: 1 }}>
              <h2 style={{
                fontSize: `${fontSize.subheader + 2}px`,
                color: primaryColor,
                fontWeight: 700,
                marginBottom: '20px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}>
                Languages
              </h2>
              {languages.map((lang, index) => (
                <span
                  key={index}
                  style={{
                    display: 'inline-block',
                    fontSize: `${fontSize.body}px`,
                    color: textColor,
                    backgroundColor: `${primaryColor}15`,
                    padding: '6px 14px',
                    borderRadius: '4px',
                    border: `1px solid ${primaryColor}30`,
                    marginRight: '8px',
                    marginBottom: '8px',
                  }}
                >
                  {lang}
                </span>
              ))}
            </div>
          )}
          {awards && awards.length > 0 && (
            <div style={{ flex: 1 }}>
              <h2 style={{
                fontSize: `${fontSize.subheader + 2}px`,
                color: primaryColor,
                fontWeight: 700,
                marginBottom: '20px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}>
                Awards & Honors
              </h2>
              {awards.map((award, index) => (
                <div key={index} style={{ fontSize: `${fontSize.body}px`, color: textColor, marginBottom: '8px' }}>
                  → {typeof award === 'string' ? award : award.name}
                  {typeof award === 'object' && award.date && (
                    <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor, marginLeft: '8px' }}>({award.date})</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Volunteer Work */}
      {volunteerWork && volunteerWork.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: `${fontSize.subheader + 2}px`,
            color: primaryColor,
            fontWeight: 700,
            marginBottom: '20px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            Volunteer Work
          </h2>
          {volunteerWork.map((vol, index) => (
            <div key={index} style={{ display: 'flex', gap: '30px', marginBottom: '20px' }}>
              <div style={{ width: '150px', flexShrink: 0 }}>
                {typeof vol !== 'string' && (
                  <div style={{ fontSize: `${fontSize.body - 1}px`, color: primaryColor, fontWeight: 600 }}>
                    {vol.period || vol.startDate || ''}
                  </div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                {typeof vol === 'string' ? (
                  <div style={{ fontSize: `${fontSize.body}px`, color: textColor }}>→ {vol}</div>
                ) : (
                  <>
                    <h3 style={{ fontSize: `${fontSize.subheader}px`, color: textColor, fontWeight: 700, margin: 0, marginBottom: '4px' }}>
                      {vol.role}
                    </h3>
                    <div style={{ fontSize: `${fontSize.body}px`, color: primaryColor, fontWeight: 600 }}>
                      {vol.organization}{vol.location && ` • ${vol.location}`}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const metadata = {
  id: 'TimelineLayout' as const,
  name: 'Timeline',
  description: 'Vertical timeline layout emphasizing career progression',
  suitableFor: ['all'],
  complexity: 'moderate' as const,
  atsCompatibility: 'medium' as const,
  isUnique: true,
};

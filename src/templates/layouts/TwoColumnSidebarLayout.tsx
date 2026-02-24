/**
 * TwoColumnSidebarLayout - Professional two-column layout with left sidebar
 *
 * Structure: 30% sidebar (photo, contact, skills) | 70% main content
 * Suitable for: All categories, modern professional look
 */

import * as React from 'react';
import { LayoutProps } from './types';
import { PhotoCircle } from '../shared/components/PhotoCircle';

export const TwoColumnSidebarLayout: React.FC<LayoutProps> = ({ data, config }) => {
  const { contact, summary, experience, education, skills, certifications, projects, languages, awards, volunteerWork } = data;
  const {
    primaryColor,
    secondaryColor,
    textColor,
    mutedColor,
    backgroundColor,
    accentColor,
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
        display: 'flex',
        gap: '30px',
      }}
    >
      {/* LEFT SIDEBAR - 30% */}
      <div style={{
        width: '30%',
        backgroundColor: accentColor || '#f8f9fa',
        padding: '20px',
        marginTop: `-${margins.top}px`,
        marginLeft: `-${margins.left}px`,
        marginBottom: `-${margins.bottom}px`,
      }}>
        {/* Photo */}
        {contact.photoUrl && (
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <PhotoCircle
              photoUrl={contact.photoUrl}
              name={contact.name || 'User'}
              size="large"
              position="center"
              primaryColor={primaryColor}
            />
          </div>
        )}

        {/* Contact Info */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            fontSize: `${fontSize.subheader}px`,
            color: primaryColor,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '12px',
          }}>
            Contact
          </h3>
          <div style={{ fontSize: `${fontSize.body - 1}px`, lineHeight: 1.8, color: textColor }}>
            {contact.email && <div style={{ marginBottom: '8px', wordBreak: 'break-word' }}>{contact.email}</div>}
            {contact.phone && <div style={{ marginBottom: '8px' }}>{contact.phone}</div>}
            {contact.location && <div style={{ marginBottom: '8px' }}>{contact.location}</div>}
            {contact.linkedin && <div style={{ marginBottom: '8px', wordBreak: 'break-word' }}>{contact.linkedin}</div>}
            {contact.github && <div style={{ marginBottom: '8px', wordBreak: 'break-word' }}>{contact.github}</div>}
            {contact.website && <div style={{ marginBottom: '8px', wordBreak: 'break-word' }}>{contact.website}</div>}
          </div>
        </div>

        {/* Skills */}
        {skills && skills.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{
              fontSize: `${fontSize.subheader}px`,
              color: primaryColor,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '12px',
            }}>
              Skills
            </h3>
            <div style={{ fontSize: `${fontSize.body - 1}px`, lineHeight: 1.8 }}>
              {skills.map((skill, index) => {
                const skillText = typeof skill === 'string' ? skill : (skill as any).category || (skill as any).name || String(skill);
                return (
                  <div key={index} style={{ marginBottom: '6px', color: textColor }}>
                    • {skillText}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{
              fontSize: `${fontSize.subheader}px`,
              color: primaryColor,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '12px',
            }}>
              Languages
            </h3>
            <div style={{ fontSize: `${fontSize.body - 1}px`, lineHeight: 1.8 }}>
              {languages.map((lang, index) => (
                <div key={index} style={{ marginBottom: '6px', color: textColor }}>
                  • {lang}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{
              fontSize: `${fontSize.subheader}px`,
              color: primaryColor,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '12px',
            }}>
              Certifications
            </h3>
            <div style={{ fontSize: `${fontSize.body - 2}px`, lineHeight: 1.6 }}>
              {certifications.map((cert, index) => (
                <div key={index} style={{ marginBottom: '8px', color: textColor }}>
                  {typeof cert === 'string' ? cert : cert.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Awards */}
        {awards && awards.length > 0 && (
          <div>
            <h3 style={{
              fontSize: `${fontSize.subheader}px`,
              color: primaryColor,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '12px',
            }}>
              Awards
            </h3>
            <div style={{ fontSize: `${fontSize.body - 1}px`, lineHeight: 1.8 }}>
              {awards.map((award, index) => (
                <div key={index} style={{ marginBottom: '8px', color: textColor }}>
                  • {typeof award === 'string' ? award : award.name}
                  {typeof award === 'object' && award.date && (
                    <div style={{ fontSize: `${fontSize.body - 2}px`, color: mutedColor }}>{award.date}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT MAIN CONTENT - 70% */}
      <div style={{ flex: 1 }}>
        {/* Name Header */}
        <h1 style={{
          fontSize: `${fontSize.header}px`,
          color: primaryColor,
          margin: 0,
          fontWeight: 700,
          marginBottom: '30px',
        }}>
          {contact.name || 'Your Name'}
        </h1>

        {/* Summary */}
        {summary && (
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{
              fontSize: `${fontSize.subheader}px`,
              color: primaryColor,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '12px',
              borderBottom: `2px solid ${primaryColor}`,
              paddingBottom: '8px',
            }}>
              Professional Summary
            </h2>
            <p style={{ fontSize: `${fontSize.body}px`, color: textColor, lineHeight: 1.6, margin: 0 }}>
              {summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{
              fontSize: `${fontSize.subheader}px`,
              color: primaryColor,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '12px',
              borderBottom: `2px solid ${primaryColor}`,
              paddingBottom: '8px',
            }}>
              Experience
            </h2>
            {experience.map((exp, index) => (
              <div key={index} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 style={{
                    fontSize: `${fontSize.subheader}px`,
                    color: textColor,
                    fontWeight: 600,
                    margin: 0,
                  }}>
                    {exp.title}
                  </h3>
                  <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor, whiteSpace: 'nowrap' }}>
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <div style={{
                  fontSize: `${fontSize.body}px`,
                  color: mutedColor,
                  marginTop: '4px',
                  marginBottom: '8px',
                }}>
                  {exp.company}{exp.location && ` • ${exp.location}`}
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', listStyle: 'none' }}>
                  {exp.description?.map((desc, i) => (
                    <li key={i} style={{
                      fontSize: `${fontSize.body}px`,
                      color: textColor,
                      lineHeight: 1.6,
                      marginBottom: '4px',
                    }}>
                      • {desc}
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
              fontSize: `${fontSize.subheader}px`,
              color: primaryColor,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '12px',
              borderBottom: `2px solid ${primaryColor}`,
              paddingBottom: '8px',
            }}>
              Education
            </h2>
            {education.map((edu, index) => (
              <div key={index} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 style={{
                    fontSize: `${fontSize.subheader}px`,
                    color: textColor,
                    fontWeight: 600,
                    margin: 0,
                  }}>
                    {edu.degree}
                  </h3>
                  <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor }}>
                    {edu.graduationDate}
                  </span>
                </div>
                <div style={{
                  fontSize: `${fontSize.body}px`,
                  color: mutedColor,
                  marginTop: '4px',
                }}>
                  {edu.institution}{edu.location && ` • ${edu.location}`}
                  {edu.gpa && ` • GPA: ${edu.gpa}`}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{
              fontSize: `${fontSize.subheader}px`,
              color: primaryColor,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '12px',
              borderBottom: `2px solid ${primaryColor}`,
              paddingBottom: '8px',
            }}>
              Projects
            </h2>
            {projects.map((project, index) => (
              <div key={index} style={{ marginBottom: '16px' }}>
                <h3 style={{
                  fontSize: `${fontSize.subheader}px`,
                  color: textColor,
                  fontWeight: 600,
                  margin: 0,
                }}>
                  {project.name}
                  {project.url && (
                    <span style={{ fontSize: `${fontSize.body - 1}px`, color: primaryColor, fontWeight: 400, marginLeft: '8px' }}>
                      {project.url}
                    </span>
                  )}
                </h3>
                <p style={{
                  fontSize: `${fontSize.body}px`,
                  color: textColor,
                  lineHeight: 1.6,
                  margin: '4px 0',
                }}>
                  {project.description}
                </p>
                {project.technologies && (
                  <div style={{
                    fontSize: `${fontSize.body - 1}px`,
                    color: mutedColor,
                    marginTop: '4px',
                  }}>
                    {project.technologies.join(' • ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Volunteer Work */}
        {volunteerWork && volunteerWork.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{
              fontSize: `${fontSize.subheader}px`,
              color: primaryColor,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '12px',
              borderBottom: `2px solid ${primaryColor}`,
              paddingBottom: '8px',
            }}>
              Volunteer Work
            </h2>
            {volunteerWork.map((vol, index) => (
              <div key={index} style={{ marginBottom: '16px' }}>
                {typeof vol === 'string' ? (
                  <div style={{ fontSize: `${fontSize.body}px`, color: textColor }}>• {vol}</div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <h3 style={{ fontSize: `${fontSize.subheader}px`, color: textColor, fontWeight: 600, margin: 0 }}>
                        {vol.role}
                      </h3>
                      <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor, whiteSpace: 'nowrap' }}>
                        {vol.period || `${vol.startDate || ''}${vol.endDate ? ` - ${vol.endDate}` : vol.current ? ' - Present' : ''}`}
                      </span>
                    </div>
                    <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor, marginTop: '4px', marginBottom: '8px' }}>
                      {vol.organization}{vol.location && ` • ${vol.location}`}
                    </div>
                    {vol.description && vol.description.length > 0 && (
                      <ul style={{ margin: 0, paddingLeft: '20px', listStyle: 'none' }}>
                        {vol.description.map((desc, i) => (
                          <li key={i} style={{ fontSize: `${fontSize.body}px`, color: textColor, lineHeight: 1.6, marginBottom: '4px' }}>
                            • {desc}
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const metadata = {
  id: 'TwoColumnSidebarLayout' as const,
  name: 'Two Column Sidebar',
  description: 'Professional two-column layout with left sidebar for contact and skills',
  suitableFor: ['all'],
  complexity: 'moderate' as const,
  atsCompatibility: 'medium' as const,
  isUnique: true,
};

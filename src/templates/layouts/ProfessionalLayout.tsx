/**
 * ProfessionalLayout - Clean corporate professional layout
 *
 * Structure: Polished corporate design, subtle accents, professional spacing
 * Suitable for: All corporate roles, business professionals
 */

import * as React from 'react';
import { LayoutProps } from './types';
import { PhotoCircle } from '../shared/components/PhotoCircle';

export const ProfessionalLayout: React.FC<LayoutProps> = ({ data, config }) => {
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
        fontFamily: "'Arial', 'Helvetica', sans-serif",
        fontSize: `${fontSize.body}px`,
        color: textColor,
        backgroundColor: backgroundColor,
        padding: `${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px`,
        maxWidth: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
      }}
    >
      {/* Professional Header with Accent Bar */}
      <div style={{
        borderLeft: `6px solid ${primaryColor}`,
        paddingLeft: '30px',
        marginBottom: '30px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontSize: `${fontSize.header}px`,
              color: primaryColor,
              margin: 0,
              fontWeight: 700,
              marginBottom: '8px',
            }}>
              {contact.name || 'Your Name'}
            </h1>
            <div style={{
              fontSize: `${fontSize.body}px`,
              color: mutedColor,
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              {contact.email && <span>{contact.email}</span>}
              {contact.phone && <span>|</span>}
              {contact.phone && <span>{contact.phone}</span>}
              {contact.location && <span>|</span>}
              {contact.location && <span>{contact.location}</span>}
            </div>
          </div>
          {contact.photoUrl && (
            <div style={{ marginLeft: '30px' }}>
              <PhotoCircle
                photoUrl={contact.photoUrl}
                name={contact.name || 'User'}
                size="medium"
                position="right"
                primaryColor={primaryColor}
              />
            </div>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      {summary && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: `${fontSize.subheader}px`,
            color: primaryColor,
            fontWeight: 700,
            marginBottom: '12px',
            paddingBottom: '8px',
            borderBottom: `3px solid ${primaryColor}`,
          }}>
            PROFESSIONAL SUMMARY
          </h2>
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

      {/* Core Competencies */}
      {skills && skills.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: `${fontSize.subheader}px`,
            color: primaryColor,
            fontWeight: 700,
            marginBottom: '12px',
            paddingBottom: '8px',
            borderBottom: `3px solid ${primaryColor}`,
          }}>
            CORE COMPETENCIES
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            padding: '16px',
          }}>
            {skills.map((skill, index) => {
              const skillText = typeof skill === 'string' ? skill : (skill as any).category || (skill as any).name || String(skill);
              return (
                <div
                  key={index}
                  style={{
                    fontSize: `${fontSize.body}px`,
                    color: textColor,
                    fontWeight: 600,
                  }}
                >
                  ▪ {skillText}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Professional Experience */}
      {experience && experience.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: `${fontSize.subheader}px`,
            color: primaryColor,
            fontWeight: 700,
            marginBottom: '16px',
            paddingBottom: '8px',
            borderBottom: `3px solid ${primaryColor}`,
          }}>
            PROFESSIONAL EXPERIENCE
          </h2>
          {experience.map((exp, index) => (
            <div key={index} style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: '6px',
              }}>
                <h3 style={{
                  fontSize: `${fontSize.subheader}px`,
                  color: textColor,
                  fontWeight: 700,
                  margin: 0,
                }}>
                  {exp.title}
                </h3>
                <span style={{
                  fontSize: `${fontSize.body - 1}px`,
                  color: mutedColor,
                  whiteSpace: 'nowrap',
                  fontStyle: 'italic',
                }}>
                  {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                </span>
              </div>
              <div style={{
                fontSize: `${fontSize.body}px`,
                color: secondaryColor,
                fontWeight: 600,
                marginBottom: '8px',
              }}>
                {exp.company}
                {exp.location && ` | ${exp.location}`}
              </div>
              <ul style={{
                margin: 0,
                paddingLeft: '20px',
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

      {/* Education & Certifications */}
      <div style={{ display: 'flex', gap: '30px', marginBottom: '30px' }}>
        {/* Education */}
        {education && education.length > 0 && (
          <div style={{ flex: 1 }}>
            <h2 style={{
              fontSize: `${fontSize.subheader}px`,
              color: primaryColor,
              fontWeight: 700,
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: `3px solid ${primaryColor}`,
            }}>
              EDUCATION
            </h2>
            {education.map((edu, index) => (
              <div key={index} style={{ marginBottom: '16px' }}>
                <h3 style={{
                  fontSize: `${fontSize.subheader - 1}px`,
                  color: textColor,
                  fontWeight: 700,
                  margin: 0,
                  marginBottom: '4px',
                }}>
                  {edu.degree}
                </h3>
                <div style={{
                  fontSize: `${fontSize.body}px`,
                  color: mutedColor,
                }}>
                  {edu.institution}
                </div>
                <div style={{
                  fontSize: `${fontSize.body - 1}px`,
                  color: mutedColor,
                }}>
                  {edu.graduationDate}
                  {edu.gpa && ` | GPA: ${edu.gpa}`}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <div style={{ flex: 1 }}>
            <h2 style={{
              fontSize: `${fontSize.subheader}px`,
              color: primaryColor,
              fontWeight: 700,
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: `3px solid ${primaryColor}`,
            }}>
              CERTIFICATIONS
            </h2>
            {certifications.map((cert, index) => (
              <div key={index} style={{
                fontSize: `${fontSize.body}px`,
                color: textColor,
                marginBottom: '10px',
              }}>
                <strong>▸</strong> {typeof cert === 'string' ? cert : cert.name}
                {typeof cert === 'object' && cert.date && (
                  <span style={{
                    fontSize: `${fontSize.body - 1}px`,
                    color: mutedColor,
                    marginLeft: '8px',
                  }}>
                    ({cert.date})
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: `${fontSize.subheader}px`,
            color: primaryColor,
            fontWeight: 700,
            marginBottom: '16px',
            paddingBottom: '8px',
            borderBottom: `3px solid ${primaryColor}`,
          }}>
            PROJECTS
          </h2>
          {projects.map((project, index) => (
            <div key={index} style={{ marginBottom: '16px' }}>
              <h3 style={{
                fontSize: `${fontSize.subheader - 1}px`,
                color: textColor,
                fontWeight: 700,
                margin: 0,
                marginBottom: '4px',
              }}>
                {project.name}
                {project.url && (
                  <span style={{ fontSize: `${fontSize.body - 1}px`, color: secondaryColor, fontWeight: 400, marginLeft: '8px' }}>
                    {project.url}
                  </span>
                )}
              </h3>
              <p style={{ fontSize: `${fontSize.body}px`, color: textColor, lineHeight: 1.6, margin: '0 0 6px 0' }}>
                {project.description}
              </p>
              {project.technologies && project.technologies.length > 0 && (
                <div style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor }}>
                  Technologies: {project.technologies.join(', ')}
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
                fontSize: `${fontSize.subheader}px`,
                color: primaryColor,
                fontWeight: 700,
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: `3px solid ${primaryColor}`,
              }}>
                LANGUAGES
              </h2>
              {languages.map((lang, index) => (
                <div key={index} style={{ fontSize: `${fontSize.body}px`, color: textColor, marginBottom: '6px' }}>
                  ▪ {lang}
                </div>
              ))}
            </div>
          )}
          {awards && awards.length > 0 && (
            <div style={{ flex: 1 }}>
              <h2 style={{
                fontSize: `${fontSize.subheader}px`,
                color: primaryColor,
                fontWeight: 700,
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: `3px solid ${primaryColor}`,
              }}>
                AWARDS & HONORS
              </h2>
              {awards.map((award, index) => (
                <div key={index} style={{ fontSize: `${fontSize.body}px`, color: textColor, marginBottom: '8px' }}>
                  <strong>▸</strong> {typeof award === 'string' ? award : award.name}
                  {typeof award === 'object' && award.date && (
                    <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor, marginLeft: '8px' }}>
                      ({award.date})
                    </span>
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
            fontSize: `${fontSize.subheader}px`,
            color: primaryColor,
            fontWeight: 700,
            marginBottom: '16px',
            paddingBottom: '8px',
            borderBottom: `3px solid ${primaryColor}`,
          }}>
            VOLUNTEER WORK
          </h2>
          {volunteerWork.map((vol, index) => (
            <div key={index} style={{ marginBottom: '16px' }}>
              {typeof vol === 'string' ? (
                <div style={{ fontSize: `${fontSize.body}px`, color: textColor }}>▪ {vol}</div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: `${fontSize.subheader - 1}px`, color: textColor, fontWeight: 700, margin: 0 }}>
                      {vol.role}
                    </h3>
                    <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor, fontStyle: 'italic' }}>
                      {vol.period || `${vol.startDate || ''}${vol.endDate ? ` – ${vol.endDate}` : vol.current ? ' – Present' : ''}`}
                    </span>
                  </div>
                  <div style={{ fontSize: `${fontSize.body}px`, color: secondaryColor, fontWeight: 600, marginBottom: '6px' }}>
                    {vol.organization}{vol.location && ` | ${vol.location}`}
                  </div>
                  {vol.description && vol.description.length > 0 && (
                    <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'square' }}>
                      {vol.description.map((desc, i) => (
                        <li key={i} style={{ fontSize: `${fontSize.body}px`, color: textColor, lineHeight: 1.6, marginBottom: '4px' }}>
                          {desc}
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
  );
};

export const metadata = {
  id: 'ProfessionalLayout' as const,
  name: 'Professional',
  description: 'Clean corporate layout with subtle accents and professional spacing',
  suitableFor: ['all'],
  complexity: 'simple' as const,
  atsCompatibility: 'high' as const,
  isUnique: true,
};
